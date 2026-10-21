'use client';

import React from 'react';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import ImageCompressorUploader from '@/components/ImageCompressorUploader';

interface ProductAddMediaSectionProps {
  name: string;
  images: any[];
  setImages: React.Dispatch<React.SetStateAction<any[]>>;
  onAddImage: () => void;
  onRemoveImage: (idx: number) => void;
}

export const ProductAddMediaSection = React.memo(function ProductAddMediaSection({
  name,
  images,
  setImages,
  onAddImage,
  onRemoveImage,
}: ProductAddMediaSectionProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <ImageIcon className="w-4 h-4 text-[#c08a46]" /> 4. Media & Gallery (With Image Compressor)
          </h2>
          <p className="text-[11px] text-slate-500">
            Upload high-res photos &bull; Automatically compressed to WebP (&lt; 200KB)
          </p>
        </div>
        <button
          type="button"
          onClick={onAddImage}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Manual Card
        </button>
      </div>

      {/* Smart Drag & Drop Image Compressor Uploader */}
      <ImageCompressorUploader
        onImageUploaded={(imageUrl, thumbnailUrl, title) => {
          setImages((prev) => [
            ...prev,
            {
              imageUrl,
              thumbnailUrl: thumbnailUrl || imageUrl,
              title: title || `${name} Photo ${prev.length + 1}`,
              altText: name || '3D Wooden Map',
              isPrimary: prev.length === 0,
              sortOrder: prev.length + 1,
            },
          ]);
        }}
      />

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between shadow-2xs"
          >
            <div className="relative h-32 bg-slate-200 overflow-hidden">
              <img
                src={img.imageUrl || '/images/product-main.jpg'}
                alt={img.altText}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {img.isPrimary && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c08a46] text-white shadow-sm">
                  Primary Cover
                </span>
              )}
            </div>

            <div className="p-3 space-y-2 bg-white border-t border-slate-100">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Image Path / URL</label>
                <input
                  type="text"
                  value={img.imageUrl}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[idx].imageUrl = e.target.value;
                    setImages(updated);
                  }}
                  className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Caption</label>
                <input
                  type="text"
                  value={img.title}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[idx].title = e.target.value;
                    setImages(updated);
                  }}
                  className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <label className="flex items-center gap-1 text-[11px] text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="primaryImageRadio"
                    checked={img.isPrimary}
                    onChange={() => {
                      const updated = images.map((item, i) => ({ ...item, isPrimary: i === idx }));
                      setImages(updated);
                    }}
                    className="accent-[#c08a46]"
                  />
                  <span>Set Cover</span>
                </label>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage(idx)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProductAddMediaSection;
