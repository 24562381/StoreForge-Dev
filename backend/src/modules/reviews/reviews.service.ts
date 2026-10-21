import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { sanitizeString, sanitizePhone, sanitizeNumber } from '../../common/utils/sanitize';
import { getOrderNumberCandidates, getPhoneNumberCandidates } from '../../common/utils/order-verification';

@Injectable()
export class ReviewsService {
  // OPTIMIZATION: In-memory cache for published/featured reviews (heavily read on customer storefront & homepage)
  // Reduces DB queries to 0 for warm reads with 60-second TTL and instant invalidation on admin edits.
  private publishedReviewsCache = new Map<string, { data: any[]; timestamp: number }>();
  private readonly CACHE_TTL_MS = 60000;

  constructor(private readonly prisma: PrismaService) {}

  private invalidateCache() {
    this.publishedReviewsCache.clear();
  }

  async findPublished(options: { productId?: number; isFeatured?: boolean; limit?: number }) {
    const cacheKey = `${options.productId || 'all'}_${options.isFeatured !== undefined ? options.isFeatured : 'all'}_${options.limit || 50}`;
    const now = Date.now();
    const cached = this.publishedReviewsCache.get(cacheKey);
    if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const where: Prisma.ReviewWhereInput = { isPublished: true };
    if (options.productId) where.productId = options.productId;
    if (options.isFeatured !== undefined) where.isFeatured = options.isFeatured;

    const data = await this.prisma.review.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: options.limit || 50,
      include: { product: true },
    });

    this.publishedReviewsCache.set(cacheKey, { data, timestamp: now });
    return data;
  }

  async findAll(options: {
    productId?: number;
    rating?: number;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { productId, rating, isPublished, page = 1, limit = 20 } = options;
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const where: Prisma.ReviewWhereInput = {};

    if (productId) where.productId = productId;
    if (rating) where.rating = rating;
    if (isPublished !== undefined) where.isPublished = isPublished;

    const skip = (safePage - 1) * safeLimit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: safeLimit,
        include: { product: true },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      total,
      page: safePage,
      totalPages: Math.ceil(total / safeLimit),
      limit: safeLimit,
    };
  }

  async findById(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!review) {
      throw new NotFoundException(`Review #${id} not found`);
    }
    return review;
  }

  async create(
    data: {
      productId?: number;
      customerName: string;
      rating: number;
      reviewText: string;
      customerImage?: string;
      location?: string;
      phone?: string;
      orderNumber?: string;
      secretToken?: string;
      accessToken?: string;
      isPublished?: boolean;
      isFeatured?: boolean;
      sortOrder?: number;
    },
    isStaffAdmin = false,
  ) {
    let validProductId: number | null = null;
    if (data.productId) {
      const pId = Number(data.productId);
      if (!isNaN(pId) && pId > 0) {
        const productExists = await this.prisma.product.findUnique({
          where: { id: pId },
          select: { id: true },
        });
        if (productExists) {
          validProductId = pId;
        }
      }
    }

    const cleanCustomerName = sanitizeString(data.customerName || 'Verified Customer', 100);
    const cleanReviewText = sanitizeString(data.reviewText || '', 2000);
    const cleanLocation = data.location ? sanitizeString(data.location, 100) : null;
    const cleanRating = sanitizeNumber(data.rating, 5, 1, 5);

    if (!cleanReviewText) {
      throw new BadRequestException('Review text is required (মতামত প্রদান আবশ্যক)');
    }

    let finalOrderNumber: string | null = null;
    let finalPhone: string | null = null;

    if (!isStaffAdmin) {
      // Storefront Customer Validation:
      // Product, Order Number, Phone Number, and Secret Token are strictly required!
      if (!validProductId) {
        throw new BadRequestException('Valid product ID is required to review a product.');
      }

      const rawOrderNumber = data.orderNumber ? String(data.orderNumber).trim() : '';
      const rawPhone = data.phone ? String(data.phone).trim() : '';
      const rawSecretToken = data.secretToken
        ? String(data.secretToken).trim()
        : data.accessToken
        ? String(data.accessToken).trim()
        : '';

      if (!rawOrderNumber) {
        throw new BadRequestException('অর্ডার নম্বর দেওয়া আবশ্যক (Order number is required)');
      }
      if (!rawPhone) {
        throw new BadRequestException('মোবাইল নম্বর দেওয়া আবশ্যক (Phone number is required)');
      }
      if (!rawSecretToken) {
        throw new BadRequestException('অর্ডারের সিক্রেট টোকেন দেওয়া আবশ্যক (Secret access token is required)');
      }

      // 1. Look up Order in Database
      const orderCandidates = getOrderNumberCandidates(rawOrderNumber);
      if (!orderCandidates.length) {
        throw new BadRequestException('অর্ডার নম্বরের ফরম্যাট সঠিক নয় (Invalid order number format)');
      }

      const order = await this.prisma.order.findFirst({
        where: {
          orderNumber: { in: orderCandidates, mode: 'insensitive' },
        },
        include: { items: true },
      });

      if (!order) {
        throw new BadRequestException('অর্ডার নম্বরটি পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার নম্বর দিন। (Order not found)');
      }

      finalOrderNumber = order.orderNumber;
      finalPhone = sanitizePhone(rawPhone) || rawPhone;

      // 2. Validate Phone Number matches the order
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const normalizedPhone = rawPhone.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d))).replace(/\D/g, '');
      const orderPhoneDigits = order.phone.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d))).replace(/\D/g, '');
      const phoneCandidates = getPhoneNumberCandidates(normalizedPhone);

      const isPhoneMatched =
        phoneCandidates.some((p) => orderPhoneDigits.includes(p) || p.includes(orderPhoneDigits)) ||
        (orderPhoneDigits.length >= 10 && normalizedPhone.length >= 10 && orderPhoneDigits.slice(-10) === normalizedPhone.slice(-10));

      if (!isPhoneMatched) {
        throw new BadRequestException('মোবাইল নম্বরটি এই অর্ডারের সাথে মিলছে না। (Phone number does not match this order)');
      }

      // 3. Validate Secret Token matches the order's accessToken
      const cleanToken = rawSecretToken.trim();
      const isTokenMatched = Boolean(
        order.accessToken &&
        (order.accessToken.trim() === cleanToken ||
         order.accessToken.trim().toLowerCase() === cleanToken.toLowerCase())
      );

      if (!isTokenMatched) {
        throw new BadRequestException('সিক্রেট টোকেনটি সঠিক নয়। অনুগ্রহ করে অর্ডার রসিদ বা ট্র্যাকিং পেজ দেখুন। (Invalid secret access token)');
      }

      // 4. Verify that this product was purchased in this order
      const hasProduct = order.items && order.items.some((item) => item.productId === validProductId);
      if (!hasProduct) {
        throw new BadRequestException('এই অর্ডারে এই পণ্যটি অন্তর্ভুক্ত ছিল না। (This product was not purchased under this order ID)');
      }

      // 5. PREVENT DUPLICATE REVIEW for the same product using the same order ID
      const allOrderVariations = Array.from(
        new Set([
          ...orderCandidates,
          ...getOrderNumberCandidates(order.orderNumber),
          order.orderNumber,
          rawOrderNumber,
        ]),
      );

      const existingReview = await this.prisma.review.findFirst({
        where: {
          productId: validProductId,
          orderNumber: { in: allOrderVariations, mode: 'insensitive' },
        },
      });

      if (existingReview) {
        throw new BadRequestException(
          'এই অর্ডার নম্বর দিয়ে এই পণ্যটির রিভিউ ইতিপূর্বে দেওয়া হয়েছে। একই অর্ডারের জন্য পুনরায় রিভিউ দেওয়া যাবে না। (You have already reviewed this product with this order ID)',
        );
      }
    } else {
      // Admin manual review creation
      finalOrderNumber = data.orderNumber ? sanitizeString(data.orderNumber, 50) : null;
      finalPhone = data.phone ? sanitizePhone(data.phone) : null;
    }

    const result = await this.prisma.review.create({
      data: {
        productId: validProductId,
        customerName: cleanCustomerName,
        rating: cleanRating,
        reviewText: cleanReviewText,
        customerImage: data.customerImage || null,
        location: cleanLocation,
        phone: finalPhone,
        orderNumber: finalOrderNumber,
        isPublished: isStaffAdmin ? (data.isPublished !== undefined ? Boolean(data.isPublished) : true) : false,
        isFeatured: isStaffAdmin ? (data.isFeatured !== undefined ? Boolean(data.isFeatured) : false) : false,
        sortOrder: sanitizeNumber(data.sortOrder, 0),
      },
    });

    this.invalidateCache();
    return result;
  }

  async update(id: number, data: any) {
    await this.findById(id);
    const result = await this.prisma.review.update({
      where: { id },
      data,
    });
    this.invalidateCache();
    return result;
  }

  async delete(id: number) {
    await this.findById(id);
    const result = await this.prisma.review.delete({ where: { id } });
    this.invalidateCache();
    return result;
  }

  async togglePublish(id: number) {
    const review = await this.findById(id);
    const result = await this.prisma.review.update({
      where: { id },
      data: { isPublished: !review.isPublished },
    });
    this.invalidateCache();
    return result;
  }

  async toggleFeature(id: number) {
    const review = await this.findById(id);
    const result = await this.prisma.review.update({
      where: { id },
      data: { isFeatured: !review.isFeatured },
    });
    this.invalidateCache();
    return result;
  }
}
