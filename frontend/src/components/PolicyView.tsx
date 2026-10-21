'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Layers, ShieldCheck, FileText, RotateCcw, Headphones, Phone, MessageSquare } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { useSettings } from '../lib/SettingsContext';
import { fetchApi } from '../lib/api';
import { sanitizeHtml } from '../lib/sanitizeHtml';

interface PolicyProps {
  policyType: 'privacy' | 'terms' | 'returns';
}

const HTML_DETECT_REGEX = /<[a-z][\s\S]*>/i;
const SECTION_SPLIT_REGEX = /(?=###\s+)/g;
const WHITESPACE_REGEX = /\s+/g;
const NON_DIGIT_REGEX = /\D/g;

const DEFAULT_TITLES = {
  privacy: {
    titleBn: 'গোপনীয়তা নীতি',
    titleEn: 'Privacy Policy',
    subBn: 'আপনার তথ্যের সর্বোচ্চ নিরাপত্তা এবং সুরক্ষা নিশ্চিত করতে আমরা দায়বদ্ধ।',
    subEn: 'We are committed to safeguarding your personal data and privacy.',
    contentBn: `### ১. তথ্যের গোপনীয়তা ও সুরক্ষা
আমরা গ্রাহকের নাম, ফোন নম্বর, ঠিকানা এবং ডেলিভারির তথ্য শুধুমাত্র পণ্য ডেলিভারি এবং কাস্টমার সাপোর্টের জন্য ব্যবহার করি। কোনো অবস্থাতেই আপনার তথ্য তৃতীয় কোনো পক্ষের সাথে বাণিজ্যিক উদ্দেশ্যে শেয়ার করা হয় না।

### ২. পেমেন্ট ও লেনদেন নিরাপত্তা
ক্যাশ অন ডেলিভারি অর্ডারে পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা দেওয়া হয়। অনলাইন বিকাশ পেমেন্টের ক্ষেত্রে বিকাশ গেটওয়ের অফিসিয়াল সিকিউরিটি ফ্রেমওয়ার্ক অনুযায়ী এনক্রিপ্টেড চ্যানেলে লেনদেন সম্পন্ন হয়।

### ৩. কুকিজ ও এনালিটিক্স
আমাদের ওয়েবসাইটে আপনার ব্রাউজিং অভিজ্ঞতা আরও দ্রুত ও মসৃণ করার জন্য প্রয়োজনীয় কুকিজ ব্যবহৃত হয়। আপনি চাইলে যেকোনো সময় আপনার ব্রাউজার সেটিংস থেকে এটি নিয়ন্ত্রণ করতে পারেন।`,
    contentEn: `### 1. Information Privacy & Protection
We only collect customer name, phone number, shipping address, and delivery notes exclusively for order dispatch and customer support. We never sell or share your personal data with any third party.

### 2. Payment & Transaction Security
For Cash on Delivery, you pay only after safely inspecting your parcel. For online payments, transactions are processed securely via official encrypted SSL gateways.

### 3. Cookies Policy
Our website uses standard essential cookies to maintain your shopping cart state and improve your shopping experience.`
  },
  terms: {
    titleBn: 'ব্যবহারের শর্তাবলী',
    titleEn: 'Terms & Conditions',
    subBn: 'প্ল্যাটফর্ম ব্যবহার ও কেনাকাটার আনুষ্ঠানিক নিয়মাবলী।',
    subEn: 'Terms and guidelines for ordering and using the StoreForge platform.',
    contentBn: `### ১. অর্ডার ও ডেলিভারি শর্ত
অর্ডার করার পর আমাদের কাস্টমার কেয়ার প্রতিনিধি ফোন কলের মাধ্যমে অর্ডার নিশ্চিত করেন। ঢাকায় ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৪ দিনের মধ্যে ডেলিভারি সম্পন্ন করা হয়।

### ২. পণ্যের মান ও ওয়ারেন্টি
আমাদের প্রতিটি ম্যাপ ১০০% প্রাকৃতিক বার্চ কাঠের তৈরি। প্রাকৃতিক কাঠের কারণে প্রতিটি পণ্যের টেকক্সচার ও শেডে সামান্য বৈচিত্র্য থাকতে পারে যা কাঠের প্রাকৃতিক সৌন্দর্যের অংশ।

### ৩. অর্ডার বাতিল ও পরিবর্তন
অর্ডার নিশ্চিত হওয়ার পর পার্সেল কুরিয়ারে হস্তান্তরের পূর্ব পর্যন্ত যেকোনো সময় আপনি ফোন করে অর্ডার বাতিল বা পরিবর্তন করতে পারবেন।`,
    contentEn: `### 1. Orders & Delivery Timeline
Once an order is placed, our support team confirms the order by phone. We deliver within 24-48 hours in Dhaka and 2-4 days nationwide across Bangladesh.

### 2. Craftsmanship & Quality
Each wooden map is handcrafted from 100% natural birch wood. Natural wood grain variations and subtle shade tones are inherent features of handcrafted timber art.

### 3. Cancellation Policy
You can modify or cancel your order anytime before it has been dispatched with our courier partner by contacting our helpline.`
  },
  returns: {
    titleBn: 'রিটার্ন ও রিফান্ড নীতি',
    titleEn: 'Return & Refund Policy',
    subBn: 'ক্ষতিগ্রস্ত পণ্যে ১০০% ইনস্ট্যান্ট ফ্রি রিপ্লেসমেন্ট সুবিধা।',
    subEn: '100% free damage replacement and guaranteed refund protection.',
    contentBn: `### ১. ফ্রি ইনস্ট্যান্ট রিপ্লেসমেন্ট
কুরিয়ারে কোনো অংশ ভেঙে গেলে বা ক্ষতিগ্রস্ত হলে ডেলিভারিম্যানের সামনে চেক করে অথবা পার্সেল পাওয়ার ২৪ ঘণ্টার মধ্যে আমাদের ছবি/ভিডিও পাঠালে তাৎক্ষণিকভাবে সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট প্রদান করা হয়।

### ২. রিফান্ড সুবিধা
বিকাশে অগ্রিম পেমেন্ট করার পর অর্ডার বাতিল হলে বা স্টক না থাকলে ৩ কার্যদিবসের মধ্যে একই বিকাশ অ্যাকাউন্টে রিফান্ড সম্পন্ন করা হয়।

### ৩. রিটার্ন প্রক্রিয়া
পণ্য ফেরত বা রিপ্লেসমেন্টের জন্য আমাদের হেল্পলাইন নম্বরে যোগাযোগ করুন। আমাদের টিম দ্রুততম সময়ে নতুন পণ্য পৌঁছে দেওয়ার ব্যবস্থা করবে।`,
    contentEn: `### 1. Free Instant Replacement
If any map piece is damaged during transit, inspect it before payment or notify us with a photo within 24 hours of delivery. We will immediately dispatch a brand-new replacement completely free of charge.

### 2. Full Refund Policy
If an online pre-payment was made and an order is cancelled or out of stock, full refund is issued back to your bKash/bank account within 3 business days.

### 3. Hassle-Free Support
Call or WhatsApp our helpline to initiate a replacement request. Our team will handle everything seamlessly.`
  },
};

function renderFormattedContent(text: string) {
  if (!text) return null;

  // Check if text is HTML (saved by TipTap / Rich Text editor)
  const isHtml = HTML_DETECT_REGEX.test(text);

  if (isHtml) {
    return (
      <div
        className="policy-html-content tiptap-content"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
      />
    );
  }

  const sections = text.split(SECTION_SPLIT_REGEX);

  return (
    <div className="policy-html-content">
      {sections.map((sec, idx) => {
        const trimmed = sec.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('###')) {
          const firstLineEnd = trimmed.indexOf('\n');
          const title = firstLineEnd !== -1 ? trimmed.substring(3, firstLineEnd).trim() : trimmed.substring(3).trim();
          const body = firstLineEnd !== -1 ? trimmed.substring(firstLineEnd).trim() : '';
          
          return (
            <div key={idx} className="policy-block">
              <h3>{title}</h3>
              {body && (
                <p className="policy-block-body whitespace-pre-line">
                  {body}
                </p>
              )}
            </div>
          );
        }

        return (
          <p key={idx} className="policy-block-body whitespace-pre-line">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export const PolicyView: React.FC<PolicyProps> = React.memo(({ policyType }) => {
  const { lang, t } = useLanguage();
  const { settings: contextSettings } = useSettings();
  const [settings, setSettings] = useState<Record<string, string>>(contextSettings || {});

  useEffect(() => {
    if (contextSettings && Object.keys(contextSettings).length > 0) {
      setSettings(contextSettings);
      return;
    }
    fetchApi('/settings/public')
      .then((data) => setSettings(data || {}))
      .catch(() => {});
  }, [contextSettings]);

  const isBn = lang === 'bn';
  const def = DEFAULT_TITLES[policyType];

  const currentTitle = React.useMemo(() => {
    const titleKey = `policy_${policyType}_title_${isBn ? 'bn' : 'en'}`;
    return settings[titleKey] || (isBn ? def.titleBn : def.titleEn);
  }, [settings, policyType, isBn, def]);

  const currentSub = React.useMemo(() => {
    const subKey = `policy_${policyType}_sub_${isBn ? 'bn' : 'en'}`;
    return settings[subKey] || (isBn ? def.subBn : def.subEn);
  }, [settings, policyType, isBn, def]);

  const currentContentText = React.useMemo(() => {
    const contentKey = `policy_${policyType}_content_${isBn ? 'bn' : 'en'}`;
    return settings[contentKey] || (isBn ? def.contentBn : def.contentEn);
  }, [settings, policyType, isBn, def]);

  const formattedContent = React.useMemo(() => {
    return renderFormattedContent(currentContentText);
  }, [currentContentText]);

  const phone = React.useMemo(() => {
    return (settings.contact_phone || '+880 1700-000000').replace(WHITESPACE_REGEX, '');
  }, [settings.contact_phone]);

  const waNum = React.useMemo(() => {
    return (settings.contact_whatsapp || '8801700000000').replace(NON_DIGIT_REGEX, '');
  }, [settings.contact_whatsapp]);

  return (
    <div className="policy-page-container">
      <section className="policy-hero">
        <div className="container">
          <nav className="breadcrumb-nav">
            <ol className="breadcrumb-list">
              <li>
                <Link href="/">
                  <Home className="w-4 h-4 inline" /> {t('nav_home', 'হোম')}
                </Link>
              </li>
              <li className="separator">
                <ChevronRight className="w-3.5 h-3.5 inline" />
              </li>
              <li className="current">{currentTitle}</li>
            </ol>
          </nav>
          <div className="policy-hero-content">
            <h1 className="policy-main-title">{currentTitle}</h1>
            <p className="policy-hero-subtitle">{currentSub}</p>
          </div>
        </div>
      </section>

      <section className="policy-body-section">
        <div className="container policy-layout-grid">
          <article className="policy-article-card">
            {formattedContent}
          </article>

          <aside className="policy-sidebar">
            <div className="policy-sidebar-card">
              <h3 className="sidebar-card-title">
                <Layers className="w-4 h-4 text-[#8e5a35]" />{' '}
                {t('policy_sidebar_nav_title', isBn ? 'অন্যান্য নীতিমালা' : 'Other Policies')}
              </h3>
              <ul className="policy-sidebar-links">
                <li className={policyType === 'privacy' ? 'active' : ''}>
                  <Link href="/privacy">
                    <ShieldCheck className="w-4 h-4" />{' '}
                    <span>
                      {settings[`policy_privacy_title_${isBn ? 'bn' : 'en'}`] ||
                        (isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy')}
                    </span>
                  </Link>
                </li>
                <li className={policyType === 'terms' ? 'active' : ''}>
                  <Link href="/terms">
                    <FileText className="w-4 h-4" />{' '}
                    <span>
                      {settings[`policy_terms_title_${isBn ? 'bn' : 'en'}`] ||
                        (isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions')}
                    </span>
                  </Link>
                </li>
                <li className={policyType === 'returns' ? 'active' : ''}>
                  <Link href="/return-policy">
                    <RotateCcw className="w-4 h-4" />{' '}
                    <span>
                      {settings[`policy_returns_title_${isBn ? 'bn' : 'en'}`] ||
                        (isBn ? 'রিটার্ন ও রিফান্ড নীতি' : 'Return & Refund Policy')}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="policy-sidebar-card assistance-card">
              <div className="assistance-icon-box">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="assistance-title">
                {t('policy_assistance_title', isBn ? 'যেকোনো জিজ্ঞাসায় আমরা আছি' : 'Need Any Assistance?')}
              </h4>
              <p className="assistance-desc">
                {t(
                  'policy_assistance_desc',
                  isBn
                    ? 'অর্ডার, ডেলিভারি বা পলিসি সংক্রান্ত যেকোনো প্রশ্নে আমাদের সাথে সরাসরি যোগাযোগ করুন।'
                    : 'Contact our support team anytime for queries regarding orders, delivery, or policies.'
                )}
              </p>
              <div className="assistance-actions">
                {phone && (
                  <a href={`tel:${phone}`} className="btn btn-outline">
                    <Phone className="w-4 h-4" /> {settings.contact_phone || phone}
                  </a>
                )}
                {waNum && (
                  <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                    <MessageSquare className="w-4 h-4" /> WhatsApp Chat
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
});
