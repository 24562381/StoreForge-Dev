'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { FaqsHeader } from './FaqsHeader';
import { FaqForm } from './FaqForm';
import { FaqList } from './FaqList';

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

export default function Wrapper() {
  const { showSuccess, showError, showWarning, showConfirm } = useAdminModal();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [translationsMap, setTranslationsMap] = useState<{ bn: Record<string, string>; en: Record<string, string> }>({
    bn: {},
    en: {},
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');

  // Form State (Add / Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [questionBn, setQuestionBn] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerBn, setAnswerBn] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(0);

  // Language View Mode Tabs
  const [languageMode, setLanguageMode] = useState<'both' | 'en' | 'bn'>('both');

  // AI & Action Loading states
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [aiAction, setAiAction] = useState<'en_to_bn' | 'bn_to_en' | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [faqsRes, bnDict, enDict] = await Promise.all([
        fetchApi('/faqs'),
        fetchApi('/translations/dictionary?lang=bn').catch(() => ({})),
        fetchApi('/translations/dictionary?lang=en').catch(() => ({})),
      ]);

      const bnMap = bnDict || {};
      const enMap = enDict || {};
      setTranslationsMap({ bn: bnMap, en: enMap });

      const enrichedFaqs: FaqItem[] = (faqsRes || []).map((f: any) => ({
        ...f,
        questionBn: bnMap[`faq.${f.id}.question`] || '',
        answerBn: bnMap[`faq.${f.id}.answer`] || '',
      }));

      setFaqs(enrichedFaqs);
    } catch (err: any) {
      console.error('Failed to load FAQs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setEditingId(null);
    setQuestion('');
    setQuestionBn('');
    setAnswer('');
    setAnswerBn('');
    setIsPublished(true);
    setSortOrder(0);
    setLanguageMode('both');
  }, []);

  const startEdit = useCallback((faq: FaqItem) => {
    setIsEditing(true);
    setEditingId(faq.id);
    setQuestion(faq.question || '');
    setQuestionBn(translationsMap.bn[`faq.${faq.id}.question`] || faq.questionBn || '');
    setAnswer(faq.answer || '');
    setAnswerBn(translationsMap.bn[`faq.${faq.id}.answer`] || faq.answerBn || '');
    setIsPublished(faq.isPublished ?? true);
    setSortOrder(faq.sortOrder || 0);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [translationsMap]);

  // Handle AI Auto-Translation
  const handleAutoTranslate = async (direction: 'en_to_bn' | 'bn_to_en') => {
    setAiAction(direction);
    setTranslateLoading(true);

    try {
      const isEnToBn = direction === 'en_to_bn';
      const sourceQ = isEnToBn ? question : questionBn;
      const sourceA = isEnToBn ? answer : answerBn;

      if (!sourceQ && !sourceA) {
        showWarning(
          isEnToBn
            ? 'Please enter English Question or Answer first.'
            : 'অনুগ্রহ করে প্রথমে বাংলা প্রশ্ন অথবা উত্তর প্রদান করুন।'
        );
        setTranslateLoading(false);
        return;
      }

      const prompt = isEnToBn
        ? `You are an expert bilingual e-commerce translator.
Translate the following FAQ into natural, polite, and elegant Bengali (বাংলা) for an upscale handcrafted wooden decor store in Bangladesh:
${JSON.stringify({ question: sourceQ, answer: sourceA })}

Return strictly valid JSON with keys: "questionBn", "answerBn".`
        : `You are an expert bilingual e-commerce translator.
Translate the following Bengali FAQ into clear, polished English for a premium handcrafted wooden decor store:
${JSON.stringify({ questionBn: sourceQ, answerBn: sourceA })}

Return strictly valid JSON with keys: "question", "answer".`;

      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, temperature: 0.3 }),
      });

      let parsed: any = null;
      if (res && (res.question || res.questionBn || res.answer || res.answerBn)) {
        parsed = res;
      } else if (res?.text) {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      }

      if (parsed) {
        if (isEnToBn) {
          if (parsed.questionBn) setQuestionBn(parsed.questionBn);
          if (parsed.answerBn) setAnswerBn(parsed.answerBn);
          showSuccess('✨ FAQ translated to Bengali successfully!');
        } else {
          if (parsed.question) setQuestion(parsed.question);
          if (parsed.answer) setAnswer(parsed.answer);
          showSuccess('✨ FAQ translated to English successfully!');
        }
      } else {
        showError('AI did not return expected translation structure.');
      }
    } catch (err: any) {
      showError(err.message || 'Translation failed');
    } finally {
      setTranslateLoading(false);
      setAiAction(null);
    }
  };

  // Simultaneous Dual-Language AI Proofreader
  const handleAiProofread = async () => {
    if (!question && !questionBn && !answer && !answerBn) {
      showWarning('Please enter FAQ text before proofreading.');
      return;
    }

    setAiLoading(true);
    try {
      const payload = {
        question,
        questionBn,
        answer,
        answerBn,
      };

      const systemInstruction = `You are a master bilingual editor for an upscale home decor e-commerce brand.
Simultaneously proofread, polish grammar, refine polite tone, and harmonize BOTH English and Bengali (বাংলা) FAQ content.

Rules:
1. Fix any typos, grammatical errors, and formatting inconsistencies in English and Bengali.
2. If Bengali is empty, generate natural, polite Bengali. If English is empty, generate clear English.
3. Return strictly valid JSON with keys:
{
  "question": "...",
  "questionBn": "...",
  "answer": "...",
  "answerBn": "..."
}`;

      const prompt = `Proofread and polish this FAQ in English & Bengali:\n${JSON.stringify(payload, null, 2)}`;

      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction, temperature: 0.3 }),
      });

      if (res && res.text) {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.question) setQuestion(parsed.question);
          if (parsed.questionBn) setQuestionBn(parsed.questionBn);
          if (parsed.answer) setAnswer(parsed.answer);
          if (parsed.answerBn) setAnswerBn(parsed.answerBn);
          showSuccess('✨ Simultaneous AI Proofreading Complete!');
        }
      }
    } catch (err: any) {
      showError(err.message || 'Proofreading failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      showWarning('Please provide both English Question and Answer before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        isPublished,
        sortOrder: Number(sortOrder) || 0,
      };

      let savedFaqId = editingId;

      if (isEditing && editingId) {
        await fetchApi(`/faqs/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        const created = await fetchApi('/faqs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        savedFaqId = created?.id;
      }

      // Upsert Bengali Translations
      if (savedFaqId && (questionBn.trim() || answerBn.trim())) {
        const translationItems = [];
        if (questionBn.trim()) {
          translationItems.push({
            key: `faq.${savedFaqId}.question`,
            en: question.trim(),
            bn: questionBn.trim(),
            category: 'faqs',
            description: `FAQ #${savedFaqId} Bengali Question`,
          });
        }
        if (answerBn.trim()) {
          translationItems.push({
            key: `faq.${savedFaqId}.answer`,
            en: answer.trim(),
            bn: answerBn.trim(),
            category: 'faqs',
            description: `FAQ #${savedFaqId} Bengali Answer`,
          });
        }

        if (translationItems.length > 0) {
          await fetchApi('/translations/admin/upsert-bulk', {
            method: 'POST',
            body: JSON.stringify({ items: translationItems }),
          }).catch(() => {});
        }
      }

      resetForm();
      await loadData();
      showSuccess(isEditing ? 'FAQ updated successfully!' : 'FAQ created successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm('Are you sure you want to delete this FAQ?', {
      title: 'Delete FAQ',
      confirmText: 'Delete FAQ',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;
    try {
      await fetchApi(`/faqs/${id}`, { method: 'DELETE' });
      if (editingId === id) resetForm();
      loadData();
      showSuccess('FAQ deleted successfully.');
    } catch (err: any) {
      showError(err.message || 'Failed to delete FAQ');
    }
  };

  const handleTogglePublish = async (faq: FaqItem) => {
    try {
      await fetchApi(`/faqs/${faq.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublished: !faq.isPublished }),
      });
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Header */}
      <FaqsHeader
        totalFaqs={faqs.length}
        publishedCount={faqs.filter((f) => f.isPublished).length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        isEditing={isEditing}
        onResetForm={resetForm}
        onAutoTranslate={handleAutoTranslate}
        translateLoading={translateLoading}
        aiAction={aiAction}
        onAiProofread={handleAiProofread}
        aiLoading={aiLoading}
      />

      {/* 2. Main Grid: Form (5 Cols) + List (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <FaqForm
          isEditing={isEditing}
          editingId={editingId}
          languageMode={languageMode}
          setLanguageMode={setLanguageMode}
          question={question}
          setQuestion={setQuestion}
          questionBn={questionBn}
          setQuestionBn={setQuestionBn}
          answer={answer}
          setAnswer={setAnswer}
          answerBn={answerBn}
          setAnswerBn={setAnswerBn}
          isPublished={isPublished}
          setIsPublished={setIsPublished}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          saving={saving}
          aiLoading={aiLoading}
          translateLoading={translateLoading}
          aiAction={aiAction}
          onAutoTranslate={handleAutoTranslate}
          onAiProofread={handleAiProofread}
          onSubmit={handleSubmit}
        />

        <FaqList
          faqs={faqs}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          editingId={editingId}
          onStartEdit={startEdit}
          onTogglePublish={handleTogglePublish}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
