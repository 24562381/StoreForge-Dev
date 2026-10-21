'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { FeaturedProductHeader } from './FeaturedProductHeader';
import { FeaturedProductLangToolbar } from './FeaturedProductLangToolbar';
import { FeaturedProductSelector } from './FeaturedProductSelector';
import { FeaturedProductImagePicker } from './FeaturedProductImagePicker';
import { FeaturedProductCustomizer } from './FeaturedProductCustomizer';
import { FeaturedProductPreview } from './FeaturedProductPreview';

const cleanProductDescription = (htmlOrText: string): string => {
  if (!htmlOrText) return '';
  return htmlOrText
    // Completely remove all heading tags (h1-h6) and their inner content
    .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, '')
    // Convert block closures and break tags to line breaks
    .replace(/<\/(p|div|li|blockquote|tr|table|ul|ol)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Normalize line breaks and trim excessive blank lines
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const cleanHtml = cleanProductDescription;

export default function Wrapper() {
  const { showSuccess, showError, showWarning } = useAdminModal();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [translationsBn, setTranslationsBn] = useState<Record<string, string>>({});

  // Language View Mode in Admin: 'both' | 'en' | 'bn'
  const [langMode, setLangMode] = useState<'both' | 'en' | 'bn'>('both');
  const [previewLang, setPreviewLang] = useState<'bn' | 'en'>('bn');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [enabled, setEnabled] = useState<boolean>(true);
  const [customImage, setCustomImage] = useState<string>('');

  // Bilingual Section Header
  const [sectionTitleBn, setSectionTitleBn] = useState<string>('ওয়ার্ল্ড ম্যাপ');
  const [sectionTitleEn, setSectionTitleEn] = useState<string>('World Map');
  const [sectionSubtitleBn, setSectionSubtitleBn] = useState<string>('আমাদের সবচেয়ে প্রশংসিত হস্তনির্মিত কাঠের শিল্পকর্ম');
  const [sectionSubtitleEn, setSectionSubtitleEn] = useState<string>('Our most admired handcrafted wooden artwork');

  // Bilingual Custom Info
  const [badgeTextBn, setBadgeTextBn] = useState<string>('এক্সক্লুসিভ কালেকশন');
  const [badgeTextEn, setBadgeTextEn] = useState<string>('PREMIUM EXCLUSIVE');

  const [priceNoteBn, setPriceNoteBn] = useState<string>('ছাড় ৳ ১৩০০');
  const [priceNoteEn, setPriceNoteEn] = useState<string>('SAVE ৳ 1300');

  const [customTitleBn, setCustomTitleBn] = useState<string>('');
  const [customTitleEn, setCustomTitleEn] = useState<string>('');

  const [customTaglineBn, setCustomTaglineBn] = useState<string>('');
  const [customTaglineEn, setCustomTaglineEn] = useState<string>('');

  const [customDescriptionBn, setCustomDescriptionBn] = useState<string>('');
  const [customDescriptionEn, setCustomDescriptionEn] = useState<string>('');

  const [btnViewTextBn, setBtnViewTextBn] = useState<string>('সম্পূর্ণ বিস্তারিত দেখুন');
  const [btnViewTextEn, setBtnViewTextEn] = useState<string>('View Full Details');

  const [btnBuyTextBn, setBtnBuyTextBn] = useState<string>('এখনই অর্ডার করুন');
  const [btnBuyTextEn, setBtnBuyTextEn] = useState<string>('Order Now');

  // Highlights (Bilingual pairs) - Defaults to empty array so deleted highlights persist
  const [highlightsBn, setHighlightsBn] = useState<string[]>([]);
  const [highlightsEn, setHighlightsEn] = useState<string[]>([]);

  const [newHlBn, setNewHlBn] = useState<string>('');
  const [newHlEn, setNewHlEn] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetchApi('/products?limit=100'),
      fetchApi('/settings/public'),
      fetchApi('/translations/dictionary?lang=bn').catch(() => ({})),
    ])
      .then(([productsRes, settingsRes, bnDict]) => {
        const prods = productsRes?.products || productsRes?.items || (Array.isArray(productsRes) ? productsRes : []);
        setProducts(prods);
        setTranslationsBn(bnDict || {});

        const s = settingsRes || {};
        const savedProdId = s.featured_product_id || (prods[0]?.id ? String(prods[0].id) : '');
        setSelectedProductId(savedProdId);
        setEnabled(s.featured_product_enabled !== 'false');
        setCustomImage(s.featured_product_image || '');

        // Headers
        setSectionTitleBn(s.featured_product_section_title_bn || s.featured_product_section_title || 'ওয়ার্ল্ড ম্যাপ');
        setSectionTitleEn(s.featured_product_section_title_en || 'World Map');
        setSectionSubtitleBn(s.featured_product_section_sub_bn || s.featured_product_section_sub || 'আমাদের সবচেয়ে প্রশংসিত হস্তনির্মিত কাঠের শিল্পকর্ম');
        setSectionSubtitleEn(s.featured_product_section_sub_en || 'Our most admired handcrafted wooden artwork');

        // Badges & Notes
        setBadgeTextBn(s.featured_product_badge_bn || s.featured_product_badge || 'এক্সক্লুসিভ কালেকশন');
        setBadgeTextEn(s.featured_product_badge_en || 'PREMIUM EXCLUSIVE');
        setPriceNoteBn(s.featured_product_price_note_bn || s.featured_product_price_note || '');
        setPriceNoteEn(s.featured_product_price_note_en || '');

        // Titles & Taglines
        setCustomTitleBn(s.featured_product_title_bn || s.featured_product_title || '');
        setCustomTitleEn(s.featured_product_title_en || '');
        setCustomTaglineBn(s.featured_product_tagline_bn || s.featured_product_tagline || '');
        setCustomTaglineEn(s.featured_product_tagline_en || '');

        // Descriptions
        setCustomDescriptionBn(s.featured_product_description_bn || s.featured_product_description || '');
        setCustomDescriptionEn(s.featured_product_description_en || '');

        // Buttons
        setBtnViewTextBn(s.featured_product_btn_view_bn || s.featured_product_btn_view || 'সম্পূর্ণ বিস্তারিত দেখুন');
        setBtnViewTextEn(s.featured_product_btn_view_en || 'View Full Details');
        setBtnBuyTextBn(s.featured_product_btn_buy_bn || s.featured_product_btn_buy || 'এখনই অর্ডার করুন');
        setBtnBuyTextEn(s.featured_product_btn_buy_en || 'Order Now');

        // Highlights BN - Persist empty array when user deletes all items
        const rawHlBn = s.featured_product_highlights_bn !== undefined ? s.featured_product_highlights_bn : s.featured_product_highlights;
        if (rawHlBn !== undefined && rawHlBn !== null && rawHlBn !== '') {
          try {
            const parsed = JSON.parse(rawHlBn);
            if (Array.isArray(parsed)) {
              setHighlightsBn(parsed);
            }
          } catch { }
        } else {
          setHighlightsBn([]);
        }

        // Highlights EN - Persist empty array when user deletes all items
        const rawHlEn = s.featured_product_highlights_en;
        if (rawHlEn !== undefined && rawHlEn !== null && rawHlEn !== '') {
          try {
            const parsed = JSON.parse(rawHlEn);
            if (Array.isArray(parsed)) {
              setHighlightsEn(parsed);
            }
          } catch { }
        } else {
          setHighlightsEn([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        showError('Failed to load featured product settings: ' + err.message);
        setLoading(false);
      });
  }, [showError]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => String(p.id) === String(selectedProductId)) || products[0];
  }, [products, selectedProductId]);

  const handleProductChange = useCallback((id: string) => {
    setSelectedProductId(id);
    const prod = products.find((p) => String(p.id) === String(id));
    if (prod) {
      // Immediately update custom description with selected product's full description (not short summary)
      const enDesc =
        cleanProductDescription(prod.fullDescription || '') ||
        cleanProductDescription(prod.shortDescription || '') ||
        '';
      const bnDesc =
        cleanProductDescription(translationsBn[`product.${prod.slug}.full_desc`] || '') ||
        cleanProductDescription(translationsBn[`product.${prod.slug}.short_desc`] || '') ||
        enDesc;

      setCustomDescriptionEn(enDesc);
      setCustomDescriptionBn(bnDesc);

      if (!customTitleBn) setCustomTitleBn(translationsBn[`product.${prod.slug}.name`] || prod.name);
      if (!customTitleEn) setCustomTitleEn(prod.name);
      if (!customTaglineBn) setCustomTaglineBn(translationsBn[`product.${prod.slug}.tagline`] || prod.tagline || '');
      if (!customTaglineEn) setCustomTaglineEn(prod.tagline || '');

      const primaryImg = prod.images?.find((img: any) => img.isPrimary) || prod.images?.[0];
      if (primaryImg?.imageUrl) {
        setCustomImage(primaryImg.imageUrl);
      }
    }
  }, [products, translationsBn, customTitleBn, customTitleEn, customTaglineBn, customTaglineEn]);

  const handleResetFromProduct = useCallback(() => {
    if (!selectedProduct) return;
    setCustomTitleBn(translationsBn[`product.${selectedProduct.slug}.name`] || selectedProduct.name);
    setCustomTitleEn(selectedProduct.name);
    setCustomTaglineBn(translationsBn[`product.${selectedProduct.slug}.tagline`] || selectedProduct.tagline || '');
    setCustomTaglineEn(selectedProduct.tagline || '');

    const enDesc =
      cleanProductDescription(selectedProduct.fullDescription || '') ||
      cleanProductDescription(selectedProduct.shortDescription || '') ||
      '';
    const bnDesc =
      cleanProductDescription(translationsBn[`product.${selectedProduct.slug}.full_desc`] || '') ||
      cleanProductDescription(translationsBn[`product.${selectedProduct.slug}.short_desc`] || '') ||
      enDesc;

    setCustomDescriptionBn(bnDesc);
    setCustomDescriptionEn(enDesc);

    const primaryImg = selectedProduct.images?.find((img: any) => img.isPrimary) || selectedProduct.images?.[0];
    if (primaryImg?.imageUrl) {
      setCustomImage(primaryImg.imageUrl);
    }
    showSuccess('Information reset from ' + selectedProduct.name);
  }, [selectedProduct, translationsBn, showSuccess]);

  const handleAddHighlight = useCallback(() => {
    const trimmedBn = newHlBn.trim();
    const trimmedEn = newHlEn.trim();
    if (!trimmedBn && !trimmedEn) return;

    const finalBn = trimmedBn || trimmedEn;
    const finalEn = trimmedEn || trimmedBn;

    setHighlightsBn((prev) => [...prev, finalBn]);
    setHighlightsEn((prev) => [...prev, finalEn]);

    setNewHlBn('');
    setNewHlEn('');
  }, [newHlBn, newHlEn]);

  const handleRemoveHighlight = useCallback((index: number) => {
    setHighlightsBn((prev) => prev.filter((_, i) => i !== index));
    setHighlightsEn((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAutoTranslate = async (direction: 'en_to_bn' | 'bn_to_en') => {
    const isEnToBn = direction === 'en_to_bn';

    if (isEnToBn) {
      if (!customTitleEn && !customTaglineEn && !customDescriptionEn && highlightsEn.length === 0) {
        showWarning('Please enter English product details first to auto-translate to Bengali.');
        return;
      }
    } else {
      if (!customTitleBn && !customTaglineBn && !customDescriptionBn && highlightsBn.length === 0) {
        showWarning('Please enter Bengali product details first to auto-translate to English.');
        return;
      }
    }

    setTranslateLoading(true);
    setAiAction(direction);

    try {
      const sourceData = isEnToBn
        ? {
          sectionTitle: sectionTitleEn || 'World Map',
          sectionSubtitle: sectionSubtitleEn || '',
          badgeText: badgeTextEn || 'PREMIUM EXCLUSIVE',
          priceNote: priceNoteEn || '',
          title: customTitleEn || selectedProduct?.name || '',
          tagline: customTaglineEn || selectedProduct?.tagline || '',
          description: customDescriptionEn || selectedProduct?.shortDescription || '',
          highlights: highlightsEn,
          btnView: btnViewTextEn || 'View Full Details',
          btnBuy: btnBuyTextEn || 'Order Now',
        }
        : {
          sectionTitle: sectionTitleBn || 'ওয়ার্ল্ড ম্যাপ',
          sectionSubtitle: sectionSubtitleBn || '',
          badgeText: badgeTextBn || 'এক্সক্লুসিভ কালেকশন',
          priceNote: priceNoteBn || '',
          title: customTitleBn || selectedProduct?.name || '',
          tagline: customTaglineBn || selectedProduct?.tagline || '',
          description: customDescriptionBn || selectedProduct?.shortDescription || '',
          highlights: highlightsBn,
          btnView: btnViewTextBn || 'সম্পূর্ণ বিস্তারিত দেখুন',
          btnBuy: btnBuyTextBn || 'এখনই অর্ডার করুন',
        };

      const prompt = isEnToBn
        ? `You are an expert e-commerce copywriter. Translate the following English product showcase fields into elegant, captivating, natural Bengali (বাংলা):\n${JSON.stringify(
          sourceData
        )}\n\nReturn strictly a valid JSON object with the exact keys:
{
  "sectionTitle": "Bengali string",
  "sectionSubtitle": "Bengali string",
  "badgeText": "Bengali string",
  "priceNote": "Bengali string",
  "title": "Bengali string",
  "tagline": "Bengali string",
  "description": "Bengali string",
  "highlights": ["Bengali bullet 1", "Bengali bullet 2"],
  "btnView": "Bengali string",
  "btnBuy": "Bengali string"
}`
        : `You are an expert e-commerce copywriter. Translate the following Bengali (বাংলা) product showcase fields into high-converting, professional, elegant English:\n${JSON.stringify(
          sourceData
        )}\n\nReturn strictly a valid JSON object with the exact keys:
{
  "sectionTitle": "English string",
  "sectionSubtitle": "English string",
  "badgeText": "English string",
  "priceNote": "English string",
  "title": "English string",
  "tagline": "English string",
  "description": "English string",
  "highlights": ["English bullet 1", "English bullet 2"],
  "btnView": "English string",
  "btnBuy": "English string"
}`;

      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, temperature: 0.3 }),
      });

      let parsed: any = null;
      if (res && (res.sectionTitle || res.title || res.description || res.highlights)) {
        parsed = res;
      } else if (res?.text) {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      }

      if (parsed) {
        if (isEnToBn) {
          if (parsed.sectionTitle) setSectionTitleBn(parsed.sectionTitle);
          if (parsed.sectionSubtitle) setSectionSubtitleBn(parsed.sectionSubtitle);
          if (parsed.badgeText) setBadgeTextBn(parsed.badgeText);
          if (parsed.priceNote) setPriceNoteBn(parsed.priceNote);
          if (parsed.title) setCustomTitleBn(parsed.title);
          if (parsed.tagline) setCustomTaglineBn(parsed.tagline);
          if (parsed.description) setCustomDescriptionBn(parsed.description);
          if (parsed.btnView) setBtnViewTextBn(parsed.btnView);
          if (parsed.btnBuy) setBtnBuyTextBn(parsed.btnBuy);
          if (parsed.highlights && Array.isArray(parsed.highlights) && parsed.highlights.length > 0) {
            setHighlightsBn(parsed.highlights);
          }
          showSuccess('✨ All featured product copy translated to Bengali (বাংলা) successfully!');
        } else {
          if (parsed.sectionTitle) setSectionTitleEn(parsed.sectionTitle);
          if (parsed.sectionSubtitle) setSectionSubtitleEn(parsed.sectionSubtitle);
          if (parsed.badgeText) setBadgeTextEn(parsed.badgeText);
          if (parsed.priceNote) setPriceNoteEn(parsed.priceNote);
          if (parsed.title) setCustomTitleEn(parsed.title);
          if (parsed.tagline) setCustomTaglineEn(parsed.tagline);
          if (parsed.description) setCustomDescriptionEn(parsed.description);
          if (parsed.btnView) setBtnViewTextEn(parsed.btnView);
          if (parsed.btnBuy) setBtnBuyTextEn(parsed.btnBuy);
          if (parsed.highlights && Array.isArray(parsed.highlights) && parsed.highlights.length > 0) {
            setHighlightsEn(parsed.highlights);
          }
          showSuccess('✨ All featured product copy translated to English (EN) successfully!');
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        featured_product_id: selectedProductId,
        featured_product_slug: selectedProduct?.slug || '',
        featured_product_enabled: enabled ? 'true' : 'false',
        featured_product_image: customImage.trim() || selectedProduct?.images?.[0]?.imageUrl || '/images/product-main.jpg',

        featured_product_section_title: sectionTitleBn.trim() || sectionTitleEn.trim(),
        featured_product_section_title_bn: sectionTitleBn.trim(),
        featured_product_section_title_en: sectionTitleEn.trim(),

        featured_product_section_sub: sectionSubtitleBn.trim() || sectionSubtitleEn.trim(),
        featured_product_section_sub_bn: sectionSubtitleBn.trim(),
        featured_product_section_sub_en: sectionSubtitleEn.trim(),

        featured_product_badge: badgeTextBn.trim() || badgeTextEn.trim(),
        featured_product_badge_bn: badgeTextBn.trim(),
        featured_product_badge_en: badgeTextEn.trim(),

        featured_product_price_note: priceNoteBn.trim() || priceNoteEn.trim(),
        featured_product_price_note_bn: priceNoteBn.trim(),
        featured_product_price_note_en: priceNoteEn.trim(),

        featured_product_title: customTitleBn.trim() || customTitleEn.trim() || selectedProduct?.name || '',
        featured_product_title_bn: customTitleBn.trim(),
        featured_product_title_en: customTitleEn.trim(),

        featured_product_tagline: customTaglineBn.trim() || customTaglineEn.trim() || selectedProduct?.tagline || '',
        featured_product_tagline_bn: customTaglineBn.trim(),
        featured_product_tagline_en: customTaglineEn.trim(),

        featured_product_description: customDescriptionBn.trim() || customDescriptionEn.trim(),
        featured_product_description_bn: customDescriptionBn.trim(),
        featured_product_description_en: customDescriptionEn.trim(),

        featured_product_highlights: JSON.stringify(highlightsBn),
        featured_product_highlights_bn: JSON.stringify(highlightsBn),
        featured_product_highlights_en: JSON.stringify(highlightsEn),

        featured_product_btn_view: btnViewTextBn.trim() || btnViewTextEn.trim(),
        featured_product_btn_view_bn: btnViewTextBn.trim(),
        featured_product_btn_view_en: btnViewTextEn.trim(),

        featured_product_btn_buy: btnBuyTextBn.trim() || btnBuyTextEn.trim(),
        featured_product_btn_buy_bn: btnBuyTextBn.trim(),
        featured_product_btn_buy_en: btnBuyTextEn.trim(),
      };

      await fetchApi('/settings/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      showSuccess('Featured Exclusive Product configuration & translations saved!');
    } catch (err: any) {
      showError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <div className="w-6 h-6 border-2 border-[#c08a46] border-t-transparent rounded-full animate-spin" />
          <span>Loading Featured Product Showcase settings...</span>
        </div>
      </div>
    );
  }

  const displayImage = customImage || selectedProduct?.images?.[0]?.imageUrl || '/images/product-main.jpg';
  const defaultVar = selectedProduct?.variants?.find((v: any) => v.isDefault) || selectedProduct?.variants?.[0] || {};
  const price = Number(defaultVar.price || 4500);
  const origPrice = Number(defaultVar.originalPrice || defaultVar.original_price || 0);

  const prevTitle = previewLang === 'bn' ? (customTitleBn || selectedProduct?.name) : (customTitleEn || selectedProduct?.name);
  const prevTagline = previewLang === 'bn' ? (customTaglineBn || selectedProduct?.tagline) : (customTaglineEn || selectedProduct?.tagline);
  const prevDesc = previewLang === 'bn' ? (customDescriptionBn || selectedProduct?.shortDescription) : (customDescriptionEn || selectedProduct?.shortDescription);
  const prevBadge = previewLang === 'bn' ? badgeTextBn : badgeTextEn;
  const prevPriceNote = previewLang === 'bn' ? priceNoteBn : priceNoteEn;
  const prevHighlights = previewLang === 'bn' ? highlightsBn : highlightsEn;
  const prevBtnView = previewLang === 'bn' ? btnViewTextBn : btnViewTextEn;
  const prevBtnBuy = previewLang === 'bn' ? btnBuyTextBn : btnBuyTextEn;
  const prevSecTitle = previewLang === 'bn' ? sectionTitleBn : sectionTitleEn;
  const prevSecSubtitle = previewLang === 'bn' ? sectionSubtitleBn : sectionSubtitleEn;

  return (
    <div className="space-y-8 w-full pb-16">
      <FeaturedProductHeader onSave={handleSave} saving={saving} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="order-1 lg:order-1 lg:col-span-5 space-y-6">
          <FeaturedProductLangToolbar
            langMode={langMode}
            setLangMode={setLangMode}
            onAutoTranslate={handleAutoTranslate}
            translateLoading={translateLoading}
            aiAction={aiAction}
          />

          <FeaturedProductSelector
            enabled={enabled}
            setEnabled={setEnabled}
            products={products}
            selectedProductId={selectedProductId}
            onProductChange={handleProductChange}
            selectedProduct={selectedProduct}
            onResetFromProduct={handleResetFromProduct}
            langMode={langMode}
            sectionTitleBn={sectionTitleBn}
            setSectionTitleBn={setSectionTitleBn}
            sectionTitleEn={sectionTitleEn}
            setSectionTitleEn={setSectionTitleEn}
            sectionSubtitleBn={sectionSubtitleBn}
            setSectionSubtitleBn={setSectionSubtitleBn}
            sectionSubtitleEn={sectionSubtitleEn}
            setSectionSubtitleEn={setSectionSubtitleEn}
          />

          <FeaturedProductImagePicker
            selectedProduct={selectedProduct}
            customImage={customImage}
            setCustomImage={setCustomImage}
          />
        </div>

        <FeaturedProductPreview
          previewLang={previewLang}
          setPreviewLang={setPreviewLang}
          prevSecTitle={prevSecTitle}
          prevSecSubtitle={prevSecSubtitle}
          displayImage={displayImage}
          prevTitle={prevTitle}
          prevTagline={prevTagline}
          prevDesc={prevDesc}
          prevBadge={prevBadge}
          prevPriceNote={prevPriceNote}
          prevHighlights={prevHighlights}
          prevBtnView={prevBtnView}
          prevBtnBuy={prevBtnBuy}
          price={price}
          origPrice={origPrice}
          onSave={handleSave}
          saving={saving}
          selectedProduct={selectedProduct}
        />

        <div className="order-2 lg:order-3 lg:col-span-12">
          <FeaturedProductCustomizer
            langMode={langMode}
            onAutoTranslate={handleAutoTranslate}
            translateLoading={translateLoading}
            aiAction={aiAction}
            selectedProduct={selectedProduct}
            badgeTextBn={badgeTextBn}
            setBadgeTextBn={setBadgeTextBn}
            badgeTextEn={badgeTextEn}
            setBadgeTextEn={setBadgeTextEn}
            priceNoteBn={priceNoteBn}
            setPriceNoteBn={setPriceNoteBn}
            priceNoteEn={priceNoteEn}
            setPriceNoteEn={setPriceNoteEn}
            customTitleBn={customTitleBn}
            setCustomTitleBn={setCustomTitleBn}
            customTitleEn={customTitleEn}
            setCustomTitleEn={setCustomTitleEn}
            customTaglineBn={customTaglineBn}
            setCustomTaglineBn={setCustomTaglineBn}
            customTaglineEn={customTaglineEn}
            setCustomTaglineEn={setCustomTaglineEn}
            customDescriptionBn={customDescriptionBn}
            setCustomDescriptionBn={setCustomDescriptionBn}
            customDescriptionEn={customDescriptionEn}
            setCustomDescriptionEn={setCustomDescriptionEn}
            highlightsBn={highlightsBn}
            highlightsEn={highlightsEn}
            onRemoveHighlight={handleRemoveHighlight}
            newHlBn={newHlBn}
            setNewHlBn={setNewHlBn}
            newHlEn={newHlEn}
            setNewHlEn={setNewHlEn}
            onAddHighlight={handleAddHighlight}
            btnViewTextBn={btnViewTextBn}
            setBtnViewTextBn={setBtnViewTextBn}
            btnViewTextEn={btnViewTextEn}
            setBtnViewTextEn={setBtnViewTextEn}
            btnBuyTextBn={btnBuyTextBn}
            setBtnBuyTextBn={setBtnBuyTextBn}
            btnBuyTextEn={btnBuyTextEn}
            setBtnBuyTextEn={setBtnBuyTextEn}
          />
        </div>
      </div>
    </div>
  );
}
