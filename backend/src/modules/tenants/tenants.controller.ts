import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TenantsService } from './tenants.service';
import { MicroserviceAuthGuard } from './tenants.guard';
import { TenantBrandingResponse } from './tenants.interface';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * GET /api/tenants/branding
   * Looks up tenant branding metadata by incoming host or subdomain
   */
  @Get('branding')
  async getBranding(
    @Query('host') hostQuery?: string,
    @Req() req?: Request,
  ): Promise<TenantBrandingResponse> {
    const rawHost =
      hostQuery ||
      (req?.headers['x-forwarded-host'] as string) ||
      (req?.headers['host'] as string) ||
      '';

    return this.tenantsService.getBranding(rawHost);
  }

  /**
   * GET /api/tenants/asset
   * Secure asset-serving endpoint by tenant, size, and purpose.
   * Validates internal microservice token before serving image from private storage.
   */
  @UseGuards(MicroserviceAuthGuard)
  @Get('asset')
  async getTenantAsset(
    @Query('tenant') tenant: string = 'default',
    @Query('size') size: string = '192',
    @Query('purpose') purpose: string = 'any',
    @Res() res?: Response,
  ) {
    if (!res) {
      throw new BadRequestException('Response object unavailable');
    }

    const cleanTenant = String(tenant || 'default').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
    const cleanSize = String(size || '192').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 16);
    const cleanPurpose = purpose === 'maskable' ? 'maskable' : 'any';

    const asset = await this.tenantsService.getAsset(cleanTenant, cleanSize, cleanPurpose);

    res.setHeader('Content-Type', asset.mimeType || 'image/png');
    res.setHeader('Cache-Control', 'private, max-age=86400, stale-while-revalidate=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');

    return res.status(HttpStatus.OK).send(asset.buffer);
  }

  /**
   * GET /api/tenants/assets/:filename
   * Secure asset-serving endpoint by filename.
   * Validates internal microservice token and guards against directory traversal.
   */
  @UseGuards(MicroserviceAuthGuard)
  @Get('assets/:filename')
  async getAssetByFilename(
    @Param('filename') filename: string,
    @Res() res?: Response,
  ) {
    if (!res) {
      throw new BadRequestException('Response object unavailable');
    }

    const asset = await this.tenantsService.getAssetByFilename(filename);

    res.setHeader('Content-Type', asset.mimeType || 'image/png');
    res.setHeader('Cache-Control', 'private, max-age=86400, stale-while-revalidate=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');

    return res.status(HttpStatus.OK).send(asset.buffer);
  }
}
