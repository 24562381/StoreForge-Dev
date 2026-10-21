'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../../../lib/LanguageContext';
import { fetchApi } from '../../../lib/api';
import { getOrderSession } from '../../../lib/orderSession';
import { ConfirmationHeroHeader } from './ConfirmationHeroHeader';
import { ConfirmationActionsRow } from './ConfirmationActionsRow';
import { ConfirmationDeliveryInfo } from './ConfirmationDeliveryInfo';
import { ConfirmationReceiptTable } from './ConfirmationReceiptTable';
import { ConfirmationAuthError } from './ConfirmationAuthError';

export default function Wrapper() {
  const { t } = useLanguage();

  const [order, setOrder] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [cookieToken, setCookieToken] = useState<string>('');
  const currency = '৳';

  useEffect(() => {
    const session = getOrderSession();
    if (!session || !session.orderNumber) {
      fetchApi('/settings/public')
        .then((data) => setSettings(data || {}))
        .catch(() => {});
      setLoading(false);
      setAuthError(true);
      return;
    }

    const tokenFromCookie = session.accessToken || session.cachedOrder?.accessToken || '';
    if (tokenFromCookie) {
      setCookieToken(tokenFromCookie);
    }

    if (session.cachedOrder && session.cachedOrder.orderNumber === session.orderNumber) {
      setOrder({
        ...session.cachedOrder,
        accessToken: session.cachedOrder.accessToken || tokenFromCookie,
      });
      setLoading(false);
    }

    const cleanNum = encodeURIComponent(session.orderNumber.trim());
    const token = encodeURIComponent(tokenFromCookie.trim());
    const verifyPromise = token
      ? fetchApi(`/orders/verify?orderNumber=${cleanNum}&token=${token}`).catch(() => null)
      : Promise.resolve(null);

    Promise.all([
      fetchApi('/settings/public').catch(() => ({})),
      verifyPromise,
    ]).then(([settingsData, orderData]) => {
      if (settingsData) setSettings(settingsData);
      if (orderData && (orderData.id || orderData.orderNumber)) {
        setOrder({
          ...orderData,
          accessToken: orderData.accessToken || tokenFromCookie,
        });
        setAuthError(false);
      } else if (!session.cachedOrder) {
        setAuthError(true);
      }
      setLoading(false);
    });
  }, []);

  const whatsappUrl = useMemo(() => {
    if (!order) return '';
    const waNum = (settings.contact_whatsapp || '8801700000000').replace(/\D/g, '');
    const waMsg = encodeURIComponent(
      `Hello! My Order Number is ${order.orderNumber}. I would like to confirm my order.`,
    );
    return `https://wa.me/${waNum}?text=${waMsg}`;
  }, [settings.contact_whatsapp, order]);

  if (loading) {
    return (
      <div
        className="container py-16 text-center"
        style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <p>
          <i className="fa-solid fa-spinner fa-spin me-2"></i>{' '}
          {t('loading', 'অর্ডার লোড করা হচ্ছে...')}
        </p>
      </div>
    );
  }

  if (authError || !order) {
    return <ConfirmationAuthError />;
  }

  return (
    <div className="confirmation-page-wrapper">
      <div className="container py-5">
        <div className="confirmation-card">
          <ConfirmationHeroHeader
            order={order}
            copied={copied}
            setCopied={setCopied}
            copiedToken={copiedToken}
            setCopiedToken={setCopiedToken}
            cookieToken={cookieToken}
          />

          <ConfirmationActionsRow
            order={order}
            whatsappUrl={whatsappUrl}
            contactPhone={settings.contact_phone}
          />

          <div className="confirmation-grid">
            <ConfirmationDeliveryInfo order={order} currency={currency} />
            <ConfirmationReceiptTable order={order} currency={currency} />
          </div>
        </div>
      </div>
    </div>
  );
}
