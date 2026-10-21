'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Ruler,
  Palette,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye,
  Type,
  X,
  Send,
  Phone,
  Layers,
  Sparkle,
  Languages,
  Wand2,
  Loader2,
  Bot,
} from 'lucide-react';
import { useAdminModal } from '@/lib/AdminModalContext';
import { fetchApi } from '@/lib/api';

export interface MapSizeOption {
  id: string;
  labelEn: string;
  labelBn: string;
}

export interface MapColorOption {
  id: string;
  nameEn: string;
  nameBn: string;
  hex: string;
}

export interface MapAddonOption {
  id: string;
  labelEn: string;
  labelBn: string;
}

export const DEFAULT_MAP_SIZES: MapSizeOption[] = [
  { id: 'M', labelEn: 'M — 100 × 60 cm (39 × 24 in)', labelBn: 'M — ১০০ × ৬০ সেমি (৩৯ × ২৪ ইঞ্চি)' },
  { id: 'L', labelEn: 'L — 150 × 90 cm (59 × 35 in)', labelBn: 'L — ১৫০ × ৯০ সেমি (৫৯ × ৩৫ ইঞ্চি)' },
  { id: 'XL', labelEn: 'XL — 200 × 120 cm (79 × 47 in)', labelBn: 'XL — ২০০ × ১২০ সেমি (৭৯ × ৪৭ ইঞ্চি)' },
  { id: 'custom', labelEn: 'Custom Dimensions (Tailored to Wall)', labelBn: 'কাস্টম সাইজ (দেয়ালের পরিমাপ অনুযায়ী)' },
];

export const DEFAULT_MAP_COLORS: MapColorOption[] = [
  { id: 'natural-multi', nameEn: 'Natural Multi-Color Classic', nameBn: 'মাল্টি-কালার ক্লাসিক (Multi-Color)', hex: '#8E5A35' },
  { id: 'dark-walnut', nameEn: 'Dark Walnut Stain', nameBn: 'ডার্ক ওয়ালনাট (Dark Walnut)', hex: '#3D271D' },
  { id: 'smoked-oak', nameEn: 'Smoked Oak Tone', nameBn: 'স্মোকড ওক (Smoked Oak)', hex: '#5C4033' },
  { id: 'terra-tone', nameEn: 'Terra Warm Brown', nameBn: 'টেরা স্পেশাল (Terra Tone)', hex: '#A0522D' },
  { id: 'custom-mix', nameEn: 'Custom Color Blend', nameBn: 'অন্যান্য কাস্টম কম্বিনেশন', hex: '#2B2B2B' },
];

export const DEFAULT_MAP_ADDONS: MapAddonOption[] = [
  { id: 'led', labelEn: 'Ambient LED Backlight', labelBn: 'অ্যাম্বিয়েন্ট LED ব্যাকলাইটিং' },
  { id: 'pins', labelEn: 'Metal Pins & Planes Set', labelBn: 'মেটাল কান্ট্রি ও প্লেন পিনস' },
  { id: 'engraving', labelEn: 'Custom Name / Logo Engraving', labelBn: 'পারিবারিক নাম বা লোগো খোদাই' },
  { id: 'islands', labelEn: 'Extra Island Pack', labelBn: 'অতিরিক্ত দ্বীপপুঞ্জ সেট (Extra Islands)' },
];

interface CustomMapSettingsSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export const CustomMapSettingsSection = React.memo(function CustomMapSettingsSection({
  settings,
  handleChange,
}: CustomMapSettingsSectionProps) {
  const { showSuccess, showWarning, showError, showConfirm } = useAdminModal();

  // Active sub-tab inside editing column
  const [activeSubTab, setActiveSubTab] = useState<'sizes' | 'colors' | 'addons' | 'headings'>('sizes');
  const [previewLang, setPreviewLang] = useState<'bn' | 'en'>('bn');

  // Translation States
  const [globalTranslateLoading, setGlobalTranslateLoading] = useState(false);
  const [globalAiAction, setGlobalAiAction] = useState<'en_to_bn' | 'bn_to_en' | null>(null);
  const [subTabTranslateLoading, setSubTabTranslateLoading] = useState<string | null>(null);
  const [singleItemTranslating, setSingleItemTranslating] = useState<{
    type: 'size' | 'color' | 'addon';
    index: number;
    dir: 'en_to_bn' | 'bn_to_en';
  } | null>(null);
  const [newFormTranslating, setNewFormTranslating] = useState<{
    type: 'size' | 'color' | 'addon';
    dir: 'en_to_bn' | 'bn_to_en';
  } | null>(null);

  // Interactive state inside the live simulator
  const [simSelectedSize, setSimSelectedSize] = useState<string>('L');
  const [simSelectedColor, setSimSelectedColor] = useState<string>('natural-multi');
  const [simSelectedAddons, setSimSelectedAddons] = useState<string[]>(['led']);

  // New Size form inputs
  const [newSizeId, setNewSizeId] = useState('');
  const [newSizeLabelEn, setNewSizeLabelEn] = useState('');
  const [newSizeLabelBn, setNewSizeLabelBn] = useState('');

  // New Color form inputs
  const [newColorId, setNewColorId] = useState('');
  const [newColorNameEn, setNewColorNameEn] = useState('');
  const [newColorNameBn, setNewColorNameBn] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8E5A35');

  // New Add-on form inputs
  const [newAddonId, setNewAddonId] = useState('');
  const [newAddonLabelEn, setNewAddonLabelEn] = useState('');
  const [newAddonLabelBn, setNewAddonLabelBn] = useState('');

  // --- Parse Sizes ---
  const sizes = useMemo((): MapSizeOption[] => {
    try {
      if (settings.custom_map_sizes_json) {
        const parsed = JSON.parse(settings.custom_map_sizes_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse custom_map_sizes_json', e);
    }
    return DEFAULT_MAP_SIZES;
  }, [settings.custom_map_sizes_json]);

  // --- Parse Colors ---
  const colors = useMemo((): MapColorOption[] => {
    try {
      if (settings.custom_map_colors_json) {
        const parsed = JSON.parse(settings.custom_map_colors_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse custom_map_colors_json', e);
    }
    return DEFAULT_MAP_COLORS;
  }, [settings.custom_map_colors_json]);

  // --- Parse Add-ons ---
  const addons = useMemo((): MapAddonOption[] => {
    try {
      if (settings.custom_map_addons_json) {
        const parsed = JSON.parse(settings.custom_map_addons_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse custom_map_addons_json', e);
    }
    return DEFAULT_MAP_ADDONS;
  }, [settings.custom_map_addons_json]);

  // ==================== SIZE HANDLERS ====================
  const handleAddSize = useCallback(() => {
    const cleanId = newSizeId.trim().toUpperCase() || `SIZE_${Date.now()}`;
    if (!newSizeLabelEn.trim() && !newSizeLabelBn.trim()) {
      showWarning('Please enter at least an English or Bengali label for the size.');
      return;
    }
    if (sizes.some((s) => s.id.toLowerCase() === cleanId.toLowerCase())) {
      showWarning(`A size with ID "${cleanId}" already exists. Please use a unique ID.`);
      return;
    }

    const updated = [
      ...sizes,
      {
        id: cleanId,
        labelEn: newSizeLabelEn.trim() || newSizeLabelBn.trim(),
        labelBn: newSizeLabelBn.trim() || newSizeLabelEn.trim(),
      },
    ];
    handleChange('custom_map_sizes_json', JSON.stringify(updated));
    setNewSizeId('');
    setNewSizeLabelEn('');
    setNewSizeLabelBn('');
    showSuccess(`Size option "${cleanId}" added.`);
  }, [newSizeId, newSizeLabelEn, newSizeLabelBn, sizes, handleChange, showWarning, showSuccess]);

  const handleUpdateSize = useCallback(
    (index: number, field: keyof MapSizeOption, value: string) => {
      const updated = [...sizes];
      updated[index] = { ...updated[index], [field]: value };
      handleChange('custom_map_sizes_json', JSON.stringify(updated));
    },
    [sizes, handleChange]
  );

  const handleRemoveSize = useCallback(
    async (index: number) => {
      const target = sizes[index];
      const confirmed = await showConfirm(`Remove size option "${target?.labelEn || target?.id}"?`, {
        title: 'Delete Size Option',
        confirmText: 'Delete',
        confirmVariant: 'danger',
      });
      if (confirmed) {
        const updated = sizes.filter((_, i) => i !== index);
        handleChange('custom_map_sizes_json', JSON.stringify(updated));
        showSuccess('Size option removed.');
      }
    },
    [sizes, handleChange, showConfirm, showSuccess]
  );

  const handleMoveSize = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= sizes.length) return;
      const updated = [...sizes];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      handleChange('custom_map_sizes_json', JSON.stringify(updated));
    },
    [sizes, handleChange]
  );

  const handleResetSizes = useCallback(async () => {
    const confirmed = await showConfirm('Reset all size options back to system default presets?', {
      title: 'Reset Size Options',
      confirmText: 'Reset Defaults',
      confirmVariant: 'primary',
    });
    if (confirmed) {
      handleChange('custom_map_sizes_json', JSON.stringify(DEFAULT_MAP_SIZES));
      showSuccess('Size options reset to defaults.');
    }
  }, [showConfirm, handleChange, showSuccess]);

  // ==================== COLOR HANDLERS ====================
  const handleAddColor = useCallback(() => {
    const cleanId = newColorId.trim().toLowerCase().replace(/\s+/g, '-') || `color-${Date.now()}`;
    if (!newColorNameEn.trim() && !newColorNameBn.trim()) {
      showWarning('Please enter at least an English or Bengali name for the stain color.');
      return;
    }
    if (colors.some((c) => c.id.toLowerCase() === cleanId.toLowerCase())) {
      showWarning(`A color with ID "${cleanId}" already exists. Please use a unique ID.`);
      return;
    }

    const updated = [
      ...colors,
      {
        id: cleanId,
        nameEn: newColorNameEn.trim() || newColorNameBn.trim(),
        nameBn: newColorNameBn.trim() || newColorNameEn.trim(),
        hex: newColorHex || '#8E5A35',
      },
    ];
    handleChange('custom_map_colors_json', JSON.stringify(updated));
    setNewColorId('');
    setNewColorNameEn('');
    setNewColorNameBn('');
    setNewColorHex('#8E5A35');
    showSuccess('Wood stain finish added.');
  }, [newColorId, newColorNameEn, newColorNameBn, newColorHex, colors, handleChange, showWarning, showSuccess]);

  const handleUpdateColor = useCallback(
    (index: number, field: keyof MapColorOption, value: string) => {
      const updated = [...colors];
      updated[index] = { ...updated[index], [field]: value };
      handleChange('custom_map_colors_json', JSON.stringify(updated));
    },
    [colors, handleChange]
  );

  const handleRemoveColor = useCallback(
    async (index: number) => {
      const target = colors[index];
      const confirmed = await showConfirm(`Remove wood stain color "${target?.nameEn || target?.id}"?`, {
        title: 'Delete Stain Color',
        confirmText: 'Delete',
        confirmVariant: 'danger',
      });
      if (confirmed) {
        const updated = colors.filter((_, i) => i !== index);
        handleChange('custom_map_colors_json', JSON.stringify(updated));
        showSuccess('Wood stain color removed.');
      }
    },
    [colors, handleChange, showConfirm, showSuccess]
  );

  const handleMoveColor = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= colors.length) return;
      const updated = [...colors];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      handleChange('custom_map_colors_json', JSON.stringify(updated));
    },
    [colors, handleChange]
  );

  const handleResetColors = useCallback(async () => {
    const confirmed = await showConfirm('Reset all wood stain finishes back to system default presets?', {
      title: 'Reset Stain Finishes',
      confirmText: 'Reset Defaults',
      confirmVariant: 'primary',
    });
    if (confirmed) {
      handleChange('custom_map_colors_json', JSON.stringify(DEFAULT_MAP_COLORS));
      showSuccess('Stain finishes reset to defaults.');
    }
  }, [showConfirm, handleChange, showSuccess]);

  // ==================== ADD-ON HANDLERS ====================
  const handleAddAddon = useCallback(() => {
    const cleanId = newAddonId.trim().toLowerCase().replace(/\s+/g, '-') || `addon-${Date.now()}`;
    if (!newAddonLabelEn.trim() && !newAddonLabelBn.trim()) {
      showWarning('Please enter at least an English or Bengali label for the add-on.');
      return;
    }
    if (addons.some((a) => a.id.toLowerCase() === cleanId.toLowerCase())) {
      showWarning(`An add-on with ID "${cleanId}" already exists. Please use a unique ID.`);
      return;
    }

    const updated = [
      ...addons,
      {
        id: cleanId,
        labelEn: newAddonLabelEn.trim() || newAddonLabelBn.trim(),
        labelBn: newAddonLabelBn.trim() || newAddonLabelEn.trim(),
      },
    ];
    handleChange('custom_map_addons_json', JSON.stringify(updated));
    setNewAddonId('');
    setNewAddonLabelEn('');
    setNewAddonLabelBn('');
    showSuccess('Special add-on extra added.');
  }, [newAddonId, newAddonLabelEn, newAddonLabelBn, addons, handleChange, showWarning, showSuccess]);

  const handleUpdateAddon = useCallback(
    (index: number, field: keyof MapAddonOption, value: string) => {
      const updated = [...addons];
      updated[index] = { ...updated[index], [field]: value };
      handleChange('custom_map_addons_json', JSON.stringify(updated));
    },
    [addons, handleChange]
  );

  const handleRemoveAddon = useCallback(
    async (index: number) => {
      const target = addons[index];
      const confirmed = await showConfirm(`Remove add-on "${target?.labelEn || target?.id}"?`, {
        title: 'Delete Add-on',
        confirmText: 'Delete',
        confirmVariant: 'danger',
      });
      if (confirmed) {
        const updated = addons.filter((_, i) => i !== index);
        handleChange('custom_map_addons_json', JSON.stringify(updated));
        showSuccess('Add-on removed.');
      }
    },
    [addons, handleChange, showConfirm, showSuccess]
  );

  const handleMoveAddon = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= addons.length) return;
      const updated = [...addons];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      handleChange('custom_map_addons_json', JSON.stringify(updated));
    },
    [addons, handleChange]
  );

  const handleResetAddons = useCallback(async () => {
    const confirmed = await showConfirm('Reset all add-ons back to system default presets?', {
      title: 'Reset Add-ons',
      confirmText: 'Reset Defaults',
      confirmVariant: 'primary',
    });
    if (confirmed) {
      handleChange('custom_map_addons_json', JSON.stringify(DEFAULT_MAP_ADDONS));
      showSuccess('Add-ons reset to defaults.');
    }
  }, [showConfirm, handleChange, showSuccess]);

  // Master reset
  const handleResetAll = useCallback(async () => {
    const confirmed = await showConfirm(
      'Reset all customization modal options (Sizes, Colors, Add-ons & Titles) to system defaults?',
      {
        title: 'Reset Everything to Default',
        confirmText: 'Reset All',
        confirmVariant: 'primary',
      }
    );
    if (confirmed) {
      handleChange('custom_map_sizes_json', JSON.stringify(DEFAULT_MAP_SIZES));
      handleChange('custom_map_colors_json', JSON.stringify(DEFAULT_MAP_COLORS));
      handleChange('custom_map_addons_json', JSON.stringify(DEFAULT_MAP_ADDONS));
      handleChange('custom_map_modal_title_en', '');
      handleChange('custom_map_modal_title_bn', '');
      handleChange('custom_map_modal_subtitle_en', '');
      handleChange('custom_map_modal_subtitle_bn', '');
      showSuccess('All Custom Map Modal settings reset to factory defaults.');
    }
  }, [showConfirm, handleChange, showSuccess]);

  // ==================== MASTER FULL MODAL TRANSLATION ====================
  const handleTranslateAllModalSettings = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';

      const title = isEnToBn
        ? (settings.custom_map_modal_title_en || 'Custom Wooden Map Request').trim()
        : (settings.custom_map_modal_title_bn || 'কাস্টম কাঠের ম্যাপ রিকোয়েস্ট').trim();
      const subtitle = isEnToBn
        ? (settings.custom_map_modal_subtitle_en || 'Choose your preferred size, stain finish & custom add-ons').trim()
        : (settings.custom_map_modal_subtitle_bn || 'আপনার পছন্দ অনুযায়ী সাইজ, কালার ও স্পেশাল ফিচার সিলেক্ট করুন').trim();

      const payload = {
        title,
        subtitle,
        sizes: sizes.map((s, i) => ({
          index: i,
          id: s.id,
          label: isEnToBn ? (s.labelEn || s.id) : (s.labelBn || s.id),
        })),
        colors: colors.map((c, i) => ({
          index: i,
          id: c.id,
          name: isEnToBn ? (c.nameEn || c.id) : (c.nameBn || c.id),
        })),
        addons: addons.map((a, i) => ({
          index: i,
          id: a.id,
          label: isEnToBn ? (a.labelEn || a.id) : (a.labelBn || a.id),
        })),
      };

      setGlobalTranslateLoading(true);
      setGlobalAiAction(direction);

      try {
        const prompt = isEnToBn
          ? `You are an elite bilingual copywriter and master localization expert for an upscale luxury handcrafted wooden map brand.
Translate the following English Custom Map Modal configuration (modal headings, sizes, wood stains, add-on features) into natural, elegant, captivating Bengali (বাংলা):
${JSON.stringify(payload)}

CRITICAL RULES:
1. Translate titles, size dimensions, wood stain color names, and add-on labels faithfully with upscale craftsmanship terminology.
2. Return strictly a raw valid JSON object:
{
  "title": "Bengali modal title",
  "subtitle": "Bengali modal subtitle",
  "sizes": [ { "index": 0, "labelBn": "..." } ],
  "colors": [ { "index": 0, "nameBn": "..." } ],
  "addons": [ { "index": 0, "labelBn": "..." } ]
}`
          : `You are an elite bilingual copywriter and master localization expert for an upscale luxury handcrafted wooden map brand.
Translate the following Bengali (বাংলা) Custom Map Modal configuration (modal headings, sizes, wood stains, add-on features) into polished, captivating, high-converting English:
${JSON.stringify(payload)}

CRITICAL RULES:
1. Translate titles, size dimensions, wood stain color names, and add-on labels faithfully with upscale craftsmanship terminology.
2. Return strictly a raw valid JSON object:
{
  "title": "English modal title",
  "subtitle": "English modal subtitle",
  "sizes": [ { "index": 0, "labelEn": "..." } ],
  "colors": [ { "index": 0, "nameEn": "..." } ],
  "addons": [ { "index": 0, "labelEn": "..." } ]
}`;

        const res = await fetchApi('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, temperature: 0.25 }),
        });

        let parsed: any = null;
        if (res && (res.title || res.sizes || res.colors || res.addons)) {
          parsed = res;
        } else if (res?.text) {
          const jsonMatch = res.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        }

        if (!parsed) {
          throw new Error('Translation returned an unexpected response structure');
        }

        if (isEnToBn) {
          if (parsed.title) handleChange('custom_map_modal_title_bn', parsed.title);
          if (parsed.subtitle) handleChange('custom_map_modal_subtitle_bn', parsed.subtitle);

          if (Array.isArray(parsed.sizes)) {
            const updatedSizes = sizes.map((s, idx) => {
              const match = parsed.sizes.find((m: any) => m.index === idx) || parsed.sizes[idx];
              return match?.labelBn ? { ...s, labelBn: match.labelBn } : s;
            });
            handleChange('custom_map_sizes_json', JSON.stringify(updatedSizes));
          }

          if (Array.isArray(parsed.colors)) {
            const updatedColors = colors.map((c, idx) => {
              const match = parsed.colors.find((m: any) => m.index === idx) || parsed.colors[idx];
              return match?.nameBn ? { ...c, nameBn: match.nameBn } : c;
            });
            handleChange('custom_map_colors_json', JSON.stringify(updatedColors));
          }

          if (Array.isArray(parsed.addons)) {
            const updatedAddons = addons.map((a, idx) => {
              const match = parsed.addons.find((m: any) => m.index === idx) || parsed.addons[idx];
              return match?.labelBn ? { ...a, labelBn: match.labelBn } : a;
            });
            handleChange('custom_map_addons_json', JSON.stringify(updatedAddons));
          }

          setPreviewLang('bn');
          showSuccess('✨ All Custom Map Modal settings translated to Bengali (বাংলা) successfully!');
        } else {
          if (parsed.title) handleChange('custom_map_modal_title_en', parsed.title);
          if (parsed.subtitle) handleChange('custom_map_modal_subtitle_en', parsed.subtitle);

          if (Array.isArray(parsed.sizes)) {
            const updatedSizes = sizes.map((s, idx) => {
              const match = parsed.sizes.find((m: any) => m.index === idx) || parsed.sizes[idx];
              return match?.labelEn ? { ...s, labelEn: match.labelEn } : s;
            });
            handleChange('custom_map_sizes_json', JSON.stringify(updatedSizes));
          }

          if (Array.isArray(parsed.colors)) {
            const updatedColors = colors.map((c, idx) => {
              const match = parsed.colors.find((m: any) => m.index === idx) || parsed.colors[idx];
              return match?.nameEn ? { ...c, nameEn: match.nameEn } : c;
            });
            handleChange('custom_map_colors_json', JSON.stringify(updatedColors));
          }

          if (Array.isArray(parsed.addons)) {
            const updatedAddons = addons.map((a, idx) => {
              const match = parsed.addons.find((m: any) => m.index === idx) || parsed.addons[idx];
              return match?.labelEn ? { ...a, labelEn: match.labelEn } : a;
            });
            handleChange('custom_map_addons_json', JSON.stringify(updatedAddons));
          }

          setPreviewLang('en');
          showSuccess('✨ All Custom Map Modal settings translated to English (EN) successfully!');
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed. Please verify AI provider configuration.');
      } finally {
        setGlobalTranslateLoading(false);
        setGlobalAiAction(null);
      }
    },
    [settings, sizes, colors, addons, handleChange, showSuccess, showError]
  );

  // ==================== SUBTAB TRANSLATION HANDLERS ====================
  // Sizes
  const handleTranslateAllSizes = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      if (!sizes || sizes.length === 0) {
        showWarning('No size options to translate.');
        return;
      }

      setSubTabTranslateLoading(`sizes_${direction}`);
      try {
        const payload = sizes.map((s, i) => ({
          index: i,
          id: s.id,
          text: isEnToBn ? s.labelEn : s.labelBn,
        }));

        const prompt = isEnToBn
          ? `Translate these wooden map size dimension labels into elegant Bengali (বাংলা):\n${JSON.stringify(payload)}\nReturn strictly valid JSON: { "sizes": [ { "index": 0, "labelBn": "..." } ] }`
          : `Translate these wooden map size dimension labels into clean professional English:\n${JSON.stringify(payload)}\nReturn strictly valid JSON: { "sizes": [ { "index": 0, "labelEn": "..." } ] }`;

        const res = await fetchApi('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, temperature: 0.2 }),
        });

        let parsed: any = null;
        if (res && res.sizes) parsed = res;
        else if (res?.text) {
          const m = res.text.match(/\{[\s\S]*\}/);
          if (m) parsed = JSON.parse(m[0]);
        }

        if (Array.isArray(parsed?.sizes)) {
          const updated = sizes.map((s, idx) => {
            const match = parsed.sizes.find((m: any) => m.index === idx) || parsed.sizes[idx];
            if (isEnToBn && match?.labelBn) return { ...s, labelBn: match.labelBn };
            if (!isEnToBn && match?.labelEn) return { ...s, labelEn: match.labelEn };
            return s;
          });
          handleChange('custom_map_sizes_json', JSON.stringify(updated));
          showSuccess(isEnToBn ? '✨ Size options translated to Bengali!' : '✨ Size options translated to English!');
        } else {
          throw new Error('Failed to parse sizes translation');
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setSubTabTranslateLoading(null);
      }
    },
    [sizes, handleChange, showSuccess, showWarning, showError]
  );

  const handleTranslateSingleSize = useCallback(
    async (index: number, direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      const target = sizes[index];
      if (!target) return;
      const src = isEnToBn ? target.labelEn : target.labelBn;
      if (!src?.trim()) {
        showWarning(isEnToBn ? 'Please enter English size label first.' : 'অনুগ্রহ করে প্রথমে বাংলা লেবেল দিন।');
        return;
      }

      setSingleItemTranslating({ type: 'size', index, dir: direction });
      try {
        const res = await fetchApi('/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: src,
            targetLang: isEnToBn ? 'bn' : 'en',
            sourceLang: isEnToBn ? 'en' : 'bn',
          }),
        });

        if (res?.translatedText) {
          const updated = [...sizes];
          if (isEnToBn) updated[index] = { ...updated[index], labelBn: res.translatedText.trim() };
          else updated[index] = { ...updated[index], labelEn: res.translatedText.trim() };
          handleChange('custom_map_sizes_json', JSON.stringify(updated));
          showSuccess(`✨ Size "${target.id}" translated!`);
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setSingleItemTranslating(null);
      }
    },
    [sizes, handleChange, showSuccess, showWarning, showError]
  );

  const handleTranslateNewSize = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      const src = isEnToBn ? newSizeLabelEn : newSizeLabelBn;
      if (!src.trim()) {
        showWarning(isEnToBn ? 'Please enter English label to translate.' : 'অনুগ্রহ করে বাংলা লেবেল প্রদান করুন।');
        return;
      }

      setNewFormTranslating({ type: 'size', dir: direction });
      try {
        const res = await fetchApi('/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: src,
            targetLang: isEnToBn ? 'bn' : 'en',
            sourceLang: isEnToBn ? 'en' : 'bn',
          }),
        });
        if (res?.translatedText) {
          if (isEnToBn) setNewSizeLabelBn(res.translatedText.trim());
          else setNewSizeLabelEn(res.translatedText.trim());
          showSuccess('✨ Size label translated!');
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setNewFormTranslating(null);
      }
    },
    [newSizeLabelEn, newSizeLabelBn, showSuccess, showWarning, showError]
  );

  // Stains / Colors
  const handleTranslateAllColors = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      if (!colors || colors.length === 0) {
        showWarning('No wood stain colors to translate.');
        return;
      }

      setSubTabTranslateLoading(`colors_${direction}`);
      try {
        const payload = colors.map((c, i) => ({
          index: i,
          id: c.id,
          text: isEnToBn ? c.nameEn : c.nameBn,
        }));

        const prompt = isEnToBn
          ? `Translate these luxury wood stain color names into elegant Bengali (বাংলা):\n${JSON.stringify(payload)}\nReturn strictly valid JSON: { "colors": [ { "index": 0, "nameBn": "..." } ] }`
          : `Translate these wood stain color names into polished professional English:\n${JSON.stringify(payload)}\nReturn strictly valid JSON: { "colors": [ { "index": 0, "nameEn": "..." } ] }`;

        const res = await fetchApi('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, temperature: 0.2 }),
        });

        let parsed: any = null;
        if (res && res.colors) parsed = res;
        else if (res?.text) {
          const m = res.text.match(/\{[\s\S]*\}/);
          if (m) parsed = JSON.parse(m[0]);
        }

        if (Array.isArray(parsed?.colors)) {
          const updated = colors.map((c, idx) => {
            const match = parsed.colors.find((m: any) => m.index === idx) || parsed.colors[idx];
            if (isEnToBn && match?.nameBn) return { ...c, nameBn: match.nameBn };
            if (!isEnToBn && match?.nameEn) return { ...c, nameEn: match.nameEn };
            return c;
          });
          handleChange('custom_map_colors_json', JSON.stringify(updated));
          showSuccess(isEnToBn ? '✨ Wood stains translated to Bengali!' : '✨ Wood stains translated to English!');
        } else {
          throw new Error('Failed to parse colors translation');
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setSubTabTranslateLoading(null);
      }
    },
    [colors, handleChange, showSuccess, showWarning, showError]
  );

  const handleTranslateSingleColor = useCallback(
    async (index: number, direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      const target = colors[index];
      if (!target) return;
      const src = isEnToBn ? target.nameEn : target.nameBn;
      if (!src?.trim()) {
        showWarning(isEnToBn ? 'Please enter English color name first.' : 'অনুগ্রহ করে প্রথমে বাংলা নাম দিন।');
        return;
      }

      setSingleItemTranslating({ type: 'color', index, dir: direction });
      try {
        const res = await fetchApi('/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: src,
            targetLang: isEnToBn ? 'bn' : 'en',
            sourceLang: isEnToBn ? 'en' : 'bn',
          }),
        });

        if (res?.translatedText) {
          const updated = [...colors];
          if (isEnToBn) updated[index] = { ...updated[index], nameBn: res.translatedText.trim() };
          else updated[index] = { ...updated[index], nameEn: res.translatedText.trim() };
          handleChange('custom_map_colors_json', JSON.stringify(updated));
          showSuccess(`✨ Wood stain "${target.id}" translated!`);
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setSingleItemTranslating(null);
      }
    },
    [colors, handleChange, showSuccess, showWarning, showError]
  );

  const handleTranslateNewColor = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      const src = isEnToBn ? newColorNameEn : newColorNameBn;
      if (!src.trim()) {
        showWarning(isEnToBn ? 'Please enter English stain name to translate.' : 'অনুগ্রহ করে বাংলা নাম প্রদান করুন।');
        return;
      }

      setNewFormTranslating({ type: 'color', dir: direction });
      try {
        const res = await fetchApi('/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: src,
            targetLang: isEnToBn ? 'bn' : 'en',
            sourceLang: isEnToBn ? 'en' : 'bn',
          }),
        });
        if (res?.translatedText) {
          if (isEnToBn) setNewColorNameBn(res.translatedText.trim());
          else setNewColorNameEn(res.translatedText.trim());
          showSuccess('✨ Stain name translated!');
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setNewFormTranslating(null);
      }
    },
    [newColorNameEn, newColorNameBn, showSuccess, showWarning, showError]
  );

  // Add-ons
  const handleTranslateAllAddons = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      if (!addons || addons.length === 0) {
        showWarning('No add-on options to translate.');
        return;
      }

      setSubTabTranslateLoading(`addons_${direction}`);
      try {
        const payload = addons.map((a, i) => ({
          index: i,
          id: a.id,
          text: isEnToBn ? a.labelEn : a.labelBn,
        }));

        const prompt = isEnToBn
          ? `Translate these wooden map add-on features and extra accessories into elegant Bengali (বাংলা):\n${JSON.stringify(payload)}\nReturn strictly valid JSON: { "addons": [ { "index": 0, "labelBn": "..." } ] }`
          : `Translate these wooden map add-on features and extra accessories into polished professional English:\n${JSON.stringify(payload)}\nReturn strictly valid JSON: { "addons": [ { "index": 0, "labelEn": "..." } ] }`;

        const res = await fetchApi('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, temperature: 0.2 }),
        });

        let parsed: any = null;
        if (res && res.addons) parsed = res;
        else if (res?.text) {
          const m = res.text.match(/\{[\s\S]*\}/);
          if (m) parsed = JSON.parse(m[0]);
        }

        if (Array.isArray(parsed?.addons)) {
          const updated = addons.map((a, idx) => {
            const match = parsed.addons.find((m: any) => m.index === idx) || parsed.addons[idx];
            if (isEnToBn && match?.labelBn) return { ...a, labelBn: match.labelBn };
            if (!isEnToBn && match?.labelEn) return { ...a, labelEn: match.labelEn };
            return a;
          });
          handleChange('custom_map_addons_json', JSON.stringify(updated));
          showSuccess(isEnToBn ? '✨ Add-on options translated to Bengali!' : '✨ Add-on options translated to English!');
        } else {
          throw new Error('Failed to parse addons translation');
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setSubTabTranslateLoading(null);
      }
    },
    [addons, handleChange, showSuccess, showWarning, showError]
  );

  const handleTranslateSingleAddon = useCallback(
    async (index: number, direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      const target = addons[index];
      if (!target) return;
      const src = isEnToBn ? target.labelEn : target.labelBn;
      if (!src?.trim()) {
        showWarning(isEnToBn ? 'Please enter English add-on label first.' : 'অনুগ্রহ করে প্রথমে বাংলা লেবেল দিন।');
        return;
      }

      setSingleItemTranslating({ type: 'addon', index, dir: direction });
      try {
        const res = await fetchApi('/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: src,
            targetLang: isEnToBn ? 'bn' : 'en',
            sourceLang: isEnToBn ? 'en' : 'bn',
          }),
        });

        if (res?.translatedText) {
          const updated = [...addons];
          if (isEnToBn) updated[index] = { ...updated[index], labelBn: res.translatedText.trim() };
          else updated[index] = { ...updated[index], labelEn: res.translatedText.trim() };
          handleChange('custom_map_addons_json', JSON.stringify(updated));
          showSuccess(`✨ Add-on "${target.id}" translated!`);
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setSingleItemTranslating(null);
      }
    },
    [addons, handleChange, showSuccess, showWarning, showError]
  );

  const handleTranslateNewAddon = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      const src = isEnToBn ? newAddonLabelEn : newAddonLabelBn;
      if (!src.trim()) {
        showWarning(isEnToBn ? 'Please enter English add-on label to translate.' : 'অনুগ্রহ করে বাংলা লেবেল প্রদান করুন।');
        return;
      }

      setNewFormTranslating({ type: 'addon', dir: direction });
      try {
        const res = await fetchApi('/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: src,
            targetLang: isEnToBn ? 'bn' : 'en',
            sourceLang: isEnToBn ? 'en' : 'bn',
          }),
        });
        if (res?.translatedText) {
          if (isEnToBn) setNewAddonLabelBn(res.translatedText.trim());
          else setNewAddonLabelEn(res.translatedText.trim());
          showSuccess('✨ Add-on label translated!');
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setNewFormTranslating(null);
      }
    },
    [newAddonLabelEn, newAddonLabelBn, showSuccess, showWarning, showError]
  );

  // Headings
  const handleTranslateHeadings = useCallback(
    async (direction: 'en_to_bn' | 'bn_to_en') => {
      const isEnToBn = direction === 'en_to_bn';
      const title = isEnToBn
        ? (settings.custom_map_modal_title_en || 'Custom Wooden Map Request').trim()
        : (settings.custom_map_modal_title_bn || 'কাস্টম কাঠের ম্যাপ রিকোয়েস্ট').trim();
      const subtitle = isEnToBn
        ? (settings.custom_map_modal_subtitle_en || 'Choose your preferred size, stain finish & custom add-ons').trim()
        : (settings.custom_map_modal_subtitle_bn || 'আপনার পছন্দ অনুযায়ী সাইজ, কালার ও স্পেশাল ফিচার সিলেক্ট করুন').trim();

      setSubTabTranslateLoading(`headings_${direction}`);
      try {
        const payload = { title, subtitle };
        const prompt = isEnToBn
          ? `Translate the following custom map popup headings into natural, elegant Bengali (বাংলা):\n${JSON.stringify(payload)}\nReturn strictly a valid JSON object: { "title": "...", "subtitle": "..." }`
          : `Translate the following custom map popup headings into polished, engaging English:\n${JSON.stringify(payload)}\nReturn strictly a valid JSON object: { "title": "...", "subtitle": "..." }`;

        const res = await fetchApi('/ai/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, temperature: 0.2 }),
        });

        let parsed: any = null;
        if (res && (res.title || res.subtitle)) parsed = res;
        else if (res?.text) {
          const m = res.text.match(/\{[\s\S]*\}/);
          if (m) parsed = JSON.parse(m[0]);
        }

        if (parsed) {
          if (isEnToBn) {
            if (parsed.title) handleChange('custom_map_modal_title_bn', parsed.title);
            if (parsed.subtitle) handleChange('custom_map_modal_subtitle_bn', parsed.subtitle);
            setPreviewLang('bn');
            showSuccess('✨ Modal headings translated to Bengali (বাংলা)!');
          } else {
            if (parsed.title) handleChange('custom_map_modal_title_en', parsed.title);
            if (parsed.subtitle) handleChange('custom_map_modal_subtitle_en', parsed.subtitle);
            setPreviewLang('en');
            showSuccess('✨ Modal headings translated to English (EN)!');
          }
        }
      } catch (err: any) {
        showError(err.message || 'Translation failed.');
      } finally {
        setSubTabTranslateLoading(null);
      }
    },
    [
      settings.custom_map_modal_title_en,
      settings.custom_map_modal_title_bn,
      settings.custom_map_modal_subtitle_en,
      settings.custom_map_modal_subtitle_bn,
      handleChange,
      showSuccess,
      showError,
    ]
  );

  const toggleSimAddon = (id: string) => {
    setSimSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3 text-slate-900 font-bold">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-600/10 border border-amber-200/60 text-[#c08a46]">
            <Sparkles className="w-5 h-5 text-[#c08a46]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">Custom Map Modal Configuration</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-[#c08a46] border border-amber-200">
                Customer Facing
              </span>
            </div>
            <span className="text-xs text-slate-500 font-normal">
              Edit size presets, wood finishes, add-ons and modal copy. Changes reflect in real time in the live preview.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleTranslateAllModalSettings('en_to_bn')}
            disabled={globalTranslateLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 text-amber-900 font-bold text-xs shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            title="Auto-translate all custom map modal options and headings from English to Bengali"
          >
            {globalTranslateLoading && globalAiAction === 'en_to_bn' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c08a46]" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-[#c08a46]" />
            )}
            <span>Translate All (EN ➔ বাংলা)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTranslateAllModalSettings('bn_to_en')}
            disabled={globalTranslateLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-300 text-blue-900 font-bold text-xs shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            title="Auto-translate all custom map modal options and headings from Bengali to English"
          >
            {globalTranslateLoading && globalAiAction === 'bn_to_en' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>Translate All (বাংলা ➔ EN)</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* GLOBAL TRANSLATION SUMMARY BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-slate-50 border border-amber-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-[#c08a46]">
            <Languages className="w-4 h-4 text-[#c08a46]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Custom Map Modal AI Translation Options</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                1-Click Full Modal Sync
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Translate all customer-facing sizes, wood stain colors, add-on features, and modal headings between English and Bengali
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleTranslateAllModalSettings('en_to_bn')}
            disabled={globalTranslateLoading}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            title="Auto-translate entire modal from English to Bengali"
          >
            {globalTranslateLoading && globalAiAction === 'en_to_bn' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c08a46]" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-[#c08a46]" />
            )}
            <span>Auto-Translate (EN ➔ বাংলা)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTranslateAllModalSettings('bn_to_en')}
            disabled={globalTranslateLoading}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-blue-300 text-blue-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            title="Auto-translate entire modal from Bengali to English"
          >
            {globalTranslateLoading && globalAiAction === 'bn_to_en' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>Auto-Translate (বাংলা ➔ EN)</span>
          </button>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE: LEFT = COMPACT EDITING, RIGHT = STICKY LIVE PREVIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* COLUMN 1: COMPACT EDITING PANEL (xl:col-span-7) */}
        {/* ========================================================================= */}
        <div className="order-1 xl:order-1 xl:col-span-7 space-y-4">
          {/* Sub-tabs Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveSubTab('sizes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'sizes'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ruler className="w-3.5 h-3.5 text-[#c08a46]" />
              <span>1. Sizes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-700">
                {sizes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('colors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'colors'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#c08a46]" />
              <span>2. Stains</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-700">
                {colors.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('addons')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'addons'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c08a46]" />
              <span>3. Add-ons</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-700">
                {addons.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('headings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'headings'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-[#c08a46]" />
              <span>4. Headings</span>
            </button>
          </div>

          {/* ────────────────── SUB-TAB 1: SIZES ────────────────── */}
          {activeSubTab === 'sizes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#c08a46]" /> Preferred Sizes ({sizes.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Use ID &quot;custom&quot; to automatically trigger the custom wall dimensions input box.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleTranslateAllSizes('en_to_bn')}
                    disabled={subTabTranslateLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Translate all size labels: English ➔ Bengali"
                  >
                    {subTabTranslateLoading === 'sizes_en_to_bn' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#c08a46]" />
                    ) : (
                      <Wand2 className="w-3 h-3 text-[#c08a46]" />
                    )}
                    <span>EN ➔ বাংলা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTranslateAllSizes('bn_to_en')}
                    disabled={subTabTranslateLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Translate all size labels: Bengali ➔ English"
                  >
                    {subTabTranslateLoading === 'sizes_bn_to_en' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    ) : (
                      <Bot className="w-3 h-3 text-blue-600" />
                    )}
                    <span>বাংলা ➔ EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSizes}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Compact Size Cards */}
              <div className="space-y-2">
                {sizes.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-amber-300 transition-all shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          ID: {s.id}
                        </span>
                        {s.id === 'custom' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                            Custom Trigger
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Single Item Quick Translation */}
                        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-md p-0.5">
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleSize(idx, 'en_to_bn')}
                            disabled={singleItemTranslating !== null}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                            title="Translate size: English ➔ Bengali"
                          >
                            {singleItemTranslating?.type === 'size' && singleItemTranslating?.index === idx && singleItemTranslating?.dir === 'en_to_bn' ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-[#c08a46]" />
                            ) : (
                              <Languages className="w-2.5 h-2.5 text-[#c08a46]" />
                            )}
                            <span>EN ➔ বাংলা</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleSize(idx, 'bn_to_en')}
                            disabled={singleItemTranslating !== null}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                            title="Translate size: Bengali ➔ English"
                          >
                            {singleItemTranslating?.type === 'size' && singleItemTranslating?.index === idx && singleItemTranslating?.dir === 'bn_to_en' ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
                            ) : (
                              <Bot className="w-2.5 h-2.5 text-blue-600" />
                            )}
                            <span>বাংলা ➔ EN</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSize(idx, 'up')}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sizes.length - 1}
                          onClick={() => handleMoveSize(idx, 'down')}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(idx)}
                          className="p-1 rounded-md bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                          title="Delete Size"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center rounded-lg bg-white border border-slate-200 focus-within:border-[#c08a46] focus-within:ring-1 focus-within:ring-[#c08a46] transition-colors">
                        <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold uppercase text-slate-400 select-none shrink-0">
                          EN
                        </span>
                        <input
                          type="text"
                          value={s.labelEn || ''}
                          onChange={(e) => handleUpdateSize(idx, 'labelEn', e.target.value)}
                          placeholder="M — 100 × 60 cm (39 × 24 in)"
                          className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                        />
                      </div>
                      <div className="flex items-center rounded-lg bg-white border border-emerald-200/90 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-colors">
                        <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold text-emerald-700 select-none shrink-0">
                          বাংলা
                        </span>
                        <input
                          type="text"
                          value={s.labelBn || ''}
                          onChange={(e) => handleUpdateSize(idx, 'labelBn', e.target.value)}
                          placeholder="M — ১০০ × ৬০ সেমি (৩৯ × ২৪ ইঞ্চি)"
                          className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compact Add Size Form */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#c08a46]" /> Add New Size
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTranslateNewSize('en_to_bn')}
                      disabled={newFormTranslating !== null}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-white hover:bg-amber-100 border border-amber-200 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Translate label: EN ➔ বাংলা"
                    >
                      {newFormTranslating?.type === 'size' && newFormTranslating?.dir === 'en_to_bn' ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-[#c08a46]" />
                      ) : (
                        <Languages className="w-2.5 h-2.5 text-[#c08a46]" />
                      )}
                      <span>Translate (EN ➔ বাংলা)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTranslateNewSize('bn_to_en')}
                      disabled={newFormTranslating !== null}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-800 bg-white hover:bg-blue-100 border border-blue-200 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Translate label: বাংলা ➔ EN"
                    >
                      {newFormTranslating?.type === 'size' && newFormTranslating?.dir === 'bn_to_en' ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
                      ) : (
                        <Bot className="w-2.5 h-2.5 text-blue-600" />
                      )}
                      <span>Translate (বাংলা ➔ EN)</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newSizeId}
                    onChange={(e) => setNewSizeId(e.target.value)}
                    placeholder="ID (e.g. XXL)"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#c08a46]"
                  />
                  <input
                    type="text"
                    value={newSizeLabelEn}
                    onChange={(e) => setNewSizeLabelEn(e.target.value)}
                    placeholder="English Label"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#c08a46]"
                  />
                  <input
                    type="text"
                    value={newSizeLabelBn}
                    onChange={(e) => setNewSizeLabelBn(e.target.value)}
                    placeholder="বাংলা লেবেল"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-1.5 rounded-lg bg-[#c08a46] hover:bg-[#a67435] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── SUB-TAB 2: WOOD STAINS ────────────────── */}
          {activeSubTab === 'colors' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#c08a46]" /> Wood Stain Finishes ({colors.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Click the color circle to open the native color picker.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleTranslateAllColors('en_to_bn')}
                    disabled={subTabTranslateLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Translate all wood stains: English ➔ Bengali"
                  >
                    {subTabTranslateLoading === 'colors_en_to_bn' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#c08a46]" />
                    ) : (
                      <Wand2 className="w-3 h-3 text-[#c08a46]" />
                    )}
                    <span>EN ➔ বাংলা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTranslateAllColors('bn_to_en')}
                    disabled={subTabTranslateLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Translate all wood stains: Bengali ➔ English"
                  >
                    {subTabTranslateLoading === 'colors_bn_to_en' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    ) : (
                      <Bot className="w-3 h-3 text-blue-600" />
                    )}
                    <span>বাংলা ➔ EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetColors}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Compact Color Cards */}
              <div className="space-y-2">
                {colors.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-amber-300 transition-all shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div
                            className="w-6 h-6 rounded-full border border-black/20 shadow-2xs shrink-0 cursor-pointer"
                            style={{ backgroundColor: c.hex }}
                          />
                          <input
                            type="color"
                            value={c.hex || '#8E5A35'}
                            onChange={(e) => handleUpdateColor(idx, 'hex', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            title="Click to change color"
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          {c.hex}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ID: {c.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Single Stain Quick Translation */}
                        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-md p-0.5">
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleColor(idx, 'en_to_bn')}
                            disabled={singleItemTranslating !== null}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                            title="Translate wood stain: English ➔ Bengali"
                          >
                            {singleItemTranslating?.type === 'color' && singleItemTranslating?.index === idx && singleItemTranslating?.dir === 'en_to_bn' ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-[#c08a46]" />
                            ) : (
                              <Languages className="w-2.5 h-2.5 text-[#c08a46]" />
                            )}
                            <span>EN ➔ বাংলা</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleColor(idx, 'bn_to_en')}
                            disabled={singleItemTranslating !== null}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                            title="Translate wood stain: Bengali ➔ English"
                          >
                            {singleItemTranslating?.type === 'color' && singleItemTranslating?.index === idx && singleItemTranslating?.dir === 'bn_to_en' ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
                            ) : (
                              <Bot className="w-2.5 h-2.5 text-blue-600" />
                            )}
                            <span>বাংলা ➔ EN</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveColor(idx, 'up')}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === colors.length - 1}
                          onClick={() => handleMoveColor(idx, 'down')}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="p-1 rounded-md bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                          title="Delete Color"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center rounded-lg bg-white border border-slate-200 focus-within:border-[#c08a46] focus-within:ring-1 focus-within:ring-[#c08a46] transition-colors">
                        <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold uppercase text-slate-400 select-none shrink-0">
                          EN
                        </span>
                        <input
                          type="text"
                          value={c.nameEn || ''}
                          onChange={(e) => handleUpdateColor(idx, 'nameEn', e.target.value)}
                          placeholder="Natural Multi-Color Classic"
                          className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                        />
                      </div>
                      <div className="flex items-center rounded-lg bg-white border border-emerald-200/90 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-colors">
                        <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold text-emerald-700 select-none shrink-0">
                          বাংলা
                        </span>
                        <input
                          type="text"
                          value={c.nameBn || ''}
                          onChange={(e) => handleUpdateColor(idx, 'nameBn', e.target.value)}
                          placeholder="মাল্টি-কালার ক্লাসিক"
                          className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compact Add Color Form */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#c08a46]" /> Add New Stain Finish
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTranslateNewColor('en_to_bn')}
                      disabled={newFormTranslating !== null}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-white hover:bg-amber-100 border border-amber-200 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Translate finish name: EN ➔ বাংলা"
                    >
                      {newFormTranslating?.type === 'color' && newFormTranslating?.dir === 'en_to_bn' ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-[#c08a46]" />
                      ) : (
                        <Languages className="w-2.5 h-2.5 text-[#c08a46]" />
                      )}
                      <span>Translate (EN ➔ বাংলা)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTranslateNewColor('bn_to_en')}
                      disabled={newFormTranslating !== null}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-800 bg-white hover:bg-blue-100 border border-blue-200 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Translate finish name: বাংলা ➔ EN"
                    >
                      {newFormTranslating?.type === 'color' && newFormTranslating?.dir === 'bn_to_en' ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
                      ) : (
                        <Bot className="w-2.5 h-2.5 text-blue-600" />
                      )}
                      <span>Translate (বাংলা ➔ EN)</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div
                        className="w-7 h-7 rounded-full border border-black/20 shadow-2xs shrink-0 cursor-pointer"
                        style={{ backgroundColor: newColorHex }}
                      />
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      placeholder="#8E5A35"
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#c08a46]"
                    />
                  </div>
                  <input
                    type="text"
                    value={newColorId}
                    onChange={(e) => setNewColorId(e.target.value)}
                    placeholder="ID (e.g. golden-oak)"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#c08a46]"
                  />
                  <input
                    type="text"
                    value={newColorNameEn}
                    onChange={(e) => setNewColorNameEn(e.target.value)}
                    placeholder="English Name"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#c08a46]"
                  />
                  <input
                    type="text"
                    value={newColorNameBn}
                    onChange={(e) => setNewColorNameBn(e.target.value)}
                    placeholder="বাংলা নাম"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-1.5 rounded-lg bg-[#c08a46] hover:bg-[#a67435] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stain</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── SUB-TAB 3: ADD-ONS ────────────────── */}
          {activeSubTab === 'addons' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#c08a46]" /> Special Add-ons & Extras ({addons.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Feature checkboxes like LED backlighting, engraved logos, or extra island packs.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleTranslateAllAddons('en_to_bn')}
                    disabled={subTabTranslateLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Translate all add-ons: English ➔ Bengali"
                  >
                    {subTabTranslateLoading === 'addons_en_to_bn' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#c08a46]" />
                    ) : (
                      <Wand2 className="w-3 h-3 text-[#c08a46]" />
                    )}
                    <span>EN ➔ বাংলা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTranslateAllAddons('bn_to_en')}
                    disabled={subTabTranslateLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Translate all add-ons: Bengali ➔ English"
                  >
                    {subTabTranslateLoading === 'addons_bn_to_en' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    ) : (
                      <Bot className="w-3 h-3 text-blue-600" />
                    )}
                    <span>বাংলা ➔ EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAddons}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Compact Add-on Cards */}
              <div className="space-y-2">
                {addons.map((a, idx) => (
                  <div
                    key={a.id || idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-amber-300 transition-all shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          ID: {a.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Single Add-on Quick Translation */}
                        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-md p-0.5">
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleAddon(idx, 'en_to_bn')}
                            disabled={singleItemTranslating !== null}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                            title="Translate add-on: English ➔ Bengali"
                          >
                            {singleItemTranslating?.type === 'addon' && singleItemTranslating?.index === idx && singleItemTranslating?.dir === 'en_to_bn' ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-[#c08a46]" />
                            ) : (
                              <Languages className="w-2.5 h-2.5 text-[#c08a46]" />
                            )}
                            <span>EN ➔ বাংলা</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTranslateSingleAddon(idx, 'bn_to_en')}
                            disabled={singleItemTranslating !== null}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                            title="Translate add-on: Bengali ➔ English"
                          >
                            {singleItemTranslating?.type === 'addon' && singleItemTranslating?.index === idx && singleItemTranslating?.dir === 'bn_to_en' ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
                            ) : (
                              <Bot className="w-2.5 h-2.5 text-blue-600" />
                            )}
                            <span>বাংলা ➔ EN</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveAddon(idx, 'up')}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === addons.length - 1}
                          onClick={() => handleMoveAddon(idx, 'down')}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAddon(idx)}
                          className="p-1 rounded-md bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                          title="Delete Add-on"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center rounded-lg bg-white border border-slate-200 focus-within:border-[#c08a46] focus-within:ring-1 focus-within:ring-[#c08a46] transition-colors">
                        <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold uppercase text-slate-400 select-none shrink-0">
                          EN
                        </span>
                        <input
                          type="text"
                          value={a.labelEn || ''}
                          onChange={(e) => handleUpdateAddon(idx, 'labelEn', e.target.value)}
                          placeholder="Ambient LED Backlight"
                          className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                        />
                      </div>
                      <div className="flex items-center rounded-lg bg-white border border-emerald-200/90 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-colors">
                        <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold text-emerald-700 select-none shrink-0">
                          বাংলা
                        </span>
                        <input
                          type="text"
                          value={a.labelBn || ''}
                          onChange={(e) => handleUpdateAddon(idx, 'labelBn', e.target.value)}
                          placeholder="অ্যাম্বিয়েন্ট LED ব্যাকলাইটিং"
                          className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compact Add Addon Form */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#c08a46]" /> Add New Add-on
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTranslateNewAddon('en_to_bn')}
                      disabled={newFormTranslating !== null}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-white hover:bg-amber-100 border border-amber-200 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Translate add-on label: EN ➔ বাংলা"
                    >
                      {newFormTranslating?.type === 'addon' && newFormTranslating?.dir === 'en_to_bn' ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-[#c08a46]" />
                      ) : (
                        <Languages className="w-2.5 h-2.5 text-[#c08a46]" />
                      )}
                      <span>Translate (EN ➔ বাংলা)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTranslateNewAddon('bn_to_en')}
                      disabled={newFormTranslating !== null}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-800 bg-white hover:bg-blue-100 border border-blue-200 flex items-center gap-0.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Translate add-on label: বাংলা ➔ EN"
                    >
                      {newFormTranslating?.type === 'addon' && newFormTranslating?.dir === 'bn_to_en' ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
                      ) : (
                        <Bot className="w-2.5 h-2.5 text-blue-600" />
                      )}
                      <span>Translate (বাংলা ➔ EN)</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newAddonId}
                    onChange={(e) => setNewAddonId(e.target.value)}
                    placeholder="ID (e.g. sound-box)"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#c08a46]"
                  />
                  <input
                    type="text"
                    value={newAddonLabelEn}
                    onChange={(e) => setNewAddonLabelEn(e.target.value)}
                    placeholder="English Label"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#c08a46]"
                  />
                  <input
                    type="text"
                    value={newAddonLabelBn}
                    onChange={(e) => setNewAddonLabelBn(e.target.value)}
                    placeholder="বাংলা লেবেল"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="px-3 py-1.5 rounded-lg bg-[#c08a46] hover:bg-[#a67435] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── SUB-TAB 4: MODAL HEADINGS ────────────────── */}
          {activeSubTab === 'headings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-[#c08a46]" /> Modal Titles & Headings
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Custom copy displayed in the popup header for English and Bengali.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleTranslateHeadings('en_to_bn')}
                    disabled={subTabTranslateLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Translate headings: English ➔ Bengali"
                  >
                    {subTabTranslateLoading === 'headings_en_to_bn' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#c08a46]" />
                    ) : (
                      <Wand2 className="w-3 h-3 text-[#c08a46]" />
                    )}
                    <span>EN ➔ বাংলা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTranslateHeadings('bn_to_en')}
                    disabled={subTabTranslateLoading !== null}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    title="Translate headings: Bengali ➔ English"
                  >
                    {subTabTranslateLoading === 'headings_bn_to_en' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    ) : (
                      <Bot className="w-3 h-3 text-blue-600" />
                    )}
                    <span>বাংলা ➔ EN</span>
                  </button>
                </div>
              </div>

              {/* English Headings Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    English Modal Headings (EN)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTranslateHeadings('en_to_bn')}
                    disabled={subTabTranslateLoading !== null}
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    title="Translate English headings to Bengali"
                  >
                    {subTabTranslateLoading === 'headings_en_to_bn' ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-[#c08a46]" />
                    ) : (
                      <Languages className="w-2.5 h-2.5 text-[#c08a46]" />
                    )}
                    <span>Translate to বাংলা ➔</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center rounded-lg bg-white border border-slate-200 focus-within:border-[#c08a46] focus-within:ring-1 focus-within:ring-[#c08a46] transition-colors">
                    <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold text-slate-400 select-none shrink-0">
                      Title
                    </span>
                    <input
                      type="text"
                      value={settings.custom_map_modal_title_en || ''}
                      onChange={(e) => handleChange('custom_map_modal_title_en', e.target.value)}
                      placeholder="Custom Wooden Map Request"
                      className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                    />
                  </div>
                  <div className="flex items-center rounded-lg bg-white border border-slate-200 focus-within:border-[#c08a46] focus-within:ring-1 focus-within:ring-[#c08a46] transition-colors">
                    <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold text-slate-400 select-none shrink-0">
                      Subtitle
                    </span>
                    <input
                      type="text"
                      value={settings.custom_map_modal_subtitle_en || ''}
                      onChange={(e) => handleChange('custom_map_modal_subtitle_en', e.target.value)}
                      placeholder="Choose your preferred size, stain finish & custom add-ons"
                      className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                    />
                  </div>
                </div>
              </div>

              {/* Bengali Headings Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    বাংলা হেডলাইন ও সাবটাইটেল (BN)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTranslateHeadings('bn_to_en')}
                    disabled={subTabTranslateLoading !== null}
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    title="Translate Bengali headings to English"
                  >
                    {subTabTranslateLoading === 'headings_bn_to_en' ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-600" />
                    ) : (
                      <Bot className="w-2.5 h-2.5 text-blue-600" />
                    )}
                    <span>Translate to English ➔</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center rounded-lg bg-white border border-emerald-200 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-colors">
                    <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold text-emerald-700 select-none shrink-0">
                      টাইটেল
                    </span>
                    <input
                      type="text"
                      value={settings.custom_map_modal_title_bn || ''}
                      onChange={(e) => handleChange('custom_map_modal_title_bn', e.target.value)}
                      placeholder="কাস্টম কাঠের ম্যাপ রিকোয়েস্ট"
                      className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                    />
                  </div>
                  <div className="flex items-center rounded-lg bg-white border border-emerald-200 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-colors">
                    <span className="pl-2.5 pr-2 py-1.5 text-[10px] font-bold text-emerald-700 select-none shrink-0">
                      সাবটাইটেল
                    </span>
                    <input
                      type="text"
                      value={settings.custom_map_modal_subtitle_bn || ''}
                      onChange={(e) => handleChange('custom_map_modal_subtitle_bn', e.target.value)}
                      placeholder="আপনার পছন্দ অনুযায়ী সাইজ, কালার ও স্পেশাল ফিচার সিলেক্ট করুন"
                      className="flex-1 pr-2.5 py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none min-w-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: STICKY LIVE CUSTOMER MODAL PREVIEW (xl:col-span-5) */}
        {/* ========================================================================= */}
        <div className="order-2 xl:order-2 xl:col-span-5 xl:sticky xl:top-6 space-y-3">
          {/* Preview Header & Language Toggle */}
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#c08a46]" />
                <span>Live Customer Preview</span>
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setPreviewLang('bn')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  previewLang === 'bn' ? 'bg-[#c08a46] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  previewLang === 'en' ? 'bg-[#c08a46] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Modal Mockup Frame */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-4 space-y-4 shadow-lg shadow-stone-900/5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#c08a46] border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#c08a46]" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-extrabold text-stone-900 truncate">
                    {previewLang === 'bn'
                      ? settings.custom_map_modal_title_bn || 'কাস্টম কাঠের ম্যাপ রিকোয়েস্ট'
                      : settings.custom_map_modal_title_en || 'Custom Wooden Map Request'}
                  </h5>
                  <p className="text-[10px] text-stone-500 truncate">
                    {previewLang === 'bn'
                      ? settings.custom_map_modal_subtitle_bn ||
                        'আপনার পছন্দ অনুযায়ী সাইজ, কালার ও স্পেশাল ফিচার সিলেক্ট করুন'
                      : settings.custom_map_modal_subtitle_en ||
                        'Choose your preferred size, stain finish & custom add-ons'}
                  </p>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                <X className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 1. Preferred Size Section */}
            <div className={`space-y-1.5 p-2 rounded-xl transition-all ${
              activeSubTab === 'sizes' ? 'bg-amber-50/50 ring-1 ring-amber-300/70' : ''
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-[#c08a46]" />
                  <span>{previewLang === 'bn' ? 'পছন্দের সাইজ ও পরিমাপ' : 'Preferred Size & Dimensions'}</span>
                </span>
                {activeSubTab === 'sizes' && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                    Editing Now
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {sizes.map((s) => {
                  const isSelected = simSelectedSize === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSimSelectedSize(s.id)}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between text-[11px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#c08a46] bg-amber-50 text-[#966427] ring-1 ring-[#c08a46]/30'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="truncate">{previewLang === 'bn' ? s.labelBn : s.labelEn}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#c08a46] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {simSelectedSize === 'custom' && (
                <div className="p-2 rounded-lg bg-amber-100/40 border border-amber-200/80 text-[10px] text-stone-600 mt-1 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-[#c08a46]" />
                  <span>{previewLang === 'bn' ? 'দেয়ালের পরিমাপ ইনপুট বক্স উন্মুক্ত হবে' : 'Custom wall dimensions box opens'}</span>
                </div>
              )}
            </div>

            {/* 2. Wood Stain Section */}
            <div className={`space-y-1.5 p-2 rounded-xl transition-all ${
              activeSubTab === 'colors' ? 'bg-amber-50/50 ring-1 ring-amber-300/70' : ''
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-[#c08a46]" />
                  <span>{previewLang === 'bn' ? 'কাঠের কালার ও ফিনিশ' : 'Wood Stain & Finish'}</span>
                </span>
                {activeSubTab === 'colors' && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                    Editing Now
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {colors.map((c) => {
                  const isSelected = simSelectedColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSimSelectedColor(c.id)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 text-[11px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#c08a46] bg-amber-50 text-[#966427] ring-1 ring-[#c08a46]/30'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate flex-1">{previewLang === 'bn' ? c.nameBn : c.nameEn}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#c08a46] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Add-ons Section */}
            <div className={`space-y-1.5 p-2 rounded-xl transition-all ${
              activeSubTab === 'addons' ? 'bg-amber-50/50 ring-1 ring-amber-300/70' : ''
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#c08a46]" />
                  <span>{previewLang === 'bn' ? 'বিশেষ ফিচার বা অ্যাড-অন' : 'Special Add-ons & Extras'}</span>
                </span>
                {activeSubTab === 'addons' && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                    Editing Now
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {addons.map((a) => {
                  const isChecked = simSelectedAddons.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleSimAddon(a.id)}
                      className={`p-1.5 rounded-lg border text-left flex items-center justify-between text-[10px] font-medium transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#c08a46] bg-amber-50/70 text-stone-900 ring-1 ring-[#c08a46]/30'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate pr-1">{previewLang === 'bn' ? a.labelBn : a.labelEn}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-[#c08a46] border-[#c08a46] text-white' : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Submit Button */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[10px] text-stone-400">
                {previewLang === 'bn' ? 'কাস্টম কোটেশন রিকোয়েস্ট' : 'Request Custom Quote'}
              </span>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8E5A35] to-[#c08a46] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-default"
              >
                <Send className="w-3 h-3" />
                <span>{previewLang === 'bn' ? 'রিকোয়েস্ট পাঠান' : 'Submit Request'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CustomMapSettingsSection;
