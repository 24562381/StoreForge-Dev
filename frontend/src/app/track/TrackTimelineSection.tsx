'use client';

import React from 'react';
import { useLanguage } from '../../lib/LanguageContext';

interface TrackTimelineSectionProps {
  order: any;
  isDhaka: boolean;
  isCod: boolean;
  isCancelled: boolean;
  currentStepIndex: number;
  steps: Array<{
    key: string;
    label: string;
    desc: string;
    icon: string;
  }>;
  statusSummary: any;
}

export const TrackTimelineSection = React.memo(function TrackTimelineSection({
  order,
  isDhaka,
  isCod,
  isCancelled,
  currentStepIndex,
  steps,
  statusSummary,
}: TrackTimelineSectionProps) {
  const { lang, t, formatNum } = useLanguage();

  const progressPercent = steps.length > 1
    ? (Math.min(Math.max(currentStepIndex, 0), steps.length - 1) / (steps.length - 1)) * 100
    : 0;

  return (
    <div className="track-card status-timeline-card">
      <div className="track-card-header">
        <div className="track-card-title">
          <i className="fa-solid fa-timeline"></i>
          <span>{t('track_status_timeline_title', 'অর্ডার অগ্রগতি ও লাইভ স্ট্যাটাস')}</span>
        </div>
        <div className="delivery-eta-badge">
          <i className="fa-solid fa-bolt text-amber-500"></i>
          <span>
            {isDhaka
              ? t('track_eta_inside_dhaka', lang === 'bn' ? 'আনুমানিক ডেলিভারি: ২৪-৪৮ ঘণ্টা' : 'Estimated Delivery: 24-48 Hours')
              : t('track_eta_outside_dhaka', lang === 'bn' ? 'আনুমানিক ডেলিভারি: ৩-৫ কার্যদিবস' : 'Estimated Delivery: 3-5 Working Days')}
          </span>
        </div>
      </div>

      {/* Visual Stepper Progress */}
      {!isCancelled ? (
        <div className="stepper-wrapper relative my-8 px-2">
          {/* Desktop connecting progress line */}
          <div className="stepper-track-line hidden md:block" style={{ top: '26px' }}>
            <div
              className="stepper-fill-line"
              style={{
                width: `${progressPercent}%`,
              }}
            ></div>
          </div>

          {/* Stepper Nodes */}
          <div className="stepper-nodes flex flex-col md:flex-row justify-between items-stretch md:items-start gap-5 md:gap-0 relative z-[2]">
            {steps.map((st, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isUpcoming = idx > currentStepIndex;

              return (
                <div
                  key={st.key}
                  className={`stepper-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${
                    isUpcoming ? 'upcoming' : ''
                  } flex-1 flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-3.5 md:gap-0 relative`}
                >
                  {/* Vertical connector line segment on mobile */}
                  {idx < steps.length - 1 && (
                    <div
                      className="md:hidden absolute left-[26px] top-[48px] bottom-[-22px] w-[2px] z-0"
                      style={{
                        background: isCompleted ? '#8E5A35' : '#E8E1D9',
                      }}
                    ></div>
                  )}

                  <div className="step-circle shrink-0 relative z-10">
                    {isCompleted ? (
                      <i className="fa-solid fa-check step-check"></i>
                    ) : (
                      <i className={`fa-solid ${st.icon}`}></i>
                    )}
                    {isCurrent && <span className="pulse-wave"></span>}
                  </div>

                  <div className="step-info flex flex-col items-start md:items-center gap-1.5 md:mt-3 flex-1 min-w-0">
                    <span className="step-label text-sm font-bold text-slate-800 leading-snug">
                      {st.label}
                    </span>

                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="step-status-tag active-tag">
                          <span className="tag-pulse-dot"></span>
                          <span>{t('track_timeline_in_progress', 'চলমান')}</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="step-status-tag completed-tag">
                          {t('track_timeline_done', 'সম্পন্ন')}
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="step-status-tag upcoming-tag">
                          {t('track_timeline_pending', 'পরবর্তী')}
                        </span>
                      )}
                    </div>

                    {st.desc && (
                      <span className="text-[11px] text-stone-500 hidden md:block max-w-[130px] leading-tight">
                        {st.desc}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="cancelled-banner">
          <i className="fa-solid fa-ban text-red-500 text-3xl"></i>
          <div>
            <h4 className="font-bold text-red-700">{t('track_order_cancelled_title', 'অর্ডারটি বাতিল রয়েছে')}</h4>
            <p className="text-xs text-red-600">
              {t(
                'track_order_cancelled_desc',
                'এই অর্ডারটির কার্যক্রম বাতিল করা হয়েছে। প্রয়োজনে সাপোর্টে যোগাযোগ করুন।',
              )}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Status Callout Alert Banner */}
      {statusSummary && (
        <div
          className="status-callout-banner"
          style={{
            background: statusSummary.bg,
            borderColor: statusSummary.border,
            color: statusSummary.color,
          }}
        >
          <div
            className="callout-icon-box"
            style={{ background: statusSummary.border, color: statusSummary.color }}
          >
            <i className={`fa-solid ${statusSummary.icon}`}></i>
          </div>
          <div className="callout-content">
            <h4 className="callout-heading">{statusSummary.title}</h4>
            <p className="callout-message">{statusSummary.message}</p>

            <div className="callout-meta-row">
              <span className="callout-meta-chip">
                <i className="fa-solid fa-truck-ramp-box"></i>
                <span>
                  {t('track_zone_label', 'ডেলিভারি জোন:')}{' '}
                  <strong>{isDhaka ? t('zone_inside_dhaka', 'ঢাকা সিটির ভেতরে') : t('zone_outside_dhaka', 'ঢাকার বাইরে')}</strong>
                </span>
              </span>
              <span className="callout-meta-chip">
                <i className="fa-solid fa-hand-holding-dollar"></i>
                <span>
                  {isCod
                    ? t('track_cod_amount_payable', lang === 'bn' ? 'ক্যাশ অন ডেলিভারি: প্রদেয় ৳ {amount}' : 'Cash on Delivery: Pay ৳ {amount}')
                        .replace('{amount}', formatNum(order.total))
                    : t('track_prepaid_status', lang === 'bn' ? 'পেমেন্ট সম্পন্ন (পেইড)' : 'Prepaid (Fully Paid)')}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
