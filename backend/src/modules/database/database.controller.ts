import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { DatabaseService, getBackupsDirectory } from './database.service';

@Controller('database')
@UseGuards(AuthGuard('jwt'), AdminGuard)
@RequirePermissions(PERMISSIONS.DATABASE_BACKUP)
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('stats')
  async getDatabaseStats() {
    return this.databaseService.getDatabaseStats();
  }

  @Get('backups')
  async getBackupsList() {
    return this.databaseService.getBackupsList();
  }

  @Post('backup')
  async createBackup(@Body('format') format?: 'sql' | 'json') {
    return this.databaseService.createBackup(format || 'sql');
  }

  @Get('backup/:filename/download')
  async downloadBackup(
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = this.databaseService.getBackupFilePath(filename);
    const stat = fs.statSync(filePath);

    res.setHeader(
      'Content-Type',
      filename.endsWith('.sql') ? 'application/sql' : 'application/json'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    res.setHeader('Content-Length', stat.size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Delete('backup/:filename')
  async deleteBackup(
    @Param('filename') filename: string,
    @Req() req: any
  ) {
    // Only primary store admin can permanently delete database backups
    if (req.adminUser?.role !== 'admin') {
      throw new ForbiddenException(
        'Only primary administrators can delete database backups.'
      );
    }
    return this.databaseService.deleteBackup(filename);
  }

  @Post('restore-existing/:filename')
  async restoreExisting(
    @Param('filename') filename: string,
    @Body('takeSafetyBackup') takeSafetyBackup: boolean | undefined,
    @Req() req: any
  ) {
    // Restoring or overwriting database requires primary administrator role
    if (req.adminUser?.role !== 'admin') {
      throw new ForbiddenException(
        'Only primary administrators can restore or overwrite database snapshots.'
      );
    }
    const filePath = this.databaseService.getBackupFilePath(filename);
    return this.databaseService.restoreFromBackup(filePath, {
      takeSafetyBackup: takeSafetyBackup !== false,
    });
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, getBackupsDirectory());
        },
        filename: (req, file, cb) => {
          const now = new Date()
            .toISOString()
            .replace(/T/, '_')
            .replace(/\..+/, '')
            .replace(/:/g, '-');
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `db-backup-uploaded-${now}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (ext !== '.sql' && ext !== '.json') {
          return cb(
            new BadRequestException(
              'Only .sql and .json database backup files are permitted!'
            ),
            false
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max backup file size
    })
  )
  async importBackup(
    @UploadedFile() file: Express.Multer.File,
    @Body('takeSafetyBackup') takeSafetyBackup: string | undefined,
    @Req() req: any
  ) {
    if (req.adminUser?.role !== 'admin') {
      // Remove uploaded file if unprivileged
      if (file && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      throw new ForbiddenException(
        'Only primary administrators can import and restore database snapshots.'
      );
    }

    if (!file) {
      throw new BadRequestException('No backup file provided for import.');
    }
    const shouldBackup =
      takeSafetyBackup === 'true' || takeSafetyBackup === undefined;
    return this.databaseService.restoreFromBackup(file.path, {
      takeSafetyBackup: shouldBackup,
    });
  }
}
