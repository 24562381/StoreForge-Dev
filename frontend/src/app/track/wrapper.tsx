'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { useLanguage } from '../../lib/LanguageContext';
import { TrackHeroSection } from './TrackHeroSection';
import { TrackOrderHeader } from './TrackOrderHeader';
import { TrackTimelineSection } from './TrackTimelineSection';
import { TrackItemsManifest } from './TrackItemsManifest';
import { TrackDeliveryBillingInfo } from './TrackDeliveryBillingInfo';
import { TrackSupportBar } from './TrackSupportBar';
import { TrackReviewModal } from './TrackReviewModal';

function TrackContent() {
  const searchParams = useSearchParams();
  const { lang, t } = useLanguage();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Review modal state for delivered orders
  const [reviewModalProduct, setReviewModalProduct] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewedProductIds, setReviewedProductIds] = useState<number[]>([]);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTrack = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim() || !token.trim()) {
      setError(
        t(
          'track_err_missing_credentials',
          lang === 'bn'
            ? 'অর্ডার ট্র্যাক করতে অর্ডার নম্বর এবং সিকিউরিটি এক্সেস কোড (ট্র্যাকিং কোড) উভয়ই আবশ্যক।'
            : 'Both Order Number and Order Access Code (secret token) are strictly required to track your order.',
        ),
      );
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const cleanNum = orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
      const params = new URLSearchParams();
      params.append('orderNumber', cleanNum);
      params.append('token', token.trim());
      if (phone.trim()) params.append('phone', phone.trim());

      const res = await fetchApi(`/orders/track?${params.toString()}`);
      setOrder(res);
      if (res && Array.isArray(res.reviewedProductIds)) {
        setReviewedProductIds(res.reviewedProductIds);
      }
    } catch (err: any) {
      setError(
        err.message ||
          t(
            'track_err_not_found',
            lang === 'bn'
              ? 'অর্ডারের তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার নম্বর ও ট্র্যাকিং কোড দিয়ে আবার চেষ্টা করুন।'
              : 'Order not found. Please verify your order number and secret access code.',
          ),
      );
    } finally {
      setLoading(false);
    }
  }, [orderNumber, phone, token, lang, t]);

  const initialAutoloadDoneRef = React.useRef(false);

  useEffect(() => {
    if (!initialAutoloadDoneRef.current) {
      initialAutoloadDoneRef.current = true;
      const initialOrder = searchParams.get('order');
      const initialToken = searchParams.get('token');
      if (initialOrder && initialToken) {
        handleTrack();
      }
    }
  }, [searchParams, handleTrack]);

  const handleCopyId = useCallback((text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedId(false), 2000);
    }
  }, []);

  const steps = React.useMemo(
    () => [
      {
        key: 'pending',
        label: t('status_pending', 'অর্ডার গ্রহণ'),
        desc: t('track_step_pending_desc', lang === 'bn' ? 'অর্ডার সিস্টেমে নথিভুক্ত হয়েছে' : 'Order received & logged'),
        icon: 'fa-box-archive',
      },
      {
        key: 'confirmed',
        label: t('status_confirmed', 'নিশ্চিতকৃত'),
        desc: t('track_step_confirmed_desc', lang === 'bn' ? 'অর্ডার প্রস্তুতের অনুমোদন দেওয়া হয়েছে' : 'Order confirmed for production'),
        icon: 'fa-clipboard-check',
      },
      {
        key: 'processing',
        label: t('status_processing', 'প্যাকেজিং ও কোয়ালিটি চেক'),
        desc: t('track_step_processing_desc', lang === 'bn' ? 'কাঠের নিখুঁত ফিনিশিং ও প্যাকিং চলছে' : 'Crafting & premium packaging'),
        icon: 'fa-wand-magic-sparkles',
      },
      {
        key: 'shipped',
        label: t('status_shipped', 'কুরিয়ারে ট্রানজিটে'),
        desc: t('track_step_shipped_desc', lang === 'bn' ? 'ডেলিভারির পথে রয়েছে' : 'Handed to courier / on the way'),
        icon: 'fa-truck-fast',
      },
      {
        key: 'delivered',
        label: t('status_delivered', 'ডেলিভারি সম্পন্ন'),
        desc: t('track_step_delivered_desc', lang === 'bn' ? 'গ্রাহকের নিকট হস্তান্তর করা হয়েছে' : 'Successfully delivered'),
        icon: 'fa-house-circle-check',
      },
    ],
    [lang, t],
  );

  const currentStepIndex = React.useMemo(() => {
    if (!order) return 0;
    const s = order.status?.toLowerCase() || '';
    if (s === 'cancelled' || s === 'returned' || s === 'refunded') return -1;
    const idx = steps.findIndex((step) => step.key === s);
    return idx >= 0 ? idx : 0;
  }, [order, steps]);

  const isCancelled = React.useMemo(
    () => Boolean(order && ['cancelled', 'returned', 'refunded'].includes(order.status?.toLowerCase())),
    [order],
  );
  const currency = '৳';

  const orderDate = React.useMemo(() => {
    if (!order?.createdAt) return '';
    try {
      return new Date(order.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }, [order?.createdAt, lang]);

  const isDhaka = React.useMemo(() => {
    if (!order) return false;
    return (
      order.district === 'inside_dhaka' ||
      (order.district && order.district.toLowerCase().includes('dhaka')) ||
      (order.address && order.address.toLowerCase().includes('dhaka'))
    );
  }, [order]);

  const isCod = React.useMemo(() => {
    if (!order) return true;
    return !order.paymentMethod || order.paymentMethod === 'cod';
  }, [order]);

  const statusSummary = React.useMemo(() => {
    if (!order) return null;
    const st = order.status?.toLowerCase();

    switch (st) {
      case 'pending':
        return {
          title: t('track_summary_pending_title', lang === 'bn' ? 'অর্ডারটি সফলভাবে জমা হয়েছে' : 'Order Received Successfully'),
          message: t(
            'track_summary_pending_msg',
            lang === 'bn'
              ? 'আপনার অর্ডারটি গ্রহণ করা হয়েছে। খুব শীঘ্রই আমাদের কাস্টমার সাপোর্ট টিম আপনার সাথে ফোনে যোগাযোগ করে অর্ডারটি কনফার্ম করবে।'
              : 'Your order has been received. Our support team will contact you shortly to verify and confirm.',
          ),
          bg: '#FFFBEB',
          border: '#FDE68A',
          color: '#92400E',
          icon: 'fa-clock',
          badgeText: t('track_summary_pending_badge', lang === 'bn' ? 'পেন্ডিং / প্রক্রিয়াধীন' : 'PENDING VERIFICATION'),
        };
      case 'confirmed':
        return {
          title: t('track_summary_confirmed_title', lang === 'bn' ? 'অর্ডার কনফার্ম করা হয়েছে' : 'Order Confirmed'),
          message: t(
            'track_summary_confirmed_msg',
            lang === 'bn'
              ? 'ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে এবং প্রস্তুত করার জন্য নির্ধারিত হয়েছে।'
              : 'Thank you! Your order is confirmed and scheduled for fulfillment.',
          ),
          bg: '#EFF6FF',
          border: '#BFDBFE',
          color: '#1E40AF',
          icon: 'fa-circle-check',
          badgeText: t('track_summary_confirmed_badge', lang === 'bn' ? 'নিশ্চিতকৃত' : 'CONFIRMED'),
        };
      case 'processing':
        return {
          title: t('track_summary_processing_title', lang === 'bn' ? 'প্যাকেজিং ও কোয়ালিটি চেকিং চলছে' : 'Packaging & Quality Inspection'),
          message: t(
            'track_summary_processing_msg',
            lang === 'bn'
              ? 'আপনার অর্ডারটির নিখুঁত কোয়ালিটি চেকিং এবং প্রটেক্টিভ প্যাকেজিং সম্পন্ন হচ্ছে যাতে নিরাপদে আপনার কাছে পৌঁছায়।'
              : 'Your items are undergoing rigorous quality inspection and secure packaging for shipment.',
          ),
          bg: '#FAF5FF',
          border: '#E9D5FF',
          color: '#6B21A8',
          icon: 'fa-box',
          badgeText: t('track_summary_processing_badge', lang === 'bn' ? 'প্রসেসিং হচ্ছে' : 'IN PROCESSING'),
        };
      case 'shipped':
        return {
          title: t('track_summary_shipped_title', lang === 'bn' ? 'পার্সেলটি কুরিয়ারে ট্রানজিটে রয়েছে' : 'Parcel Shipped & In Transit'),
          message: t(
            'track_summary_shipped_msg',
            lang === 'bn'
              ? `আপনার পার্সেলটি কুরিয়ার সার্ভিসের কাছে হস্তান্তর করা হয়েছে। ডেলিভারি রাইডার নির্ধারিত সময়ে আপনার দেওয়া ফোন নম্বরে কল করে পার্সেলটি পৌঁছে দেবে।`
              : `Your package has been dispatched with our express courier partner and is on its way to your destination.`,
          ),
          bg: '#ECFDF5',
          border: '#A7F3D0',
          color: '#065F46',
          icon: 'fa-truck-fast',
          badgeText: t('track_summary_shipped_badge', lang === 'bn' ? 'ট্রানজিটে আছে' : 'DISPATCHED & ON THE WAY'),
        };
      case 'delivered':
        return {
          title: t('track_summary_delivered_title', lang === 'bn' ? 'অভিনন্দন! ডেলিভারি সম্পন্ন হয়েছে' : 'Delivered Successfully!'),
          message: t(
            'track_summary_delivered_msg',
            lang === 'bn'
              ? 'আপনার প্রিমিয়াম অর্ডারটি সফলভাবে ডেলিভারি করা হয়েছে। আমাদের পণ্যটি ব্যবহারের অভিজ্ঞতা জানিয়ে একটি মূল্যবান রিভিউ দিন।'
              : 'Your order has been successfully delivered. We hope you love your purchase!',
          ),
          bg: '#F0FDF4',
          border: '#BBF7D0',
          color: '#166534',
          icon: 'fa-house-circle-check',
          badgeText: t('track_summary_delivered_badge', lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'DELIVERED'),
        };
      case 'cancelled':
      default:
        return {
          title: t('track_summary_cancelled_title', lang === 'bn' ? 'অর্ডারটি বাতিল করা হয়েছে' : 'Order Cancelled'),
          message: t(
            'track_summary_cancelled_msg',
            lang === 'bn'
              ? 'অর্ডারটি বাতিল করা হয়েছে। কোনো জিজ্ঞাসা থাকলে বা পুনরায় অর্ডার করতে চাইলে আমাদের হটলাইনে যোগাযোগ করুন।'
              : 'This order has been marked as cancelled. If this is a mistake, please reach out to our customer helpline.',
          ),
          bg: '#FEF2F2',
          border: '#FECACA',
          color: '#991B1B',
          icon: 'fa-circle-xmark',
          badgeText: t('track_summary_cancelled_badge', lang === 'bn' ? 'বাতিল' : 'CANCELLED'),
        };
    }
  }, [order, lang, t]);

  const handleOpenReviewModal = useCallback((item: any) => {
    setReviewModalProduct(item);
    setReviewRating(5);
    setHoverRating(0);
    setReviewText('');
    setReviewSuccess('');
    setReviewError('');
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setReviewModalProduct(null);
  }, []);

  const handleSubmitReview = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reviewModalProduct || !order) return;
      if (!reviewText.trim()) {
        setReviewError(
          t(
            'track_review_feedback_required',
            lang === 'bn' ? 'অনুগ্রহ করে আপনার রিভিউ ও মন্তব্য লিখুন।' : 'Please write your review feedback.',
          ),
        );
        return;
      }

      setReviewSuccess('');
      setReviewError('');
      setSubmittingReview(true);

      const targetProductId =
        reviewModalProduct.productId ||
        reviewModalProduct.product_id ||
        (reviewModalProduct.product && reviewModalProduct.product.id) ||
        null;

      try {
        const res = await fetchApi('/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: targetProductId,
            customerName: order.customerName || 'Customer',
            orderNumber: order.orderNumber,
            phone: order.phone,
            secretToken: token || order.accessToken,
            rating: Number(reviewRating) || 5,
            reviewText: reviewText.trim(),
          }),
        });

        if (res && (res.id || res.success)) {
          if (targetProductId) {
            setReviewedProductIds((prev) => [...prev, targetProductId]);
          }
          if (reviewModalProduct.id) {
            setReviewedProductIds((prev) => [...prev, reviewModalProduct.id]);
          }
          setReviewSuccess(t('review_success_submitted', 'আপনার রিভিউটি সফলভাবে জমা নেওয়া হয়েছে! ধন্যবাদ।'));
          setReviewText('');
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setReviewModalProduct(null);
            setReviewSuccess('');
          }, 2000);
        } else {
          setReviewError(res?.message || t('review_err_generic', 'রিভিউ জমা দিতে সমস্যা হয়েছে।'));
        }
      } catch (err: any) {
        setReviewError(err.message || t('network_error_retry', 'সার্ভার সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'));
      } finally {
        setSubmittingReview(false);
      }
    },
    [reviewModalProduct, order, reviewText, reviewRating, lang, t],
  );

  return (
    <div className="track-page-wrapper">
      <TrackHeroSection
        orderNumber={orderNumber}
        setOrderNumber={setOrderNumber}
        phone={phone}
        setPhone={setPhone}
        token={token}
        setToken={setToken}
        loading={loading}
        onTrack={handleTrack}
      />

      <section className="track-results-section py-5">
        <div className="container">
          {error && (
            <div className="track-error-card">
              <div className="error-icon-wrap">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h4 className="error-title">
                  {t('track_error_card_title', lang === 'bn' ? 'অর্ডার খুঁজে পাওয়া যায়নি' : 'Unable to Track Order')}
                </h4>
                <p className="error-desc">{error}</p>
              </div>
            </div>
          )}

          {order && (
            <div className="track-details-wrapper">
              <TrackOrderHeader
                order={order}
                orderDate={orderDate}
                isDhaka={isDhaka}
                statusSummary={statusSummary}
                copiedId={copiedId}
                onCopyId={handleCopyId}
              />

              <TrackTimelineSection
                order={order}
                isDhaka={isDhaka}
                isCod={isCod}
                isCancelled={isCancelled}
                currentStepIndex={currentStepIndex}
                steps={steps}
                statusSummary={statusSummary}
              />

              <TrackItemsManifest
                order={order}
                currency={currency}
                reviewedProductIds={reviewedProductIds}
                onOpenReviewModal={handleOpenReviewModal}
              />

              <TrackDeliveryBillingInfo
                order={order}
                currency={currency}
                isDhaka={isDhaka}
                isCod={isCod}
              />

              <TrackSupportBar />
            </div>
          )}
        </div>
      </section>

      <TrackReviewModal
        reviewModalProduct={reviewModalProduct}
        onClose={handleCloseReviewModal}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        hoverRating={hoverRating}
        setHoverRating={setHoverRating}
        reviewText={reviewText}
        setReviewText={setReviewText}
        submittingReview={submittingReview}
        reviewSuccess={reviewSuccess}
        reviewError={reviewError}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}

export default function Wrapper() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-stone-500">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
