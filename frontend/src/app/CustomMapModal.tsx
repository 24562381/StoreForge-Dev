'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Sparkles, Send, CheckCircle2, Upload, AlertCircle, User, Palette, Ruler, Check } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useSettings } from '@/lib/SettingsContext';
import { fetchApi } from '@/lib/api';

interface CustomMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSize?: string;
  defaultColor?: string;
  settings?: Record<string, string>;
}

export const DEFAULT_SIZE_PRESETS = [
  { id: 'M', labelBn: 'M — ১০০ × ৬০ সেমি (৩৯ × ২৪ ইঞ্চি)', labelEn: 'M — 100 × 60 cm (39 × 24 in)' },
  { id: 'L', labelBn: 'L — ১৫০ × ৯০ সেমি (৫৯ × ৩৫ ইঞ্চি)', labelEn: 'L — 150 × 90 cm (59 × 35 in)' },
  { id: 'XL', labelBn: 'XL — ২০০ × ১২০ সেমি (৭৯ × ৪৭ ইঞ্চি)', labelEn: 'XL — 200 × 120 cm (79 × 47 in)' },
  { id: 'custom', labelBn: 'কাস্টম সাইজ (দেয়ালের পরিমাপ অনুযায়ী)', labelEn: 'Custom Dimensions (Tailored to Wall)' },
];

export const DEFAULT_COLOR_PRESETS = [
  { id: 'natural-multi', nameBn: 'মাল্টি-কালার ক্লাসিক (Multi-Color)', nameEn: 'Natural Multi-Color Classic', hex: '#8E5A35' },
  { id: 'dark-walnut', nameBn: 'ডার্ক ওয়ালনাট (Dark Walnut)', nameEn: 'Dark Walnut Stain', hex: '#3D271D' },
  { id: 'smoked-oak', nameBn: 'স্মোকড ওক (Smoked Oak)', nameEn: 'Smoked Oak Tone', hex: '#5C4033' },
  { id: 'terra-tone', nameBn: 'টেরা স্পেশাল (Terra Tone)', nameEn: 'Terra Warm Brown', hex: '#A0522D' },
  { id: 'custom-mix', nameBn: 'অন্যান্য কাস্টম কম্বিনেশন', nameEn: 'Custom Color Blend', hex: '#2B2B2B' },
];

export const DEFAULT_POPULAR_ADDONS = [
  { id: 'led', labelBn: 'অ্যাম্বিয়েন্ট LED ব্যাকলাইটিং', labelEn: 'Ambient LED Backlight' },
  { id: 'pins', labelBn: 'মেটাল কান্ট্রি ও প্লেন পিনস', labelEn: 'Metal Pins & Planes Set' },
  { id: 'engraving', labelBn: 'পারিবারিক নাম বা লোগো খোদাই', labelEn: 'Custom Name / Logo Engraving' },
  { id: 'islands', labelBn: 'অতিরিক্ত দ্বীপপুঞ্জ সেট (Extra Islands)', labelEn: 'Extra Island Pack' },
];

const BUDGET_RANGES = [
  { id: '', labelBn: 'বাজেট বেছে নিন (ঐচ্ছিক)', labelEn: 'Select Budget Range (Optional)' },
  { id: '4k-8k', labelBn: '৳ ৪,০০০ — ৳ ৮,০০০', labelEn: 'BDT 4,000 — 8,000' },
  { id: '8k-15k', labelBn: '৳ ৮,০০০ — ৳ ১৫,০০০', labelEn: 'BDT 8,000 — 15,000' },
  { id: '15k-25k', labelBn: '৳ ১৫,০০০ — ৳ ২৫,০০০', labelEn: 'BDT 15,000 — 25,000' },
  { id: '25k-plus', labelBn: '৳ ২৫,০০০+', labelEn: 'BDT 25,000+' },
];

export const CustomMapModal = React.memo(function CustomMapModal({
  isOpen,
  onClose,
  defaultSize,
  defaultColor,
  settings: propSettings,
}: CustomMapModalProps) {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { settings: ctxSettings } = useSettings();
  const activeSettings = propSettings || ctxSettings || {};

  // Resolve dynamic options configured via Admin Settings page
  const sizes = useMemo(() => {
    try {
      if (activeSettings.custom_map_sizes_json) {
        const parsed = JSON.parse(activeSettings.custom_map_sizes_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse custom_map_sizes_json', e);
    }
    return DEFAULT_SIZE_PRESETS;
  }, [activeSettings.custom_map_sizes_json]);

  const colors = useMemo(() => {
    try {
      if (activeSettings.custom_map_colors_json) {
        const parsed = JSON.parse(activeSettings.custom_map_colors_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse custom_map_colors_json', e);
    }
    return DEFAULT_COLOR_PRESETS;
  }, [activeSettings.custom_map_colors_json]);

  const addons = useMemo(() => {
    try {
      if (activeSettings.custom_map_addons_json) {
        const parsed = JSON.parse(activeSettings.custom_map_addons_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse custom_map_addons_json', e);
    }
    return DEFAULT_POPULAR_ADDONS;
  }, [activeSettings.custom_map_addons_json]);

  const modalTitle = isBn
    ? activeSettings.custom_map_modal_title_bn || 'কাস্টম কাঠের ম্যাপ রিকোয়েস্ট'
    : activeSettings.custom_map_modal_title_en || 'Custom Wooden Map Request';

  const modalSubtitle = isBn
    ? activeSettings.custom_map_modal_subtitle_bn ||
      'আপনার পছন্দ অনুযায়ী সাইজ, কালার ও স্পেশাল ফিচার সিলেক্ট করুন'
    : activeSettings.custom_map_modal_subtitle_en ||
      'Choose your preferred size, stain finish & custom add-ons';

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedSize, setSelectedSize] = useState(defaultSize || 'L');
  const [customDimensions, setCustomDimensions] = useState('');
  const [selectedColor, setSelectedColor] = useState(
    defaultColor || (isBn ? 'মাল্টি-কালার ক্লাসিক (Multi-Color)' : 'Natural Multi-Color Classic')
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');

  // UI status
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize defaults if props or dynamic options change
  useEffect(() => {
    if (defaultSize) {
      const match = sizes.find(
        (s: any) => s.id === defaultSize || s.labelEn === defaultSize || s.labelBn === defaultSize
      );
      setSelectedSize(match ? match.id : defaultSize);
    } else if (!selectedSize && sizes.length > 0) {
      setSelectedSize(sizes[0].id);
    }

    if (defaultColor) {
      setSelectedColor(defaultColor);
    } else if (!selectedColor && colors.length > 0) {
      setSelectedColor(isBn ? colors[0].nameBn || colors[0].nameEn : colors[0].nameEn || colors[0].nameBn);
    }
  }, [defaultSize, defaultColor, sizes, colors, isBn]);

  // Lock background scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন' : 'Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(isBn ? 'ছবির সর্বোচ্চ সাইজ ৫ মেগাবাইট (5MB)' : 'Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/uploads/reference', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      if (data?.imageUrl) {
        setReferenceImageUrl(data.imageUrl);
      }
    } catch {
      setErrorMessage(isBn ? 'ছবি আপলোড ব্যর্থ হয়েছে, আবার চেষ্টা করুন' : 'Image upload failed, please retry');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage(isBn ? 'আপনার নাম লিখুন' : 'Please provide your name');
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(isBn ? 'সঠিক মোবাইল নম্বর লিখুন' : 'Please provide a valid phone number');
      return;
    }

    if (!customerAddress.trim()) {
      setErrorMessage(isBn ? 'ডেলিভারি ঠিকানা প্রদান করুন' : 'Please provide your delivery address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail.trim())) {
      setErrorMessage(isBn ? 'সঠিক ইমেইল অ্যাড্রেস প্রদান করুন' : 'Please provide a valid email address');
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        isBn
          ? 'অনুগ্রহ করে আপনার বিশেষ অনুরোধ বা বিবরণ লিখুন'
          : 'Please provide your customization requirements or notes'
      );
      return;
    }

    setSubmitting(true);

    try {
      const foundSize = sizes.find((s: any) => s.id === selectedSize);
      const resolvedSize =
        selectedSize === 'custom' && customDimensions.trim()
          ? `Custom: ${customDimensions.trim()}`
          : foundSize
          ? (isBn ? foundSize.labelBn : foundSize.labelEn)
          : selectedSize;

      const addonsText =
        selectedAddons.length > 0
          ? `\n\n[Add-ons]: ` +
            selectedAddons
              .map((id) => {
                const a = addons.find((p: any) => p.id === id);
                return a ? (isBn ? a.labelBn || a.labelEn : a.labelEn || a.labelBn) : id;
              })
              .join(', ')
          : '';

      const fullDescription = `${description.trim()}${addonsText}`;

      await fetchApi('/customizations', {
        method: 'POST',
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim(),
          customerAddress: customerAddress.trim(),
          preferredSize: resolvedSize,
          preferredColor: selectedColor,
          description: fullDescription || (isBn ? 'কাস্টম অর্ডার রিকোয়েস্ট' : 'Custom order request'),
          referenceImage: referenceImageUrl || undefined,
          estimatedBudget: estimatedBudget || undefined,
        }),
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || (isBn ? 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে, আবার চেষ্টা করুন' : 'Failed to submit request, please retry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Simple, Bright & Clean */}
        <div className="relative px-5 sm:px-8 py-4 sm:py-5 bg-white border-b border-stone-150 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 text-[#c08a46] border border-amber-200/50 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#c08a46]" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-stone-800 tracking-tight">
                  {modalTitle}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 font-normal">
                  {modalSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {submittedSuccess ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-stone-900">
                {isBn ? 'রিকোয়েস্টটি সফলভাবে জমা হয়েছে!' : 'Request Submitted Successfully!'}
              </h4>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {isBn
                  ? 'ধন্যবাদ! আমাদের এক্সক্লুসিভ টিম শীঘ্রই আপনার সাথে যোগাযোগ করে কাস্টমাইজেশনের মাপ ও ড্রয়িং নিশ্চিত করবে।'
                  : 'Thank you! Our artisan studio will contact you shortly to confirm dimensions, stain preview, and quote.'}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#c08a46] text-white font-bold text-sm hover:bg-[#a67435] transition-all shadow-md cursor-pointer"
                >
                  {isBn ? 'ঠিক আছে' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            {/* Modal Body / Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-7">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Customer Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <User className="w-4 h-4 text-[#c08a46]" />
                  <span>{isBn ? 'আপনার যোগাযোগের বিবরণ' : 'Contact Information'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'আপনার নাম' : 'Full Name'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={150}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={isBn ? 'যেমন: মোহাম্মদ তানভীর' : 'e.g. Tanvir Ahmed'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46] focus:ring-2 focus:ring-[#c08a46]/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold text-xs pointer-events-none">
                        +88
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={30}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46] focus:ring-2 focus:ring-[#c08a46]/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'ডেলিভারি ঠিকানা / জেলা' : 'Delivery Address / City'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={500}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder={isBn ? 'যেমন: বাড়ি ১২, রোড ৫, উত্তরা, ঢাকা' : 'e.g. House 12, Road 5, Uttara, Dhaka'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46] focus:ring-2 focus:ring-[#c08a46]/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      maxLength={150}
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46] focus:ring-2 focus:ring-[#c08a46]/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Preferred Size */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Ruler className="w-4 h-4 text-[#c08a46]" />
                  <span>{isBn ? 'পছন্দের সাইজ ও পরিমাপ' : 'Preferred Size & Dimensions'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {sizes.map((s: any) => {
                    const isSelected = selectedSize === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSize(s.id)}
                        className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer hover:shadow-xs ${
                          isSelected
                            ? 'border-[#c08a46] bg-amber-50/60 shadow-xs ring-1 ring-[#c08a46]/30'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <span className="text-xs font-bold text-stone-800">
                          {isBn ? s.labelBn || s.labelEn : s.labelEn || s.labelBn}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#c08a46] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedSize === 'custom' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      maxLength={100}
                      value={customDimensions}
                      onChange={(e) => setCustomDimensions(e.target.value)}
                      placeholder={isBn ? 'যেমন: ১২ ফুট × ৭ ফুট অথবা ২৫০ × ১৫০ সেমি' : 'e.g. 10 ft x 6 ft or 250 x 140 cm'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 text-stone-900 text-xs font-medium focus:outline-none focus:border-[#c08a46] focus:ring-2 focus:ring-[#c08a46]/10"
                    />
                  </div>
                )}
              </div>

              {/* 3. Wood Color & Stain */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Palette className="w-4 h-4 text-[#c08a46]" />
                  <span>{isBn ? 'কাঠের কালার ও ফিনিশ' : 'Wood Stain & Finish'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {colors.map((c: any) => {
                    const label = isBn ? c.nameBn || c.nameEn : c.nameEn || c.nameBn;
                    const isSelected =
                      selectedColor === label ||
                      selectedColor === c.nameEn ||
                      selectedColor === c.nameBn ||
                      selectedColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(label)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer hover:shadow-xs ${
                          isSelected
                            ? 'border-[#c08a46] bg-amber-50/60 shadow-xs ring-1 ring-[#c08a46]/30'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-black/10 shrink-0 shadow-xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-bold text-stone-800 flex-1 truncate">
                          {label}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#c08a46] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Special Custom Features (Add-ons) */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Sparkles className="w-4 h-4 text-[#c08a46]" />
                  <span>{isBn ? 'বিশেষ ফিচার বা অ্যাড-অন (ঐচ্ছিক)' : 'Special Add-ons & Extras (Optional)'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {addons.map((addon: any) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer hover:shadow-xs ${
                          isChecked
                            ? 'border-[#c08a46] bg-amber-50/50 text-stone-900 ring-1 ring-[#c08a46]/30'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/60 text-stone-700'
                        }`}
                      >
                        <span className="text-xs font-semibold pr-2">
                          {isBn ? addon.labelBn || addon.labelEn : addon.labelEn || addon.labelBn}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? 'bg-[#c08a46] border-[#c08a46] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Instructions & Reference Photo / Budget */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
                <div className="lg:col-span-7 space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-stone-700">
                    {isBn
                      ? 'আপনার বিশেষ অনুরোধ বা বিবরণ লিখুন'
                      : 'Customization Requirements & Notes'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={4000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      isBn
                        ? 'দেয়ালের ব্যাকগ্রাউন্ড রঙ, বিশেষ কোনো লেখা খোদাই বা অন্য কোনো নির্দিষ্ট পছন্দ থাকলে লিখুন...'
                        : 'Provide details about your wall color, custom laser engraving text, delivery timeline, etc...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#c08a46] focus:ring-2 focus:ring-[#c08a46]/10 transition-all h-[116px] resize-none"
                  />
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                  {/* Reference Photo */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                      <span>{isBn ? 'রেফারেন্স / দেয়ালের ছবি (ঐচ্ছিক)' : 'Reference / Wall Photo'}</span>
                      {uploadingImage && <span className="text-[10px] text-amber-600 font-bold">Uploading...</span>}
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {referenceImageUrl ? (
                      <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
                        <img
                          src={referenceImageUrl}
                          alt="Reference"
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>{isBn ? 'ছবি সংযুক্ত হয়েছে' : 'Photo Attached'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setReferenceImageUrl('')}
                            className="text-[11px] text-rose-500 hover:underline font-semibold cursor-pointer"
                          >
                            {isBn ? 'মুছে ফেলুন' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-xl border border-dashed border-stone-300 hover:border-[#c08a46] text-stone-600 hover:text-stone-900 text-xs font-semibold flex items-center justify-center gap-2 bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-stone-400" />
                        <span>{isBn ? 'ছবি সিলেক্ট করুন' : 'Attach Photo'}</span>
                      </button>
                    )}
                  </div>

                  {/* Estimated Budget */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
                      {isBn ? 'আনুমানিক বাজেট (ঐচ্ছিক)' : 'Budget Range (Optional)'}
                    </label>
                    <select
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46] cursor-pointer"
                    >
                      {BUDGET_RANGES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {isBn ? b.labelBn : b.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Action Buttons */}
            <div className="px-5 sm:px-8 py-3.5 sm:py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs sm:text-sm hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-[#c08a46] hover:bg-[#a67435] text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isBn ? 'কাস্টম রিকোয়েস্ট পাঠান' : 'Submit Custom Request'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

export default CustomMapModal;
