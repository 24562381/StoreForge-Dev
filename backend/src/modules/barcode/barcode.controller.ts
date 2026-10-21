import { Controller, Get, Param, Res, BadRequestException } from '@nestjs/common';
import { BarcodeService } from './barcode.service';
import { Response } from 'express';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @RateLimit({ limit: 40, ttl: 60000 })
  @Get('code128/:text')
  async getBarcode(@Param('text') text: string, @Res() res: Response) {
    if (!text || text.length > 64) {
      throw new BadRequestException('Barcode text must be between 1 and 64 characters');
    }
    try {
      const buffer = await this.barcodeService.generateBarcode(text);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch {
      throw new BadRequestException('Failed to generate Code128 barcode for provided text');
    }
  }

  @RateLimit({ limit: 40, ttl: 60000 })
  @Get('qr/:text')
  async getQr(@Param('text') text: string, @Res() res: Response) {
    if (!text || text.length > 300) {
      throw new BadRequestException('QR code text must be between 1 and 300 characters');
    }
    try {
      const buffer = await this.barcodeService.generateQrCode(text);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch {
      throw new BadRequestException('Failed to generate QR code for provided text');
    }
  }
}

