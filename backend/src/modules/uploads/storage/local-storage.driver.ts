import * as fs from 'fs';
import * as path from 'path';
import { IStorageDriver, StorageProviderType, StorageUploadResult, StorageStats } from './storage.interface';

export class LocalStorageDriver implements IStorageDriver {
  readonly provider: StorageProviderType = 'local';
  private readonly uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, filename: string, _mimeType: string): Promise<StorageUploadResult> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      url: `/uploads/${filename}`,
      key: filename,
      size: fileBuffer.length,
      filename,
      provider: 'local',
    };
  }

  async delete(key: string): Promise<boolean> {
    const cleanKey = path.basename(key);
    const filePath = path.join(this.uploadDir, cleanKey);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch {
      // Ignored
    }
    return false;
  }

  async getBuffer(key: string): Promise<Buffer | null> {
    const cleanKey = path.basename(key.split('?')[0]);
    const filePath = path.join(this.uploadDir, cleanKey);
    try {
      if (fs.existsSync(filePath)) {
        return await fs.promises.readFile(filePath);
      }
    } catch {
      return null;
    }
    return null;
  }

  async getStats(): Promise<Partial<StorageStats>> {
    let totalFiles = 0;
    let totalSizeBytes = 0;

    try {
      if (fs.existsSync(this.uploadDir)) {
        const files = await fs.promises.readdir(this.uploadDir);
        for (const file of files) {
          try {
            const stat = await fs.promises.stat(path.join(this.uploadDir, file));
            if (stat.isFile()) {
              totalFiles++;
              totalSizeBytes += stat.size;
            }
          } catch {}
        }
      }
    } catch {}

    // Check host filesystem free space via statfs if supported
    let vpsFreeSpaceBytes: number | undefined;
    try {
      if (typeof fs.promises.statfs === 'function') {
        const disk = await fs.promises.statfs(this.uploadDir);
        vpsFreeSpaceBytes = disk.bavail * disk.bsize;
      }
    } catch {}

    return {
      driver: 'local',
      provider: 'local',
      providerLabel: 'Local VPS Disk',
      isOperational: true,
      totalFiles,
      totalSizeBytes,
      totalSizeFormatted: this.formatBytes(totalSizeBytes),
      vpsFreeSpaceBytes,
      vpsFreeSpaceFormatted: vpsFreeSpaceBytes ? this.formatBytes(vpsFreeSpaceBytes) : undefined,
    };
  }

  async testConnection(): Promise<{ success: boolean; latencyMs?: number; message?: string }> {
    const start = Date.now();
    try {
      await fs.promises.access(this.uploadDir, fs.constants.R_OK | fs.constants.W_OK);
      const latencyMs = Date.now() - start;
      return {
        success: true,
        latencyMs,
        message: 'Local disk filesystem is writable and operational.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Local directory permission error: ${err.message}`,
      };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
