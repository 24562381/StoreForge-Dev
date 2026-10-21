import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const MAX_STORE_SIZE = 50000; // LRU cap to protect memory

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static store = new Map<string, RateLimitRecord>();
  private static cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private reflector: Reflector) {
    if (!RateLimitGuard.cleanupTimer) {
      RateLimitGuard.cleanupTimer = setInterval(() => {
        RateLimitGuard.pruneExpired();
      }, 60000);
      if (typeof RateLimitGuard.cleanupTimer.unref === 'function') {
        RateLimitGuard.cleanupTimer.unref();
      }
    }
  }

  private static pruneExpired(): void {
    const now = Date.now();
    for (const [key, record] of RateLimitGuard.store.entries()) {
      if (now > record.resetTime) {
        RateLimitGuard.store.delete(key);
      }
    }
  }

  private getClientIp(req: any): string {
    const xForwardedFor = req.headers ? req.headers['x-forwarded-for'] : null;
    if (xForwardedFor) {
      const firstIp =
        typeof xForwardedFor === 'string'
          ? xForwardedFor.split(',')[0].trim()
          : Array.isArray(xForwardedFor)
          ? xForwardedFor[0].trim()
          : '';
      if (firstIp) return firstIp;
    }
    return (
      (req.headers && req.headers['x-real-ip']) ||
      req.ip ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      '127.0.0.1'
    );
  }

  private resolveTierLimits(path: string, method: string): { limit: number; ttl: number } {
    const normPath = (path || '').toLowerCase();

    // Tier 0: Initial Setup mutation (Strict anti-hammering & race defense: 5 req/min)
    if (normPath.includes('/auth/first-run-setup')) {
      return { limit: 5, ttl: 60000 };
    }

    // Tier 0.5: Setup status queries (60 req/min)
    if (normPath.includes('/auth/setup-status')) {
      return { limit: 60, ttl: 60000 };
    }

    // Tier 1: Auth endpoints (Brute-force protection: 30 req/min)
    if (normPath.includes('/auth/login') || normPath.includes('/auth/change-password')) {
      return { limit: 30, ttl: 60000 };
    }

    // Tier 2: Checkout & Payment mutations (Order spam protection: 30 req/min)
    if (
      (normPath.includes('/orders') && method === 'POST') ||
      (normPath.includes('/payment') && method === 'POST')
    ) {
      return { limit: 30, ttl: 60000 };
    }

    // Tier 3: Uploads (30 uploads/min)
    if (normPath.includes('/uploads') && method === 'POST') {
      return { limit: 30, ttl: 60000 };
    }

    // Tier 4: Reviews submission (30 reviews/min)
    if (normPath.includes('/reviews') && method === 'POST') {
      return { limit: 30, ttl: 60000 };
    }

    // Tier 5: General public & admin queries (300 req/min)
    return { limit: 300, ttl: 60000 };
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // Check decorator options
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (
      process.env.NODE_ENV === 'test' ||
      (process.env.NODE_ENV !== 'production' && req.headers?.['x-test-suite'] === 'true') ||
      options?.skip
    ) {
      return true;
    }

    const ip = this.getClientIp(req);
    const path = req.path || req.url || '';
    const method = req.method || 'GET';

    const tier = this.resolveTierLimits(path, method);
    const limit = options?.limit || tier.limit;
    const ttl = options?.ttl || tier.ttl;

    // Bucket key by IP and tier/path category (prevent cross-endpoint starvation)
    const category = options?.limit
      ? `custom:${limit}`
      : path.includes('/auth/first-run-setup')
      ? 'auth:setup'
      : path.includes('/auth/setup-status')
      ? 'auth:setup-status'
      : path.includes('/auth/change-password')
      ? 'auth:change-password'
      : path.includes('/auth/login')
      ? 'auth:login'
      : path.includes('/auth/')
      ? 'auth'
      : path.includes('/orders') && method === 'POST'
      ? 'orders'
      : path.includes('/uploads') && method === 'POST'
      ? 'uploads'
      : 'global';

    const key = `${ip}:${category}`;
    const now = Date.now();

    let record = RateLimitGuard.store.get(key);

    if (!record || now > record.resetTime) {
      // Memory safety cap
      if (RateLimitGuard.store.size >= MAX_STORE_SIZE) {
        RateLimitGuard.pruneExpired();
      }

      record = {
        count: 1,
        resetTime: now + ttl,
      };
      RateLimitGuard.store.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, limit - record.count);
    const resetSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

    // Attach standard rate limit headers
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('RateLimit-Limit', limit.toString());
      res.setHeader('RateLimit-Remaining', remaining.toString());
      res.setHeader('RateLimit-Reset', resetSeconds.toString());
    }

    if (record.count > limit) {
      if (res && typeof res.setHeader === 'function') {
        res.setHeader('Retry-After', resetSeconds.toString());
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Too many requests from this IP. Please try again in ${resetSeconds} seconds.`,
          retryAfter: resetSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
