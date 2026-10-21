import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getFrontendUrl } from '../../common/utils/urls';

@Injectable()
export class SettingsService {
  // OPTIMIZATION: In-memory dictionary cache with TTL and auto-invalidation.
  // Precomputes publicSettings once during cache load, reducing CPU regex/filtering on hot routes from O(K) to O(1).
  private cache: Record<string, string> = {};
  private publicCache: Record<string, string> = {};
  private cacheLoaded = false;
  private lastCacheTime = 0;

  constructor(private readonly prisma: PrismaService) {}

  private async refreshCache(): Promise<Record<string, string>> {
    const settings = await this.prisma.setting.findMany({
      select: { key: true, value: true },
    });
    const map: Record<string, string> = {};
    for (let i = 0; i < settings.length; i++) {
      const s = settings[i];
      map[s.key] = s.value;
    }
    this.cache = map;

    // Precompute public settings to save CPU on high-throughput storefront traffic
    const sensitivePatterns = [
      /secret/i,
      /password/i,
      /pass(?:wd)?$/i,
      /api[_-]?key/i,
      /auth[_-]?token/i,
      /private[_-]?key/i,
      /access[_-]?key/i,
      /credential/i,
      /jwt/i,
      /smtp[_-]?pass/i,
      /sslcommerz/i,
      /^bkash_app_/,
      /^bkash_user/,
      /^bkash_pass/,
      /^sms_api_key$/,
      /^sms_client_id$/,
      /^storage_/,
      /^r2_/,
    ];

    const publicSettings: Record<string, string> = {};
    for (const [k, v] of Object.entries(map)) {
      const isSensitive = sensitivePatterns.some((pattern) => pattern.test(k));
      if (!isSensitive) {
        publicSettings[k] = v;
      }
    }

    const dbStoreUrl = String(map['store_url'] || map['frontend_url'] || '').trim();
    const envStoreUrl = getFrontendUrl();

    const isDbLocalhost = !dbStoreUrl || dbStoreUrl === 'http://localhost:3000' || dbStoreUrl === 'https://localhost:3000';
    const isEnvCustom = envStoreUrl && !envStoreUrl.includes('localhost') && !envStoreUrl.includes('127.0.0.1');

    const rawStoreUrl = (isDbLocalhost && isEnvCustom)
      ? envStoreUrl
      : (dbStoreUrl || envStoreUrl || getFrontendUrl());

    let cleanStoreUrl = String(rawStoreUrl || '').trim();
    if (/^(javascript|data|vbscript|blob):/i.test(cleanStoreUrl)) {
      cleanStoreUrl = 'http://localhost:3000';
    } else if (!/^https?:\/\//i.test(cleanStoreUrl)) {
      cleanStoreUrl = `http://${cleanStoreUrl}`;
    }

    publicSettings['store_url'] = cleanStoreUrl.replace(/\/+$/, '');
    publicSettings['frontend_url'] = publicSettings['store_url'];
    this.publicCache = publicSettings;

    this.cacheLoaded = true;
    this.lastCacheTime = Date.now();
    return this.cache;
  }

  async getAll(): Promise<Record<string, string>> {
    const now = Date.now();
    // Cache for 60 seconds or until explicitly invalidated
    if (!this.cacheLoaded || now - this.lastCacheTime > 60000) {
      await this.refreshCache();
    }
    return this.cache;
  }

  async getPublic(): Promise<Record<string, string>> {
    const now = Date.now();
    if (!this.cacheLoaded || now - this.lastCacheTime > 60000) {
      await this.refreshCache();
    }
    return this.publicCache;
  }

  async getAllDetailed() {
    return this.prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async get(key: string, defaultValue = ''): Promise<string> {
    const all = await this.getAll();
    return all[key] ?? defaultValue;
  }

  async set(key: string, value: string, description?: string) {
    const res = await this.prisma.setting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
    await this.refreshCache();
    return res;
  }

  async updateBulk(entries: Record<string, string>) {
    if (!entries || typeof entries !== 'object') {
      return this.getAll();
    }
    const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);
    const ops = [];

    for (const [rawKey, rawValue] of Object.entries(entries)) {
      const key = String(rawKey).trim();
      if (!key || dangerousKeys.has(key) || !/^[a-zA-Z0-9_-]+$/.test(key)) {
        continue;
      }
      const value = rawValue !== null && rawValue !== undefined ? String(rawValue) : '';
      ops.push(
        this.prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      );

      // Keep delivery_charge_dhaka and delivery_charge_inside synchronized
      if (key === 'delivery_charge_dhaka') {
        ops.push(
          this.prisma.setting.upsert({
            where: { key: 'delivery_charge_inside' },
            update: { value },
            create: { key: 'delivery_charge_inside', value },
          }),
        );
      } else if (key === 'delivery_charge_inside') {
        ops.push(
          this.prisma.setting.upsert({
            where: { key: 'delivery_charge_dhaka' },
            update: { value },
            create: { key: 'delivery_charge_dhaka', value },
          }),
        );
      } else if (key === 'store_url') {
        ops.push(
          this.prisma.setting.upsert({
            where: { key: 'frontend_url' },
            update: { value },
            create: { key: 'frontend_url', value },
          }),
        );
      } else if (key === 'frontend_url') {
        ops.push(
          this.prisma.setting.upsert({
            where: { key: 'store_url' },
            update: { value },
            create: { key: 'store_url', value },
          }),
        );
      }
    }

    if (ops.length > 0) {
      await this.prisma.$transaction(ops);
      await this.refreshCache();
    }
    return this.getAll();
  }
}
