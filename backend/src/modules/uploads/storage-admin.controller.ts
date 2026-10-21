import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { StorageService } from './storage/storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageConfig } from './storage/storage.interface';

@Controller(['storage', 'uploads/storage'])
@UseGuards(AuthGuard('jwt'), AdminGuard)
@RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
export class StorageAdminController {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Admin: Get storage server health, active driver, and capacity stats
   */
  @Get('status')
  async getStatus() {
    const stats = await this.storageService.getStorageStatus();
    const config = this.storageService.getCurrentConfig();
    return {
      stats,
      config,
    };
  }

  /**
   * Admin: Live test storage connectivity with given credentials
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testConnection(@Body() body: Partial<StorageConfig>) {
    const res = await this.storageService.testConnection(body);
    return {
      ...res,
      pingMs: (res as any).latencyMs ?? (res as any).pingMs ?? 1,
    };
  }

  /**
   * Admin: Save storage configuration and instantly activate driver
   */
  @Post('config')
  @HttpCode(HttpStatus.OK)
  async saveConfig(@Body() body: Record<string, string>) {
    const keyMapping: Record<string, string | undefined> = {
      storage_driver: body.storage_driver ?? body.driver,
      storage_provider: body.storage_provider ?? body.provider,
      storage_endpoint: body.storage_endpoint ?? body.endpoint,
      storage_region: body.storage_region ?? body.region,
      storage_bucket: body.storage_bucket ?? body.bucket,
      storage_access_key_id: body.storage_access_key_id ?? body.accessKeyId,
      storage_secret_access_key: body.storage_secret_access_key ?? body.secretAccessKey,
      storage_public_url: body.storage_public_url ?? body.publicUrl,
      storage_force_path_style: body.storage_force_path_style !== undefined
        ? String(body.storage_force_path_style)
        : (body.forcePathStyle !== undefined ? String(body.forcePathStyle) : undefined),
    };

    const updates: Promise<any>[] = [];

    for (const [key, val] of Object.entries(keyMapping)) {
      if (val !== undefined) {
        // If secret key is unchanged / masked placeholder, don't overwrite with empty
        if (key === 'storage_secret_access_key' && (!val || String(val).startsWith('••••'))) {
          continue;
        }

        updates.push(
          this.prisma.setting.upsert({
            where: { key },
            update: { value: String(val).trim() },
            create: { key, value: String(val).trim() },
          }),
        );
      }
    }

    await Promise.all(updates);
    await this.storageService.reloadConfiguration();

    return {
      success: true,
      message: 'Storage settings saved and driver reloaded.',
      config: this.storageService.getCurrentConfig(),
    };
  }

  /**
   * Admin: One-click sync local photos to cloud storage
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncLocalToCloud() {
    return this.storageService.syncLocalToCloud();
  }
}
