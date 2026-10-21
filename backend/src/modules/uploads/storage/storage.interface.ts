export type StorageProviderType =
  | 'local'
  | 'r2'
  | 'aws'
  | 'digitalocean'
  | 'wasabi'
  | 'backblaze'
  | 'minio'
  | 'custom';

export interface StorageConfig {
  driver: 'local' | 's3';
  provider: StorageProviderType;
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrl?: string;
  forcePathStyle?: boolean;
}

export interface StorageUploadResult {
  url: string;
  key: string;
  size: number;
  filename: string;
  provider: StorageProviderType;
}

export interface StorageStats {
  driver: 'local' | 's3';
  provider: StorageProviderType;
  providerLabel: string;
  isOperational: boolean;
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  vpsFreeSpaceBytes?: number;
  vpsFreeSpaceFormatted?: string;
  pingLatencyMs?: number;
  errorMessage?: string;
  publicBaseUrl?: string;
}

export interface IStorageDriver {
  readonly provider: StorageProviderType;
  upload(fileBuffer: Buffer, filename: string, mimeType: string): Promise<StorageUploadResult>;
  delete(key: string): Promise<boolean>;
  getStats(): Promise<Partial<StorageStats>>;
  testConnection?(): Promise<{ success: boolean; latencyMs?: number; message?: string }>;
  getBuffer?(key: string): Promise<Buffer | null>;
}
