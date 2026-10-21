'use client';

import React from 'react';
import { Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface FeaturedProductImagePickerProps {
  selectedProduct: any;
  customImage: string;
  setCustomImage: (img: string) => void;
}

export const FeaturedProductImagePicker = React.memo(function FeaturedProductImagePicker({
  selectedProduct,
  customImage,
  setCustomImage,
}: FeaturedProductImagePickerProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <ImageIcon className="w-4 h-4 text-[#c08a46]" />
          <span>2. Select Showcase Hero Image</span>
        </div>
      </div>

      {selectedProduct?.images && selectedProduct.images.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Pick from product images:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
            {selectedProduct.images.map((img: any, idx: number) => {
              const isSelected = customImage === img.imageUrl;
              return (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setCustomImage(img.imageUrl)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group cursor-pointer ${
                    isSelected
                      ? 'border-[#c08a46] ring-2 ring-[#c08a46]/30 shadow-md'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Product thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#c08a46]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white drop-shadow" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Or Custom Image URL
        </label>
        <input
          type="text"
          value={customImage}
          onChange={(e) => setCustomImage(e.target.value)}
          placeholder="/images/product-main.jpg or https://..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
        />
      </div>
    </div>
  );
});

export default FeaturedProductImagePicker;
