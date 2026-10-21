'use client';

import React from 'react';
import { Layers, Plus, Palette, Trash2, Check } from 'lucide-react';

interface ProductEditVariantsSectionProps {
  variants: any[];
  setVariants: React.Dispatch<React.SetStateAction<any[]>>;
  colors: any[];
  hasColorVariants: boolean;
  sizePresets: any[];
  onAddCustomVariant: () => void;
  onAddPresetSize: (preset: any) => void;
  onRemoveVariant: (idx: number) => void;
}

export const ProductEditVariantsSection = React.memo(function ProductEditVariantsSection({
  variants,
  setVariants,
  colors,
  hasColorVariants,
  sizePresets,
  onAddCustomVariant,
  onAddPresetSize,
  onRemoveVariant,
}: ProductEditVariantsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-[#c08a46]" /> 3. Sizes, Dimensions & Pricing
          </h2>
          <p className="text-[11px] text-slate-500">Configure size presets, dimensions, pricing, and stock status</p>
        </div>
        <button
          type="button"
          onClick={onAddCustomVariant}
          className="px-3 py-1.5 rounded-lg bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add Size
        </button>
      </div>

      {/* Quick Presets Buttons */}
      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-600">Quick Presets:</span>
        {sizePresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onAddPresetSize(preset)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#c08a46] text-slate-800 text-[11px] font-bold shadow-2xs hover:text-[#c08a46] transition-colors"
          >
            + {preset.sizeName.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Variants List */}
      <div className="space-y-3">
        {variants.map((v, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono font-bold">
                  {idx + 1}
                </span>
                <span>{v.sizeName}</span>
              </span>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="defaultVariant"
                    checked={v.isDefault}
                    onChange={() => {
                      const updated = variants.map((item, i) => ({ ...item, isDefault: i === idx }));
                      setVariants(updated);
                    }}
                    className="accent-[#c08a46]"
                  />
                  <span>Default Size</span>
                </label>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveVariant(idx)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove size"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-0.5">Size Name</label>
                <input
                  type="text"
                  value={v.sizeName}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[idx].sizeName = e.target.value;
                    setVariants(updated);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-0.5">Dimensions</label>
                <input
                  type="text"
                  value={v.dimensions}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[idx].dimensions = e.target.value;
                    setVariants(updated);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-0.5">Price (৳ BDT)</label>
                <input
                  type="number"
                  min="0"
                  value={v.price}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[idx].price = Math.max(0, Number(e.target.value) || 0);
                    setVariants(updated);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-0.5">Original Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={v.originalPrice || ''}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[idx].originalPrice = e.target.value ? Math.max(0, Number(e.target.value) || 0) : '';
                    setVariants(updated);
                  }}
                  placeholder="Discount strike"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600"
                />
              </div>
            </div>

            {/* Wood Stain multi-selection per size */}
            {hasColorVariants && colors.length > 0 && (
              <div className="pt-2.5 border-t border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#c08a46]" />
                    <span>Available Colors for this Size ({((v.availableColors || []).length)}/{colors.length} selected):</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...variants];
                        updated[idx].availableColors = colors.map((c) => c.name);
                        setVariants(updated);
                      }}
                      className="text-[#c08a46] hover:underline font-bold"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...variants];
                        updated[idx].availableColors = [];
                        setVariants(updated);
                      }}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {colors.map((c, cIdx) => {
                    const isChecked = (v.availableColors || []).includes(c.name);
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => {
                          const cur = v.availableColors || [];
                          const next = cur.includes(c.name)
                            ? cur.filter((name: string) => name !== c.name)
                            : [...cur, c.name];
                          const updated = [...variants];
                          updated[idx].availableColors = next;
                          setVariants(updated);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#fdf7f2] border-[#c08a46] text-[#8e5a35] shadow-2xs font-bold'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: c.colourHex || '#8E5A35' }}
                        />
                        <span>{c.name}</span>
                        {isChecked && <Check className="w-3 h-3 text-[#c08a46] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default ProductEditVariantsSection;
