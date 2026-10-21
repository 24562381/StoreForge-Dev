'use client';

import React, { useState, useRef, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import {
  UploadCloud,
  Loader2,
  Trash2,
  Check,
  Globe,
  Shield
} from 'lucide-react';
import { useAdminModal } from '@/lib/AdminModalContext';
import { getAdminToken } from '@/lib/api';

interface FaviconUploaderProps {
  label: string;
  type: 'store' | 'admin';
  value: string;
  onChange: (url: string) => void;
}

const MIME_FAVICON_REGEX = /^image\/(jpeg|jpg|png|webp|svg\+xml|x-icon|vnd\.microsoft\.icon)$/i;

export default function FaviconUploader({ label, type, value, onChange }: FaviconUploaderProps) {
  const { showError, showWarning, showSuccess } = useAdminModal();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const processAndUpload = useCallback(async (file: File) => {
    if (!MIME_FAVICON_REGEX.test(file.type) && !file.name.match(/\.(ico|png|jpe?g|webp|svg)$/i)) {
      showWarning('Please select a valid icon file (ICO, PNG, SVG, or WebP).');
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading...');

    try {
      let fileToUpload: File | Blob = file;

      // Only compress raster if unusually large (> 2MB) and keep max dimension up to 1024 for 512x512 PWA icons
      if (file.size > 2 * 1024 * 1024 && file.type !== 'image/svg+xml' && !file.name.endsWith('.svg') && !file.name.endsWith('.ico')) {
        try {
          const options = {
            maxSizeMB: 1.0,
            maxWidthOrHeight: 1024,
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
      formData.append('type', type);

      const token = getAdminToken();
      const apiUrl = `/api/uploads/favicon?type=${type}`;

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
      const uploadedUrl = data.imageUrl || data.faviconUrl || data.url;

      if (!uploadedUrl) {
        throw new Error('No URL returned by server.');
      }

      onChange(uploadedUrl);
      if (type === 'admin') {
        try {
          localStorage.setItem('sf_admin_favicon', uploadedUrl);
          window.dispatchEvent(new CustomEvent('sf_favicon_updated', { detail: uploadedUrl }));
        } catch {}
      }
      showSuccess(`${label} and PWA manifest icons successfully updated!`);
    } catch (err: any) {
      showError('Favicon upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [label, onChange, showError, showWarning, showSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndUpload(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {type === 'store' ? (
            <Globe className="w-3.5 h-3.5 text-blue-600" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-amber-600" />
          )}
          <label className="block text-xs font-bold text-slate-700">{label}</label>
        </div>
        {value && (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <Check className="w-3 h-3" /> Set
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp,image/jpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center justify-between gap-3 p-2 px-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Browser Tab Favicon Mockup Preview */}
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={`${label} Preview`}
                className="w-5 h-5 object-contain rounded"
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
              title="Remove Favicon"
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
              <span>Upload {type === 'store' ? 'Store' : 'Admin'} Favicon</span>
            </>
          )}
        </button>
      )}

      {/* Sizing instruction helper */}
      <span className="text-[11px] text-slate-500 mt-1.5 block leading-tight">
        📐 <strong>Size:</strong> 32×32 or 64×64 px (1:1) • PNG / ICO / SVG • &lt; 100 KB
      </span>
    </div>
  );
}
