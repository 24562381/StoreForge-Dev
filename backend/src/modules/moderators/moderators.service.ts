import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { sanitizeString, sanitizePhone } from '../../common/utils/sanitize';
import { hasPermission, PERMISSIONS } from '../../common/constants/permissions';
import { clearStaffCache } from '../../common/guards/admin.guard';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ModeratorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Filters out confidential data (NID, NID photo, present/permanent address)
   * unless requester is Super Admin, viewing their own record, or has explicit VIEW_SENSITIVE_INFO permission.
   */
  private filterConfidentialFields(user: any, requester: any) {
    if (!user) return null;
    const isSuperAdmin = requester?.role === 'admin';
    const requesterId = Number(requester?.id || requester?.userId || requester?.sub);
    const isSelf = requesterId > 0 && requesterId === Number(user.id);
    const hasViewPerm =
      hasPermission(requester, PERMISSIONS.VIEW_SENSITIVE_INFO) ||
      hasPermission(requester, PERMISSIONS.MODERATORS_MANAGE);

    const canViewConfidential = isSuperAdmin || isSelf || hasViewPerm;

    if (canViewConfidential) {
      return user;
    }

    // Redact confidential records for unauthorized viewers
    const { nidNumber, nidPhoto, presentAddress, permanentAddress, ...sanitized } = user;
    return {
      ...sanitized,
      nidNumber: null,
      nidPhoto: null,
      presentAddress: null,
      permanentAddress: null,
      isConfidentialRedacted: true,
    };
  }

  async getAllModerators(requester: any) {
    const users = await this.prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        photo: true,
        nidNumber: true,
        nidPhoto: true,
        presentAddress: true,
        permanentAddress: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users.map((u) => this.filterConfidentialFields(u, requester));
  }

  async getModeratorById(id: number, requester: any) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid moderator ID');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: numericId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        photo: true,
        nidNumber: true,
        nidPhoto: true,
        presentAddress: true,
        permanentAddress: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Staff member / Moderator not found');
    }

    return this.filterConfidentialFields(user, requester);
  }

  async createModerator(
    data: {
      name: string;
      email: string;
      password?: string;
      role?: string;
      phone?: string;
      photo?: string;
      nidNumber?: string;
      nidPhoto?: string;
      presentAddress?: string;
      permanentAddress?: string;
      permissions?: string[] | string;
    },
    requester: any,
  ) {
    const name = sanitizeString(data.name, 100);
    const email = sanitizeString(data.email, 150).toLowerCase();
    const rawPassword = data.password ? String(data.password).trim() : '';

    if (!name || !email) {
      throw new BadRequestException('Name and email are required');
    }

    if (!rawPassword || rawPassword.length < 6) {
      throw new BadRequestException('Initial password of at least 6 characters is required');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('A user with this email address already exists');
    }

    // Role verification: only super admin can create other admins
    let targetRole = data.role === 'admin' ? 'admin' : 'moderator';
    if (targetRole === 'admin' && requester?.role !== 'admin') {
      targetRole = 'moderator';
    }

    let permissionsStr = '[]';
    if (targetRole === 'admin') {
      permissionsStr = JSON.stringify(['*']);
    } else if (data.permissions) {
      if (Array.isArray(data.permissions)) {
        const cleanPerms =
          requester?.role === 'admin'
            ? data.permissions
            : data.permissions.filter((p: string) => p !== '*');
        permissionsStr = JSON.stringify(cleanPerms);
      } else if (typeof data.permissions === 'string') {
        try {
          const parsed = JSON.parse(data.permissions);
          const cleanPerms = Array.isArray(parsed)
            ? requester?.role === 'admin'
              ? parsed
              : parsed.filter((p: string) => p !== '*')
            : [];
          permissionsStr = JSON.stringify(cleanPerms);
        } catch {
          permissionsStr = JSON.stringify([]);
        }
      }
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const created = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: targetRole,
        phone: data.phone ? sanitizePhone(data.phone) : null,
        photo: data.photo ? sanitizeString(data.photo, 1000) : null,
        nidNumber: data.nidNumber ? sanitizeString(data.nidNumber, 100) : null,
        nidPhoto: data.nidPhoto ? sanitizeString(data.nidPhoto, 1000) : null,
        presentAddress: data.presentAddress ? sanitizeString(data.presentAddress, 1000) : null,
        permanentAddress: data.permanentAddress ? sanitizeString(data.permanentAddress, 1000) : null,
        permissions: permissionsStr,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        photo: true,
        nidNumber: true,
        nidPhoto: true,
        presentAddress: true,
        permanentAddress: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    return created;
  }

  async updateModerator(
    id: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      phone?: string;
      photo?: string;
      nidNumber?: string;
      nidPhoto?: string;
      presentAddress?: string;
      permanentAddress?: string;
      permissions?: string[] | string;
      isActive?: boolean;
    },
    requester: any,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid moderator ID');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: numericId },
    });

    if (!user) {
      throw new NotFoundException('Moderator / Staff member not found');
    }

    // Protect primary super admin from being demoted or deactivated
    if (user.id === 1 || user.email === 'admin@storeforge.io' || user.email === 'admin@woodenmap.com') {
      if (data.isActive === false) {
        throw new BadRequestException('The primary system administrator account cannot be deactivated');
      }
      if (data.role && data.role !== 'admin') {
        throw new BadRequestException('The primary system administrator role cannot be changed');
      }
    }

    // Object-Level Authorization: Non-admins cannot modify administrator accounts
    if (user.role === 'admin' && requester?.role !== 'admin') {
      throw new ForbiddenException('Only system administrators can modify administrator accounts');
    }

    const updatePayload: any = {};

    if (data.name !== undefined) {
      updatePayload.name = sanitizeString(data.name, 100);
    }

    if (data.email !== undefined) {
      const cleanEmail = sanitizeString(data.email, 150).toLowerCase();
      if (cleanEmail && cleanEmail !== user.email) {
        const existing = await this.prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (existing && existing.id !== numericId) {
          throw new BadRequestException('Email address is already in use by another user');
        }
        updatePayload.email = cleanEmail;
      }
    }

    if (data.password && String(data.password).trim().length >= 6) {
      updatePayload.password = await bcrypt.hash(String(data.password).trim(), 10);
    }

    if (data.phone !== undefined) {
      updatePayload.phone = data.phone ? sanitizePhone(data.phone) : null;
    }

    if (data.photo !== undefined) {
      updatePayload.photo = data.photo ? sanitizeString(data.photo, 1000) : null;
    }

    if (data.nidNumber !== undefined) {
      updatePayload.nidNumber = data.nidNumber ? sanitizeString(data.nidNumber, 100) : null;
    }

    if (data.nidPhoto !== undefined) {
      updatePayload.nidPhoto = data.nidPhoto ? sanitizeString(data.nidPhoto, 1000) : null;
    }

    if (data.presentAddress !== undefined) {
      updatePayload.presentAddress = data.presentAddress ? sanitizeString(data.presentAddress, 1000) : null;
    }

    if (data.permanentAddress !== undefined) {
      updatePayload.permanentAddress = data.permanentAddress ? sanitizeString(data.permanentAddress, 1000) : null;
    }

    if (data.isActive !== undefined) {
      updatePayload.isActive = Boolean(data.isActive);
    }

    if (requester?.role === 'admin' && data.role !== undefined) {
      updatePayload.role = data.role === 'admin' ? 'admin' : 'moderator';
    }

    if (data.permissions !== undefined) {
      if (updatePayload.role === 'admin' || user.role === 'admin') {
        updatePayload.permissions = JSON.stringify(['*']);
      } else if (Array.isArray(data.permissions)) {
        const cleanPerms =
          requester?.role === 'admin'
            ? data.permissions
            : data.permissions.filter((p: string) => p !== '*');
        updatePayload.permissions = JSON.stringify(cleanPerms);
      } else if (typeof data.permissions === 'string') {
        try {
          const parsed = JSON.parse(data.permissions);
          const cleanPerms = Array.isArray(parsed)
            ? requester?.role === 'admin'
              ? parsed
              : parsed.filter((p: string) => p !== '*')
            : [];
          updatePayload.permissions = JSON.stringify(cleanPerms);
        } catch {
          updatePayload.permissions = JSON.stringify([]);
        }
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: numericId },
      data: updatePayload,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        photo: true,
        nidNumber: true,
        nidPhoto: true,
        presentAddress: true,
        permanentAddress: true,
        permissions: true,
        isActive: true,
        updatedAt: true,
      },
    });

    clearStaffCache(numericId);

    return this.filterConfidentialFields(updated, requester);
  }

  async deleteModerator(id: number, requester: any) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new BadRequestException('Invalid moderator ID');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: numericId },
    });

    if (!user) {
      throw new NotFoundException('Moderator not found');
    }

    if (user.id === 1 || user.email === 'admin@storeforge.io' || user.email === 'admin@woodenmap.com') {
      throw new BadRequestException('Primary system administrator account cannot be deleted');
    }

    // Object-Level Authorization: Only administrators can delete administrator accounts
    if (user.role === 'admin' && requester?.role !== 'admin') {
      throw new ForbiddenException('Only system administrators can delete administrator accounts');
    }

    const requesterId = Number(requester?.id || requester?.userId || requester?.sub);
    if (requesterId > 0 && requesterId === numericId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.prisma.user.delete({
      where: { id: numericId },
    });

    clearStaffCache(numericId);

    return { success: true, message: `Staff account "${user.name}" removed successfully` };
  }
}
