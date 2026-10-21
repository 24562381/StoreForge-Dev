'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Check, Sparkles, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface TranslationItem {
  id?: number;
  key?: string;
  category?: string;
  subCategory?: string;
  description?: string;
  bn?: string;
  en?: string;
}

interface TranslationUpsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<TranslationItem> | null;
  categoriesConfig?: Record<string, any>;
  onSave: (formData: Partial<TranslationItem>) => Promise<void>;
}

export const TranslationUpsertModal = React.memo(function TranslationUpsertModal({
  isOpen,
  onClose,
  initialData,
  categoriesConfig,
  onSave,
}: TranslationUpsertModalProps) {
  const [key, setKey] = useState('');
  const [category, setCategory] = useState('header_navigation');
  const [description, setDescription] = useState('');
  const [en, setEn] = useState('');
  const [bn, setBn] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setKey(initialData.key || '');
      setCategory(initialData.category || 'header_navigation');
      setDescription(initialData.description || '');
      setEn(initialData.en || '');
      setBn(initialData.bn || '');
    } else {
      setKey('');
      setCategory('header_navigation');
      setDescription('');
      setEn('');
      setBn('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData?.id);

  const handleAiTranslate = async () => {
    if (!en.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetchApi('/ai/translate', {
        method: 'POST',
        body: JSON.stringify({ text: en, targetLang: 'bn' }),
      });
      if (res?.translatedText) {
        setBn(res.translatedText);
        return;
      }
      // Fallback to /ai/complete
      const compRes = await fetchApi('/ai/complete', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Translate the following English phrase into natural Bengali (বাংলা) for an e-commerce website: "${en}". Return strictly a JSON object with key "translatedText".`,
          temperature: 0.2,
        }),
      });
      const translated =
        compRes?.translatedText ||
        compRes?.bn ||
        (compRes?.text ? JSON.parse(compRes.text.match(/\{[\s\S]*\}/)?.[0] || '{}')?.translatedText : '');
      if (translated) {
        setBn(translated);
      }
    } catch {
      // Ignore translation failure
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: initialData?.id,
        key: key.trim(),
        category,
        description: description.trim(),
        en: en.trim(),
        bn: bn.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-[#c08a46]">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                {isEditing ? `Edit Translation Key: ${initialData?.key}` : 'Add New Translation Key'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define bilingual English & Bengali dictionary mappings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Unique Key Identifier *
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={key}
              onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="e.g. checkout_submit_btn"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-[#c08a46] disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category Scope</label>
              {categoriesConfig ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                >
                  {Object.entries(categoriesConfig).map(([catKey, catVal]) => (
                    <option key={catKey} value={catKey}>
                      {catVal.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="header_navigation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Context / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Button label on checkout"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">English Text (EN) *</label>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-mono font-bold">
                EN
              </span>
            </div>
            <textarea
              rows={2}
              required
              value={en}
              onChange={(e) => setEn(e.target.value)}
              placeholder="Confirm Order Now"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-emerald-800">
                Bengali Text (বাংলা - BN) *
              </label>
              <button
                type="button"
                onClick={handleAiTranslate}
                disabled={aiLoading || !en}
                className="text-[11px] font-bold text-[#c08a46] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {aiLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Auto-Translate</span>
              </button>
            </div>
            <textarea
              rows={2}
              required
              value={bn}
              onChange={(e) => setBn(e.target.value)}
              placeholder="এখনই অর্ডার সম্পন্ন করুন"
              className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
          </div>

          {/* Fixed Modal Footer Toolbar */}
          <div className="p-4 sm:p-5 sm:px-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Key' : 'Save Key'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default TranslationUpsertModal;
