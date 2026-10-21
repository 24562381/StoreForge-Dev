'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { CategoryHeader } from './CategoryHeader';
import { CategoryForm } from './CategoryForm';
import { CategoryTable } from './CategoryTable';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  sortOrder: number;
  _count?: { products: number };
  nameBn?: string;
  descriptionBn?: string;
}

const generateSlug = (val: string): string => {
  return (val || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function Wrapper() {
  const { showSuccess, showError, showWarning, showConfirm } = useAdminModal();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [translationsMap, setTranslationsMap] = useState<{ bn: Record<string, string>; en: Record<string, string> }>({
    bn: {},
    en: {},
  });
  const [loading, setLoading] = useState(true);

  // Form State (Add / Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('active');
  const [sortOrder, setSortOrder] = useState<number>(0);

  // Language Mode Tabs - default to both so Bangla translation fields are immediately visible
  const [languageMode, setLanguageMode] = useState<'both' | 'en' | 'bn'>('both');

  // AI & Action Loading states
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [aiAction, setAiAction] = useState<'en_to_bn' | 'bn_to_en' | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, bnDict, enDict] = await Promise.all([
        fetchApi('/categories'),
        fetchApi('/translations/dictionary?lang=bn').catch(() => ({})),
        fetchApi('/translations/dictionary?lang=en').catch(() => ({})),
      ]);

      const bnMap = bnDict || {};
      const enMap = enDict || {};
      setTranslationsMap({ bn: bnMap, en: enMap });

      const enrichedCategories: CategoryItem[] = (catsRes || []).map((c: any) => ({
        ...c,
        nameBn: bnMap[`category.${c.slug}.name`] || '',
        descriptionBn: bnMap[`category.${c.slug}.description`] || '',
      }));

      setCategories(enrichedCategories);
    } catch (err: any) {
      console.error('Failed to load categories', err);
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
    setName('');
    setNameBn('');
    setSlug('');
    setDescription('');
    setDescriptionBn('');
    setImageUrl('');
    setStatus('active');
    setSortOrder(0);
  }, []);

  const startEdit = useCallback((c: CategoryItem) => {
    setIsEditing(true);
    setEditingId(c.id);
    setName(c.name || '');
    setNameBn(translationsMap.bn[`category.${c.slug}.name`] || c.nameBn || '');
    setSlug(c.slug || generateSlug(c.name || ''));
    setDescription(c.description || '');
    setDescriptionBn(translationsMap.bn[`category.${c.slug}.description`] || c.descriptionBn || '');
    setImageUrl(c.imageUrl || '');
    setStatus(c.status || 'active');
    setSortOrder(c.sortOrder || 0);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [translationsMap]);

  // 1-Click Auto Translate (EN -> BN or BN -> EN)
  const handleAutoTranslate = async (direction: 'en_to_bn' | 'bn_to_en' = 'en_to_bn') => {
    const isEnToBn = direction === 'en_to_bn';
    const sourceName = isEnToBn ? name : nameBn;
    const sourceDesc = isEnToBn ? description : descriptionBn;

    if (!sourceName && !sourceDesc) {
      showWarning(
        isEnToBn
          ? 'Please enter English Category Name or Description first.'
          : 'অনুগ্রহ করে প্রথমে বাংলা ক্যাটাগরির নাম অথবা বিবরণ প্রদান করুন।'
      );
      return;
    }
    setTranslateLoading(true);
    setAiAction(direction);
    try {
      const prompt = isEnToBn
        ? `Translate the following category details into elegant Bengali (বাংলা) for an upscale handcrafted wooden home decor brand:
${JSON.stringify({ name: sourceName, description: sourceDesc })}

Return strictly valid JSON with keys: nameBn, descriptionBn.`
        : `Translate the following Bengali (বাংলা) category details into polished, professional English for an upscale handcrafted wooden home decor brand:
${JSON.stringify({ nameBn: sourceName, descriptionBn: sourceDesc })}

Return strictly valid JSON with keys: name, description.`;

      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, temperature: 0.3 }),
      });

      let parsed: any = null;
      if (res && (res.name || res.nameBn || res.description || res.descriptionBn)) {
        parsed = res;
      } else if (res?.text) {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      }

      if (parsed) {
        if (isEnToBn) {
          if (parsed.nameBn) setNameBn(parsed.nameBn);
          if (parsed.descriptionBn) setDescriptionBn(parsed.descriptionBn);
          showSuccess('✨ Category details translated to Bengali (বাংলা) successfully!');
        } else {
          if (parsed.name) setName(parsed.name);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.name && (!slug || slug === generateSlug(name))) {
            setSlug(generateSlug(parsed.name));
          }
          showSuccess('✨ Category details translated to English (EN) successfully!');
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
    if (!name && !nameBn && !description && !descriptionBn) {
      showWarning('Please provide at least Category Name or Description before proofreading.');
      return;
    }
    setAiLoading(true);
    try {
      const payload = {
        name,
        nameBn,
        description,
        descriptionBn,
      };

      const systemInstruction = `You are a master bilingual editor specialized in luxury wooden decor and e-commerce categories.
Simultaneously proofread, polish grammar, refine luxury marketing tone, and harmonize BOTH English and Bengali (বাংলা) category copy.

Rules:
1. Fix any typos, grammar mistakes, and tone inconsistencies in English and Bengali.
2. If Bengali is empty, generate natural, eloquent Bengali. If English is empty, generate eloquent English.
3. Return strictly valid JSON:
{
  "name": "...",
  "nameBn": "...",
  "description": "...",
  "descriptionBn": "..."
}`;

      const prompt = `Proofread and polish this category in English & Bengali:\n${JSON.stringify(payload, null, 2)}`;

      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction, temperature: 0.3 }),
      });

      let parsed: any = null;
      if (res && res.name) parsed = res;
      else if (res && res.text) {
        const match = res.text.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (parsed) {
        if (parsed.name) setName(parsed.name);
        if (parsed.nameBn) setNameBn(parsed.nameBn);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.descriptionBn) setDescriptionBn(parsed.descriptionBn);
        showSuccess('✨ Simultaneous AI Proofreading Complete for Category copy!');
      }
    } catch (err: any) {
      showError(err.message || 'Proofreading failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showWarning('Please enter a category name before saving.');
      return;
    }

    const cleanSlug = slug.trim() || generateSlug(name);
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        nameBn: nameBn.trim() || name.trim(),
        slug: cleanSlug,
        description: description.trim() || null,
        descriptionBn: descriptionBn.trim() || '',
        imageUrl: imageUrl.trim() || null,
        status,
        sortOrder: Number(sortOrder) || 0,
      };

      if (isEditing && editingId) {
        await fetchApi(`/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      // Upsert bilingual translations
      const translationItems = [
        {
          key: `category.${cleanSlug}.name`,
          en: name.trim(),
          bn: nameBn.trim() || name.trim(),
          category: 'categories',
          description: `Category Name for ${name.trim()}`,
        },
      ];

      if (description.trim() || descriptionBn.trim()) {
        translationItems.push({
          key: `category.${cleanSlug}.description`,
          en: description.trim(),
          bn: descriptionBn.trim() || description.trim(),
          category: 'categories',
          description: `Category Description for ${name.trim()}`,
        });
      }

      await fetchApi('/translations/admin/upsert-bulk', {
        method: 'POST',
        body: JSON.stringify({ items: translationItems }),
      }).catch(() => {});

      resetForm();
      await loadData();
      showSuccess(isEditing ? 'Category updated successfully!' : 'Category created successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    const confirmed = await showConfirm(`Are you sure you want to delete category "${catName}"?`, {
      title: 'Delete Category',
      confirmText: 'Delete Category',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;
    try {
      await fetchApi(`/categories/${id}`, { method: 'DELETE' });
      if (editingId === id) resetForm();
      loadData();
      showSuccess(`Category "${catName}" was deleted.`);
    } catch (err: any) {
      showError(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Header with Actions & AI Tools */}
      <CategoryHeader
        isEditing={isEditing}
        onResetForm={resetForm}
        onAutoTranslate={handleAutoTranslate}
        translateLoading={translateLoading}
        aiAction={aiAction}
        onAiProofread={handleAiProofread}
        aiLoading={aiLoading}
      />

      {/* 2. Main Grid: Form (5 Cols) + Table (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <CategoryForm
          isEditing={isEditing}
          editingId={editingId}
          languageMode={languageMode}
          setLanguageMode={setLanguageMode}
          name={name}
          setName={setName}
          nameBn={nameBn}
          setNameBn={setNameBn}
          slug={slug}
          setSlug={setSlug}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          description={description}
          setDescription={setDescription}
          descriptionBn={descriptionBn}
          setDescriptionBn={setDescriptionBn}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          status={status}
          setStatus={setStatus}
          saving={saving}
          onSubmit={handleSubmit}
        />

        <CategoryTable
          categories={categories}
          loading={loading}
          editingId={editingId}
          onStartEdit={startEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
