import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { hasPermission } from '../constants/permissions';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

interface CachedStaff {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    permissions: string | null;
    isActive: boolean;
  };
  expiresAt: number;
}

const STAFF_CACHE = new Map<number, CachedStaff>();
const STAFF_CACHE_TTL_MS = 15000; // 15 seconds fast cache

/**
 * Manually evict a staff member from the cache or clear entire cache.
 */
export function clearStaffCache(userId?: number) {
  if (userId) {
    STAFF_CACHE.delete(Number(userId));
  } else {
    STAFF_CACHE.clear();
  }
}

/**
 * AdminGuard / StaffGuard: Live DB Identity, Suspension Verification, RBAC & Security Audit Guard.
 * Enforces live database identity checks, active account checks, and granular permission enforcement.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger('StaffSecurity');

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenPayload = request.user;

    if (!tokenPayload || (!tokenPayload.userId && !tokenPayload.sub)) {
      throw new UnauthorizedException('Authentication required');
    }

    const userId = Number(tokenPayload.userId || tokenPayload.sub);
    if (isNaN(userId) || userId <= 0) {
      throw new UnauthorizedException('Invalid user identity');
    }

    // 1. Check in-memory short-lived cache before querying database
    const now = Date.now();
    let dbUser: CachedStaff['user'] | null = null;
    const cached = STAFF_CACHE.get(userId);

    if (cached && cached.expiresAt > now) {
      dbUser = cached.user;
    } else {
      dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          isActive: true,
        },
      });

      if (dbUser) {
        STAFF_CACHE.set(userId, { user: dbUser, expiresAt: now + STAFF_CACHE_TTL_MS });
      } else {
        STAFF_CACHE.delete(userId);
      }
    }

    if (!dbUser) {
      this.logger.warn(`[SECURITY ALERT] Request with non-existent user ID: ${userId}`);
      throw new UnauthorizedException('Staff identity verification failed');
    }

    // 2. Check if account is active
    if (dbUser.isActive === false) {
      this.logger.warn(`[SECURITY ALERT] Suspended staff account attempted access: ${dbUser.email}`);
      throw new UnauthorizedException('Account has been suspended by store administration');
    }

    // 3. Verify Role: must be admin or moderator
    if (dbUser.role !== 'admin' && dbUser.role !== 'moderator') {
      const cleanPath = request.path || (request.url ? request.url.split('?')[0] : '');
      this.logger.warn(
        `[SECURITY ALERT] Non-staff user "${dbUser.email}" attempted staff action: ${request.method} ${cleanPath}`,
      );
      throw new ForbiddenException('Staff privileges required');
    }

    // 4. Granular Permission Check
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPermissions && requiredPermissions.length > 0) {
      if (dbUser.role !== 'admin') {
        const hasAllRequired = requiredPermissions.every((perm) => hasPermission(dbUser, perm));
        if (!hasAllRequired) {
          this.logger.warn(
            `[ACCESS DENIED] Moderator "${dbUser.email}" lacks required permissions [${requiredPermissions.join(', ')}] on ${request.method} ${request.url}`,
          );
          throw new ForbiddenException(
            `Access denied. You lack the necessary permission (${requiredPermissions.join(', ')}) to perform this action.`,
          );
        }
      }
    }

    // Attach live verified user to request object
    request.adminUser = dbUser;
    request.staffUser = dbUser;

    // 5. Silent Background Security Audit: Log all administrative modifications
    const method = request.method;
    if (MUTATION_METHODS.has(method)) {
      const clientIp = request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown';
      const cleanIp = Array.isArray(clientIp) ? clientIp[0] : clientIp;
      this.logger.log(
        `[AUDIT] Staff (${dbUser.role}) "${dbUser.name}" <${dbUser.email}> modified ${request.url} via ${method} (IP: ${cleanIp})`,
      );
    }

    return true;
  }
}
