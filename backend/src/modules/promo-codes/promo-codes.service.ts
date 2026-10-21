import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PromoCodesService {
  // OPTIMIZATION: In-memory cache for promo codes with fast O(1) Map lookups
  // Invalidated immediately on create, update, or delete operations.
  private promoCodesCache: any[] | null = null;
  private lastCacheTime = 0;
  private readonly CACHE_TTL_MS = 60000;

  constructor(private readonly prisma: PrismaService) {}

  private invalidateCache() {
    this.promoCodesCache = null;
    this.lastCacheTime = 0;
  }

  async getAllAdmin() {
    const now = Date.now();
    if (this.promoCodesCache && now - this.lastCacheTime < this.CACHE_TTL_MS) {
      return this.promoCodesCache;
    }

    const promos = await this.prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });

    this.promoCodesCache = promos;
    this.lastCacheTime = now;
    return promos;
  }

  async getByIdAdmin(id: number) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promo code not found');
    return promo;
  }

  async createAdmin(data: {
    code: string;
    description?: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
  }) {
    const cleanCode = data.code.trim().toUpperCase();
    const existing = await this.prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      throw new BadRequestException(`Promo code "${cleanCode}" already exists.`);
    }

    const res = await this.prisma.promoCode.create({
      data: {
        code: cleanCode,
        description: data.description?.trim() || null,
        discountType: data.discountType || 'fixed',
        discountValue: Number(data.discountValue) || 0,
        minOrderAmount: data.minOrderAmount !== undefined && data.minOrderAmount !== null ? Number(data.minOrderAmount) : 0,
        maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
    this.invalidateCache();
    return res;
  }

  async updateAdmin(
    id: number,
    data: {
      code?: string;
      description?: string;
      discountType?: 'fixed' | 'percentage';
      discountValue?: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      usageLimit?: number;
      startDate?: string | null;
      endDate?: string | null;
      isActive?: boolean;
    },
  ) {
    const existing = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promo code not found');

    let cleanCode = existing.code;
    if (data.code && data.code.trim().toUpperCase() !== existing.code) {
      cleanCode = data.code.trim().toUpperCase();
      const duplicate = await this.prisma.promoCode.findUnique({
        where: { code: cleanCode },
      });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(`Promo code "${cleanCode}" already exists.`);
      }
    }

    const res = await this.prisma.promoCode.update({
      where: { id },
      data: {
        code: cleanCode,
        description: data.description !== undefined ? data.description?.trim() || null : existing.description,
        discountType: data.discountType || existing.discountType,
        discountValue: data.discountValue !== undefined ? Number(data.discountValue) : existing.discountValue,
        minOrderAmount: data.minOrderAmount !== undefined ? (data.minOrderAmount !== null ? Number(data.minOrderAmount) : 0) : existing.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount !== undefined ? (data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null) : existing.maxDiscountAmount,
        usageLimit: data.usageLimit !== undefined ? (data.usageLimit ? Number(data.usageLimit) : null) : existing.usageLimit,
        startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : existing.startDate,
        endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : existing.endDate,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
      },
    });
    this.invalidateCache();
    return res;
  }

  async deleteAdmin(id: number) {
    const existing = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Promo code not found');
    await this.prisma.promoCode.delete({ where: { id } });
    this.invalidateCache();
    return { success: true, message: 'Promo code deleted successfully' };
  }

  /**
   * Validate a promo code against a cart subtotal for customer checkout
   */
  async validatePromoCode(code: string, subtotal: number) {
    if (!code || !code.trim()) {
      return { valid: false, message: 'অনুগ্রহ করে একটি প্রোমো কোড লিখুন।' };
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo) {
      return { valid: false, message: 'প্রোমো কোডটি সঠিক নয়।' };
    }

    if (!promo.isActive) {
      return { valid: false, message: 'এই প্রোমো কোডটি বর্তমানে নিষ্ক্রিয় আছে।' };
    }

    const now = new Date();
    if (promo.startDate && now < new Date(promo.startDate)) {
      return { valid: false, message: 'এই প্রোমো কোডটির মেয়াদ এখনও শুরু হয়নি।' };
    }

    if (promo.endDate && now > new Date(promo.endDate)) {
      return { valid: false, message: 'এই প্রোমো কোডটির মেয়াদ শেষ হয়ে গিয়েছে।' };
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return { valid: false, message: 'এই প্রোমো কোডটির ব্যবহারের সর্বোচ্চ সীমা শেষ হয়ে গিয়েছে।' };
    }

    const minAmount = Number(promo.minOrderAmount || 0);
    if (subtotal < minAmount) {
      return {
        valid: false,
        message: `এই কোডটি ব্যবহার করতে ন্যূনতম ৳${minAmount} মূল্যের অর্ডার করতে হবে।`,
      };
    }

    let discountAmount = 0;
    const discountVal = Number(promo.discountValue);

    if (promo.discountType === 'percentage') {
      discountAmount = (subtotal * discountVal) / 100;
      if (promo.maxDiscountAmount && Number(promo.maxDiscountAmount) > 0) {
        discountAmount = Math.min(discountAmount, Number(promo.maxDiscountAmount));
      }
    } else {
      discountAmount = discountVal;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      id: promo.id,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: discountVal,
      discountAmount,
      description: promo.description,
      message: `প্রোমো কোড সফলভাবে যোগ হয়েছে! (৳${discountAmount} ছাড়)`,
    };
  }

  /**
   * Increment usage count after order is confirmed
   */
  async incrementUsage(code: string) {
    try {
      const cleanCode = code.trim().toUpperCase();
      await this.prisma.promoCode.update({
        where: { code: cleanCode },
        data: { usedCount: { increment: 1 } },
      });
    } catch (e) {
      // Ignore if promo code not found
    }
  }
}
