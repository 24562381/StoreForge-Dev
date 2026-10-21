'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAdminPrefix } from '@/lib/useAdminPrefix';
import { useAdminModal } from '@/lib/AdminModalContext';

import OrderDetailHeader from './OrderDetailHeader';
import OrderMilestoneWorkflow from './OrderMilestoneWorkflow';
import OrderCustomerCard from './OrderCustomerCard';
import OrderManifestTable from './OrderManifestTable';
import OrderPaymentSummaryCard from './OrderPaymentSummaryCard';
import OrderInternalNotesCard from './OrderInternalNotesCard';

const STATUSES = [
  { key: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'processing', label: 'Processing', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'shipped', label: 'Shipped', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'delivered', label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' },
];

const NON_DIGIT_REGEX = /[^0-9]/g;

export default function Wrapper() {
  const prefix = useAdminPrefix();
  const params = useParams();
  const orderId = params?.id;
  const { showSuccess, showError, showConfirm } = useAdminModal();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const loadOrder = useCallback(() => {
    if (!orderId) return;
    setLoading(true);
    fetchApi(`/orders/${orderId}`)
      .then((data) => {
        setOrder(data);
        setAdminNote(data.adminNote || '');
        setLoading(false);
      })
      .catch((err) => {
        showError('Failed to load order: ' + err.message);
        setLoading(false);
      });
  }, [orderId, showError]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleUpdateStatus = useCallback(
    async (newStatus: string) => {
      if (!orderId) return;
      setUpdatingStatus(true);
      try {
        await fetchApi(`/orders/${orderId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        });
        showSuccess(`Order status updated to ${newStatus.toUpperCase()}`);
        loadOrder();
      } catch (err: any) {
        showError(err.message || 'Status update failed');
      } finally {
        setUpdatingStatus(false);
      }
    },
    [orderId, showSuccess, showError, loadOrder]
  );

  const handleSaveAdminNote = useCallback(async () => {
    if (!orderId) return;
    setSavingNote(true);
    try {
      await fetchApi(`/orders/${orderId}/admin-note`, {
        method: 'PUT',
        body: JSON.stringify({ adminNote }),
      });
      showSuccess('Admin note saved!');
      loadOrder();
    } catch (err: any) {
      showError(err.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  }, [orderId, adminNote, showSuccess, showError, loadOrder]);

  const handleSwitchToCod = useCallback(async () => {
    if (!orderId) return;
    const confirmed = await showConfirm(
      'Are you sure you want to switch this order to Cash on Delivery (COD)?',
      {
        title: 'Switch to COD',
        confirmText: 'Switch to COD',
        confirmVariant: 'primary',
      }
    );
    if (!confirmed) return;
    try {
      await fetchApi(`/orders/${orderId}/switch-cod`, {
        method: 'PUT',
        body: JSON.stringify({ adminNote: 'Switched to COD by admin' }),
      });
      showSuccess('Order switched to COD successfully');
      loadOrder();
    } catch (err: any) {
      showError(err.message || 'Failed to switch payment method');
    }
  }, [orderId, showConfirm, showSuccess, showError, loadOrder]);

  const openShippingLabelPopup = useCallback(() => {
    if (!orderId) return;
    const screenWidth =
      typeof window !== 'undefined'
        ? window.innerWidth || document.documentElement.clientWidth || screen.width
        : 1200;
    const screenHeight =
      typeof window !== 'undefined'
        ? window.innerHeight || document.documentElement.clientHeight || screen.height
        : 900;
    const screenLeft =
      typeof window !== 'undefined' && window.screenLeft !== undefined
        ? window.screenLeft
        : typeof window !== 'undefined'
        ? window.screenX
        : 0;
    const screenTop =
      typeof window !== 'undefined' && window.screenTop !== undefined
        ? window.screenTop
        : typeof window !== 'undefined'
        ? window.screenY
        : 0;

    const width = Math.min(1080, Math.max(880, Math.round(screenWidth * 0.85)));
    const height = Math.min(980, Math.max(820, Math.round(screenHeight * 0.92)));
    const left = Math.max(0, Math.round(screenLeft + (screenWidth - width) / 2));
    const top = Math.max(0, Math.round(screenTop + (screenHeight - height) / 2));

    const popup = window.open(
      `${prefix}/orders/${orderId}/shipping-label`,
      `ShippingLabel_${orderId}`,
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
    if (popup) {
      popup.focus();
    }
  }, [orderId, prefix]);

  const currentStatusObj = useMemo(() => {
    return STATUSES.find((s) => s.key === order?.status) || STATUSES[0];
  }, [order?.status]);

  const cleanPhone = useMemo(() => {
    return order?.phone ? order.phone.replace(NON_DIGIT_REGEX, '') : '';
  }, [order?.phone]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-700">Loading Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center text-slate-500 space-y-3">
        <div className="text-4xl">📦</div>
        <h2 className="text-lg font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested order #{orderId} does not exist or could not be loaded.
        </p>
        <Link
          href={`${prefix}/orders`}
          className="inline-block px-4 py-2 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs shadow-sm transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-16">
      <OrderDetailHeader
        order={order}
        prefix={prefix}
        currentStatusObj={currentStatusObj}
        openShippingLabelPopup={openShippingLabelPopup}
        handleSwitchToCod={handleSwitchToCod}
      />

      <OrderMilestoneWorkflow
        statuses={STATUSES}
        currentStatus={order.status}
        updatingStatus={updatingStatus}
        onUpdateStatus={handleUpdateStatus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <OrderCustomerCard order={order} cleanPhone={cleanPhone} />
          <OrderManifestTable items={order.items} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <OrderPaymentSummaryCard order={order} />
          <OrderInternalNotesCard
            adminNote={adminNote}
            setAdminNote={setAdminNote}
            savingNote={savingNote}
            onSaveAdminNote={handleSaveAdminNote}
          />
        </div>
      </div>
    </div>
  );
}
