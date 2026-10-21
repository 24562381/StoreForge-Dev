'use client';

import React from 'react';
import { Sparkles, RefreshCw, Clock, Save } from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import { PolicyPageConfig } from './PolicyTabNav';

interface PolicyEditorSectionProps {
  currentPage: PolicyPageConfig;
  settings: Record<string, string>;
  handleFieldChange: (key: string, value: string) => void;
  onAiTranslate: (targetLang: 'bn' | 'en') => void;
  translating: boolean;
  translatingDirection: 'bn' | 'en' | null;
  onAiPolish: () => void;
  polishing: boolean;
  onSave: () => void;
  saving: boolean;
}

export const PolicyEditorSection = React.memo(function PolicyEditorSection({
  currentPage,
  settings,
  handleFieldChange,
  onAiTranslate,
  translating,
  translatingDirection,
  onAiPolish,
  polishing,
  onSave,
  saving,
}: PolicyEditorSectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Editing:</span>
            <span className="text-amber-700 font-extrabold">{currentPage.label}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {currentPage.slug}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Changes made here are instantly reflected on customer storefront pages.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onAiTranslate('bn')}
            disabled={translating || polishing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title="Translate English fields to Bengali"
          >
            {translating && translatingDirection === 'bn' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{translating && translatingDirection === 'bn' ? 'Translating...' : 'Translate to BN'}</span>
          </button>

          <button
            type="button"
            onClick={() => onAiTranslate('en')}
            disabled={translating || polishing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title="Translate Bengali fields to English"
          >
            {translating && translatingDirection === 'en' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{translating && translatingDirection === 'en' ? 'Translating...' : 'Translate to EN'}</span>
          </button>

          <button
            type="button"
            onClick={onAiPolish}
            disabled={polishing || translating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {polishing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{polishing ? 'Polishing...' : 'AI Polish Bangla'}</span>
          </button>
        </div>
      </div>

      {/* Titles & Hero Subtitles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* English Titles */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            English Page Title & Subtitle
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Page Main Title
            </label>
            <input
              type="text"
              value={settings[currentPage.titleKeyEn] ?? currentPage.defaultTitleEn}
              onChange={(e) => handleFieldChange(currentPage.titleKeyEn, e.target.value)}
              placeholder="e.g. Privacy Policy"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hero Subtitle
            </label>
            <textarea
              rows={2}
              value={settings[currentPage.subKeyEn] ?? currentPage.defaultSubEn}
              onChange={(e) => handleFieldChange(currentPage.subKeyEn, e.target.value)}
              placeholder="English subtitle..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-500 font-sans"
            />
          </div>
        </div>

        {/* Bangla Titles */}
        <div className="space-y-4 p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            বাংলা হেডলাইন ও বিবরণ
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পেজ শিরোনাম (Title)
            </label>
            <input
              type="text"
              value={settings[currentPage.titleKeyBn] ?? currentPage.defaultTitleBn}
              onChange={(e) => handleFieldChange(currentPage.titleKeyBn, e.target.value)}
              placeholder="e.g. গোপনীয়তা নীতি"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-600 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সাবটাইটেল / সংক্ষিপ্ত পরিচিতি (Subtitle)
            </label>
            <textarea
              rows={2}
              value={settings[currentPage.subKeyBn] ?? currentPage.defaultSubBn}
              onChange={(e) => handleFieldChange(currentPage.subKeyBn, e.target.value)}
              placeholder="পেজের উপরের সাবটাইটেল..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-600 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Full Policy Content with TipTap Rich Text Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <TipTapEditor
            label="Full Policy Content — English"
            badge="English"
            badgeColor="slate"
            placeholder="Write full English policy content..."
            minHeight="340px"
            value={settings[currentPage.contentKeyEn] ?? currentPage.defaultContentEn}
            onChange={(val) => handleFieldChange(currentPage.contentKeyEn, val)}
          />
        </div>

        <div className="space-y-2">
          <TipTapEditor
            label="সম্পূর্ণ পলিসি কনটেন্ট — বাংলা"
            badge="বাংলা"
            badgeColor="emerald"
            placeholder="পলিসির মূল বিবরণ লিখুন..."
            minHeight="340px"
            value={settings[currentPage.contentKeyBn] ?? currentPage.defaultContentBn}
            onChange={(val) => handleFieldChange(currentPage.contentKeyBn, val)}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Save to publish changes to customer-facing policy pages.</span>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Policy Changes'}
        </button>
      </div>
    </div>
  );
});

export default PolicyEditorSection;
