'use client';

import React from 'react';
import { Plus, Edit3, Trash2, CheckCircle2, Save, Sparkles } from 'lucide-react';
import ImageCompressorUploader from '@/components/ImageCompressorUploader';

const generateSlug = (val: string): string => {
  return (val || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface CategoryFormProps {
  isEditing: boolean;
  editingId: number | null;
  languageMode: 'both' | 'en' | 'bn';
  setLanguageMode: (mode: 'both' | 'en' | 'bn') => void;
  name: string;
  setName: (v: string) => void;
  nameBn: string;
  setNameBn: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  sortOrder: number;
  setSortOrder: (v: number) => void;
  description: string;
  setDescription: (v: string) => void;
  descriptionBn: string;
  setDescriptionBn: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const CategoryForm = React.memo(function CategoryForm({
  isEditing,
  editingId,
  languageMode,
  setLanguageMode,
  name,
  setName,
  nameBn,
  setNameBn,
  slug,
  setSlug,
  sortOrder,
  setSortOrder,
  description,
  setDescription,
  descriptionBn,
  setDescriptionBn,
  imageUrl,
  setImageUrl,
  status,
  setStatus,
  saving,
  onSubmit,
}: CategoryFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit3 className="w-4 h-4 text-[#c08a46]" /> Edit Category #{editingId}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-[#c08a46]" /> Add New Category
              </>
            )}
          </h2>
          <p className="text-[11px] text-slate-500">
            {isEditing ? 'Update specifications and translations' : 'Create a new collection category'}
          </p>
        </div>

        {/* Language Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setLanguageMode('en')}
            className={`px-2 py-1 rounded-lg transition-colors text-[11px] ${
              languageMode === 'en' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguageMode('bn')}
            className={`px-2 py-1 rounded-lg transition-colors text-[11px] ${
              languageMode === 'bn' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            বাংলা
          </button>
          <button
            type="button"
            onClick={() => setLanguageMode('both')}
            className={`px-2 py-1 rounded-lg transition-colors text-[11px] ${
              languageMode === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Both
          </button>
        </div>
      </div>

      {/* Category Name (English & Bengali) */}
      <div className={`grid gap-3 ${languageMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {(languageMode === 'both' || languageMode === 'en') && (
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>Category Name (English) *</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">EN</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                const newName = e.target.value;
                const prevSlug = generateSlug(name);
                const newSlug = generateSlug(newName);
                setName(newName);
                if (!slug.trim() || slug === prevSlug) {
                  setSlug(newSlug);
                }
              }}
              placeholder="e.g. World Maps"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#c08a46]"
            />
          </div>
        )}

        {(languageMode === 'both' || languageMode === 'bn') && (
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
              <span>ক্যাটাগরির নাম (বাংলা)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
            </label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="যেমন: বিশ্ব মানচিত্র"
              className="w-full px-3 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
        )}
      </div>

      {/* Slug & Sort Order */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">URL Slug *</label>
            <button
              type="button"
              onClick={() => setSlug(generateSlug(name))}
              className="text-[11px] font-bold text-[#c08a46] hover:text-[#9a6a2f] inline-flex items-center gap-1 transition-colors cursor-pointer"
              title="Generate slug from English category name"
            >
              <Sparkles className="w-3 h-3" /> Auto-generate
            </button>
          </div>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="world-maps"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>
        <div className="sm:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            placeholder="0"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>
      </div>

      {/* Category Description (English & Bengali) */}
      <div className={`grid gap-3 ${languageMode === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {(languageMode === 'both' || languageMode === 'en') && (
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>Description (English)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">EN</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Handcrafted 3D multi-layered wooden world maps..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
            />
          </div>
        )}

        {(languageMode === 'both' || languageMode === 'bn') && (
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
              <span>বিবরণ (বাংলা - BN)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">বাংলা</span>
            </label>
            <textarea
              rows={3}
              value={descriptionBn}
              onChange={(e) => setDescriptionBn(e.target.value)}
              placeholder="হস্তনির্মিত ত্রি-মাত্রিক কাঠের বিশ্ব মানচিত্র সংগ্রহ..."
              className="w-full px-3 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
        )}
      </div>

      {/* Category Image Upload & Preview */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>Category Banner / Icon Image</span>
          {imageUrl && (
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Image Loaded
            </span>
          )}
        </label>

        {imageUrl ? (
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden relative border border-slate-300 shrink-0">
              <img
                src={imageUrl}
                alt={name || 'Category Image'}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL"
                className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-[11px] font-mono text-slate-700"
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove Image
              </button>
            </div>
          </div>
        ) : (
          <ImageCompressorUploader
            onImageUploaded={(url) => {
              setImageUrl(url);
            }}
          />
        )}
      </div>

      {/* Status & Submit Button */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
        <div className="sm:col-span-5">
          <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#c08a46]"
          >
            <option value="active">Active (Visible)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>

        <div className="sm:col-span-7 flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}</span>
          </button>
        </div>
      </div>
    </form>
  );
});

export default CategoryForm;
