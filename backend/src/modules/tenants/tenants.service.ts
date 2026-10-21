import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { SettingsService } from '../settings/settings.service';
import { StorageService } from '../uploads/storage/storage.service';
import { TenantBrandingResponse } from './tenants.interface';

// 1x1 transparent PNG fallback buffer in base64
const FALLBACK_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Look up branding metadata by hostname or subdomain
   */
  async getBranding(hostname?: string): Promise<TenantBrandingResponse> {
    const rawHost = String(hostname || '').trim().toLowerCase();
    const cleanHost = rawHost.split(':')[0].replace(/[^a-z0-9\.\-]/g, '');

    const settings = await this.settingsService.getAll();

    // Store Name Resolution (English prioritized for international/PWA standards)
    const englishName = (
      settings['store_name_en'] ||
      settings['site_name_en'] ||
      settings['site_title_en'] ||
      settings['store_name'] ||
      settings['site_name'] ||
      settings['site_title'] ||
      ''
    ).trim();

    const banglaName = (
      settings['store_name_bn'] ||
      settings['site_name_bn'] ||
      settings['site_title_bn'] ||
      ''
    ).trim();

    const rawName = englishName || banglaName || 'StoreForge';
    const cleanName = rawName.replace(/[\x00-\x1F\x7F<>'"&]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50);

    // Short name standard for PWA home screens (max 15 chars recommended by WebAPK)
    const shortName = cleanName.length > 15 ? cleanName.slice(0, 15).trim() : cleanName;

    // Tagline / Description Resolution
    const rawTagline = (
      settings['store_tagline_en'] ||
      settings['site_subtitle_en'] ||
      settings['site_description_en'] ||
      settings['store_tagline'] ||
      settings['site_subtitle'] ||
      settings['site_description'] ||
      settings['store_tagline_bn'] ||
      'Modern E-Commerce Store'
    ).trim();
    const cleanDesc = rawTagline.replace(/[\x00-\x1F\x7F<>'"&]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);

    // Theme & Background Colors
    let themeColor = '#8E5A35';
    if (settings['theme_color'] && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(settings['theme_color'].trim())) {
      themeColor = settings['theme_color'].trim();
    }

    const tenantId = cleanHost && cleanHost !== 'localhost' ? cleanHost.replace(/\./g, '_') : 'default';

    return {
      tenantId,
      name: cleanName,
      shortName,
      description: cleanDesc,
      themeColor,
      backgroundColor: '#FAF7F2',
      startUrl: '/',
      display: 'standalone',
      orientation: 'any',
      icons: {
        icon192: settings['store_icon_192'] || '',
        icon512: settings['store_icon_512'] || '',
        iconMaskable192: settings['store_icon_maskable_192'] || '',
        iconMaskable512: settings['store_icon_maskable_512'] || '',
        favicon: settings['store_favicon_url'] || '',
      },
      shortcuts: [
        {
          name: 'Shop Products',
          shortName: 'Products',
          description: 'Browse our catalog',
          url: '/products',
          icon: '/api/pwa/icon?tenant=' + tenantId + '&size=192',
        },
        {
          name: 'Track Order',
          shortName: 'Track',
          description: 'Check real-time delivery status',
          url: '/track',
          icon: '/api/pwa/icon?tenant=' + tenantId + '&size=192',
        },
      ],
    };
  }

  /**
   * Securely retrieve an asset buffer by tenant, size, and purpose (Local VPS disk or Private S3)
   */
  async getAsset(tenantId: string, size: string, purpose?: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const settings = await this.settingsService.getAll();
    const isMaskable = purpose?.toLowerCase() === 'maskable';
    const cleanSize = size?.toLowerCase() || '192';

    let settingKey = 'store_icon_192';
    if (isMaskable) {
      settingKey = cleanSize === '512' ? 'store_icon_maskable_512' : 'store_icon_maskable_192';
    } else if (cleanSize === '512') {
      settingKey = 'store_icon_512';
    } else if (cleanSize === 'favicon' || cleanSize === '64') {
      settingKey = 'store_favicon_url';
    }

    const assetRef = settings[settingKey] || settings['store_icon_192'] || settings['store_favicon_url'] || '';

    if (assetRef) {
      const asset = await this.storageService.getBuffer(assetRef);
      if (asset) {
        return asset;
      }
    }

    // Check fallback local icons if present on host
    const possibleFallbackPaths = [
      path.join(process.cwd(), `public/icons/icon-${cleanSize === '512' ? '512x512' : '192x192'}.png`),
      path.resolve(process.cwd(), `../frontend/public/icons/icon-${cleanSize === '512' ? '512x512' : '192x192'}.png`),
    ];

    for (const fallbackPath of possibleFallbackPaths) {
      try {
        if (fs.existsSync(fallbackPath)) {
          const buf = await fs.promises.readFile(fallbackPath);
          return { buffer: buf, mimeType: 'image/png' };
        }
      } catch {}
    }

    // Return safe fallback 1x1 PNG to guarantee valid image blob
    return {
      buffer: Buffer.from(FALLBACK_PNG_BASE64, 'base64'),
      mimeType: 'image/png',
    };
  }

  /**
   * Securely retrieve an asset by exact filename from local storage or cloud
   */
  async getAssetByFilename(filename: string): Promise<{ buffer: Buffer; mimeType: string }> {
    // Strictly prevent directory traversal
    const cleanFilename = path.basename(filename.split('?')[0]);
    if (!cleanFilename || cleanFilename.includes('..') || !/^[a-zA-Z0-9_\-\.]+$/.test(cleanFilename)) {
      throw new NotFoundException('Invalid asset filename format');
    }

    const asset = await this.storageService.getBuffer(cleanFilename);
    if (!asset) {
      throw new NotFoundException('Asset file not found in storage');
    }

    return asset;
  }
}
