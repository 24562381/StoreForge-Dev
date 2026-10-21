import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { IStorageDriver, StorageConfig, StorageProviderType, StorageUploadResult, StorageStats } from './storage.interface';

export class S3StorageDriver implements IStorageDriver {
  readonly provider: StorageProviderType;
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: StorageConfig) {
    this.provider = config.provider || 'custom';
    this.bucket = config.bucket || '';

    // Normalize public URL (strip trailing slash)
    const rawPublicUrl = config.publicUrl?.trim() || '';
    this.publicBaseUrl = rawPublicUrl.replace(/\/+$/, '');

    // Resolve endpoint
    let resolvedEndpoint = config.endpoint?.trim() || undefined;
    if (resolvedEndpoint && !/^https?:\/\//i.test(resolvedEndpoint)) {
      resolvedEndpoint = `https://${resolvedEndpoint}`;
    }

    const region = config.region?.trim() || (this.provider === 'r2' ? 'auto' : 'us-east-1');

    this.client = new S3Client({
      region,
      endpoint: resolvedEndpoint,
      credentials: {
        accessKeyId: config.accessKeyId || '',
        secretAccessKey: config.secretAccessKey || '',
      },
      forcePathStyle: Boolean(config.forcePathStyle || this.provider === 'minio'),
    });
  }

  async upload(fileBuffer: Buffer, filename: string, mimeType: string): Promise<StorageUploadResult> {
    const key = filename;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    // Compute public accessible URL
    let url: string;
    if (this.publicBaseUrl) {
      url = `${this.publicBaseUrl}/${key}`;
    } else {
      // Fallback: construct standard endpoint URL
      url = `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }

    return {
      url,
      key,
      size: fileBuffer.length,
      filename,
      provider: this.provider,
    };
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async getBuffer(key: string): Promise<Buffer | null> {
    try {
      const cleanKey = key.replace(/^\/+/, '');
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: cleanKey,
        }),
      );
      if (response.Body) {
        const byteArray = await response.Body.transformToByteArray();
        return Buffer.from(byteArray);
      }
      return null;
    } catch {
      return null;
    }
  }

  async testConnection(): Promise<{ success: boolean; latencyMs?: number; message?: string }> {
    const start = Date.now();
    try {
      if (!this.bucket) {
        return { success: false, message: 'Bucket name is not specified' };
      }

      await this.client.send(
        new HeadBucketCommand({
          Bucket: this.bucket,
        }),
      );

      const latencyMs = Date.now() - start;
      return {
        success: true,
        latencyMs,
        message: `Successfully connected to bucket "${this.bucket}" in ${latencyMs}ms.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to authenticate with cloud storage provider',
      };
    }
  }

  async getStats(): Promise<Partial<StorageStats>> {
    let totalFiles = 0;
    let totalSizeBytes = 0;
    let isOperational = false;
    let pingLatencyMs: number | undefined;
    let errorMessage: string | undefined;

    const start = Date.now();
    try {
      const res = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          MaxKeys: 1000,
        }),
      );

      pingLatencyMs = Date.now() - start;
      isOperational = true;

      if (res.Contents) {
        totalFiles = res.KeyCount || res.Contents.length;
        for (const item of res.Contents) {
          totalSizeBytes += item.Size || 0;
        }
      }
    } catch (err: any) {
      isOperational = false;
      errorMessage = err?.message || 'Bucket connection failed';
    }

    const providerLabels: Record<StorageProviderType, string> = {
      local: 'Local VPS Disk',
      r2: 'Cloudflare R2',
      aws: 'Amazon Web Services (S3)',
      digitalocean: 'DigitalOcean Spaces',
      wasabi: 'Wasabi Hot Cloud',
      backblaze: 'Backblaze B2',
      minio: 'Self-Hosted MinIO',
      custom: 'Custom S3-Compatible Storage',
    };

    return {
      driver: 's3',
      provider: this.provider,
      providerLabel: providerLabels[this.provider] || 'S3 Cloud Storage',
      isOperational,
      totalFiles,
      totalSizeBytes,
      totalSizeFormatted: this.formatBytes(totalSizeBytes),
      pingLatencyMs,
      errorMessage,
      publicBaseUrl: this.publicBaseUrl,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
