import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import * as crypto from 'crypto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { StorageService } from './storage/storage.service';
import { SettingsService } from '../settings/settings.service';

const uploadTmpDir = join(process.cwd(), 'public/uploads/tmp');
if (!fs.existsSync(uploadTmpDir)) {
  fs.mkdirSync(uploadTmpDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MIME_MATCH_REGEX = /^image\/(jpeg|png|webp|gif)$/i;

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly storageService: StorageService,
    private readonly settingsService: SettingsService,
  ) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadTmpDir,
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(16).toString('hex');
          cb(null, `tmp_${randomName}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext) || !MIME_MATCH_REGEX.test(file.mimetype)) {
          return cb(new BadRequestException('Only safe image files (.jpg, .jpeg, .png, .webp, .gif) are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const randomName = crypto.randomBytes(16).toString('hex');
    const mainFilename = `${randomName}.webp`;
    const thumbFilename = `thumb_${randomName}.webp`;

    try {
      // 1. Optimize main image with sharp to WebP
      const webpBuffer = await sharp(file.path)
        .rotate()
        .webp({ quality: 85 })
        .toBuffer();

      const mainResult = await this.storageService.upload(webpBuffer, mainFilename, 'image/webp');

      // 2. Generate thumbnail WebP
      let thumbnailUrl = mainResult.url;
      try {
        const thumbBuffer = await sharp(file.path)
          .rotate()
          .resize(300, 300, { fit: 'inside' })
          .webp({ quality: 80 })
          .toBuffer();

        const thumbResult = await this.storageService.upload(thumbBuffer, thumbFilename, 'image/webp');
        thumbnailUrl = thumbResult.url;
      } catch {}

      // Clean up tmp file
      try {
        fs.unlinkSync(file.path);
      } catch {}

      return {
        imageUrl: mainResult.url,
        thumbnailUrl,
        filename: mainFilename,
        size: mainResult.size,
        provider: mainResult.provider,
      };
    } catch (err: any) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
      throw new BadRequestException(`Failed to process and store image: ${err.message}`);
    }
  }

  /**
   * Upload favicon & automatically generate crisp PWA manifest icons (192x192, 512x512, maskable)
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('favicon')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadTmpDir,
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(16).toString('hex');
          cb(null, `tmp_fav_${randomName}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg']);
        if (!allowed.has(ext)) {
          return cb(new BadRequestException('Only icon files (.png, .svg, .webp, .jpg) are allowed for favicons!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFavicon(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') typeBody?: string,
    @Query('type') typeQuery?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No favicon file uploaded');
    }

    const type = (typeBody || typeQuery || 'store').toLowerCase() === 'admin' ? 'admin' : 'store';
    const isStore = type === 'store';
    const randomName = crypto.randomBytes(12).toString('hex');

    try {
      // 1. Generate crisp 64x64 browser tab icon
      const faviconBuffer = await sharp(file.path)
        .rotate()
        .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
      const mainResult = await this.storageService.upload(
        faviconBuffer,
        `favicon_${type}_${randomName}.png`,
        'image/png',
      );

      // 2. Generate standard 192x192 PWA Icon
      const icon192Buffer = await sharp(file.path)
        .rotate()
        .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 8 })
        .toBuffer();
      const icon192Result = await this.storageService.upload(
        icon192Buffer,
        `icon_192_${type}_${randomName}.png`,
        'image/png',
      );

      // 3. Generate standard 512x512 PWA Icon
      const icon512Buffer = await sharp(file.path)
        .rotate()
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 8 })
        .toBuffer();
      const icon512Result = await this.storageService.upload(
        icon512Buffer,
        `icon_512_${type}_${randomName}.png`,
        'image/png',
      );

      // 4. Generate maskable 192x192 PWA Icon with safe margins
      const inner192 = await sharp(file.path)
        .rotate()
        .resize(154, 154, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const maskable192Buffer = await sharp({
        create: {
          width: 192,
          height: 192,
          channels: 4,
          background: isStore ? { r: 250, g: 247, b: 242, alpha: 1 } : { r: 15, g: 23, b: 42, alpha: 1 },
        },
      })
        .composite([{ input: inner192, gravity: 'center' }])
        .png({ compressionLevel: 8 })
        .toBuffer();
      const maskable192Result = await this.storageService.upload(
        maskable192Buffer,
        `maskable_192_${type}_${randomName}.png`,
        'image/png',
      );

      // 5. Generate maskable 512x512 PWA Icon with safe margins
      const inner512 = await sharp(file.path)
        .rotate()
        .resize(410, 410, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      const maskable512Buffer = await sharp({
        create: {
          width: 512,
          height: 512,
          channels: 4,
          background: isStore ? { r: 250, g: 247, b: 242, alpha: 1 } : { r: 15, g: 23, b: 42, alpha: 1 },
        },
      })
        .composite([{ input: inner512, gravity: 'center' }])
        .png({ compressionLevel: 8 })
        .toBuffer();
      const maskable512Result = await this.storageService.upload(
        maskable512Buffer,
        `maskable_512_${type}_${randomName}.png`,
        'image/png',
      );

      // 6. Auto-persist to settings table so manifests & frontend immediately get the updated icons
      const prefix = isStore ? 'store' : 'admin';
      await this.settingsService.updateBulk({
        [`${prefix}_favicon_url`]: mainResult.url,
        [`${prefix}_icon_192`]: icon192Result.url,
        [`${prefix}_icon_512`]: icon512Result.url,
        [`${prefix}_icon_maskable_192`]: maskable192Result.url,
        [`${prefix}_icon_maskable_512`]: maskable512Result.url,
      });

      return {
        imageUrl: mainResult.url,
        faviconUrl: mainResult.url,
        icon192: icon192Result.url,
        icon512: icon512Result.url,
        iconMaskable192: maskable192Result.url,
        iconMaskable512: maskable512Result.url,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to generate favicon and PWA icons: ${err.message}`);
    } finally {
      try {
        fs.unlinkSync(file.path);
      } catch {}
    }
  }

  /**
   * Public: Upload customer customization reference photo (rate-limited & sanitized)
   */
  @RateLimit({ limit: 6, ttl: 60000 })
  @Post('reference')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadTmpDir,
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(16).toString('hex');
          cb(null, `tmp_ref_${randomName}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext) || !MIME_MATCH_REGEX.test(file.mimetype)) {
          return cb(new BadRequestException('Only safe image files (.jpg, .jpeg, .png, .webp) are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadReferencePhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const randomName = crypto.randomBytes(16).toString('hex');
    const refFilename = `ref_${randomName}.webp`;

    try {
      // Re-encode through sharp: strips EXIF metadata and ensures clean WebP
      const sanitizedBuffer = await sharp(file.path)
        .rotate()
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      const uploadResult = await this.storageService.upload(sanitizedBuffer, refFilename, 'image/webp');

      // Clean up tmp file
      try {
        fs.unlinkSync(file.path);
      } catch {}

      return {
        imageUrl: uploadResult.url,
        filename: refFilename,
        size: uploadResult.size,
        provider: uploadResult.provider,
      };
    } catch (err: any) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
      throw new BadRequestException('Invalid or unprocessable image file');
    }
  }
}
