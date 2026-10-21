'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface TranslationsCategoryNavProps {
  categoriesConfig: Record<string, {
    label: string;
    icon: any;
    subCategories: Array<{ id: string; label: string; keys: string[] }>;
  }>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (sub: string) => void;
  itemsCountMap: Record<string, number>;
}

export const TranslationsCategoryNav = React.memo(function TranslationsCategoryNav({
  categoriesConfig,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  itemsCountMap,
}: TranslationsCategoryNavProps) {
  return (
    <div className="lg:col-span-4 lg:sticky lg:top-20 z-10 space-y-3 self-start">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-2 max-h-[calc(100vh-6.5rem)] overflow-y-auto">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
          Translation Categories
        </h2>

        <div className="space-y-1">
          {Object.entries(categoriesConfig).map(([catKey, cat]) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === catKey;
            const totalInCat = itemsCountMap[catKey] || 0;

            return (
              <div key={catKey} className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(catKey);
                    setSelectedSubCategory(cat.subCategories[0]?.id || 'all');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{cat.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {totalInCat}
                  </span>
                </button>

                {/* Subcategories */}
                {isSelected && cat.subCategories.length > 1 && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-amber-200 ml-3">
                    {cat.subCategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubCategory(sub.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          selectedSubCategory === sub.id
                            ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default TranslationsCategoryNav;
