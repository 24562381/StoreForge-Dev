'use client';

import React from 'react';
import { Search, HelpCircle, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  questionBn?: string;
  answerBn?: string;
}

interface FaqListProps {
  faqs: FaqItem[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: 'all' | 'published' | 'hidden';
  setStatusFilter: (val: 'all' | 'published' | 'hidden') => void;
  editingId: number | null;
  onStartEdit: (faq: FaqItem) => void;
  onTogglePublish: (faq: FaqItem) => void;
  onDelete: (id: number) => void;
}

export const FaqList = React.memo(function FaqList({
  faqs,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  editingId,
  onStartEdit,
  onTogglePublish,
  onDelete,
}: FaqListProps) {
  const filteredFaqs = React.useMemo(() => {
    const q = searchTerm.toLowerCase();
    return faqs.filter((faq) => {
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        (faq.questionBn && faq.questionBn.toLowerCase().includes(q)) ||
        (faq.answerBn && faq.answerBn.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (statusFilter === 'published') return faq.isPublished;
      if (statusFilter === 'hidden') return !faq.isPublished;
      return true;
    });
  }, [faqs, searchTerm, statusFilter]);

  return (
    <div className="lg:col-span-7 space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs in English or বাংলা..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#c08a46]"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({faqs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live ({faqs.filter((f) => f.isPublished).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('hidden')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'hidden'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hidden ({faqs.filter((f) => !f.isPublished).length})
          </button>
        </div>
      </div>

      {/* FAQ Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-[#c08a46] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Loading FAQ catalog...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No FAQs found</p>
            <p className="text-xs text-slate-400">Add your first question using the form on the left.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                editingId === faq.id
                  ? 'border-[#c08a46] ring-2 ring-amber-500/20 bg-amber-50/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  {/* English Question & Answer */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                        EN
                      </span>
                      <h3 className="text-xs font-bold text-slate-900">{faq.question}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 pl-6 whitespace-pre-line leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>

                  {/* Bengali Question & Answer if present */}
                  {(faq.questionBn || faq.answerBn) && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          বাংলা
                        </span>
                        <h4 className="text-xs font-bold text-emerald-900">{faq.questionBn}</h4>
                      </div>
                      <p className="text-xs text-emerald-800/90 mt-1 pl-6 whitespace-pre-line leading-relaxed">
                        {faq.answerBn}
                      </p>
                    </div>
                  )}

                  {/* Meta Bar */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span>Order: {faq.sortOrder || 0}</span>
                    <span>•</span>
                    <span className={faq.isPublished ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}>
                      {faq.isPublished ? '● Live on Store' : '○ Hidden'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onTogglePublish(faq)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    title={faq.isPublished ? 'Hide FAQ' : 'Publish FAQ'}
                  >
                    {faq.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartEdit(faq)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-[#c08a46] hover:text-white text-slate-600 transition-colors cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(faq.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default FaqList;
