'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../../../../lib/LanguageContext';
import { fetchApi } from '../../../../lib/api';
import { getOrderSession, saveOrderSession } from '../../../../lib/orderSession';
import { OrderVerifyAuthCard } from './OrderVerifyAuthCard';

export default function Wrapper() {
  const { t } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = decodeURIComponent((params?.number as string) || '');
  const urlToken = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      router.replace('/order/confirmation');
      return;
    }

    const session = getOrderSession();
    const token =
      urlToken ||
      (session &&
      (session.orderNumber === orderNumber || session.orderNumber === `#${orderNumber}`)
        ? session.accessToken
        : '');

    if (!token) {
      setAuthError(true);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const cleanNum = encodeURIComponent(orderNumber.trim());
    fetchApi(`/orders/verify?orderNumber=${cleanNum}&token=${encodeURIComponent(token)}`)
      .then((data) => {
        if (!isMounted) return;
        if (data && (data.id || data.orderNumber)) {
          saveOrderSession(data);
          router.replace('/order/confirmation');
        } else {
          setAuthError(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [orderNumber, urlToken, router]);

  if (loading) {
    return (
      <div
        className="container py-12 text-center"
        style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <p>
          <i className="fa-solid fa-spinner fa-spin me-2"></i>{' '}
          {t('loading', 'অর্ডার যাচাই করা হচ্ছে...')}
        </p>
      </div>
    );
  }

  return <OrderVerifyAuthCard />;
}
