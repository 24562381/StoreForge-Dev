'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Activity,
  Server,
  Database,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';

interface StorageConfigState {
  driver: 'local' | 's3';
  provider: string;
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  secretAccessKeySet?: boolean;
  publicUrl: string;
  forcePathStyle: boolean;
}

interface StorageStatsState {
  driver: 'local' | 's3';
  connected: boolean;
  pingMs?: number;
  totalFiles: number;
  totalSizeBytes: number;
  freeDiskSpaceBytes?: number;
  error?: string;
}

interface ProviderPreset {
  id: string;
  name: string;
  driver: 'local' | 's3';
  defaultEndpoint: string;
  defaultRegion: string;
  forcePathStyle: boolean;
  note: string;
}

const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'local',
    name: 'Local VPS Disk',
    driver: 'local',
    defaultEndpoint: '',
    defaultRegion: '',
    forcePathStyle: false,
    note: 'Files stored directly on this server under /uploads. Ideal for single-server setups.',
  },
  {
    id: 'r2',
    name: 'Cloudflare R2',
    driver: 's3',
    defaultEndpoint: 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com',
    defaultRegion: 'auto',
    forcePathStyle: false,
    note: 'Zero egress fees worldwide, S3 compatible, lightning-fast edge delivery.',
  },
  {
    id: 's3',
    name: 'Amazon Web Services (AWS S3)',
    driver: 's3',
    defaultEndpoint: 'https://s3.amazonaws.com',
    defaultRegion: 'us-east-1',
    forcePathStyle: false,
    note: 'Industry standard cloud object storage with global multi-region support.',
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean Spaces',
    driver: 's3',
    defaultEndpoint: 'https://nyc3.digitaloceanspaces.com',
    defaultRegion: 'nyc3',
    forcePathStyle: false,
    note: 'Predictable pricing with built-in CDN edge distribution.',
  },
  {
    id: 'wasabi',
    name: 'Wasabi Hot Cloud',
    driver: 's3',
    defaultEndpoint: 'https://s3.wasabisys.com',
    defaultRegion: 'us-east-1',
    forcePathStyle: false,
    note: 'Low-cost, high-performance object storage without egress fees.',
  },
  {
    id: 'backblaze',
    name: 'Backblaze B2',
    driver: 's3',
    defaultEndpoint: 'https://s3.us-west-004.backblazeb2.com',
    defaultRegion: 'us-west-004',
    forcePathStyle: false,
    note: 'Affordable S3-compatible cloud storage.',
  },
  {
    id: 'minio',
    name: 'Self-Hosted MinIO',
    driver: 's3',
    defaultEndpoint: 'http://your-storage-server:9000',
    defaultRegion: 'us-east-1',
    forcePathStyle: true,
    note: 'Open-source, self-hosted S3-compatible object storage on your own hardware.',
  },
  {
    id: 'custom',
    name: 'Custom S3-Compatible Endpoint',
    driver: 's3',
    defaultEndpoint: 'https://storage.yourdomain.com',
    defaultRegion: 'us-east-1',
    forcePathStyle: false,
    note: 'Any custom S3-compliant gateway, Ceph, SeaweedFS, or private enterprise cluster.',
  },
];

function formatBytes(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export const StorageSettingsSection = React.memo(function StorageSettingsSection() {
  const { showSuccess, showError } = useAdminModal();

  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [config, setConfig] = useState<StorageConfigState>({
    driver: 'local',
    provider: 'local',
    endpoint: '',
    region: 'auto',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: '',
    secretAccessKeySet: false,
    publicUrl: '',
    forcePathStyle: false,
  });

  const [stats, setStats] = useState<StorageStatsState | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    pingMs?: number;
    error?: string;
  } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    syncedFiles: number;
    syncedSizeBytes: number;
    failedFiles: number;
    message: string;
  } | null>(null);

  const loadStorageStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/storage/status');
      if (res && res.config) {
        setConfig((prev) => ({
          ...prev,
          driver: res.config.driver || 'local',
          provider: res.config.provider || 'local',
          endpoint: res.config.endpoint || '',
          region: res.config.region || 'auto',
          bucket: res.config.bucket || '',
          accessKeyId: res.config.accessKeyId || '',
          secretAccessKeySet: !!res.config.secretAccessKeySet,
          secretAccessKey: res.config.secretAccessKeySet ? '••••••••••••••••' : '',
          publicUrl: res.config.publicUrl || '',
          forcePathStyle: !!res.config.forcePathStyle,
        }));
      }
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error('Failed to load storage status', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStorageStatus();
  }, [loadStorageStatus]);

  const handleProviderSelect = (providerId: string) => {
    const preset = PROVIDER_PRESETS.find((p) => p.id === providerId);
    if (!preset) return;

    setConfig((prev) => ({
      ...prev,
      provider: preset.id,
      driver: preset.driver,
      endpoint: preset.driver === 'local' ? '' : (prev.endpoint && prev.endpoint !== 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com' ? prev.endpoint : preset.defaultEndpoint),
      region: preset.defaultRegion || prev.region,
      forcePathStyle: preset.forcePathStyle,
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetchApi('/storage/test', {
        method: 'POST',
        body: JSON.stringify({
          driver: config.driver,
          provider: config.provider,
          endpoint: config.endpoint,
          region: config.region,
          bucket: config.bucket,
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey.includes('•') ? undefined : config.secretAccessKey,
          publicUrl: config.publicUrl,
          forcePathStyle: config.forcePathStyle,
        }),
      });

      setTestResult(res);
      if (res.success) {
        showSuccess(`Storage connection verified! Response latency: ${res.pingMs} ms`);
      } else {
        showError(res.message || 'Storage connection test failed');
      }
      // Refresh stats
      loadStorageStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
        error: err.message,
      });
      showError(err.message || 'Storage connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        driver: config.driver,
        provider: config.provider,
        endpoint: config.endpoint,
        region: config.region,
        bucket: config.bucket,
        accessKeyId: config.accessKeyId,
        publicUrl: config.publicUrl,
        forcePathStyle: config.forcePathStyle,
      };

      if (!config.secretAccessKey.includes('•') && config.secretAccessKey.trim()) {
        payload.secretAccessKey = config.secretAccessKey.trim();
      }

      await fetchApi('/storage/config', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showSuccess('Storage configuration saved and activated successfully!');
      loadStorageStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to save storage configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncLocalToCloud = async () => {
    if (config.driver !== 's3') {
      showError('Please switch Active Driver to Cloud S3 Storage before syncing local files');
      return;
    }

    if (!confirm('This will copy all existing media files from local disk to your cloud bucket. Existing files on the bucket will not be overwritten. Continue?')) {
      return;
    }

    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetchApi('/storage/sync', {
        method: 'POST',
      });
      setSyncResult(res);
      showSuccess(res.message || 'Files synchronized to cloud successfully!');
      loadStorageStatus();
    } catch (err: any) {
      showError(err.message || 'Failed to sync local files to cloud');
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center py-16">
        <div className="w-9 h-9 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Connecting to Storage Engine & Gathering Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Media Storage Engine & Cloud Object Storage</h2>
              <p className="text-xs text-slate-500 font-normal">
                Dual-mode storage architecture: Local VPS disk storage with zero-latency proxy, or pluggable S3-compatible cloud storage (Cloudflare R2, AWS S3, MinIO, Wasabi, DigitalOcean Spaces).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadStorageStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Driver */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-slate-600" />
                Active Driver
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  stats?.driver === 's3'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {stats?.driver === 's3' ? 'Cloud Object Storage' : 'Local VPS Disk'}
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 tracking-tight">
              {stats?.driver === 's3'
                ? PROVIDER_PRESETS.find((p) => p.id === config.provider)?.name || 'S3 Cloud'
                : 'Host VPS Storage'}
            </p>
            <p className="text-[11px] text-slate-500">
              {stats?.driver === 's3' ? 'Direct S3 / CDN edge delivery' : 'Served via Next.js reverse-proxy'}
            </p>
          </div>

          {/* Card 2: Connection Status */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-600" />
                Connectivity & Health
              </span>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  stats?.connected
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    stats?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}
                />
                {stats?.connected ? 'Online' : 'Degraded'}
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 tracking-tight">
              {stats?.connected ? 'Operational' : 'Connection Error'}
            </p>
            <p className="text-[11px] text-slate-500">
              {stats?.pingMs !== undefined ? `Round-trip ping: ${stats.pingMs} ms` : 'Local filesystem ready'}
            </p>
          </div>

          {/* Card 3: Media Files Stored */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-slate-600" />
                Indexed Media Files
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 tracking-tight">
              {stats?.totalFiles?.toLocaleString() ?? 0}{' '}
              <span className="text-xs font-normal text-slate-500">files</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Total volume: {formatBytes(stats?.totalSizeBytes ?? 0)}
            </p>
          </div>

          {/* Card 4: Host VPS Free Space */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-slate-600" />
                Host VPS Free Disk
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 tracking-tight">
              {stats?.freeDiskSpaceBytes ? formatBytes(stats.freeDiskSpaceBytes) : 'Available'}
            </p>
            <p className="text-[11px] text-slate-500">
              Host disk space available for local uploads & caching
            </p>
          </div>
        </div>

        {/* Diagnostic Banner if there is an active test result */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-sm">{testResult.message}</p>
              {testResult.pingMs !== undefined && (
                <p className="text-slate-600">Endpoint latency: {testResult.pingMs} ms</p>
              )}
              {testResult.error && (
                <pre className="mt-1 p-2 bg-white/80 rounded-lg text-[11px] font-mono text-red-700 overflow-x-auto">
                  {testResult.error}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Sync Result Banner */}
        {syncResult && (
          <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-sm">{syncResult.message}</p>
              <p className="text-slate-600">
                Uploaded {syncResult.syncedFiles} files ({formatBytes(syncResult.syncedSizeBytes)}). Failed: {syncResult.failedFiles}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Storage Driver & Provider Configuration</h3>
          <p className="text-xs text-slate-500">
            Select your storage target and configure authentication credentials. All keys are secured with server-side masking.
          </p>
        </div>

        {/* Driver Toggle Switch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setConfig((prev) => ({ ...prev, driver: 'local', provider: 'local' }));
            }}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              config.driver === 'local'
                ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className={`w-5 h-5 ${config.driver === 'local' ? 'text-amber-600' : 'text-slate-600'}`} />
                <span className="text-sm font-bold text-slate-900">Option A: Local VPS Disk</span>
              </div>
              {config.driver === 'local' && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-200" />
              )}
            </div>
            <p className="text-xs text-slate-600">
              Zero configuration required. All uploads remain on your server disk and are served securely via Next.js proxy.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setConfig((prev) => ({
                ...prev,
                driver: 's3',
                provider: prev.provider === 'local' ? 'r2' : prev.provider,
                endpoint: prev.endpoint || 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com',
              }));
            }}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              config.driver === 's3'
                ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cloud className={`w-5 h-5 ${config.driver === 's3' ? 'text-blue-600' : 'text-slate-600'}`} />
                <span className="text-sm font-bold text-slate-900">Option B: Cloud S3 Object Storage</span>
              </div>
              {config.driver === 's3' && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-200" />
              )}
            </div>
            <p className="text-xs text-slate-600">
              Multi-server and container ready. Connect Cloudflare R2, AWS S3, MinIO, Wasabi, or DigitalOcean Spaces.
            </p>
          </button>
        </div>

        {/* Cloud Provider Presets */}
        {config.driver === 's3' && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-800">
              Select Cloud Storage Provider Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PROVIDER_PRESETS.filter((p) => p.driver === 's3').map((preset) => {
                const isSelected = config.provider === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleProviderSelect(preset.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold truncate">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5 truncate">
                      {preset.defaultRegion || 'Universal'}
                    </div>
                  </button>
                );
              })}
            </div>
            {config.provider && (
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                {PROVIDER_PRESETS.find((p) => p.id === config.provider)?.note}
              </p>
            )}
          </div>
        )}

        {/* Credentials Form (Shown when driver === 's3') */}
        {config.driver === 's3' && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Endpoint */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  S3 Endpoint URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.endpoint}
                  onChange={(e) => setConfig((prev) => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="https://<account-id>.r2.cloudflarestorage.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-500">
                  For Cloudflare R2: find Account ID in R2 dashboard. For AWS: https://s3.amazonaws.com.
                </p>
              </div>

              {/* Bucket Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Bucket Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.bucket}
                  onChange={(e) => setConfig((prev) => ({ ...prev, bucket: e.target.value }))}
                  placeholder="my-ecommerce-store-bucket"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-500">
                  Target bucket container where media objects are stored.
                </p>
              </div>

              {/* Access Key ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Access Key ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={config.accessKeyId}
                  onChange={(e) => setConfig((prev) => ({ ...prev, accessKeyId: e.target.value }))}
                  placeholder="e.g. 7f83b2a19c... or AKIAIOSFODNN7EXAMPLE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-500">
                  API token key ID with Read & Write permissions on the bucket.
                </p>
              </div>

              {/* Secret Access Key */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Secret Access Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={config.secretAccessKey}
                    onChange={(e) => setConfig((prev) => ({ ...prev, secretAccessKey: e.target.value }))}
                    placeholder={config.secretAccessKeySet ? '•••••••••••••••• (Stored securely)' : 'Enter Secret Key'}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {config.secretAccessKeySet
                    ? 'Key is securely registered. Leave as dots to keep existing secret key.'
                    : 'Secret credentials are protected server-side and never exposed to visitors.'}
                </p>
              </div>

              {/* Region */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Region
                </label>
                <input
                  type="text"
                  value={config.region}
                  onChange={(e) => setConfig((prev) => ({ ...prev, region: e.target.value }))}
                  placeholder="auto (or us-east-1, ap-southeast-1)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-500">
                  Cloudflare R2 uses &quot;auto&quot;. AWS and Wasabi use their specific region code.
                </p>
              </div>

              {/* Public CDN URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Public CDN / Custom Domain URL
                </label>
                <input
                  type="text"
                  value={config.publicUrl}
                  onChange={(e) => setConfig((prev) => ({ ...prev, publicUrl: e.target.value }))}
                  placeholder="https://pub-xxxxxx.r2.dev or https://media.yourdomain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <p className="text-[11px] text-slate-500">
                  Optional. If configured, uploaded image URLs will point directly to your CDN domain.
                </p>
              </div>
            </div>

            {/* Force Path Style Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="forcePathStyle"
                checked={config.forcePathStyle}
                onChange={(e) => setConfig((prev) => ({ ...prev, forcePathStyle: e.target.checked }))}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <label htmlFor="forcePathStyle" className="text-xs text-slate-700 cursor-pointer">
                <strong>Force Path-Style URLs</strong> (Required for MinIO, e.g. <span className="font-mono text-[11px]">endpoint/bucket/key</span> instead of <span className="font-mono text-[11px]">bucket.endpoint/key</span>)
              </label>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Test Connection Button */}
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-all shadow-xs disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 text-amber-600 ${testing ? 'animate-bounce' : ''}`} />
              {testing ? 'Verifying Connection...' : 'Test Storage Connection'}
            </button>

            {/* Sync Local to Cloud Button */}
            {config.driver === 's3' && (
              <button
                type="button"
                onClick={handleSyncLocalToCloud}
                disabled={syncing || testing || saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 transition-all shadow-xs disabled:opacity-50"
              >
                <ArrowRightLeft className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing Files...' : 'Sync Local Files to Cloud'}
              </button>
            )}
          </div>

          {/* Save Configuration Button */}
          <button
            type="button"
            onClick={() => handleSaveConfig()}
            disabled={saving || testing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {saving ? 'Activating Storage...' : 'Save Storage Configuration'}
          </button>
        </div>
      </div>

      {/* Migration & Security Explanatory Panel */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Seamless Multi-Server Scalability & Enterprise Security Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-slate-600" />
              Moving From Single VPS to Multiple Servers
            </h4>
            <p className="leading-relaxed">
              When scaling to multiple frontend/backend containers or multiple VPS instances, local disk storage is not shared across servers. By switching to S3 or Cloudflare R2, any instance can immediately read and write media through a centralized cloud object store without image loss.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Zero-Downtime Migration & Failover Protection
            </h4>
            <p className="leading-relaxed">
              Use the <strong>&quot;Sync Local Files to Cloud&quot;</strong> tool to batch-upload historical media files. Even if cloud storage experiences transient downtime, the backend automatically maintains dual local fallback so uploads never fail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
