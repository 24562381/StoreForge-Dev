import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomizationDto, UpdateCustomizationStatusDto } from './dto/create-customization.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: Customer submits a customization request
   */
  async create(dto: CreateCustomizationDto) {
    return this.prisma.customizationRequest.create({
      data: {
        customerName: dto.customerName.trim(),
        customerPhone: dto.customerPhone.trim(),
        customerEmail: dto.customerEmail?.trim() || null,
        customerAddress: dto.customerAddress?.trim() || null,
        preferredSize: dto.preferredSize?.trim() || null,
        preferredColor: dto.preferredColor?.trim() || null,
        description: dto.description.trim(),
        referenceImage: dto.referenceImage?.trim() || null,
        estimatedBudget: dto.estimatedBudget?.trim() || null,
        status: 'pending',
      },
    });
  }

  /**
   * Admin: List all customization requests with search, filter, and pagination
   */
  async findAllAdmin(query: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.CustomizationRequestWhereInput = {};

    if (query.status && query.status !== 'all') {
      where.status = query.status.trim().toLowerCase();
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { preferredSize: { contains: q, mode: 'insensitive' } },
        { preferredColor: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customizationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customizationRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  /**
   * Admin: Get counts for status badges
   */
  async getStatsAdmin() {
    const [total, pending, contacted, inProgress, completed, cancelled] = await Promise.all([
      this.prisma.customizationRequest.count(),
      this.prisma.customizationRequest.count({ where: { status: 'pending' } }),
      this.prisma.customizationRequest.count({ where: { status: 'contacted' } }),
      this.prisma.customizationRequest.count({ where: { status: 'in_progress' } }),
      this.prisma.customizationRequest.count({ where: { status: 'completed' } }),
      this.prisma.customizationRequest.count({ where: { status: 'cancelled' } }),
    ]);

    return {
      total,
      pending,
      contacted,
      inProgress,
      completed,
      cancelled,
    };
  }

  /**
   * Admin: Find single request details
   */
  async findByIdAdmin(id: number) {
    const request = await this.prisma.customizationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Customization request #${id} not found`);
    }

    return request;
  }

  /**
   * Admin: Update status and notes
   */
  async updateAdmin(id: number, dto: UpdateCustomizationStatusDto) {
    await this.findByIdAdmin(id);

    return this.prisma.customizationRequest.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status.trim().toLowerCase() } : {}),
        ...(dto.adminNotes !== undefined ? { adminNotes: dto.adminNotes } : {}),
      },
    });
  }

  /**
   * Admin: Delete request
   */
  async deleteAdmin(id: number) {
    await this.findByIdAdmin(id);

    return this.prisma.customizationRequest.delete({
      where: { id },
    });
  }
}
