'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAdminPrefix } from '@/lib/useAdminPrefix';
import { useAdminModal } from '@/lib/AdminModalContext';

import ProductEditHeader from './ProductEditHeader';
import ProductEditContentSection from './ProductEditContentSection';
import ProductEditHighlightsSection from './ProductEditHighlightsSection';
import ProductEditColorsSection from './ProductEditColorsSection';
import ProductEditVariantsSection from './ProductEditVariantsSection';
import ProductEditMediaSection from './ProductEditMediaSection';
import {
  DEFAULT_WARNING_EN,
  DEFAULT_WARNING_BN,
  DEFAULT_FALLBACK_HIGHLIGHTS,
} from '@/lib/productDefaults';

const DEFAULT_COLOR_PRESETS = [
  { name: 'Natural Oak & Walnut', hex: '#8E5A35', priceAdjustment: 0 },
  { name: 'Dark Oak Relief', hex: '#241810', priceAdjustment: 0 },
  { name: 'Terra Multi-Layer', hex: '#D4A373', priceAdjustment: 0 },
  { name: 'Light Birch & Gold', hex: '#E9D5A1', priceAdjustment: 300 },
  { name: 'Monochrome Silver-Grey', hex: '#4A5568', priceAdjustment: 500 },
];

const SIZE_PRESETS = [
  { sizeName: '4 Feet (Compact)', dimensions: '4 x 2.5 ft (120 x 75 cm)', price: 4500, originalPrice: 5500 },
  { sizeName: '5 Feet (Standard)', dimensions: '5 x 3.1 ft (150 x 95 cm)', price: 6200, originalPrice: 7500 },
  { sizeName: '6 Feet (Grand)', dimensions: '6 x 3.8 ft (180 x 115 cm)', price: 7500, originalPrice: 9200 },
  { sizeName: '8 Feet (Luxury Massive)', dimensions: '8 x 5.0 ft (240 x 150 cm)', price: 12500, originalPrice: 15000 },
];

const generateSlug = (val: string): string => {
  return (val || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const JSON_MATCH_REGEX = /\{[\s\S]*\}/;

export default function Wrapper() {
  const prefix = useAdminPrefix();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const { showSuccess, showError, showWarning } = useAdminModal();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colorPresets, setColorPresets] = useState<any[]>(DEFAULT_COLOR_PRESETS);
  const [aiLoading, setAiLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [aiAction, setAiAction] = useState<'en_to_bn' | 'bn_to_en' | null>(null);
  const [contentLangMode, setContentLangMode] = useState<'both' | 'en' | 'bn'>('en');
  const [featuresLangMode, setFeaturesLangMode] = useState<'both' | 'en' | 'bn'>('en');

  // Core Fields (English)
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [tagline, setTagline] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [warningText, setWarningText] = useState('');
  const [status, setStatus] = useState('active');

  // Bengali Translations (বাংলা)
  const [nameBn, setNameBn] = useState('');
  const [taglineBn, setTaglineBn] = useState('');
  const [shortDescriptionBn, setShortDescriptionBn] = useState('');
  const [fullDescriptionBn, setFullDescriptionBn] = useState('');
  const [warningTextBn, setWarningTextBn] = useState('');

  // Default Settings State (for resets & comparison)
  const [defaultWarningEn, setDefaultWarningEn] = useState(DEFAULT_WARNING_EN);
  const [defaultWarningBn, setDefaultWarningBn] = useState(DEFAULT_WARNING_BN);
  const [defaultHighlights, setDefaultHighlights] = useState<any[]>(DEFAULT_FALLBACK_HIGHLIGHTS);

  // Option Toggles
  const [hasSizeVariants, setHasSizeVariants] = useState(true);
  const [hasColorVariants, setHasColorVariants] = useState(true);
  const [isExclusive, setIsExclusive] = useState(false);

  // Colors
  const [colors, setColors] = useState<any[]>([]);

  // New Color Form
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8E5A35');
  const [newColorAdjustment, setNewColorAdjustment] = useState(0);
  const [colorPresetHint, setColorPresetHint] = useState<string>('');

  // Variants
  const [variants, setVariants] = useState<any[]>([]);

  // Gallery Images
  const [images, setImages] = useState<any[]>([]);

  // Features (with bilingual title and description)
  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    Promise.all([
      fetchApi('/categories').catch(() => []),
      fetchApi('/settings/public').catch(() => null),
      fetchApi(`/products/${productId}`),
      fetchApi('/translations/admin/list').catch(() => []),
    ])
      .then(([cats, settings, p, allTranslations]) => {
        if (cats && Array.isArray(cats)) {
          setCategories(cats);
        }

        if (settings?.default_product_colors) {
          try {
            const parsed = JSON.parse(settings.default_product_colors);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setColorPresets(parsed);
            }
          } catch (e) {}
        }

        const loadedWarningEn = settings?.default_craftsmanship_notice || DEFAULT_WARNING_EN;
        const loadedWarningBn = settings?.default_craftsmanship_notice_bn || DEFAULT_WARNING_BN;
        setDefaultWarningEn(loadedWarningEn);
        setDefaultWarningBn(loadedWarningBn);

        let loadedHighlights = DEFAULT_FALLBACK_HIGHLIGHTS;
        if (settings?.default_product_highlights) {
          try {
            const parsed = JSON.parse(settings.default_product_highlights);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedHighlights = parsed;
            }
          } catch (e) {}
        }
        setDefaultHighlights(loadedHighlights);

        if (p) {
          setName(p.name || '');
          setSlug(p.slug || '');
          setCategoryId(p.categoryId || '');
          setTagline(p.tagline || '');
          setShortDescription(p.shortDescription || '');
          setFullDescription(p.fullDescription || '');
          // If product warningText is empty, pre-fill with settings default
          setWarningText(p.warningText || loadedWarningEn);
          setStatus(p.status || 'active');
          setHasSizeVariants(p.hasSizeVariants ?? true);
          setHasColorVariants(p.hasColorVariants ?? (p.colors && p.colors.length > 0));
          setIsExclusive(!!p.isExclusive);
          setColors(
            p.colors && p.colors.length > 0
              ? p.colors.map((c: any) => ({
                  id: c.id,
                  name: c.name || '',
                  colourHex: c.colourHex || '#8E5A35',
                  priceAdjustment: Number(c.priceAdjustment) || 0,
                }))
              : [
                  { name: 'Natural Oak & Walnut', colourHex: '#8E5A35', priceAdjustment: 0 },
                  { name: 'Dark Oak Relief', colourHex: '#241810', priceAdjustment: 0 },
                  { name: 'Terra Multi-Layer', colourHex: '#D4A373', priceAdjustment: 0 },
                ]
          );
          setVariants(
            p.variants?.map((v: any) => {
              let avColors: string[] = [];
              if (v.colour) {
                try {
                  const parsed = JSON.parse(v.colour);
                  if (Array.isArray(parsed)) avColors = parsed;
                } catch {
                  avColors = String(v.colour).split(',').map((s: string) => s.trim()).filter(Boolean);
                }
              }
              if (avColors.length === 0 && p.colors?.length > 0) {
                avColors = p.colors.map((c: any) => c.name);
              }
              return {
                id: v.id,
                sizeName: v.sizeName || '',
                dimensions: v.dimensions || '',
                colour: v.colour || '',
                colourHex: v.colourHex || '#8E5A35',
                availableColors: avColors,
                price: v.price || 0,
                originalPrice: v.originalPrice || '',
                stockStatus: v.stockStatus || 'in_stock',
                isDefault: !!v.isDefault,
                sortOrder: v.sortOrder || 1,
              };
            }) || []
          );
          setImages(
            p.images?.map((img: any) => ({
              id: img.id,
              imageUrl: img.imageUrl || '',
              title: img.title || '',
              altText: img.altText || '',
              isPrimary: !!img.isPrimary,
              sortOrder: img.sortOrder || 1,
            })) || []
          );

          // Populate features and their translations, fallback to settings default highlights if empty
          if (Array.isArray(p.features) && p.features.length > 0) {
            setFeatures(
              p.features.map((f: any, idx: number) => ({
                id: f.id,
                title: f.title || '',
                titleBn: Array.isArray(allTranslations)
                  ? allTranslations.find((t: any) => t.key === `product.${p.slug}.feature.${idx}.title`)?.bn || ''
                  : '',
                description: f.description || '',
                descriptionBn: Array.isArray(allTranslations)
                  ? allTranslations.find((t: any) => t.key === `product.${p.slug}.feature.${idx}.desc`)?.bn || ''
                  : '',
                icon: f.icon || 'feather',
                sortOrder: f.sortOrder || idx + 1,
              }))
            );
          } else {
            setFeatures(loadedHighlights);
          }

          // Populate core translations if present
          if (Array.isArray(allTranslations) && p.slug) {
            const findTr = (keySuffix: string) =>
              allTranslations.find((t: any) => t.key === `product.${p.slug}.${keySuffix}`)?.bn || '';
            setNameBn(findTr('name'));
            setTaglineBn(findTr('tagline'));
            setShortDescriptionBn(findTr('short_desc'));
            setFullDescriptionBn(findTr('full_desc'));
            const savedWarningBn = findTr('warning');
            setWarningTextBn(savedWarningBn || (p.warningText ? '' : loadedWarningBn));
          } else if (!p.warningText) {
            setWarningTextBn(loadedWarningBn);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        showError('Failed to load product: ' + err.message);
        setLoading(false);
      });
  }, [productId, showError]);

  const handleAiProofread = useCallback(async () => {
    if (!name.trim() && !nameBn.trim() && !fullDescription.trim() && !fullDescriptionBn.trim()) {
      showWarning('Please provide at least an English or Bengali Product Name/Description before proofreading.');
      return;
    }
    setAiLoading(true);
    try {
      const featureList = features.map((f) => ({
        title: f.title || '',
        titleBn: f.titleBn || '',
        description: f.description || '',
        descriptionBn: f.descriptionBn || '',
      }));

      const payload = {
        name,
        nameBn,
        tagline,
        taglineBn,
        shortDescription,
        shortDescriptionBn,
        fullDescription,
        fullDescriptionBn,
        warningText: warningText || 'Please Note: Handcrafted from 100% natural wood. Grain patterns, organic knots, and stain tones may vary slightly from photos. Avoid direct water contact and high humidity.',
        warningTextBn: warningTextBn || 'বিশেষ দ্রষ্টব্য: ১০০% প্রাকৃতিক কাঠে হস্তনির্মিত হওয়ায় কাঠের আঁশ, টেক্সচার ও রঙের শেড ছবির তুলনায় সামান্য ভিন্ন হতে পারে। সরাসরি পানি ও অতিরিক্ত আর্দ্রতা থেকে দূরে রাখুন।',
        features: featureList,
      };

      const systemInstruction = `You are an elite master copy editor and bilingual proofreader specialized in luxury handcrafted wooden home/office decor.
Your mission is to perform dual simultaneous AI proofreading, grammar & spelling correction, vocabulary enhancement, and luxury tone refinement for BOTH English and Bengali (বাংলা) copy.

Rules:
1. Fix all typos, grammatical mistakes, awkward phrasing, and punctuation in BOTH English and Bengali text.
2. Elevate the tone to be sophisticated, prestigious, evocative, and commercially compelling.
3. If Bengali fields are provided, refine them to sound poetic and natural in native Bengali. If empty, generate faithful, eloquent Bengali translations.
4. In 'fullDescription' and 'fullDescriptionBn', preserve and properly structure valid HTML tags (<p>, <strong>, <em>, <ul>, <li>, <h3>, etc.).
5. For the 'features' array, proofread all items (title, titleBn, description, descriptionBn).
6. Always return strictly valid JSON matching this schema:
{
  "name": "...",
  "nameBn": "...",
  "tagline": "...",
  "taglineBn": "...",
  "shortDescription": "...",
  "shortDescriptionBn": "...",
  "fullDescription": "...",
  "fullDescriptionBn": "...",
  "warningText": "...",
  "warningTextBn": "...",
  "features": [
    { "title": "...", "titleBn": "...", "description": "...", "descriptionBn": "..." }
  ]
}`;

      const prompt = `Simultaneously proofread, polish, and harmonize the following product content in English and Bengali:\n${JSON.stringify(
        payload,
        null,
        2
      )}`;

      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          temperature: 0.3,
        }),
      });

      let parsed: any = null;
      if (res && res.name) {
        parsed = res;
      } else if (res && res.text) {
        const jsonMatch = res.text.match(JSON_MATCH_REGEX);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {}
        }
      }

      if (parsed) {
        if (parsed.name) setName(parsed.name);
        if (parsed.nameBn) setNameBn(parsed.nameBn);
        if (parsed.tagline) setTagline(parsed.tagline);
        if (parsed.taglineBn) setTaglineBn(parsed.taglineBn);
        if (parsed.shortDescription) setShortDescription(parsed.shortDescription);
        if (parsed.shortDescriptionBn) setShortDescriptionBn(parsed.shortDescriptionBn);
        if (parsed.fullDescription) setFullDescription(parsed.fullDescription);
        if (parsed.fullDescriptionBn) setFullDescriptionBn(parsed.fullDescriptionBn);
        if (parsed.warningText) setWarningText(parsed.warningText);
        if (parsed.warningTextBn) setWarningTextBn(parsed.warningTextBn);

        if (Array.isArray(parsed.features) && parsed.features.length > 0) {
          setFeatures(
            parsed.features.map((f: any, idx: number) => ({
              id: features[idx]?.id || String(idx + 1),
              title: f.title || features[idx]?.title || '',
              titleBn: f.titleBn || features[idx]?.titleBn || f.title || '',
              description: f.description || features[idx]?.description || '',
              descriptionBn: f.descriptionBn || features[idx]?.descriptionBn || f.description || '',
            }))
          );
        }

        showSuccess('✨ Bilingual AI Proofreading Complete! Both English and Bengali content polished & harmonized.');
      } else {
        showError('Could not parse proofreading response. Please check your content.');
      }
    } catch (err: any) {
      showError(err.message || 'Proofreading failed');
    } finally {
      setAiLoading(false);
    }
  }, [
    name,
    nameBn,
    tagline,
    taglineBn,
    shortDescription,
    shortDescriptionBn,
    fullDescription,
    fullDescriptionBn,
    warningText,
    warningTextBn,
    features,
    showWarning,
    showSuccess,
    showError,
  ]);

  const handleAutoTranslateAll = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en' = 'en_to_bn') => {
      const isEnToBn = direction === 'en_to_bn';
      if (isEnToBn) {
        if (!name && !tagline && !shortDescription && !fullDescription && features.length === 0) {
          showWarning('Please enter English product details first to auto-translate.');
          return;
        }
      } else {
        if (!nameBn && !taglineBn && !shortDescriptionBn && !fullDescriptionBn && features.length === 0) {
          showWarning('অনুগ্রহ করে প্রথমে বাংলা পণ্যের তথ্য প্রদান করুন।');
          return;
        }
      }

      setTranslateLoading(true);
      setAiAction(direction);
      try {
        const featureList = features.map((f) => ({
          title: isEnToBn ? f.title : f.titleBn,
          description: isEnToBn ? f.description : f.descriptionBn,
        }));
        const payload = isEnToBn
          ? {
              name,
              tagline,
              shortDescription,
              fullDescription,
              warningText: warningText || 'Please Note: Handcrafted from 100% natural wood. Grain patterns, organic knots, and stain tones may vary slightly from photos. Avoid direct water contact and high humidity.',
              features: featureList,
            }
          : {
              nameBn,
              taglineBn,
              shortDescriptionBn,
              fullDescriptionBn,
              warningTextBn: warningTextBn || 'বিশেষ দ্রষ্টব্য: ১০০% প্রাকৃতিক কাঠে হস্তনির্মিত হওয়ায় কাঠের আঁশ, টেক্সচার ও রঙের শেড ছবির তুলনায় সামান্য ভিন্ন হতে পারে। সরাসরি পানি ও অতিরিক্ত আর্দ্রতা থেকে দূরে রাখুন।',
              features: featureList,
            };

        const prompt = isEnToBn
          ? `Translate the following English product fields into fluent, natural Bengali (বাংলা) for an upscale handcrafted wooden decor brand:\n${JSON.stringify(
              payload
            )}\n\nReturn strictly valid JSON with keys: nameBn, taglineBn, shortDescriptionBn, fullDescriptionBn, warningTextBn, and features (an array of objects with titleBn and descriptionBn).`
          : `Translate the following Bengali (বাংলা) product fields into polished, high-converting English for an upscale handcrafted wooden decor brand:\n${JSON.stringify(
              payload
            )}\n\nReturn strictly valid JSON with keys: name, tagline, shortDescription, fullDescription, warningText, and features (an array of objects with title and description).`;

        const res = await fetchApi('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, temperature: 0.3 }),
        });

        let parsed: any = null;
        if (
          res &&
          (res.name ||
            res.nameBn ||
            res.tagline ||
            res.taglineBn ||
            res.shortDescription ||
            res.shortDescriptionBn ||
            res.fullDescription ||
            res.fullDescriptionBn ||
            res.features)
        ) {
          parsed = res;
        } else if (res?.text) {
          const jsonMatch = res.text.match(JSON_MATCH_REGEX);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        }

        if (parsed) {
          if (isEnToBn) {
            if (parsed.nameBn) setNameBn(parsed.nameBn);
            if (parsed.taglineBn) setTaglineBn(parsed.taglineBn);
            if (parsed.shortDescriptionBn) setShortDescriptionBn(parsed.shortDescriptionBn);
            if (parsed.fullDescriptionBn) setFullDescriptionBn(parsed.fullDescriptionBn);
            if (parsed.warningTextBn) setWarningTextBn(parsed.warningTextBn);

            if (parsed.features && Array.isArray(parsed.features)) {
              setFeatures((prev) =>
                prev.map((f, i) => ({
                  ...f,
                  titleBn: parsed.features[i]?.titleBn || f.titleBn || f.title,
                  descriptionBn: parsed.features[i]?.descriptionBn || f.descriptionBn || f.description,
                }))
              );
            }

            showSuccess('All product fields & feature highlights translated to Bengali (বাংলা) successfully!');
          } else {
            if (parsed.name) {
              setName(parsed.name);
              if (!slug || slug === generateSlug(name)) {
                setSlug(generateSlug(parsed.name));
              }
            }
            if (parsed.tagline) setTagline(parsed.tagline);
            if (parsed.shortDescription) setShortDescription(parsed.shortDescription);
            if (parsed.fullDescription) setFullDescription(parsed.fullDescription);
            if (parsed.warningText) setWarningText(parsed.warningText);

            if (parsed.features && Array.isArray(parsed.features)) {
              setFeatures((prev) =>
                prev.map((f, i) => ({
                  ...f,
                  title: parsed.features[i]?.title || f.title || f.titleBn,
                  description: parsed.features[i]?.description || f.description || f.descriptionBn,
                }))
              );
            }

            showSuccess('All product fields & feature highlights translated to English (EN) successfully!');
          }
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed');
      } finally {
        setTranslateLoading(false);
        setAiAction(null);
      }
    },
    [
      name,
      nameBn,
      tagline,
      taglineBn,
      shortDescription,
      shortDescriptionBn,
      fullDescription,
      fullDescriptionBn,
      warningText,
      warningTextBn,
      features,
      slug,
      showWarning,
      showSuccess,
      showError,
    ]
  );

  // Color Actions
  const handleAddNewColor = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!newColorName.trim()) {
        showWarning('Please enter a color / stain name.');
        return;
      }
      if (colors.some((c) => c.name.toLowerCase() === newColorName.trim().toLowerCase())) {
        showWarning('This color is already in the list.');
        return;
      }
      setColors((prev) => [
        ...prev,
        {
          name: newColorName.trim(),
          colourHex: newColorHex,
          priceAdjustment: Number(newColorAdjustment) || 0,
        },
      ]);
      setNewColorName('');
      setNewColorAdjustment(0);
      setColorPresetHint('');
    },
    [newColorName, newColorHex, newColorAdjustment, colors, showWarning]
  );

  const handleAddDefaultPresetColor = useCallback((preset: (typeof DEFAULT_COLOR_PRESETS)[0]) => {
    setNewColorName(preset.name);
    setNewColorHex(preset.hex);
    setNewColorAdjustment(preset.priceAdjustment ?? 0);
    setColorPresetHint(`✨ Loaded "${preset.name}". Set the extra price (৳) if needed, then click "Add" to save.`);
  }, []);

  const handleRemoveColor = useCallback((index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddPresetSize = useCallback(
    (preset: (typeof SIZE_PRESETS)[0]) => {
      setVariants((prev) => [
        ...prev,
        {
          sizeName: preset.sizeName,
          dimensions: preset.dimensions,
          availableColors: colors.map((c) => c.name),
          colour: colors[0]?.name || 'Natural Oak & Walnut',
          colourHex: colors[0]?.colourHex || '#8E5A35',
          price: preset.price,
          originalPrice: preset.originalPrice,
          stockStatus: 'in_stock',
          isDefault: prev.length === 0,
          sortOrder: prev.length + 1,
        },
      ]);
    },
    [colors]
  );

  const handleAddCustomVariant = useCallback(() => {
    setVariants((prev) => [
      ...prev,
      {
        sizeName: 'Custom Size',
        dimensions: 'Custom Dimensions',
        availableColors: colors.map((c) => c.name),
        colour: colors[0]?.name || 'Natural Oak & Walnut',
        colourHex: colors[0]?.colourHex || '#8E5A35',
        price: 5000,
        originalPrice: 6500,
        stockStatus: 'in_stock',
        isDefault: prev.length === 0,
        sortOrder: prev.length + 1,
      },
    ]);
  }, [colors]);

  const handleRemoveVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddImage = useCallback(() => {
    setImages((prev) => [
      ...prev,
      {
        imageUrl: '/images/product-main.jpg',
        title: name ? `${name} Photo ${prev.length + 1}` : 'Product Photo',
        altText: name || '3D Wooden Map',
        isPrimary: prev.length === 0,
        sortOrder: prev.length + 1,
      },
    ]);
  }, [name]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleResetWarningToDefault = useCallback(() => {
    setWarningText(defaultWarningEn);
    setWarningTextBn(defaultWarningBn);
  }, [defaultWarningEn, defaultWarningBn]);

  const handleResetHighlightsToDefault = useCallback(() => {
    setFeatures(defaultHighlights);
  }, [defaultHighlights]);

  const isDefaultHighlights = React.useMemo(() => {
    if (!Array.isArray(features) || !Array.isArray(defaultHighlights)) return false;
    if (features.length !== defaultHighlights.length) return false;
    return features.every((f, i) => {
      const d = defaultHighlights[i];
      return (
        (f.title || '').trim() === (d.title || '').trim() &&
        (f.titleBn || '').trim() === (d.titleBn || '').trim() &&
        (f.description || '').trim() === (d.description || '').trim() &&
        (f.descriptionBn || '').trim() === (d.descriptionBn || '').trim() &&
        (f.icon || 'feather') === (d.icon || 'feather')
      );
    });
  }, [features, defaultHighlights]);

  const handleAddFeature = useCallback(() => {
    setFeatures((prev) => [
      ...prev,
      {
        title: 'New Feature Highlight',
        titleBn: 'নতুন ফিচার হাইলাইট',
        description: 'Detail specification about this handcrafted feature.',
        descriptionBn: 'এই কাঠের মানচিত্রের বিস্তারিত বৈশিষ্ট্য ও বিশেষত্ব।',
        icon: 'sparkles',
        sortOrder: prev.length + 1,
      },
    ]);
  }, []);

  const handleRemoveFeature = useCallback((index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !slug.trim()) {
        showWarning('Product Name and Slug are required before saving.');
        return;
      }

      setSaving(true);
      try {
        const payload = {
          name: name.trim(),
          slug: slug.trim(),
          categoryId: categoryId ? Number(categoryId) : undefined,
          tagline: tagline.trim(),
          shortDescription: shortDescription.trim(),
          fullDescription: fullDescription.trim(),
          warningText: warningText.trim(),
          hasSizeVariants,
          hasColorVariants,
          isExclusive,
          status,
          colors: hasColorVariants ? colors : [],
          variants: variants.map((v) => {
            const av =
              v.availableColors !== undefined
                ? v.availableColors
                : v.colour
                ? [v.colour]
                : colors.length > 0
                ? colors.map((c) => c.name)
                : [];
            return {
              id: v.id,
              sizeName: v.sizeName,
              dimensions: v.dimensions,
              colour: JSON.stringify(av),
              colourHex: colors.find((c) => av.includes(c.name))?.colourHex || '#8E5A35',
              price: Number(v.price),
              originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
              stockStatus: v.stockStatus,
              isDefault: !!v.isDefault,
              sortOrder: v.sortOrder || 1,
            };
          }),
          images: images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            title: img.title,
            altText: img.altText,
            isPrimary: !!img.isPrimary,
            sortOrder: img.sortOrder || 1,
          })),
          features: features.map((f, idx) => ({
            id: f.id,
            title: f.title,
            description: f.description,
            icon: f.icon,
            sortOrder: f.sortOrder || idx + 1,
          })),
        };

        await fetchApi(`/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // Upsert bilingual translations for core fields
        const translationItems: Array<{
          key: string;
          en: string;
          bn: string;
          category: string;
          description: string;
        }> = [
          {
            key: `product.${slug}.name`,
            en: name.trim(),
            bn: nameBn.trim() || name.trim(),
            category: 'products',
            description: `${name} Title`,
          },
          {
            key: `product.${slug}.tagline`,
            en: tagline.trim(),
            bn: taglineBn.trim() || tagline.trim(),
            category: 'products',
            description: `${name} Tagline`,
          },
          {
            key: `product.${slug}.short_desc`,
            en: shortDescription.trim(),
            bn: shortDescriptionBn.trim() || shortDescription.trim(),
            category: 'products',
            description: `${name} Short Desc`,
          },
          {
            key: `product.${slug}.full_desc`,
            en: fullDescription.trim(),
            bn: fullDescriptionBn.trim() || fullDescription.trim(),
            category: 'products',
            description: `${name} Full Desc`,
          },
          {
            key: `product.${slug}.warning`,
            en: warningText.trim(),
            bn: warningTextBn.trim() || warningText.trim(),
            category: 'products',
            description: `${name} Warning Note`,
          },
        ];

        // Add feature translations
        features.forEach((f, idx) => {
          if (f.title || f.titleBn) {
            translationItems.push({
              key: `product.${slug}.feature.${idx}.title`,
              en: (f.title || '').trim(),
              bn: (f.titleBn || f.title || '').trim(),
              category: 'products',
              description: `${name} Highlight #${idx + 1} Title`,
            });
          }
          if (f.description || f.descriptionBn) {
            translationItems.push({
              key: `product.${slug}.feature.${idx}.desc`,
              en: (f.description || '').trim(),
              bn: (f.descriptionBn || f.description || '').trim(),
              category: 'products',
              description: `${name} Highlight #${idx + 1} Desc`,
            });
          }
        });

        const validTranslations = translationItems.filter((item) => item.en || item.bn);
        if (validTranslations.length > 0) {
          await fetchApi('/translations/admin/upsert-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: validTranslations }),
          }).catch(() => {});
        }

        await showSuccess('Product and bilingual translations updated successfully!');
        router.push(`${prefix}/products`);
      } catch (err: any) {
        showError(err.message || 'Failed to update product');
      } finally {
        setSaving(false);
      }
    },
    [
      name,
      slug,
      categoryId,
      tagline,
      shortDescription,
      fullDescription,
      warningText,
      hasSizeVariants,
      hasColorVariants,
      isExclusive,
      status,
      colors,
      variants,
      images,
      features,
      productId,
      nameBn,
      taglineBn,
      shortDescriptionBn,
      fullDescriptionBn,
      warningTextBn,
      showWarning,
      showError,
      showSuccess,
      router,
      prefix,
    ]
  );

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-[#c08a46] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold">Loading product specifications...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full pb-16">
      <ProductEditHeader
        prefix={prefix}
        productId={productId}
        slug={slug}
        translateLoading={translateLoading}
        aiAction={aiAction}
        aiLoading={aiLoading}
        saving={saving}
        onAutoTranslateAll={handleAutoTranslateAll}
        onAiProofread={handleAiProofread}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 Cols): Content & Bilingual Translations */}
        <div className="lg:col-span-6 space-y-6">
          <ProductEditContentSection
            contentLangMode={contentLangMode}
            setContentLangMode={setContentLangMode}
            hasSizeVariants={hasSizeVariants}
            setHasSizeVariants={setHasSizeVariants}
            hasColorVariants={hasColorVariants}
            setHasColorVariants={setHasColorVariants}
            isExclusive={isExclusive}
            setIsExclusive={setIsExclusive}
            slug={slug}
            setSlug={setSlug}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
            status={status}
            setStatus={setStatus}
            name={name}
            setName={setName}
            nameBn={nameBn}
            setNameBn={setNameBn}
            tagline={tagline}
            setTagline={setTagline}
            taglineBn={taglineBn}
            setTaglineBn={setTaglineBn}
            shortDescription={shortDescription}
            setShortDescription={setShortDescription}
            shortDescriptionBn={shortDescriptionBn}
            setShortDescriptionBn={setShortDescriptionBn}
            fullDescription={fullDescription}
            setFullDescription={setFullDescription}
            fullDescriptionBn={fullDescriptionBn}
            setFullDescriptionBn={setFullDescriptionBn}
            warningText={warningText}
            setWarningText={setWarningText}
            warningTextBn={warningTextBn}
            setWarningTextBn={setWarningTextBn}
            defaultWarningEn={defaultWarningEn}
            defaultWarningBn={defaultWarningBn}
            onResetWarningToDefault={handleResetWarningToDefault}
          />

          <ProductEditHighlightsSection
            features={features}
            setFeatures={setFeatures}
            featuresLangMode={featuresLangMode}
            setFeaturesLangMode={setFeaturesLangMode}
            onAddFeature={handleAddFeature}
            onRemoveFeature={handleRemoveFeature}
            isDefaultHighlights={isDefaultHighlights}
            onResetToDefaultHighlights={handleResetHighlightsToDefault}
          />
        </div>

        {/* Right Column (6 Cols): Colors, Variants, Gallery */}
        <div className="lg:col-span-6 space-y-6">
          <ProductEditColorsSection
            hasColorVariants={hasColorVariants}
            colorPresets={colorPresets}
            colors={colors}
            newColorName={newColorName}
            setNewColorName={setNewColorName}
            newColorHex={newColorHex}
            setNewColorHex={setNewColorHex}
            newColorAdjustment={newColorAdjustment}
            setNewColorAdjustment={setNewColorAdjustment}
            colorPresetHint={colorPresetHint}
            setColorPresetHint={setColorPresetHint}
            onAddDefaultPresetColor={handleAddDefaultPresetColor}
            onAddNewColor={handleAddNewColor}
            onRemoveColor={handleRemoveColor}
          />

          <ProductEditVariantsSection
            variants={variants}
            setVariants={setVariants}
            colors={colors}
            hasColorVariants={hasColorVariants}
            sizePresets={SIZE_PRESETS}
            onAddCustomVariant={handleAddCustomVariant}
            onAddPresetSize={handleAddPresetSize}
            onRemoveVariant={handleRemoveVariant}
          />

          <ProductEditMediaSection
            name={name}
            images={images}
            setImages={setImages}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
          />
        </div>
      </div>
    </form>
  );
}
