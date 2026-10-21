import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const TRIM_DASHES_REGEX = /(^-|-$)/g;

@Injectable()
export class CategoriesService {
  // OPTIMIZATION: Dual in-memory cache for active and total category trees.
  // Categories are frequently accessed on navbar and catalog menus; caching eliminates repetitive SQL queries.
  // Automatically invalidated on any category create/update/delete.
  private activeCategoriesCache: any[] | null = null;
  private allCategoriesCache: any[] | null = null;
  private lastCacheTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  private invalidateCache() {
    this.activeCategoriesCache = null;
    this.allCategoriesCache = null;
    this.lastCacheTime = 0;
  }

  async findAll(activeOnly = false) {
    const now = Date.now();
    if (activeOnly && this.activeCategoriesCache && now - this.lastCacheTime < 60000) {
      return this.activeCategoriesCache;
    }
    if (!activeOnly && this.allCategoriesCache && now - this.lastCacheTime < 60000) {
      return this.allCategoriesCache;
    }

    const categories = await this.prisma.category.findMany({
      where: activeOnly ? { status: 'active' } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const slugs = categories.map((c) => c.slug);
    const transKeys = slugs.flatMap((slug) => [`category.${slug}.name`, `category.${slug}.description`]);
    const translations = transKeys.length
      ? await this.prisma.translation.findMany({
          where: { key: { in: transKeys } },
          select: { key: true, bn: true },
        })
      : [];

    const transMap = new Map(translations.map((t) => [t.key, t.bn]));
    const enriched = categories.map((c) => ({
      ...c,
      nameBn: transMap.get(`category.${c.slug}.name`) || '',
      descriptionBn: transMap.get(`category.${c.slug}.description`) || '',
    }));

    if (activeOnly) {
      this.activeCategoriesCache = enriched;
    } else {
      this.allCategoriesCache = enriched;
    }
    this.lastCacheTime = now;

    return enriched;
  }

  async findById(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    const trans = await this.prisma.translation.findMany({
      where: {
        key: {
          in: [`category.${category.slug}.name`, `category.${category.slug}.description`],
        },
      },
      select: { key: true, bn: true },
    });
    const transMap = new Map(trans.map((t) => [t.key, t.bn]));

    return {
      ...category,
      nameBn: transMap.get(`category.${category.slug}.name`) || '',
      descriptionBn: transMap.get(`category.${category.slug}.description`) || '',
    };
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'active' },
          include: {
            variants: { orderBy: { sortOrder: 'asc' } },
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    const trans = await this.prisma.translation.findMany({
      where: {
        key: {
          in: [`category.${category.slug}.name`, `category.${category.slug}.description`],
        },
      },
      select: { key: true, bn: true },
    });
    const transMap = new Map(trans.map((t) => [t.key, t.bn]));

    return {
      ...category,
      nameBn: transMap.get(`category.${category.slug}.name`) || '',
      descriptionBn: transMap.get(`category.${category.slug}.description`) || '',
    };
  }

  async create(data: {
    name: string;
    nameBn?: string;
    slug?: string;
    description?: string;
    descriptionBn?: string;
    imageUrl?: string;
    status?: string;
    sortOrder?: number;
  }) {
    const cleanName = typeof data.name === 'string' ? data.name.trim() : '';
    if (!cleanName) {
      throw new BadRequestException('Category name is required');
    }

    const finalSlug =
      typeof data.slug === 'string' && data.slug.trim()
        ? data.slug.trim().toLowerCase()
        : cleanName.toLowerCase().replace(NON_ALPHANUMERIC_REGEX, '-').replace(TRIM_DASHES_REGEX, '');

    const conflict = await this.prisma.category.findUnique({
      where: { slug: finalSlug },
      select: { id: true },
    });
    if (conflict) {
      throw new BadRequestException(`A category with slug "${finalSlug}" already exists. Please choose a unique URL slug.`);
    }

    const cleanDesc =
      typeof data.description === 'string' && data.description.trim()
        ? data.description.trim()
        : null;

    const cleanImageUrl =
      typeof data.imageUrl === 'string' && data.imageUrl.trim()
        ? data.imageUrl.trim()
        : null;

    const res = await this.prisma.category.create({
      data: {
        name: cleanName,
        slug: finalSlug,
        description: cleanDesc,
        imageUrl: cleanImageUrl,
        status: data.status || 'active',
        sortOrder: Number(data.sortOrder) || 0,
      },
    });

    const cleanNameBn =
      typeof data.nameBn === 'string' && data.nameBn.trim()
        ? data.nameBn.trim()
        : cleanName;

    await this.prisma.translation.upsert({
      where: { key: `category.${finalSlug}.name` },
      update: { bn: cleanNameBn, en: cleanName },
      create: {
        key: `category.${finalSlug}.name`,
        bn: cleanNameBn,
        en: cleanName,
        category: 'categories',
        description: `Category Name for ${cleanName}`,
      },
    });

    const cleanDescBn =
      typeof data.descriptionBn === 'string' && data.descriptionBn.trim()
        ? data.descriptionBn.trim()
        : (cleanDesc || '');

    if (cleanDescBn || cleanDesc) {
      await this.prisma.translation.upsert({
        where: { key: `category.${finalSlug}.description` },
        update: {
          bn: cleanDescBn,
          en: cleanDesc || '',
        },
        create: {
          key: `category.${finalSlug}.description`,
          bn: cleanDescBn,
          en: cleanDesc || '',
          category: 'categories',
          description: `Category Description for ${cleanName}`,
        },
      });
    }

    this.invalidateCache();
    return {
      ...res,
      nameBn: cleanNameBn,
      descriptionBn: cleanDescBn,
    };
  }

  async update(id: number, data: any) {
    const existing = await this.findById(id);

    // Whitelist and sanitize only valid Category table fields
    const updatePayload: {
      name?: string;
      slug?: string;
      description?: string | null;
      imageUrl?: string | null;
      status?: string;
      sortOrder?: number;
    } = {};

    if (typeof data.name === 'string' && data.name.trim()) {
      updatePayload.name = data.name.trim();
    }

    if (typeof data.slug === 'string' && data.slug.trim()) {
      const targetSlug = data.slug.trim().toLowerCase();
      // Check for slug conflicts with other categories
      const conflict = await this.prisma.category.findFirst({
        where: {
          slug: targetSlug,
          id: { not: id },
        },
        select: { id: true },
      });
      if (conflict) {
        throw new BadRequestException(
          `A category with slug "${targetSlug}" already exists. Please choose a unique URL slug.`,
        );
      }
      updatePayload.slug = targetSlug;
    }

    if (data.description !== undefined) {
      updatePayload.description =
        typeof data.description === 'string' && data.description.trim()
          ? data.description.trim()
          : null;
    }

    if (data.imageUrl !== undefined) {
      updatePayload.imageUrl =
        typeof data.imageUrl === 'string' && data.imageUrl.trim()
          ? data.imageUrl.trim()
          : null;
    }

    if (typeof data.status === 'string' && data.status.trim()) {
      updatePayload.status = data.status.trim();
    }

    if (data.sortOrder !== undefined) {
      updatePayload.sortOrder = Number(data.sortOrder) || 0;
    }

    const res = await this.prisma.category.update({
      where: { id },
      data: updatePayload,
    });

    const activeSlug = res.slug || existing.slug;

    // Safely handle Bengali translation for Name
    const rawNameBn = data.nameBn !== undefined ? data.nameBn : existing.nameBn;
    const cleanNameBn =
      typeof rawNameBn === 'string' && rawNameBn.trim()
        ? rawNameBn.trim()
        : res.name;

    await this.prisma.translation.upsert({
      where: { key: `category.${activeSlug}.name` },
      update: { bn: cleanNameBn, en: res.name },
      create: {
        key: `category.${activeSlug}.name`,
        bn: cleanNameBn,
        en: res.name,
        category: 'categories',
        description: `Category Name for ${res.name}`,
      },
    });

    // Safely handle Bengali translation for Description (prevents TypeError on null)
    const rawDescBn = data.descriptionBn !== undefined ? data.descriptionBn : existing.descriptionBn;
    const cleanDescBn =
      typeof rawDescBn === 'string' && rawDescBn.trim()
        ? rawDescBn.trim()
        : (res.description || '');
    const cleanEnDesc = res.description ? String(res.description).trim() : '';

    if (cleanDescBn || cleanEnDesc) {
      await this.prisma.translation.upsert({
        where: { key: `category.${activeSlug}.description` },
        update: { bn: cleanDescBn, en: cleanEnDesc },
        create: {
          key: `category.${activeSlug}.description`,
          bn: cleanDescBn,
          en: cleanEnDesc,
          category: 'categories',
          description: `Category Description for ${res.name}`,
        },
      });
    }

    // If slug changed, clean up old slug translations to avoid ghost records
    if (existing.slug && existing.slug !== activeSlug) {
      await this.prisma.translation
        .deleteMany({
          where: {
            key: {
              in: [
                `category.${existing.slug}.name`,
                `category.${existing.slug}.description`,
              ],
            },
          },
        })
        .catch(() => {});
    }

    this.invalidateCache();
    return {
      ...res,
      nameBn: cleanNameBn,
      descriptionBn: cleanDescBn,
    };
  }

  async delete(id: number) {
    const category = await this.findById(id);

    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}" because it contains ${productCount} product(s). Please reassign or delete the products first.`,
      );
    }

    const res = await this.prisma.category.delete({
      where: { id },
    });

    await this.prisma.translation
      .deleteMany({
        where: {
          key: {
            in: [
              `category.${category.slug}.name`,
              `category.${category.slug}.description`,
            ],
          },
        },
      })
      .catch(() => {});

    this.invalidateCache();
    return res;
  }
}
