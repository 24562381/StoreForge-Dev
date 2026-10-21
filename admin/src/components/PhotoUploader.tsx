'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Trash2, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { getAdminToken } from '@/lib/api';

const API_BASE = '/api';

interface PhotoUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  variant?: 'avatar' | 'document';
  disabled?: boolean;
  hint?: string;
}

export default function PhotoUploader({
  label,
  value,
  onChange,
  variant = 'avatar',
  disabled = false,
  hint,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setUploading(true);

      try {
        let uploadFile = file;

        // Compress raster images client-side for faster uploads
        if (file.type.startsWith('image/')) {
          try {
            uploadFile = await imageCompression(file, {
              maxSizeMB: 0.5,
              maxWidthOrHeight: variant === 'avatar' ? 800 : 1600,
              useWebWorker: true,
              fileType: 'image/webp',
              initialQuality: 0.85,
            });
          } catch {
            uploadFile = file;
          }
        }

        const formData = new FormData();
        const baseName = file.name.split('.')[0] || 'photo';
        formData.append('file', uploadFile, `${baseName}.webp`);

        const token = getAdminToken();
        const res = await fetch(`${API_BASE}/uploads`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed (HTTP ${res.status})`);
        }

        const data = await res.json();
        const url = data.imageUrl || data.url;
        if (url) {
          onChange(url);
        } else {
          throw new Error('No image URL returned by server');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to upload photo');
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onChange, variant],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
      setError(null);
    },
    [onChange],
  );

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {variant === 'avatar' ? (
        <div className="flex items-center gap-4">
          {/* Avatar Preview */}
          <div
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            className={`relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all group ${
              disabled
                ? 'bg-slate-100 border-slate-200 cursor-not-allowed'
                : 'bg-slate-50 border-dashed border-slate-300 hover:border-[#c08a46] hover:bg-amber-50/30 cursor-pointer'
            }`}
          >
            {value ? (
              <img src={value} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-[#c08a46]">
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">Photo</span>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Action Buttons & Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#c08a46] hover:text-[#c08a46] text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : value ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {value && !disabled && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              {hint || 'JPG, PNG, or WebP. Auto-optimized to WebP.'}
            </p>
          </div>
        </div>
      ) : (
        /* Document / Landscape Variant */
        <div className="space-y-2">
          <div
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            className={`relative rounded-xl border-2 p-3 flex items-center justify-between transition-all group ${
              disabled
                ? 'bg-slate-100 border-slate-200 cursor-not-allowed'
                : 'bg-slate-50 border-dashed border-slate-300 hover:border-[#c08a46] hover:bg-amber-50/30 cursor-pointer'
            }`}
          >
            {value ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                  <img src={value} alt="Doc Preview" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Document Uploaded</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block">{value}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-slate-500 py-1">
                <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-[#c08a46]" />
                <div>
                  <span className="text-xs font-bold block group-hover:text-[#c08a46]">Click to upload document photo</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP up to 10MB</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-[#c08a46] animate-spin" />
              ) : value && !disabled ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
