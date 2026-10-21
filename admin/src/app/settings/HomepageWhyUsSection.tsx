'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  FileText,
  LayoutGrid,
  Check,
  Languages,
  Wand2,
  Bot,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  Trees,
  Layers,
  Truck,
  Gem,
  ShieldCheck,
  Heart,
  Sparkles,
  Clock,
  Star,
  Box,
  ThumbsUp,
  Compass,
  MapPin,
  ChevronDown,
  Eye,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

// Dynamic import for TipTapEditor to optimize bundle and SSR isolation
const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-44 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
      <Loader2 className="w-4 h-4 animate-spin mr-2" />
      Loading Rich Text Editor...
    </div>
  ),
});

export interface WhyUsCardItem {
  id: string;
  icon: string;
  title_en: string;
  title_bn: string;
  desc_en: string;
  desc_bn: string;
}

export const DEFAULT_WHY_US_CARDS: WhyUsCardItem[] = [
  {
    id: 'card-1',
    icon: 'Trees',
    title_en: '100% Original Birch Plywood',
    title_bn: '১০০% অরিজিনাল বার্চ প্লাইউড',
    desc_en: 'Imported high-grade Birch wood is used, which is weather and moisture resistant.',
    desc_bn: 'আমদানিকৃত উন্নতমানের গ্রেড-এ বার্চ কাঠ ব্যবহার করা হয়, যা আবহাওয়া ও আর্দ্রতা প্রতিরোধী।',
  },
  {
    id: 'card-2',
    icon: 'Layers',
    title_en: '3D Multi-Layered Depth',
    title_bn: '৩ডি মাল্টি-লেয়ারড গভীরতা',
    desc_en: 'Precision joints of wood with various shades and depths bring a realistic three-dimensional look to your wall.',
    desc_bn: 'বিভিন্ন শেড এবং ভিন্ন ভিন্ন গভীরতার কাঠের নিখুঁত জোড়া দিয়ে দেয়ালে এনে দেয় বাস্তবসম্মত ত্রিমাত্রিক রূপ।',
  },
  {
    id: 'card-3',
    icon: 'Award',
    title_en: 'Lifetime Craftsmanship',
    title_bn: 'লাইফটাইম ক্রাফটম্যানশিপ',
    desc_en: 'Laser-cut precision and hand-polished by skilled artisans ensures it retains its new shine for years to come.',
    desc_bn: 'লেজার কাটিং এবং দক্ষ শিল্পীদের হাতের পলিশে প্রস্তুত হওয়ায় বছরের পর বছর ধরে নতুনের মতো উজ্জ্বলতা থাকে।',
  },
  {
    id: 'card-4',
    icon: 'Truck',
    title_en: 'Safe Delivery & Support',
    title_bn: 'নিরাপদ ডেলিভারি ও সাপোর্ট',
    desc_en: 'Special 3-ply bubble & wooden frame packaging with nationwide home delivery and free installation guide.',
    desc_bn: 'বিশেষ থ্রি-প্লাই বাবল ও কাঠের ফ্রেমিং প্যাকেজিং সহ সারাদেশে হোম ডেলিভারি ও ফ্রি ইনস্টলেশন গাইড।',
  },
];

export const AVAILABLE_ICONS = [
  { id: 'Trees', label: 'Birch Trees', icon: Trees },
  { id: 'Layers', label: '3D Layers', icon: Layers },
  { id: 'Award', label: 'Award / Badge', icon: Award },
  { id: 'Truck', label: 'Delivery Truck', icon: Truck },
  { id: 'Gem', label: 'Precious Gem', icon: Gem },
  { id: 'ShieldCheck', label: 'Verified Shield', icon: ShieldCheck },
  { id: 'Sparkles', label: 'Sparkles / Magic', icon: Sparkles },
  { id: 'Heart', label: 'Handcrafted Heart', icon: Heart },
  { id: 'Star', label: 'Premium Star', icon: Star },
  { id: 'Clock', label: 'Longevity Clock', icon: Clock },
  { id: 'Box', label: 'Safe Packaging', icon: Box },
  { id: 'ThumbsUp', label: 'Satisfaction', icon: ThumbsUp },
  { id: 'Compass', label: 'World Compass', icon: Compass },
  { id: 'MapPin', label: 'Global Map Pin', icon: MapPin },
];

const DEFAULT_PARAGRAPH_BN = `<p><strong>উডেন মীর</strong>-এ আমরা বিশ্বাস করি আপনার দেয়াল হলো অনন্য নান্দনিকতার এক জীবন্ত ক্যানভাস। আমাদের প্রতিটি কাঠের ওয়ার্ল্ড ম্যাপ ১০০% আমদানিকৃত প্রিমিয়াম গ্রেড-এ বার্চ প্লাইউড থেকে দক্ষ শিল্পীদের হাতের নিখুঁত ফিনিশিং ও সর্বাধুনিক লেজার কাটিং প্রযুক্তির মেলবন্ধনে তৈরি।</p><p>বহুস্তরীয় ৩ডি ডেপথ, নিখুঁত দেশ ও সীমানা খোদাই এবং প্রাকৃতিক কাঠের টেক্সচারের সমন্বয়ে এটি আপনার বসার ঘর বা অফিস কক্ষে এনে দেয় এক আভিজাত্যপূর্ণ ও বিলাসবহুল আবহ। বিশেষ থ্রি-প্লাই বাবল ও কাঠের মজবুত প্যাকেজিংয়ে সম্পূর্ণ নিরাপদে আপনার ঠিকানায় পৌঁছে দেওয়া হয় ফ্রি ইনস্টলেশন গাইড ও আজীবন কারিগরির নিশ্চয়তাসহ।</p>`;

const DEFAULT_PARAGRAPH_EN = `<p>At <strong>Wooden Mir</strong>, we believe your wall is a canvas for timeless elegance. Every wooden map is handcrafted from 100% genuine imported grade-A birch plywood, combining precision laser cutting with meticulous hand-finishing by master artisans.</p><p>With multi-layered 3D relief, engraved country borders, capitals, and natural wood stains, each piece brings warmth, sophistication, and global wonder directly into your living space or executive office. Packaged with heavy-duty wooden framing and protective multi-ply cushioning, our creations arrive safely at your doorstep with complimentary installation accessories and lifetime craftsmanship assurance.</p>`;

interface HomepageWhyUsSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export const HomepageWhyUsSection = React.memo(function HomepageWhyUsSection({
  settings,
  handleChange,
}: HomepageWhyUsSectionProps) {
  const { showSuccess, showError, showWarning } = useAdminModal();

  // Mode: 'cards' or 'paragraph'
  const displayMode = settings.why_us_display_mode === 'paragraph' ? 'paragraph' : 'cards';

  // Language View Mode in Admin: 'both' | 'bn' | 'en'
  const [langView, setLangView] = useState<'both' | 'bn' | 'en'>('both');

  // AI Translation Loading State
  const [translateLoading, setTranslateLoading] = useState(false);
  const [aiAction, setAiAction] = useState<'en_to_bn' | 'bn_to_en' | null>(null);

  // Show live visual preview tab
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState<'bn' | 'en'>('bn');

  // Parse Cards List from settings or fallback to defaults
  const cards: WhyUsCardItem[] = useMemo(() => {
    if (!settings.why_us_cards_json) {
      return DEFAULT_WHY_US_CARDS;
    }
    try {
      const parsed = JSON.parse(settings.why_us_cards_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
    return DEFAULT_WHY_US_CARDS;
  }, [settings.why_us_cards_json]);

  // Save Cards List
  const handleUpdateCards = (updated: WhyUsCardItem[]) => {
    handleChange('why_us_cards_json', JSON.stringify(updated));
  };

  const handleCardChange = (index: number, field: keyof WhyUsCardItem, val: string) => {
    const next = [...cards];
    next[index] = { ...next[index], [field]: val };
    handleUpdateCards(next);
  };

  const handleAddCard = () => {
    if (cards.length >= 8) {
      showWarning('Maximum 8 feature cards are allowed for ideal storefront layout.');
      return;
    }
    const newCard: WhyUsCardItem = {
      id: `card-${Date.now()}`,
      icon: 'Award',
      title_en: 'New Feature Title',
      title_bn: 'নতুন বৈশিষ্ট্যের শিরোনাম',
      desc_en: 'Description highlighting your unique product advantage.',
      desc_bn: 'আপনার পণ্যের বিশেষ গুণাবলী ও সুবিধার সংক্ষিপ্ত বিবরণ।',
    };
    handleUpdateCards([...cards, newCard]);
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) {
      showWarning('At least 1 card is required in Card Mode.');
      return;
    }
    const next = cards.filter((_, i) => i !== index);
    handleUpdateCards(next);
  };

  const handleResetCards = () => {
    handleUpdateCards(DEFAULT_WHY_US_CARDS);
    showSuccess('Feature cards reset to default 4 cards.');
  };

  // AI Auto-Translation Logic (EN ➔ BN & BN ➔ EN)
  const handleAutoTranslate = async (direction: 'en_to_bn' | 'bn_to_en') => {
    const isEnToBn = direction === 'en_to_bn';

    // Check prerequisites
    if (isEnToBn) {
      const hasHeader = (settings.why_us_title_en || '').trim();
      const hasContent =
        displayMode === 'paragraph'
          ? (settings.why_us_paragraph_en || '').trim()
          : cards.some((c) => c.title_en.trim());
      if (!hasHeader && !hasContent) {
        showWarning('Please enter English content first before auto-translating to Bengali.');
        return;
      }
    } else {
      const hasHeader = (settings.why_us_title_bn || '').trim();
      const hasContent =
        displayMode === 'paragraph'
          ? (settings.why_us_paragraph_bn || '').trim()
          : cards.some((c) => c.title_bn.trim());
      if (!hasHeader && !hasContent) {
        showWarning('Please enter Bengali (বাংলা) content first before auto-translating to English.');
        return;
      }
    }

    setTranslateLoading(true);
    setAiAction(direction);

    try {
      if (displayMode === 'paragraph') {
        const sourceData = isEnToBn
          ? {
              badge: settings.why_us_badge_en || 'PROMISE OF EXCELLENCE',
              title: settings.why_us_title_en || 'Why Choose Wooden Mir?',
              subtitle:
                settings.why_us_sub_en ||
                'Every piece of our wooden artwork holds enduring quality, precise craftsmanship, and a touch of aesthetic elegance.',
              paragraphHtml: settings.why_us_paragraph_en || DEFAULT_PARAGRAPH_EN,
            }
          : {
              badge: settings.why_us_badge_bn || 'শ্রেষ্ঠত্বের প্রতিশ্রুতি',
              title: settings.why_us_title_bn || 'কেন উডেন মীর সেরা পছন্দ?',
              subtitle:
                settings.why_us_sub_bn ||
                'আমাদের প্রতিটি কাঠের শিল্পকর্মে থাকে দীর্ঘস্থায়ী মান, নিখুঁত কারিগরি এবং নান্দনিক আভিজাত্যের স্পর্শ',
              paragraphHtml: settings.why_us_paragraph_bn || DEFAULT_PARAGRAPH_BN,
            };

        const prompt = isEnToBn
          ? `You are a master bilingual copywriter for an upscale handcrafted luxury wooden map brand.
Translate the following English homepage section details into elegant, natural, captivating Bengali (বাংলা):
${JSON.stringify(sourceData)}

CRITICAL RULES:
1. Preserve all HTML tags (such as <p>, <strong>, <em>, <ul>, <li>, <blockquote>, <a>) in "paragraphHtml" exactly as structured. Only translate the human-readable text contents inside the tags.
2. Return strictly a raw valid JSON object with the exact keys:
{
  "badge": "Bengali string",
  "title": "Bengali string",
  "subtitle": "Bengali string",
  "paragraphHtml": "Bengali HTML with preserved tags"
}`
          : `You are a master bilingual copywriter for an upscale handcrafted luxury wooden map brand.
Translate the following Bengali (বাংলা) homepage section details into polished, sophisticated, high-converting English:
${JSON.stringify(sourceData)}

CRITICAL RULES:
1. Preserve all HTML tags (such as <p>, <strong>, <em>, <ul>, <li>, <blockquote>, <a>) in "paragraphHtml" exactly as structured. Only translate the human-readable text contents inside the tags.
2. Return strictly a raw valid JSON object with the exact keys:
{
  "badge": "English string",
  "title": "English string",
  "subtitle": "English string",
  "paragraphHtml": "English HTML with preserved tags"
}`;

        const res = await fetchApi('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, temperature: 0.25 }),
        });

        let parsed: any = null;
        if (res && (res.badge || res.title || res.subtitle || res.paragraphHtml)) {
          parsed = res;
        } else if (res?.text) {
          const jsonMatch = res.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        }

        if (parsed) {
          if (isEnToBn) {
            if (parsed.badge) handleChange('why_us_badge_bn', parsed.badge);
            if (parsed.title) handleChange('why_us_title_bn', parsed.title);
            if (parsed.subtitle) handleChange('why_us_sub_bn', parsed.subtitle);
            if (parsed.paragraphHtml) handleChange('why_us_paragraph_bn', parsed.paragraphHtml);
            showSuccess('✨ Section header and editorial paragraph translated to Bengali (বাংলা) successfully!');
          } else {
            if (parsed.badge) handleChange('why_us_badge_en', parsed.badge);
            if (parsed.title) handleChange('why_us_title_en', parsed.title);
            if (parsed.subtitle) handleChange('why_us_sub_en', parsed.subtitle);
            if (parsed.paragraphHtml) handleChange('why_us_paragraph_en', parsed.paragraphHtml);
            showSuccess('✨ Section header and editorial paragraph translated to English (EN) successfully!');
          }
        } else {
          showError('AI did not return expected translation structure.');
        }
      } else {
        // Mode === 'cards'
        const sourceData = isEnToBn
          ? {
              badge: settings.why_us_badge_en || 'PROMISE OF EXCELLENCE',
              title: settings.why_us_title_en || 'Why Choose Wooden Mir?',
              subtitle:
                settings.why_us_sub_en ||
                'Every piece of our wooden artwork holds enduring quality, precise craftsmanship, and a touch of aesthetic elegance.',
              cards: cards.map((c) => ({
                id: c.id,
                title: c.title_en,
                desc: c.desc_en,
              })),
            }
          : {
              badge: settings.why_us_badge_bn || 'শ্রেষ্ঠত্বের প্রতিশ্রুতি',
              title: settings.why_us_title_bn || 'কেন উডেন মীর সেরা পছন্দ?',
              subtitle:
                settings.why_us_sub_bn ||
                'আমাদের প্রতিটি কাঠের শিল্পকর্মে থাকে দীর্ঘস্থায়ী মান, নিখুঁত কারিগরি এবং নান্দনিক আভিজাত্যের স্পর্শ',
              cards: cards.map((c) => ({
                id: c.id,
                title: c.title_bn,
                desc: c.desc_bn,
              })),
            };

        const prompt = isEnToBn
          ? `You are an expert e-commerce copywriter for an upscale handcrafted wooden home decor brand.
Translate the following English feature cards into elegant, compelling, natural Bengali (বাংলা):
${JSON.stringify(sourceData)}

Return strictly a valid JSON object with the exact keys:
{
  "badge": "Bengali string",
  "title": "Bengali string",
  "subtitle": "Bengali string",
  "cards": [
    { "id": "matching_id", "title": "Bengali card title", "desc": "Bengali card description" }
  ]
}`
          : `You are an expert e-commerce copywriter for an upscale handcrafted wooden home decor brand.
Translate the following Bengali feature cards into professional, elegant, high-converting English:
${JSON.stringify(sourceData)}

Return strictly a valid JSON object with the exact keys:
{
  "badge": "English string",
  "title": "English string",
  "subtitle": "English string",
  "cards": [
    { "id": "matching_id", "title": "English card title", "desc": "English card description" }
  ]
}`;

        const res = await fetchApi('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, temperature: 0.25 }),
        });

        let parsed: any = null;
        if (res && (res.badge || res.title || res.subtitle || Array.isArray(res.cards))) {
          parsed = res;
        } else if (res?.text) {
          const jsonMatch = res.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        }

        if (parsed) {
          if (isEnToBn) {
            if (parsed.badge) handleChange('why_us_badge_bn', parsed.badge);
            if (parsed.title) handleChange('why_us_title_bn', parsed.title);
            if (parsed.subtitle) handleChange('why_us_sub_bn', parsed.subtitle);
            if (Array.isArray(parsed.cards)) {
              const updatedCards = cards.map((orig) => {
                const match = parsed.cards.find((m: any) => m.id === orig.id);
                if (match) {
                  return {
                    ...orig,
                    title_bn: match.title || orig.title_bn,
                    desc_bn: match.desc || orig.desc_bn,
                  };
                }
                return orig;
              });
              handleUpdateCards(updatedCards);
            }
            showSuccess('✨ Section header and all cards translated to Bengali (বাংলা) successfully!');
          } else {
            if (parsed.badge) handleChange('why_us_badge_en', parsed.badge);
            if (parsed.title) handleChange('why_us_title_en', parsed.title);
            if (parsed.subtitle) handleChange('why_us_sub_en', parsed.subtitle);
            if (Array.isArray(parsed.cards)) {
              const updatedCards = cards.map((orig) => {
                const match = parsed.cards.find((m: any) => m.id === orig.id);
                if (match) {
                  return {
                    ...orig,
                    title_en: match.title || orig.title_en,
                    desc_en: match.desc || orig.desc_en,
                  };
                }
                return orig;
              });
              handleUpdateCards(updatedCards);
            }
            showSuccess('✨ Section header and all cards translated to English (EN) successfully!');
          }
        } else {
          showError('AI did not return expected translation structure.');
        }
      }
    } catch (err: any) {
      showError(err.message || 'Auto-translation failed. Check AI provider settings.');
    } finally {
      setTranslateLoading(false);
      setAiAction(null);
    }
  };

  return (
    <div className="pt-8 border-t border-slate-200/90 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#c08a46]" />
            <span>Homepage &quot;Why Choose Us&quot; Section Settings</span>
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose whether to show the 4-Column Feature Cards or a Rich TipTap Editorial Paragraph, with bilingual copy and 1-click AI translation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200">
            Active: {displayMode === 'paragraph' ? 'Editorial Paragraph (TipTap)' : 'Feature Cards Grid (Default)'}
          </span>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
          </button>
        </div>
      </div>

      {/* 1. Display Mode Switcher (Cards vs Paragraph) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Feature Cards Grid */}
        <button
          type="button"
          onClick={() => handleChange('why_us_display_mode', 'cards')}
          className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
            displayMode === 'cards'
              ? 'border-[#c08a46] bg-amber-50/40 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#c08a46]" />
              <span className="text-xs font-bold text-slate-900">Feature Cards Grid</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Default
              </span>
            </div>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                displayMode === 'cards' ? 'border-[#c08a46] bg-[#c08a46] text-white' : 'border-slate-300'
              }`}
            >
              {displayMode === 'cards' && <Check className="w-2.5 h-2.5" />}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Display customizable multi-column feature cards with custom Lucide icons, bold headlines, and detailed benefit descriptions.
          </p>
          {/* Miniature Visual Mockup */}
          <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-white border border-slate-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-1 rounded bg-[#FAF5EE] border border-[#EADDCF] flex flex-col items-center text-center">
                <div className="w-3.5 h-3.5 rounded bg-amber-100/80 mb-0.5" />
                <div className="w-6 h-1 rounded bg-slate-400 mb-0.5" />
                <div className="w-8 h-0.5 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </button>

        {/* Option 2: Editorial Rich Paragraph (TipTap) */}
        <button
          type="button"
          onClick={() => handleChange('why_us_display_mode', 'paragraph')}
          className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
            displayMode === 'paragraph'
              ? 'border-[#c08a46] bg-amber-50/40 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#c08a46]" />
              <span className="text-xs font-bold text-slate-900">Editorial Rich Paragraph</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                TipTap Rich Text
              </span>
            </div>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                displayMode === 'paragraph' ? 'border-[#c08a46] bg-[#c08a46] text-white' : 'border-slate-300'
              }`}
            >
              {displayMode === 'paragraph' && <Check className="w-2.5 h-2.5" />}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Present an elegant, story-driven editorial narrative with custom headings, bold highlights, lists, and quotes formatted via TipTap.
          </p>
          {/* Miniature Visual Mockup */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="w-24 h-1.5 rounded bg-slate-700" />
            <div className="w-full h-1 rounded bg-slate-200" />
            <div className="w-5/6 h-1 rounded bg-slate-200" />
            <div className="w-4/5 h-1 rounded bg-slate-200" />
          </div>
        </button>
      </div>

      {/* 2. Bilingual Toolbar & 1-Click AI Translation */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Languages className="w-4 h-4 text-[#c08a46]" />
            <span>Editing Language View Mode:</span>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => setLangView('both')}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer ${
                langView === 'both' ? 'bg-[#c08a46] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side (Both)
            </button>
            <button
              type="button"
              onClick={() => setLangView('bn')}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer ${
                langView === 'bn' ? 'bg-[#c08a46] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇧🇩 বাংলা (BN)
            </button>
            <button
              type="button"
              onClick={() => setLangView('en')}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer ${
                langView === 'en' ? 'bg-[#c08a46] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇬🇧 English (EN)
            </button>
          </div>
        </div>

        {/* AI Translation Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-200/70">
          <button
            type="button"
            onClick={() => handleAutoTranslate('en_to_bn')}
            disabled={translateLoading}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/90 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            title="Translate all English fields to Bengali using AI"
          >
            {translateLoading && aiAction === 'en_to_bn' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c08a46]" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-[#c08a46]" />
            )}
            <span>AI Auto-Translate (EN ➔ বাংলা)</span>
          </button>

          <button
            type="button"
            onClick={() => handleAutoTranslate('bn_to_en')}
            disabled={translateLoading}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/90 text-blue-900 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            title="Translate all Bengali fields to English using AI"
          >
            {translateLoading && aiAction === 'bn_to_en' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>AI Auto-Translate (বাংলা ➔ EN)</span>
          </button>
        </div>
      </div>

      {/* 3. Section Header Configuration (Badge, Title, Subtitle) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>Section Badge, Title &amp; Subtitle</span>
        </h4>

        {/* Badge Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(langView === 'both' || langView === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Badge Text <span className="font-mono text-slate-400 font-normal">(English)</span>
              </label>
              <input
                type="text"
                value={settings.why_us_badge_en !== undefined ? settings.why_us_badge_en : 'PROMISE OF EXCELLENCE'}
                onChange={(e) => handleChange('why_us_badge_en', e.target.value)}
                placeholder="PROMISE OF EXCELLENCE"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}

          {(langView === 'both' || langView === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ব্যাজ টেক্সট <span className="font-mono text-slate-400 font-normal">(বাংলা)</span>
              </label>
              <input
                type="text"
                value={settings.why_us_badge_bn !== undefined ? settings.why_us_badge_bn : 'শ্রেষ্ঠত্বের প্রতিশ্রুতি'}
                onChange={(e) => handleChange('why_us_badge_bn', e.target.value)}
                placeholder="শ্রেষ্ঠত্বের প্রতিশ্রুতি"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
        </div>

        {/* Section Heading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(langView === 'both' || langView === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section Main Title <span className="font-mono text-slate-400 font-normal">(English)</span>
              </label>
              <input
                type="text"
                value={settings.why_us_title_en !== undefined ? settings.why_us_title_en : 'Why Choose Wooden Mir?'}
                onChange={(e) => handleChange('why_us_title_en', e.target.value)}
                placeholder="Why Choose Wooden Mir?"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}

          {(langView === 'both' || langView === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সেকশন শিরোনাম <span className="font-mono text-slate-400 font-normal">(বাংলা)</span>
              </label>
              <input
                type="text"
                value={settings.why_us_title_bn !== undefined ? settings.why_us_title_bn : 'কেন উডেন মীর সেরা পছন্দ?'}
                onChange={(e) => handleChange('why_us_title_bn', e.target.value)}
                placeholder="কেন উডেন মীর সেরা পছন্দ?"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
        </div>

        {/* Section Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(langView === 'both' || langView === 'en') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section Subtitle <span className="font-mono text-slate-400 font-normal">(English)</span>
              </label>
              <textarea
                rows={2}
                value={
                  settings.why_us_sub_en !== undefined
                    ? settings.why_us_sub_en
                    : 'Every piece of our wooden artwork holds enduring quality, precise craftsmanship, and a touch of aesthetic elegance.'
                }
                onChange={(e) => handleChange('why_us_sub_en', e.target.value)}
                placeholder="Enter subtitle text..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}

          {(langView === 'both' || langView === 'bn') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সাব-টাইটেল / উপশিরোনাম <span className="font-mono text-slate-400 font-normal">(বাংলা)</span>
              </label>
              <textarea
                rows={2}
                value={
                  settings.why_us_sub_bn !== undefined
                    ? settings.why_us_sub_bn
                    : 'আমাদের প্রতিটি কাঠের শিল্পকর্মে থাকে দীর্ঘস্থায়ী মান, নিখুঁত কারিগরি এবং নান্দনিক আভিজাত্যের স্পর্শ'
                }
                onChange={(e) => handleChange('why_us_sub_bn', e.target.value)}
                placeholder="উপশিরোনাম লিখুন..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. MODE A: Editorial Rich Paragraph Editor (TipTap) */}
      {displayMode === 'paragraph' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#c08a46]" />
                <span>Editorial Paragraph Content (TipTap Rich Text)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Write a compelling brand narrative formatted with headings, quotes, bold highlights, and lists.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {(langView === 'both' || langView === 'en') && (
              <div className="space-y-1.5">
                <TipTapEditor
                  label="English Editorial Paragraph"
                  badge="EN"
                  badgeColor="slate"
                  value={
                    settings.why_us_paragraph_en !== undefined
                      ? settings.why_us_paragraph_en
                      : DEFAULT_PARAGRAPH_EN
                  }
                  onChange={(val) => handleChange('why_us_paragraph_en', val)}
                  placeholder="Write captivating English brand story here..."
                  minHeight="220px"
                />
              </div>
            )}

            {(langView === 'both' || langView === 'bn') && (
              <div className="space-y-1.5">
                <TipTapEditor
                  label="বাংলা সম্পাদকীয় অনুচ্ছেদ"
                  badge="বাংলা"
                  badgeColor="emerald"
                  value={
                    settings.why_us_paragraph_bn !== undefined
                      ? settings.why_us_paragraph_bn
                      : DEFAULT_PARAGRAPH_BN
                  }
                  onChange={(val) => handleChange('why_us_paragraph_bn', val)}
                  placeholder="এখানে আকর্ষণীয় বাংলা ব্র্যান্ডের গল্প লিখুন..."
                  minHeight="220px"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODE B: Feature Cards Editor */}
      {displayMode === 'cards' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-[#c08a46]" />
                <span>Feature Cards Manager ({cards.length} Cards)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Customize titles, descriptions, and icons for each card displayed in the homepage grid.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCards}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset to initial 4 cards"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleAddCard}
                className="px-3 py-1.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {cards.map((card, idx) => {
              const currentIconObj = AVAILABLE_ICONS.find((i) => i.id === card.icon) || AVAILABLE_ICONS[0];
              const IconComp = currentIconObj.icon;

              return (
                <div
                  key={card.id || idx}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Icon Picker Dropdown */}
                        <div className="relative inline-block">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-400">
                            <IconComp className="w-4 h-4 text-[#c08a46]" />
                            <span className="text-xs">{currentIconObj.label}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                            <select
                              value={card.icon}
                              onChange={(e) => handleCardChange(idx, 'icon', e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            >
                              {AVAILABLE_ICONS.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCard(idx)}
                      disabled={cards.length <= 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                      title="Delete this card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Titles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(langView === 'both' || langView === 'en') && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Card Title (English)
                        </label>
                        <input
                          type="text"
                          value={card.title_en}
                          onChange={(e) => handleCardChange(idx, 'title_en', e.target.value)}
                          placeholder="e.g. 100% Original Birch Plywood"
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#c08a46]"
                        />
                      </div>
                    )}

                    {(langView === 'both' || langView === 'bn') && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          কার্ড শিরোনাম (বাংলা)
                        </label>
                        <input
                          type="text"
                          value={card.title_bn}
                          onChange={(e) => handleCardChange(idx, 'title_bn', e.target.value)}
                          placeholder="যেমন: ১০০% অরিজিনাল বার্চ প্লাইউড"
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#c08a46]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Descriptions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(langView === 'both' || langView === 'en') && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Description (English)
                        </label>
                        <textarea
                          rows={2}
                          value={card.desc_en}
                          onChange={(e) => handleCardChange(idx, 'desc_en', e.target.value)}
                          placeholder="Enter English description..."
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#c08a46]"
                        />
                      </div>
                    )}

                    {(langView === 'both' || langView === 'bn') && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          বিবরণ (বাংলা)
                        </label>
                        <textarea
                          rows={2}
                          value={card.desc_bn}
                          onChange={(e) => handleCardChange(idx, 'desc_bn', e.target.value)}
                          placeholder="বাংলা বিবরণ লিখুন..."
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#c08a46]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Live Visual Storefront Preview */}
      {showPreview && (
        <div className="p-6 rounded-2xl bg-[#FBF8F4] border border-[#8E5A35]/20 space-y-4">
          <div className="flex items-center justify-between border-b border-[#8E5A35]/15 pb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#8E5A35]" />
              <span className="text-xs font-bold text-[#2C1810]">Storefront Appearance Preview</span>
            </div>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#8E5A35]/20 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setPreviewLang('bn')}
                className={`px-2 py-0.5 rounded ${previewLang === 'bn' ? 'bg-[#8E5A35] text-white' : 'text-slate-600'}`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2 py-0.5 rounded ${previewLang === 'en' ? 'bg-[#8E5A35] text-white' : 'text-slate-600'}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Section Head */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF3EB] text-[#8E5A35] border border-[#C08A46]/20">
              <Gem className="w-3 h-3 text-[#C08A46]" />
              <span>
                {previewLang === 'bn'
                  ? settings.why_us_badge_bn || 'শ্রেষ্ঠত্বের প্রতিশ্রুতি'
                  : settings.why_us_badge_en || 'PROMISE OF EXCELLENCE'}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-[#2C1810]">
              {previewLang === 'bn'
                ? settings.why_us_title_bn || 'কেন উডেন মীর সেরা পছন্দ?'
                : settings.why_us_title_en || 'Why Choose Wooden Mir?'}
            </h3>
            <p className="text-xs text-stone-600">
              {previewLang === 'bn'
                ? settings.why_us_sub_bn ||
                  'আমাদের প্রতিটি কাঠের শিল্পকর্মে থাকে দীর্ঘস্থায়ী মান, নিখুঁত কারিগরি এবং নান্দনিক আভিজাত্যের স্পর্শ'
                : settings.why_us_sub_en ||
                  'Every piece of our wooden artwork holds enduring quality, precise craftsmanship, and a touch of aesthetic elegance.'}
            </p>
          </div>

          {/* Preview Content */}
          {displayMode === 'paragraph' ? (
            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-[#8E5A35]/15 shadow-xs">
              <div
                className="tiptap-content text-stone-700 text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    previewLang === 'bn'
                      ? settings.why_us_paragraph_bn || DEFAULT_PARAGRAPH_BN
                      : settings.why_us_paragraph_en || DEFAULT_PARAGRAPH_EN
                  ),
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
              {cards.map((c, i) => {
                const iconObj = AVAILABLE_ICONS.find((ico) => ico.id === c.icon) || AVAILABLE_ICONS[0];
                const Ico = iconObj.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white border border-[#8E5A35]/15 flex flex-col items-center text-center shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FAF3EB] border border-[#C08A46]/30 flex items-center justify-center text-[#8E5A35] mb-2.5">
                      <Ico className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-[#2C1810] mb-1">
                      {previewLang === 'bn' ? c.title_bn : c.title_en}
                    </div>
                    <div className="text-[11px] text-stone-600">
                      {previewLang === 'bn' ? c.desc_bn : c.desc_en}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default HomepageWhyUsSection;
