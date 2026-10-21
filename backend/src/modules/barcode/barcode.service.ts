import { Injectable } from '@nestjs/common';
import * as bwipjs from 'bwip-js';

@Injectable()
export class BarcodeService {
  // OPTIMIZATION: Bounded in-memory LRU-like Map cache for rendered Barcode and QR code image buffers.
  // Generating barcodes consumes significant CPU (canvas/raster operations).
  // Caching up to 500 recently generated barcodes provides instant O(1) buffer retrieval for printing invoices and labels.
  private barcodeCache = new Map<string, Buffer>();
  private qrCache = new Map<string, Buffer>();
  private readonly MAX_CACHE_SIZE = 500;

  async generateBarcode(text: string): Promise<Buffer> {
    const cleanText = text.replace(/^#/, '');
    const cached = this.barcodeCache.get(cleanText);
    if (cached) {
      return cached;
    }

    const buffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: cleanText,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });

    if (this.barcodeCache.size >= this.MAX_CACHE_SIZE) {
      // Evict oldest item
      const firstKey = this.barcodeCache.keys().next().value;
      if (firstKey) this.barcodeCache.delete(firstKey);
    }
    this.barcodeCache.set(cleanText, buffer);

    return buffer;
  }

  async generateQrCode(text: string): Promise<Buffer> {
    const cached = this.qrCache.get(text);
    if (cached) {
      return cached;
    }

    const buffer = await bwipjs.toBuffer({
      bcid: 'qrcode',
      text,
      scale: 4,
    });

    if (this.qrCache.size >= this.MAX_CACHE_SIZE) {
      // Evict oldest item
      const firstKey = this.qrCache.keys().next().value;
      if (firstKey) this.qrCache.delete(firstKey);
    }
    this.qrCache.set(text, buffer);

    return buffer;
  }
}

