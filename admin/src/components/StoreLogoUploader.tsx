'use client';

import React, { useState, useRef, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import {
  UploadCloud,
  Loader2,
  Trash2,
  Check
} from 'lucide-react';
import { useAdminModal } from '@/lib/AdminModalContext';
import { getAdminToken } from '@/lib/api';

interface StoreLogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

const MIME_IMAGE_REGEX = /^image\/(jpeg|jpg|png|webp|svg\+xml)$/i;

export default function StoreLogoUploader({ value, onChange }: StoreLogoUploaderProps) {
  const { showError, showWarning, showSuccess } = useAdminModal();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const processAndUpload = useCallback(async (file: File) => {
    if (!MIME_IMAGE_REGEX.test(file.type) && !file.name.match(/\.(png|jpe?g|webp|svg)$/i)) {
      showWarning('Please select a valid image (PNG, WebP, JPEG, or SVG).');
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading...');

    try {
      let fileToUpload: File | Blob = file;

      // Skip SVG compression to keep vector precision
      if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
        try {
          const options = {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: file.type === 'image/png' ? 'image/png' : 'image/webp',
            initialQuality: 0.95,
          };
          fileToUpload = await imageCompression(file, options);
        } catch {
          fileToUpload = file;
        }
      }

      const formData = new FormData();
      formData.append('file', fileToUpload, file.name);

      const token = getAdminToken();
      const apiUrl = '/api/uploads';

      const res = await fetch(apiUrl, {
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
      const uploadedUrl = data.imageUrl || data.url;

      if (!uploadedUrl) {
        throw new Error('No URL returned by server.');
      }

      onChange(uploadedUrl);
      showSuccess('Store logo updated!');
    } catch (err: any) {
      showError('Upload failed: ' + (err.message || 'Error uploading'));
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onChange, showError, showWarning, showSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndUpload(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-slate-700">Store Logo</label>
        {value && (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <Check className="w-3 h-3" /> Uploaded
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center justify-between gap-3 p-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-16 h-9 rounded-lg bg-slate-900/90 p-1 flex items-center justify-center shrink-0 border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Logo Preview"
                className="max-h-7 max-w-[56px] object-contain"
              />
            </div>
            <div className="truncate text-xs text-slate-600 font-mono">
              {value.split('/').pop()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Change'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={uploading}
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs transition-colors cursor-pointer"
              title="Remove Logo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 hover:border-[#c08a46] hover:bg-amber-50/30 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 text-[#c08a46] animate-spin" />
              <span>{uploadProgress}</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-[#c08a46]" />
              <span>Upload Logo (PNG, SVG, WebP)</span>
            </>
          )}
        </button>
      )}

      {/* Sizing instruction helper */}
      <span className="text-[11px] text-slate-500 mt-1.5 block leading-tight">
        📐 <strong>Recommended:</strong> 240×60 px (4:1) • PNG (transparent) / SVG • &lt; 500 KB
      </span>
    </div>
  );
}
