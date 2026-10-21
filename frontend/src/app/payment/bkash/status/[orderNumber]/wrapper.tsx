'use client';

import React, { useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../../../../lib/api';
import { getOrderSession, saveOrderSession } from '../../../../../lib/orderSession';
import { BkashStatusCard } from './BkashStatusCard';

export default function Wrapper() {
  const { orderNumber } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') || 'failed';
  const msg = searchParams.get('msg') || '';

  const handleSwitchToCod = useCallback(async () => {
    try {
      const cleanNum = Array.isArray(orderNumber) ? orderNumber[0] : orderNumber;
      const session = getOrderSession();
      const token = (session?.accessToken || '').trim();
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
      const updated = await fetchApi(`/orders/${cleanNum}/switch-cod${tokenQuery}`, {
        method: 'PUT',
      });
      if (updated) {
        saveOrderSession(updated);
      }
      router.push('/order/confirmation');
    } catch {
      router.push('/order/confirmation');
    }
  }, [orderNumber, router]);

  const handleRetryBkash = useCallback(async () => {
    const cleanNum = Array.isArray(orderNumber) ? orderNumber[0] : orderNumber;
    try {
      const session = getOrderSession();
      const token = (session?.accessToken || '').trim();
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
      const res = await fetchApi(`/payment/bkash/initiate/${cleanNum}${tokenQuery}`, {
        method: 'POST',
      });
      if (res.bkashURL) {
        window.location.href = res.bkashURL;
      }
    } catch (err: any) {
      alert(err.message || 'Could not restart bKash session');
    }
  }, [orderNumber]);

  return (
    <BkashStatusCard
      status={status}
      msg={msg}
      onSwitchToCod={handleSwitchToCod}
      onRetryBkash={handleRetryBkash}
    />
  );
}
