'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ShieldCheck, FileText, RotateCcw, Check } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { PoliciesHeader } from './PoliciesHeader';
import { PolicyTabNav, PolicyPageConfig } from './PolicyTabNav';
import { PolicyEditorSection } from './PolicyEditorSection';

export const POLICY_PAGES: PolicyPageConfig[] = [
  {
    id: 'privacy',
    label: 'Privacy Policy',
    labelBn: 'গোপনীয়তা নীতি',
    icon: ShieldCheck,
    slug: '/privacy',
    titleKeyBn: 'policy_privacy_title_bn',
    titleKeyEn: 'policy_privacy_title_en',
    subKeyBn: 'policy_privacy_sub_bn',
    subKeyEn: 'policy_privacy_sub_en',
    contentKeyBn: 'policy_privacy_content_bn',
    contentKeyEn: 'policy_privacy_content_en',
    defaultTitleBn: 'গোপনীয়তা নীতি',
    defaultTitleEn: 'Privacy Policy',
    defaultSubBn: 'আপনার তথ্যের সর্বোচ্চ নিরাপত্তা এবং সুরক্ষা নিশ্চিত করতে আমরা দায়বদ্ধ।',
    defaultSubEn: 'We are committed to safeguarding your personal data and privacy.',
    defaultContentBn: `### ১. তথ্যের গোপনীয়তা ও সুরক্ষা
আমরা গ্রাহকের নাম, ফোন নম্বর, ঠিকানা এবং ডেলিভারির তথ্য শুধুমাত্র পণ্য ডেলিভারি এবং কাস্টমার সাপোর্টের জন্য ব্যবহার করি। কোনো অবস্থাতেই আপনার তথ্য তৃতীয় কোনো পক্ষের সাথে বাণিজ্যিক উদ্দেশ্যে শেয়ার করা হয় না।

### ২. পেমেন্ট ও লেনদেন নিরাপত্তা
ক্যাশ অন ডেলিভারি অর্ডারে পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা দেওয়া হয়। অনলাইন বিকাশ পেমেন্টের ক্ষেত্রে বিকাশ গেটওয়ের অফিসিয়াল সিকিউরিটি ফ্রেমওয়ার্ক অনুযায়ী এনক্রিপ্টেড চ্যানেলে লেনদেন সম্পন্ন হয়।

### ৩. কুকিজ ও এনালিটিক্স
আমাদের ওয়েবসাইটে আপনার ব্রাউজিং অভিজ্ঞতা আরও দ্রুত ও মসৃণ করার জন্য প্রয়োজনীয় কুকিজ ব্যবহৃত হয়। আপনি চাইলে যেকোনো সময় আপনার ব্রাউজার সেটিংস থেকে এটি নিয়ন্ত্রণ করতে পারেন।`,
    defaultContentEn: `### 1. Information Privacy & Protection
We only collect customer name, phone number, shipping address, and delivery notes exclusively for order dispatch and customer support. We never sell or share your personal data with any third party for marketing.

### 2. Payment & Transaction Security
For Cash on Delivery, you pay only after safely inspecting your parcel. For online bKash payments, transactions are processed securely via official encrypted SSL gateways.

### 3. Cookies Policy
Our website uses standard essential cookies to maintain your shopping cart state and improve your shopping experience.`
  },
  {
    id: 'terms',
    label: 'Terms & Conditions',
    labelBn: 'ব্যবহারের শর্তাবলী',
    icon: FileText,
    slug: '/terms',
    titleKeyBn: 'policy_terms_title_bn',
    titleKeyEn: 'policy_terms_title_en',
    subKeyBn: 'policy_terms_sub_bn',
    subKeyEn: 'policy_terms_sub_en',
    contentKeyBn: 'policy_terms_content_bn',
    contentKeyEn: 'policy_terms_content_en',
    defaultTitleBn: 'ব্যবহারের শর্তাবলী',
    defaultTitleEn: 'Terms & Conditions',
    defaultSubBn: 'প্ল্যাটফর্ম ব্যবহার ও কেনাকাটার আনুষ্ঠানিক নিয়মাবলী।',
    defaultSubEn: 'Terms and guidelines for ordering and using the StoreForge platform.',
    defaultContentBn: `### ১. অর্ডার ও ডেলিভারি শর্ত
অর্ডার করার পর আমাদের কাস্টমার কেয়ার প্রতিনিধি ফোন কলের মাধ্যমে অর্ডার নিশ্চিত করেন। ঢাকায় ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৪ দিনের মধ্যে ডেলিভারি সম্পন্ন করা হয়।

### ২. পণ্যের মান ও ওয়ারেন্টি
আমাদের প্রতিটি ম্যাপ ১০০% প্রাকৃতিক বার্চ কাঠের তৈরি। প্রাকৃতিক কাঠের কারণে প্রতিটি পণ্যের টেক্সচার ও শেডে সামান্য বৈচিত্র্য থাকতে পারে যা কাঠের প্রাকৃতিক সৌন্দর্যের অংশ।

### ৩. অর্ডার বাতিল ও পরিবর্তন
অর্ডার নিশ্চিত হওয়ার পর পার্সেল কুরিয়ারে হস্তান্তরের পূর্ব পর্যন্ত যেকোনো সময় আপনি ফোন করে অর্ডার বাতিল বা পরিবর্তন করতে পারবেন।`,
    defaultContentEn: `### 1. Orders & Delivery Timeline
Once an order is placed, our support team confirms the order by phone. We deliver within 24-48 hours in Dhaka and 2-4 days nationwide across Bangladesh.

### 2. Craftsmanship & Quality
Each wooden map is handcrafted from 100% natural birch wood. Natural wood grain variations and subtle shade tones are inherent features of handcrafted timber art.

### 3. Cancellation Policy
You can modify or cancel your order anytime before it has been dispatched with our courier partner by contacting our helpline.`
  },
  {
    id: 'returns',
    label: 'Return & Refund Policy',
    labelBn: 'রিটার্ন ও রিফান্ড নীতি',
    icon: RotateCcw,
    slug: '/return-policy',
    titleKeyBn: 'policy_returns_title_bn',
    titleKeyEn: 'policy_returns_title_en',
    subKeyBn: 'policy_returns_sub_bn',
    subKeyEn: 'policy_returns_sub_en',
    contentKeyBn: 'policy_returns_content_bn',
    contentKeyEn: 'policy_returns_content_en',
    defaultTitleBn: 'রিটার্ন ও রিফান্ড নীতি',
    defaultTitleEn: 'Return & Replacement Policy',
    defaultSubBn: 'ক্ষতিগ্রস্ত পণ্যে ১০০% ইনস্ট্যান্ট ফ্রি রিপ্লেসমেন্ট সুবিধা।',
    defaultSubEn: '100% free damage replacement and guaranteed refund protection.',
    defaultContentBn: `### ১. ফ্রি ইনস্ট্যান্ট রিপ্লেসমেন্ট
কুরিয়ারে কোনো অংশ ভেঙে গেলে বা ক্ষতিগ্রস্ত হলে ডেলিভারিম্যানের সামনে চেক করে অথবা পার্সেল পাওয়ার ২৪ ঘণ্টার মধ্যে আমাদের ছবি/ভিডিও পাঠালে তাৎক্ষণিকভাবে সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট প্রদান করা হয়।

### ২. রিফান্ড সুবিধা
বিকাশে অগ্রিম পেমেন্ট করার পর অর্ডার বাতিল হলে বা স্টক না থাকলে ৩ কার্যদিবসের মধ্যে একই বিকাশ অ্যাকাউন্টে রিফান্ড সম্পন্ন করা হয়।

### ৩. রিটার্ন প্রক্রিয়া
পণ্য ফেরত বা রিপ্লেসমেন্টের জন্য আমাদের হেল্পলাইন নম্বরে যোগাযোগ করুন। আমাদের টিম দ্রুততম সময়ে নতুন পণ্য পৌঁছে দেওয়ার ব্যবস্থা করবে।`,
    defaultContentEn: `### 1. Free Instant Replacement
If any map piece is damaged during transit, inspect it before payment or notify us with a photo within 24 hours of delivery. We will immediately dispatch a brand-new replacement completely free of charge.

### 2. Full Refund Policy
If an online pre-payment was made and an order is cancelled or out of stock, full refund is issued back to your bKash/bank account within 3 business days.

### 3. Hassle-Free Support
Call or WhatsApp our helpline to initiate a replacement request. Our team will handle everything seamlessly.`
  }
];

export default function Wrapper() {
  const { showSuccess, showError } = useAdminModal();
  const [activeTab, setActiveTab] = useState('privacy');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatingDirection, setTranslatingDirection] = useState<'bn' | 'en' | null>(null);
  const [polishing, setPolishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentPage = useMemo(() => {
    return POLICY_PAGES.find((p) => p.id === activeTab) || POLICY_PAGES[0];
  }, [activeTab]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/settings/admin');
      const map: Record<string, string> = {};
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          map[item.key] = item.value;
        });
      } else if (data && typeof data === 'object') {
        Object.assign(map, data);
      }
      setSettings(map);
    } catch (err) {
      console.error('Failed to load policy settings', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleFieldChange = useCallback((key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetchApi('/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      showSuccess(`${currentPage.label} saved successfully!`);
    } catch (err: any) {
      showError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [settings, currentPage.label, showSuccess, showError]);

  const handleAiTranslate = async (targetLang: 'bn' | 'en') => {
    const isToBn = targetLang === 'bn';
    const srcTitleKey = isToBn ? currentPage.titleKeyEn : currentPage.titleKeyBn;
    const srcSubKey = isToBn ? currentPage.subKeyEn : currentPage.subKeyBn;
    const srcContentKey = isToBn ? currentPage.contentKeyEn : currentPage.contentKeyBn;

    const destTitleKey = isToBn ? currentPage.titleKeyBn : currentPage.titleKeyEn;
    const destSubKey = isToBn ? currentPage.subKeyBn : currentPage.subKeyEn;
    const destContentKey = isToBn ? currentPage.contentKeyBn : currentPage.contentKeyEn;

    const srcTitle = settings[srcTitleKey] ?? (isToBn ? currentPage.defaultTitleEn : currentPage.defaultTitleBn);
    const srcSub = settings[srcSubKey] ?? (isToBn ? currentPage.defaultSubEn : currentPage.defaultSubBn);
    const srcContent = settings[srcContentKey] ?? (isToBn ? currentPage.defaultContentEn : currentPage.defaultContentBn);

    setTranslating(true);
    setTranslatingDirection(targetLang);

    try {
      const prompt = isToBn
        ? `You are an expert e-commerce legal copywriter. Translate the following English legal policy page (Title, Subtitle, and Full Content) into natural, professional, and clear Bengali (বাংলা).
Format the content with proper headings and paragraphs matching the original structure.

Source English:
${JSON.stringify({ title: srcTitle, subtitle: srcSub, content: srcContent })}

Return strictly valid JSON with keys: "title", "subtitle", "content".`
        : `You are an expert e-commerce legal copywriter. Translate the following Bengali legal policy page (Title, Subtitle, and Full Content) into fluent, professional, and clear legal English.
Format the content with proper headings and paragraphs matching the original structure.

Source Bengali:
${JSON.stringify({ title: srcTitle, subtitle: srcSub, content: srcContent })}

Return strictly valid JSON with keys: "title", "subtitle", "content".`;

      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, temperature: 0.3 }),
      });

      let parsed: any = null;
      if (res?.text) {
        const match = res.text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {}
        }
        if (!parsed && res.text) {
          handleFieldChange(destContentKey, res.text.trim());
        }
      } else if (res && typeof res === 'object') {
        parsed = res;
      }

      if (parsed) {
        if (parsed.title) handleFieldChange(destTitleKey, parsed.title);
        if (parsed.subtitle) handleFieldChange(destSubKey, parsed.subtitle);
        if (parsed.content) handleFieldChange(destContentKey, parsed.content);
        showSuccess(isToBn ? '✨ Policy translated to Bengali (বাংলা) successfully!' : '✨ Policy translated to English successfully!');
      } else {
        showSuccess('AI Translation completed!');
      }
    } catch (err: any) {
      showError(err.message || 'AI Translation failed');
    } finally {
      setTranslating(false);
      setTranslatingDirection(null);
    }
  };

  const handleAiPolish = async () => {
    const currentContent = settings[currentPage.contentKeyBn] || currentPage.defaultContentBn;
    setPolishing(true);
    try {
      const prompt = `Review and enhance this Bengali policy text for a premium handcrafted wooden maps e-commerce business. Make it transparent, customer-friendly, professional, and properly formatted with Markdown. Return ONLY the polished Bengali text:\n\n${currentContent}`;
      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      if (res?.text) {
        handleFieldChange(currentPage.contentKeyBn, res.text.trim());
        showSuccess('AI Polish completed!');
      }
    } catch (err: any) {
      showError(err.message || 'AI Polish failed');
    } finally {
      setPolishing(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-20">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-900/90 border border-emerald-500/40 text-emerald-100 shadow-2xl backdrop-blur-md animate-in fade-in duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      <PoliciesHeader
        currentSlug={currentPage.slug}
        onSave={handleSave}
        saving={saving}
      />

      <PolicyTabNav
        policyPages={POLICY_PAGES}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <PolicyEditorSection
        currentPage={currentPage}
        settings={settings}
        handleFieldChange={handleFieldChange}
        onAiTranslate={handleAiTranslate}
        translating={translating}
        translatingDirection={translatingDirection}
        onAiPolish={handleAiPolish}
        polishing={polishing}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
