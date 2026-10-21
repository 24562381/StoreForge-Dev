import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IStorageDriver,
  StorageConfig,
  StorageStats,
  StorageUploadResult,
  StorageProviderType,
} from './storage.interface';
import { LocalStorageDriver } from './local-storage.driver';
import { S3StorageDriver } from './s3-storage.driver';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private activeDriver: IStorageDriver;
  private localDriver: LocalStorageDriver;
  private currentConfig: StorageConfig;

  constructor(private readonly prisma: PrismaService) {
    this.localDriver = new LocalStorageDriver();
    this.activeDriver = this.localDriver;
    this.currentConfig = {
      driver: 'local',
      provider: 'local',
    };
  }

  async onModuleInit() {
    await this.reloadConfiguration();
  }

  /**
   * Reads settings from PostgreSQL (with fallback to .env) and dynamically instantiates active driver
   */
  async reloadConfiguration(): Promise<void> {
    try {
      const dbSettings = await this.prisma.setting.findMany({
        where: {
          key: {
            in: [
              'storage_driver',
              'storage_provider',
              'storage_endpoint',
              'storage_region',
              'storage_bucket',
              'storage_access_key_id',
              'storage_secret_access_key',
              'storage_public_url',
              'storage_force_path_style',
            ],
          },
        },
      });

      const map: Record<string, string> = {};
      for (const s of dbSettings) {
        if (s.value) map[s.key] = s.value;
      }

      const driver = (map['storage_driver'] || process.env.STORAGE_DRIVER || 'local').toLowerCase() as 'local' | 's3';
      const provider = (map['storage_provider'] || process.env.STORAGE_PROVIDER || 'local').toLowerCase() as StorageProviderType;
      const endpoint = map['storage_endpoint'] || process.env.STORAGE_ENDPOINT || process.env.R2_ENDPOINT || '';
      const region = map['storage_region'] || process.env.STORAGE_REGION || process.env.R2_REGION || 'auto';
      const bucket = map['storage_bucket'] || process.env.STORAGE_BUCKET || process.env.R2_BUCKET_NAME || '';
      const accessKeyId = map['storage_access_key_id'] || process.env.STORAGE_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '';
      const secretAccessKey = map['storage_secret_access_key'] || process.env.STORAGE_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '';
      const publicUrl = map['storage_public_url'] || process.env.STORAGE_PUBLIC_URL || process.env.R2_PUBLIC_URL || '';
      const forcePathStyle = map['storage_force_path_style'] === 'true' || process.env.STORAGE_FORCE_PATH_STYLE === 'true';

      this.currentConfig = {
        driver,
        provider,
        endpoint,
        region,
        bucket,
        accessKeyId,
        secretAccessKey,
        publicUrl,
        forcePathStyle,
      };

      if (driver === 's3' && bucket && accessKeyId && secretAccessKey) {
        this.activeDriver = new S3StorageDriver(this.currentConfig);
        this.logger.log(`Active storage driver: S3 / Cloud (${provider}) -> Bucket: ${bucket}`);
      } else {
        this.activeDriver = this.localDriver;
        this.logger.log(`Active storage driver: Local VPS Disk`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to load storage configuration: ${err.message}. Defaulting to Local VPS.`);
      this.activeDriver = this.localDriver;
    }
  }

  /**
   * Upload file buffer through active driver (with graceful local fallback if cloud fails)
   */
  async upload(fileBuffer: Buffer, filename: string, mimeType: string): Promise<StorageUploadResult> {
    try {
      return await this.activeDriver.upload(fileBuffer, filename, mimeType);
    } catch (err: any) {
      if (this.activeDriver.provider !== 'local') {
        this.logger.warn(`Cloud storage upload failed: ${err.message}. Falling back to local storage.`);
        return await this.localDriver.upload(fileBuffer, filename, mimeType);
      }
      throw err;
    }
  }

  /**
   * Delete file
   */
  async delete(key: string): Promise<boolean> {
    try {
      const deletedFromActive = await this.activeDriver.delete(key);
      await this.localDriver.delete(key);
      return deletedFromActive;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve file buffer and MIME type securely (supporting both active S3 and local storage)
   */
  async getBuffer(keyOrUrl: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (!keyOrUrl || typeof keyOrUrl !== 'string') return null;

    let cleanKey = keyOrUrl.trim();
    if (cleanKey.includes('://')) {
      try {
        const parsed = new URL(cleanKey);
        cleanKey = parsed.pathname.replace(/^\/+/, '');
      } catch {
        cleanKey = path.basename(cleanKey);
      }
    }
    cleanKey = cleanKey.replace(/^\/?(uploads\/)?/, '');
    cleanKey = path.basename(cleanKey.split('?')[0]);

    if (!cleanKey || cleanKey.includes('..')) {
      return null;
    }

    let buffer: Buffer | null = null;
    if (this.activeDriver.getBuffer) {
      try {
        buffer = await this.activeDriver.getBuffer(cleanKey);
      } catch {
        buffer = null;
      }
    }

    if (!buffer && this.localDriver.getBuffer) {
      try {
        buffer = await this.localDriver.getBuffer(cleanKey);
      } catch {
        buffer = null;
      }
    }

    if (!buffer) return null;

    let mimeType = 'image/png';
    const ext = path.extname(cleanKey).toLowerCase();
    if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.svg') mimeType = 'image/svg+xml';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.ico') mimeType = 'image/x-icon';

    return { buffer, mimeType };
  }

  /**
   * Get detailed health and size metrics for Admin Dashboard
   */
  async getStorageStatus(): Promise<StorageStats & { localStats: Partial<StorageStats> }> {
    const activeStats = await this.activeDriver.getStats();
    const localStats = await this.localDriver.getStats();

    return {
      driver: this.currentConfig.driver,
      provider: this.activeDriver.provider,
      providerLabel: activeStats.providerLabel || 'Local VPS Disk',
      isOperational: activeStats.isOperational ?? true,
      totalFiles: activeStats.totalFiles ?? localStats.totalFiles ?? 0,
      totalSizeBytes: activeStats.totalSizeBytes ?? localStats.totalSizeBytes ?? 0,
      totalSizeFormatted: activeStats.totalSizeFormatted || localStats.totalSizeFormatted || '0 B',
      vpsFreeSpaceBytes: localStats.vpsFreeSpaceBytes,
      vpsFreeSpaceFormatted: localStats.vpsFreeSpaceFormatted,
      pingLatencyMs: activeStats.pingLatencyMs,
      errorMessage: activeStats.errorMessage,
      publicBaseUrl: activeStats.publicBaseUrl,
      localStats,
    };
  }

  /**
   * Test S3 / Cloud connection with given or current configuration
   */
  async testConnection(customConfig?: Partial<StorageConfig>): Promise<{ success: boolean; latencyMs?: number; message?: string }> {
    const configToTest: StorageConfig = {
      ...this.currentConfig,
      ...(customConfig || {}),
    };

    if (configToTest.driver === 'local') {
      return this.localDriver.testConnection();
    }

    try {
      const testDriver = new S3StorageDriver(configToTest);
      return await testDriver.testConnection();
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Could not instantiate S3 client with given credentials',
      };
    }
  }

  /**
   * One-click Sync: Copy all local photos to Cloud S3 bucket
   */
  async syncLocalToCloud(): Promise<{
    totalFound: number;
    syncedCount: number;
    failedCount: number;
    skippedCount: number;
    errors: string[];
  }> {
    if (this.currentConfig.driver !== 's3' || !(this.activeDriver instanceof S3StorageDriver)) {
      throw new Error('Cloud storage is not currently configured or active. Enable S3/R2 mode first.');
    }

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      return { totalFound: 0, syncedCount: 0, failedCount: 0, skippedCount: 0, errors: [] };
    }

    const files = await fs.promises.readdir(uploadDir);
    let totalFound = 0;
    let syncedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      try {
        const stat = await fs.promises.stat(filePath);
        if (!stat.isFile()) continue;

        totalFound++;
        const ext = path.extname(file).toLowerCase();
        let mimeType = 'image/webp';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';

        const buffer = await fs.promises.readFile(filePath);
        await this.activeDriver.upload(buffer, file, mimeType);
        syncedCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`${file}: ${err.message}`);
      }
    }

    return {
      totalFound,
      syncedCount,
      failedCount,
      skippedCount,
      errors: errors.slice(0, 10), // Limit error list
    };
  }

  getCurrentConfig(): Omit<StorageConfig, 'secretAccessKey'> & { hasSecretKey: boolean } {
    return {
      driver: this.currentConfig.driver,
      provider: this.currentConfig.provider,
      endpoint: this.currentConfig.endpoint,
      region: this.currentConfig.region,
      bucket: this.currentConfig.bucket,
      accessKeyId: this.currentConfig.accessKeyId,
      publicUrl: this.currentConfig.publicUrl,
      forcePathStyle: this.currentConfig.forcePathStyle,
      hasSecretKey: Boolean(this.currentConfig.secretAccessKey && this.currentConfig.secretAccessKey.length > 0),
    };
  }
}
