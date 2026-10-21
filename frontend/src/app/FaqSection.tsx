'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Headphones, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface FaqItem {
  id: number | string;
  question: string;
  answer: string;
  questionBn?: string;
  answerBn?: string;
  isPublished?: boolean;
  sortOrder?: number;
}

interface FaqSectionProps {
  faqs?: FaqItem[];
  settings?: Record<string, string>;
}

export const FaqSection = React.memo(function FaqSection({ faqs, settings = {} }: FaqSectionProps) {
  const { t, lang } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // If there are no published FAQs from the database, do not show the section on the home page
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Compute robust fallbacks for contact info
  const rawPhone = settings?.contact_phone || settings?.phone || '+880 1700-000000';
  const displayPhone = settings?.contact_phone || settings?.phone || '+880 1700-000000';
  const cleanPhone = rawPhone.replace(/\s+/g, '');

  const rawWa = settings?.contact_whatsapp || settings?.whatsapp || rawPhone;
  let cleanWa = rawWa.replace(/\D/g, '');
  if (cleanWa.startsWith('01')) {
    cleanWa = '88' + cleanWa;
  } else if (!cleanWa.startsWith('88') && cleanWa.length === 11) {
    cleanWa = '88' + cleanWa;
  }
  if (!cleanWa) {
    cleanWa = '8801700000000';
  }

  return (
    <section
      className="home-section faq-section home-faq-section py-10 sm:py-14"
      id="faqs"
      aria-label={t('home_faq_title', 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)')}
    >
      <div className="container faq-container home-faq-container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="home-section-head text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FAF3EB] text-[#8E5A35] border border-[#C08A46]/20 mb-2.5 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#C08A46]" />
            <span>{t('home_faq_badge', 'সাধারণ জিজ্ঞাসা ও উত্তর')}</span>
          </div>
          <h2 className="home-section-title text-2xl sm:text-3xl md:text-[2.2rem] font-extrabold text-[#2C1810] tracking-tight">
            {t('home_faq_title', 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী')}
          </h2>
          <p className="home-section-sub text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {t(
              'home_faq_sub',
              'আপনার মনে আসা যেকোনো প্রশ্নের উত্তর সহজে খুঁজে নিন'
            )}
          </p>
        </div>

        {/* Accordion Cards: wider width, compact elegant vertical padding & spacing */}
        <div className="faq-accordion" id="faqAccordion">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;

            // Resolve multilingual text: check language dictionary first, then item's own localized field, then base field
            const questionText =
              lang === 'bn'
                ? t(`faq.${faq.id}.question`, faq.questionBn || faq.question)
                : t(`faq.${faq.id}.question_en`, faq.question);

            const answerText =
              lang === 'bn'
                ? t(`faq.${faq.id}.answer`, faq.answerBn || faq.answer)
                : t(`faq.${faq.id}.answer_en`, faq.answer);

            return (
              <div
                key={faq.id || idx}
                className="faq-card bg-white rounded-2xl border border-[#EDE8E0] shadow-[0_2px_8px_rgba(44,24,16,0.02)] hover:border-[#8E5A35]/30 transition-all duration-200 overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 py-3.5 px-5 sm:py-4 sm:px-7 text-left cursor-pointer border-none bg-transparent select-none transition-colors"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-[1.05rem] font-bold text-[#2A1810] tracking-tight leading-snug">
                    {questionText}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#723E19] stroke-[2.5] shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-[#EAD8C7] stroke-[2.5] shrink-0 transition-transform" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4.5 pt-0 sm:px-7 sm:pb-5 text-stone-600 text-sm sm:text-base leading-relaxed">
                    <p className="whitespace-pre-line m-0 text-stone-600 leading-relaxed font-normal">
                      {answerText}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Assistance Contact Strip */}
        <div className="home-faq-help-card mt-8 sm:mt-10 p-5 sm:p-6 rounded-2xl bg-white border border-[#EDE8E0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="home-faq-help-info flex items-center gap-4 text-center sm:text-left w-full sm:w-auto">
            <div className="home-faq-help-icon w-12 h-12 rounded-xl bg-[#FAF3EB] border border-[#C08A46]/25 flex items-center justify-center shrink-0 text-[#8E5A35]">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="home-faq-help-title text-base sm:text-lg font-bold text-[#2C1810] m-0">
                {t('faq_more_questions', 'আরও কোনো প্রশ্ন আছে?')}
              </h4>
              <p className="home-faq-help-desc text-xs sm:text-sm text-stone-500 mt-1 mb-0 leading-normal">
                {t(
                  'faq_more_questions_sub',
                  'আমাদের কাস্টমার সাপোর্ট টিম আপনাকে সার্বক্ষণিক সহায়তা করতে প্রস্তুত।'
                )}
              </p>
            </div>
          </div>
          <div className="home-faq-help-actions flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end shrink-0">
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                t('whatsapp_inquiry_msg', 'Hello! I would like to inquire about the products.')
              )}`}
              target="_blank"
              rel="noreferrer"
              className="home-faq-btn-wa inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-2xs"
            >
              <i className="fa-brands fa-whatsapp text-emerald-600 text-base"></i>
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${cleanPhone}`}
              className="home-faq-btn-call inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8E5A35] hover:bg-[#784A2A] text-white border border-[#784A2A] transition-all shadow-sm hover:shadow-md"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{displayPhone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});
