'use client';

import React from 'react';
import { HelpCircle, Search, Languages, Sparkles, X } from 'lucide-react';

interface FaqsHeaderProps {
  totalFaqs: number;
  publishedCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'published' | 'hidden';
  setStatusFilter: (filter: 'all' | 'published' | 'hidden') => void;
  isEditing: boolean;
  onResetForm: () => void;
  onAutoTranslate: (direction: 'en_to_bn' | 'bn_to_en') => void;
  translateLoading: boolean;
  aiAction?: 'en_to_bn' | 'bn_to_en' | null;
  onAiProofread: () => void;
  aiLoading: boolean;
}

export const FaqsHeader = React.memo(function FaqsHeader({
  totalFaqs,
  publishedCount,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isEditing,
  onResetForm,
  onAutoTranslate,
  translateLoading,
  aiAction,
  onAiProofread,
  aiLoading,
}: FaqsHeaderProps) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-100 text-[#c08a46]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">FAQ Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage bilingual (English & বাংলা) customer support FAQs with real-time AI assistance
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {isEditing && (
          <button
            type="button"
            onClick={onResetForm}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancel Edit
          </button>
        )}

        <button
          type="button"
          onClick={() => onAutoTranslate('en_to_bn')}
          disabled={translateLoading}
          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          title="Auto-translate English FAQ to Bengali"
        >
          <Languages className="w-3.5 h-3.5 text-[#c08a46]" />
          <span>{translateLoading && aiAction === 'en_to_bn' ? 'Translating...' : 'Auto-Translate (EN ➔ বাংলা)'}</span>
        </button>

        <button
          type="button"
          onClick={() => onAutoTranslate('bn_to_en')}
          disabled={translateLoading}
          className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          title="Auto-translate Bengali FAQ to English"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          <span>{translateLoading && aiAction === 'bn_to_en' ? 'Translating...' : 'Auto-Translate (বাংলা ➔ EN)'}</span>
        </button>

        <button
          type="button"
          onClick={onAiProofread}
          disabled={aiLoading}
          className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>{aiLoading ? 'Proofreading...' : 'AI Auto-Proofread (EN & বাংলা)'}</span>
        </button>
      </div>
    </div>
  );
});

export default FaqsHeader;
