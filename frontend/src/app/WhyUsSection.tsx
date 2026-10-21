'use client';

import React, { useMemo } from 'react';
import {
  Gem,
  Trees,
  Layers,
  Award,
  Truck,
  ShieldCheck,
  Heart,
  Sparkles,
  Clock,
  Star,
  Box,
  ThumbsUp,
  Compass,
  MapPin,
  CheckCircle2,
  Quote,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

interface WhyUsSectionProps {
  settings?: Record<string, string>;
}

interface CardData {
  id?: string;
  icon?: string;
  title_en?: string;
  title_bn?: string;
  desc_en?: string;
  desc_bn?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trees,
  Layers,
  Award,
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
  CheckCircle2,
};

const DEFAULT_PARAGRAPH_BN = `<p><strong>উডেন মীর</strong>-এ আমরা বিশ্বাস করি আপনার দেয়াল হলো অনন্য নান্দনিকতার এক জীবন্ত ক্যানভাস। আমাদের প্রতিটি কাঠের ওয়ার্ল্ড ম্যাপ ১০০% আমদানিকৃত প্রিমিয়াম গ্রেড-এ বার্চ প্লাইউড থেকে দক্ষ শিল্পীদের হাতের নিখুঁত ফিনিশিং ও সর্বাধুনিক লেজার কাটিং প্রযুক্তির মেলবন্ধনে তৈরি।</p><p>বহুস্তরীয় ৩ডি ডেপথ, নিখুঁত দেশ ও সীমানা খোদাই এবং প্রাকৃতিক কাঠের টেক্সচারের সমন্বয়ে এটি আপনার বসার ঘর বা অফিস কক্ষে এনে দেয় এক আভিজাত্যপূর্ণ ও বিলাসবহুল আবহ। বিশেষ থ্রি-প্লাই বাবল ও কাঠের মজবুত প্যাকেজিংয়ে সম্পূর্ণ নিরাপদে আপনার ঠিকানায় পৌঁছে দেওয়া হয় ফ্রি ইনস্টলেশন গাইড ও আজীবন কারিগরির নিশ্চয়তাসহ।</p>`;

const DEFAULT_PARAGRAPH_EN = `<p>At <strong>Wooden Mir</strong>, we believe your wall is a canvas for timeless elegance. Every wooden map is handcrafted from 100% genuine imported grade-A birch plywood, combining precision laser cutting with meticulous hand-finishing by master artisans.</p><p>With multi-layered 3D relief, engraved country borders, capitals, and natural wood stains, each piece brings warmth, sophistication, and global wonder directly into your living space or executive office. Packaged with heavy-duty wooden framing and protective multi-ply cushioning, our creations arrive safely at your doorstep with complimentary installation accessories and lifetime craftsmanship assurance.</p>`;

export const WhyUsSection = React.memo(function WhyUsSection({ settings }: WhyUsSectionProps) {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';

  // Mode: 'cards' (default) or 'paragraph'
  const displayMode = settings?.why_us_display_mode === 'paragraph' ? 'paragraph' : 'cards';

  // Section Header (Bilingual with setting override or fallback to translation dictionary)
  const badgeText = isBn
    ? settings?.why_us_badge_bn || t('why_us_badge', 'শ্রেষ্ঠত্বের প্রতিশ্রুতি')
    : settings?.why_us_badge_en || t('why_us_badge', 'PROMISE OF EXCELLENCE');

  const titleText = isBn
    ? settings?.why_us_title_bn || t('why_us_title', 'কেন উডেন মীর সেরা পছন্দ?')
    : settings?.why_us_title_en || t('why_us_title', 'Why Choose Wooden Mir?');

  const subtitleText = isBn
    ? settings?.why_us_sub_bn ||
      t(
        'why_us_sub',
        'আমাদের প্রতিটি কাঠের শিল্পকর্মে থাকে দীর্ঘস্থায়ী মান, নিখুঁত কারিগরি এবং নান্দনিক আভিজাত্যের স্পর্শ'
      )
    : settings?.why_us_sub_en ||
      t(
        'why_us_sub',
        'Every piece of our wooden artwork holds enduring quality, precise craftsmanship, and a touch of aesthetic elegance.'
      );

  // Parse Cards from settings or fallback to defaults
  const parsedCards: CardData[] = useMemo(() => {
    if (settings?.why_us_cards_json) {
      try {
        const parsed = JSON.parse(settings.why_us_cards_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
    // Default 4 cards
    return [
      {
        icon: 'Trees',
        title_bn: t('why_feat_1_title', '১০০% অরিজিনাল বার্চ প্লাইউড'),
        title_en: '100% Original Birch Plywood',
        desc_bn: t(
          'why_feat_1_desc',
          'আমদানিকৃত উন্নতমানের গ্রেড-এ বার্চ কাঠ ব্যবহার করা হয়, যা আবহাওয়া ও আর্দ্রতা প্রতিরোধী।'
        ),
        desc_en: 'Imported high-grade Birch wood is used, which is weather and moisture resistant.',
      },
      {
        icon: 'Layers',
        title_bn: t('why_feat_2_title', '৩ডি মাল্টি-লেয়ারড গভীরতা'),
        title_en: '3D Multi-Layered Depth',
        desc_bn: t(
          'why_feat_2_desc',
          'বিভিন্ন শেড এবং ভিন্ন ভিন্ন গভীরতার কাঠের নিখুঁত জোড়া দিয়ে দেয়ালে এনে দেয় বাস্তবসম্মত ত্রিমাত্রিক রূপ।'
        ),
        desc_en:
          'Precision joints of wood with various shades and depths bring a realistic three-dimensional look to your wall.',
      },
      {
        icon: 'Award',
        title_bn: t('why_feat_3_title', 'লাইফটাইম ক্রাফটম্যানশিপ'),
        title_en: 'Lifetime Craftsmanship',
        desc_bn: t(
          'why_feat_3_desc',
          'লেজার কাটিং এবং দক্ষ শিল্পীদের হাতের পলিশে প্রস্তুত হওয়ায় বছরের পর বছর ধরে নতুনের মতো ঔজ্জ্বল্য থাকে।'
        ),
        desc_en:
          'Laser-cut precision and hand-polished by skilled artisans ensures it retains its new shine for years to come.',
      },
      {
        icon: 'Truck',
        title_bn: t('why_feat_4_title', 'নিরাপদ ডেলিভারি ও সাপোর্ট'),
        title_en: 'Safe Delivery & Support',
        desc_bn: t(
          'why_feat_4_desc',
          'বিশেষ থ্রি-প্লাই বাবল ও কাঠের ফ্রেমিং প্যাকেজিং সহ সারাদেশে হোম ডেলিভারি ও ফ্রি ইনস্টলেশন গাইড।'
        ),
        desc_en:
          'Special 3-ply bubble & wooden frame packaging with nationwide home delivery and free installation guide.',
      },
    ];
  }, [settings?.why_us_cards_json, t]);

  // Clean, sanitized paragraph content
  const paragraphHtml = useMemo(() => {
    const raw = isBn
      ? settings?.why_us_paragraph_bn || DEFAULT_PARAGRAPH_BN
      : settings?.why_us_paragraph_en || DEFAULT_PARAGRAPH_EN;
    return sanitizeHtml(raw);
  }, [isBn, settings?.why_us_paragraph_bn, settings?.why_us_paragraph_en]);

  return (
    <section
      className="home-section home-why-us-section py-14 sm:py-20"
      id="why-us"
      aria-label={titleText}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="home-section-head text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF3EB] text-[#8E5A35] border border-[#C08A46]/20 mb-3.5 shadow-2xs">
            <Gem className="w-3.5 h-3.5 text-[#C08A46]" />
            <span>{badgeText}</span>
          </div>
          <h2 className="home-section-title text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2C1810] tracking-tight">
            {titleText}
          </h2>
          <p className="home-section-sub text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {subtitleText}
          </p>
        </div>

        {/* MODE A: Editorial Rich Paragraph Mode */}
        {displayMode === 'paragraph' ? (
          <div className="why-us-editorial-container max-w-4xl mx-auto relative">
            <div className="relative p-7 sm:p-12 rounded-3xl bg-white border border-[#8E5A35]/15 shadow-sm overflow-hidden">
              {/* Subtle Warm Gradient Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FAF3EB] to-transparent rounded-bl-full pointer-events-none opacity-80" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-gradient-to-tr from-[#FAF3EB] to-transparent rounded-tr-full pointer-events-none opacity-60" />

              {/* Decorative Quote Icon Watermark */}
              <div className="absolute top-6 right-6 text-[#C08A46]/15 pointer-events-none">
                <Quote className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              {/* Sanitized Rich HTML Narrative */}
              <div
                className="why-us-prose tiptap-content relative z-10 text-[#2C1810]/85 text-sm sm:text-base leading-relaxed sm:leading-loose"
                dangerouslySetInnerHTML={{ __html: paragraphHtml }}
              />

              {/* Bottom Brand Assurance Seal */}
              <div className="mt-8 pt-6 border-t border-[#8E5A35]/10 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500 relative z-10">
                <div className="flex items-center gap-2 text-[#8E5A35] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#C08A46]" />
                  <span>{isBn ? '১০০% খাঁটি মানের গ্যারান্টি' : '100% Quality Assurance Guarantee'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-stone-600">
                  <Sparkles className="w-3.5 h-3.5 text-[#C08A46]" />
                  <span>{isBn ? 'দক্ষ কারিগরদের নিখুঁত হাতে তৈরি' : 'Handcrafted by Master Artisans'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODE B: 4-Column Feature Grid */
          <div
            className={`why-us-grid grid grid-cols-1 sm:grid-cols-2 ${
              parsedCards.length === 3
                ? 'lg:grid-cols-3'
                : parsedCards.length >= 4
                ? 'lg:grid-cols-4'
                : 'lg:grid-cols-2'
            } gap-5 sm:gap-6`}
          >
            {parsedCards.map((feat, idx) => {
              const iconKey = feat.icon || 'Trees';
              const IconComp = ICON_MAP[iconKey] || Gem;

              const cardTitle = isBn
                ? feat.title_bn || feat.title_en || ''
                : feat.title_en || feat.title_bn || '';

              const cardDesc = isBn
                ? feat.desc_bn || feat.desc_en || ''
                : feat.desc_en || feat.desc_bn || '';

              return (
                <div
                  key={feat.id || idx}
                  className="why-us-card group relative p-6 sm:p-7 rounded-2xl bg-white border border-[#8E5A35]/15 hover:border-[#8E5A35]/40 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                >
                  {/* Subtle Ambient Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FAF3EB]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Icon Container */}
                  <div className="why-us-icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF3EB] to-[#F5ECE1] border border-[#C08A46]/30 flex items-center justify-center text-[#8E5A35] group-hover:scale-110 group-hover:text-[#C08A46] group-hover:border-[#C08A46]/60 group-hover:shadow-md transition-all duration-300 mb-5 shrink-0 relative z-10">
                    <IconComp className="w-7 h-7" />
                  </div>

                  {/* Title */}
                  <h3 className="why-us-card-title font-extrabold text-[#2C1810] text-base sm:text-[1.05rem] leading-snug mb-2.5 group-hover:text-[#8E5A35] transition-colors relative z-10">
                    {cardTitle}
                  </h3>

                  {/* Description */}
                  <p className="why-us-card-desc text-stone-600 text-xs sm:text-sm leading-relaxed m-0 relative z-10 flex-1">
                    {cardDesc}
                  </p>

                  {/* Micro-interaction underline */}
                  <div className="w-8 h-0.5 bg-[#C08A46]/25 group-hover:w-14 group-hover:bg-[#C08A46] transition-all duration-300 mt-5 rounded-full relative z-10" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
});

export default WhyUsSection;
