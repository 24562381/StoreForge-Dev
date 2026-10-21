'use client';

import React from 'react';
import { Palette, Info, Plus, Trash2 } from 'lucide-react';

interface ProductAddColorsSectionProps {
  hasColorVariants: boolean;
  colorPresets: any[];
  colors: any[];
  newColorName: string;
  setNewColorName: (n: string) => void;
  newColorHex: string;
  setNewColorHex: (h: string) => void;
  newColorAdjustment: number;
  setNewColorAdjustment: (a: number) => void;
  colorPresetHint: string;
  setColorPresetHint: (h: string) => void;
  onAddDefaultPresetColor: (preset: any) => void;
  onAddNewColor: (e?: React.FormEvent) => void;
  onRemoveColor: (idx: number) => void;
}

export const ProductAddColorsSection = React.memo(function ProductAddColorsSection({
  hasColorVariants,
  colorPresets,
  colors,
  newColorName,
  setNewColorName,
  newColorHex,
  setNewColorHex,
  newColorAdjustment,
  setNewColorAdjustment,
  colorPresetHint,
  setColorPresetHint,
  onAddDefaultPresetColor,
  onAddNewColor,
  onRemoveColor,
}: ProductAddColorsSectionProps) {
  if (!hasColorVariants) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Palette className="w-4 h-4 text-[#c08a46]" /> 3. Wood Stains & Color Swatches
          </h2>
          <p className="text-[11px] text-slate-500">
            Add custom wood finish tones (Birch, Oak, Terra) with custom hex swatches
          </p>
        </div>
      </div>

      {/* Quick Default Preset Color Inserter */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 flex-wrap text-xs">
        <span className="font-bold text-slate-600">Presets:</span>
        {colorPresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onAddDefaultPresetColor(preset)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#c08a46] text-slate-800 text-[11px] font-bold shadow-2xs hover:text-[#c08a46] transition-colors"
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-slate-300"
              style={{ backgroundColor: preset.hex }}
            />
            <span>+ {preset.name}</span>
          </button>
        ))}
      </div>

      {/* Add Custom Color Form */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">Add Custom Color / Stain:</div>
          {colorPresetHint && (
            <button
              type="button"
              onClick={() => setColorPresetHint('')}
              className="text-[11px] text-slate-600 hover:text-slate-800 underline"
            >
              Clear message
            </button>
          )}
        </div>

        {colorPresetHint && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 shadow-2xs animate-in fade-in duration-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium leading-relaxed">{colorPresetHint}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Color Name</label>
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="e.g. Vintage Walnut"
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Swatch</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 p-0.5 rounded-lg border border-slate-200 bg-white cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-[11px]"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Extra (৳)</label>
            <input
              type="number"
              min="0"
              value={newColorAdjustment}
              onChange={(e) => setNewColorAdjustment(Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => onAddNewColor()}
              className="w-full py-1.5 px-3 rounded-lg bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Active Colors List */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700">Active Wood Stains ({colors.length}):</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {colors.map((c, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-6 h-6 rounded-full border border-slate-300 shadow-inner shrink-0"
                  style={{ backgroundColor: c.colourHex || '#8E5A35' }}
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">{c.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {c.colourHex} {Number(c.priceAdjustment) > 0 ? `(+৳${c.priceAdjustment})` : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveColor(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove Color"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProductAddColorsSection;
