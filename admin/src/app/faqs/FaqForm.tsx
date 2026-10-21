'use client';

import React from 'react';
import { HelpCircle, Sparkles, RefreshCw, Languages, Globe2, Save } from 'lucide-react';

interface FaqFormProps {
  isEditing: boolean;
  editingId: number | null;
  languageMode: 'both' | 'en' | 'bn';
  setLanguageMode: (val: 'both' | 'en' | 'bn') => void;
  question: string;
  setQuestion: (val: string) => void;
  questionBn: string;
  setQuestionBn: (val: string) => void;
  answer: string;
  setAnswer: (val: string) => void;
  answerBn: string;
  setAnswerBn: (val: string) => void;
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
  sortOrder: number;
  setSortOrder: (val: number) => void;
  saving: boolean;
  aiLoading: boolean;
  translateLoading: boolean;
  aiAction: 'en_to_bn' | 'bn_to_en' | null;
  onAutoTranslate: (dir: 'en_to_bn' | 'bn_to_en') => void;
  onAiProofread: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const FaqForm = React.memo(function FaqForm({
  isEditing,
  editingId,
  languageMode,
  setLanguageMode,
  question,
  setQuestion,
  questionBn,
  setQuestionBn,
  answer,
  setAnswer,
  answerBn,
  setAnswerBn,
  isPublished,
  setIsPublished,
  sortOrder,
  setSortOrder,
  saving,
  aiLoading,
  translateLoading,
  aiAction,
  onAutoTranslate,
  onAiProofread,
  onSubmit,
}: FaqFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 sticky top-4"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-[#c08a46]" />
          <span>{isEditing ? `Edit FAQ #${editingId}` : 'Add New FAQ'}</span>
        </div>
        {isEditing && (
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
            Editing Mode
          </span>
        )}
      </div>

      {/* AI Tools Bar */}
      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <Sparkles className="w-3.5 h-3.5 text-[#c08a46]" />
          <span>AI Assistant:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onAutoTranslate('en_to_bn')}
            disabled={translateLoading || aiLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-[11px] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Translate English Question & Answer to Bengali"
          >
            {translateLoading && aiAction === 'en_to_bn' ? (
              <RefreshCw className="w-3 h-3 animate-spin text-[#c08a46]" />
            ) : (
              <Languages className="w-3 h-3 text-[#c08a46]" />
            )}
            <span>{translateLoading && aiAction === 'en_to_bn' ? 'Translating...' : 'Translate to BN'}</span>
          </button>

          <button
            type="button"
            onClick={() => onAutoTranslate('bn_to_en')}
            disabled={translateLoading || aiLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-900 font-bold text-[11px] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Translate Bengali Question & Answer to English"
          >
            {translateLoading && aiAction === 'bn_to_en' ? (
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
            ) : (
              <Globe2 className="w-3 h-3 text-blue-600" />
            )}
            <span>{translateLoading && aiAction === 'bn_to_en' ? 'Translating...' : 'Translate to EN'}</span>
          </button>

          <button
            type="button"
            onClick={onAiProofread}
            disabled={aiLoading || translateLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Proofread and refine both English and Bengali text"
          >
            {aiLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            <span>{aiLoading ? 'Polishing...' : 'Proofread'}</span>
          </button>
        </div>
      </div>

      {/* Language Switcher Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setLanguageMode('en')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            languageMode === 'en'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          English (EN)
        </button>
        <button
          type="button"
          onClick={() => setLanguageMode('bn')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            languageMode === 'bn'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          বাংলা (BN)
        </button>
        <button
          type="button"
          onClick={() => setLanguageMode('both')}
          className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
            languageMode === 'both'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Side-by-Side
        </button>
      </div>

      {/* Question Fields */}
      <div className="space-y-3">
        {(languageMode === 'both' || languageMode === 'en') && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Question (English - EN) *</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono font-bold">
                EN
              </span>
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How long does delivery take?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
            />
          </div>
        )}

        {(languageMode === 'both' || languageMode === 'bn') && (
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
              <span>প্রশ্ন (বাংলা - BN)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                বাংলা
              </span>
            </label>
            <input
              type="text"
              value={questionBn}
              onChange={(e) => setQuestionBn(e.target.value)}
              placeholder="যেমন: ডেলিভারি পেতে কত দিন সময় লাগে?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
        )}
      </div>

      {/* Answer Fields */}
      <div className="space-y-3">
        {(languageMode === 'both' || languageMode === 'en') && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Answer (English - EN) *</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono font-bold">
                EN
              </span>
            </label>
            <textarea
              rows={4}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g. Deliveries within Dhaka take 24-48 hours. Nationwide delivery takes 2-4 days via SteadFast courier."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46] leading-relaxed"
            />
          </div>
        )}

        {(languageMode === 'both' || languageMode === 'bn') && (
          <div>
            <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
              <span>উত্তর (বাংলা - BN)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                বাংলা
              </span>
            </label>
            <textarea
              rows={4}
              value={answerBn}
              onChange={(e) => setAnswerBn(e.target.value)}
              placeholder="যেমন: ঢাকা সিটির ভেতরে ২৪-৪৮ ঘণ্টা এবং সমগ্র বাংলাদেশে ২-৪ দিনের মধ্যে ডেলিভারি সম্পন্ন হয়।"
              className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600 leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Visibility & Sort Order */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Visibility</label>
          <select
            value={isPublished ? 'true' : 'false'}
            onChange={(e) => setIsPublished(e.target.value === 'true')}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#c08a46]"
          >
            <option value="true">🟢 Published (Live)</option>
            <option value="false">⚪ Hidden (Draft)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            placeholder="0"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#c08a46]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 px-4 rounded-xl bg-[#c08a46] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#a87435] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{saving ? 'Saving...' : isEditing ? 'Update FAQ' : 'Save FAQ'}</span>
        </button>
      </div>
    </form>
  );
});

export default FaqForm;
