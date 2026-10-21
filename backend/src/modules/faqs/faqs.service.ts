import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FaqsService {
  // OPTIMIZATION: Dual in-memory cache for published FAQs (storefront) and full FAQ sets (admin).
  // Prevents repeat database roundtrips on high-traffic landing pages.
  // Automatically invalidated on any FAQ create/update/delete.
  private publishedFaqsCache: any[] | null = null;
  private allFaqsCache: any[] | null = null;
  private lastCacheTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  private invalidateCache() {
    this.publishedFaqsCache = null;
    this.allFaqsCache = null;
    this.lastCacheTime = 0;
  }

  async findAll(onlyPublished = false) {
    const now = Date.now();
    if (onlyPublished && this.publishedFaqsCache && now - this.lastCacheTime < 60000) {
      return this.publishedFaqsCache;
    }
    if (!onlyPublished && this.allFaqsCache && now - this.lastCacheTime < 60000) {
      return this.allFaqsCache;
    }

    const faqs = await this.prisma.faq.findMany({
      where: onlyPublished ? { isPublished: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    const faqIds = faqs.map((f) => f.id);
    const transKeys = faqIds.flatMap((id) => [`faq.${id}.question`, `faq.${id}.answer`]);
    const translations = transKeys.length
      ? await this.prisma.translation.findMany({
          where: { key: { in: transKeys } },
          select: { key: true, bn: true },
        })
      : [];

    const transMap = new Map(translations.map((t) => [t.key, t.bn]));
    const enrichedFaqs = faqs.map((f) => ({
      ...f,
      questionBn: transMap.get(`faq.${f.id}.question`) || '',
      answerBn: transMap.get(`faq.${f.id}.answer`) || '',
    }));

    if (onlyPublished) {
      this.publishedFaqsCache = enrichedFaqs;
    } else {
      this.allFaqsCache = enrichedFaqs;
    }
    this.lastCacheTime = now;

    return enrichedFaqs;
  }

  async findById(id: number) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException(`FAQ #${id} not found`);
    return faq;
  }

  async create(data: { question: string; answer: string; isPublished?: boolean; sortOrder?: number }) {
    const res = await this.prisma.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        isPublished: data.isPublished ?? true,
        sortOrder: data.sortOrder || 0,
      },
    });
    this.invalidateCache();
    return res;
  }

  async update(id: number, data: any) {
    await this.findById(id);
    const res = await this.prisma.faq.update({ where: { id }, data });
    this.invalidateCache();
    return res;
  }

  async delete(id: number) {
    await this.findById(id);
    const res = await this.prisma.faq.delete({ where: { id } });
    this.invalidateCache();
    return res;
  }
}
