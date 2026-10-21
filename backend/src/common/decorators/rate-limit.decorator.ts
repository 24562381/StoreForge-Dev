import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  limit: number;
  ttl?: number; // Window duration in milliseconds (defaults to 60000ms / 1 min)
  skip?: boolean;
}

export const RATE_LIMIT_KEY = 'rate_limit_options';

/**
 * Custom Rate Limit decorator to set per-route request limits
 */
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

/**
 * Skip rate limiting on specific public health checks or webhooks
 */
export const SkipRateLimit = () => SetMetadata(RATE_LIMIT_KEY, { skip: true });
