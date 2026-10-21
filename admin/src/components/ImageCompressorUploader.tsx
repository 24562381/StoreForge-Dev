'use client';

import React, { useState, useRef, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, Link2, Sparkles } from 'lucide-react';
import { useAdminModal } from '@/lib/AdminModalContext';
import { getAdminToken } from '@/lib/api';

const MIME_IMAGE_REGEX = /^image\/(jpeg|jpg|png|webp)$/i;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

interface ImageCompressorUploaderProps {
  onImageUploaded: (imageUrl: string, thumbnailUrl?: string, title?: string) => void;
}

export default function ImageCompressorUploader({ onImageUploaded }: ImageCompressorUploaderProps) {
  const { showError, showWarning } = useAdminModal();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [lastStats, setLastStats] = useState<{ originalSize: string; compressedSize: string; ratio: string } | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [manualCaption, setManualCaption] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processAndUploadFile = useCallback(async (file: File) => {
    if (!MIME_IMAGE_REGEX.test(file.type)) {
      showWarning('Please select a valid raster image file (JPEG, PNG, or WebP).');
      return;
    }

    setCompressing(true);
    setUploadProgress('Compressing & converting image to WebP...');
    setLastStats(null);

    try {
      const originalSizeBytes = file.size;

      // Compression options
      const options = {
        maxSizeMB: 0.25, // Target max 250 KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
      };

      const compressedFile = await imageCompression(file, options);
      const compressedSizeBytes = compressedFile.size;
      const ratio = Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100);

      setLastStats({
        originalSize: formatSize(originalSizeBytes),
        compressedSize: formatSize(compressedSizeBytes),
        ratio: ratio > 0 ? `-${ratio}%` : 'Optimized',
      });

      setUploadProgress('Uploading compressed image...');

      // Upload to backend
      const formData = new FormData();
      formData.append('file', compressedFile, `${file.name.split('.')[0] || 'photo'}.webp`);

      const token = getAdminToken();
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Server upload failed with status ' + res.status);
      }

      const data = await res.json();
      const finalUrl = data.imageUrl || data.url;
      const thumbUrl = data.thumbnailUrl || data.thumbUrl || finalUrl;

      setUploadProgress(null);
      setCompressing(false);

      if (finalUrl) {
        onImageUploaded(finalUrl, thumbUrl, file.name.split('.')[0]);
      }
    } catch (err: any) {
      showError('Compression / Upload failed: ' + (err.message || 'Unknown error'));
      setUploadProgress(null);
      setCompressing(false);
    }
  }, [onImageUploaded, showError, showWarning]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processAndUploadFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onImageUploaded(manualUrl.trim(), manualUrl.trim(), manualCaption.trim() || 'Product Photo');
    setManualUrl('');
    setManualCaption('');
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#c08a46] bg-amber-50/60 shadow-md scale-[1.01]'
            : 'border-slate-300 hover:border-[#c08a46] bg-slate-50/70 hover:bg-amber-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {compressing ? (
            <>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-[#c08a46]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="text-xs font-bold text-amber-900">{uploadProgress}</div>
              <div className="text-[11px] text-slate-500">In-browser smart compression & WebP encoding in progress</div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-[#c08a46] flex items-center justify-center shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  <span className="text-[#c08a46] underline">Click to upload photo</span> or drag & drop here
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High-res JPEG, PNG, or WebP &bull; Smart client-side compression to &lt; 200KB WebP
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compression Statistics Banner */}
      {lastStats && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Smart Compression:</strong> {lastStats.originalSize} &rarr; <strong>{lastStats.compressedSize}</strong>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-mono font-bold text-[10px]">
            {lastStats.ratio}
          </span>
        </div>
      )}

      {/* Manual URL Inserter Toggle */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[11px] font-bold text-slate-500 hover:text-[#c08a46] flex items-center gap-1.5 transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{showManualInput ? 'Hide manual URL input' : 'Or paste direct Image URL'}</span>
        </button>
      </div>

      {showManualInput && (
        <form onSubmit={handleManualAdd} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            <div className="sm:col-span-7">
              <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Image URL / Path</label>
              <input
                type="text"
                required
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="/images/product-main.jpg or https://..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Caption</label>
              <input
                type="text"
                value={manualCaption}
                onChange={(e) => setManualCaption(e.target.value)}
                placeholder="Product Angle"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 px-3 rounded-lg bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs shadow-2xs transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
