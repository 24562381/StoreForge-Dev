'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';

import { PromoCodesHeader } from './PromoCodesHeader';
import { PromoCodesFilterBar } from './PromoCodesFilterBar';
import { PromoCodesTable } from './PromoCodesTable';
import { PromoCodeModal } from './PromoCodeModal';

interface PromoCode {
  id: number;
  code: string;
  description: string | null;
  discountType: 'fixed' | 'percentage';
  discountValue: string | number;
  minOrderAmount: string | number | null;
  maxDiscountAmount: string | number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Wrapper() {
  const { showSuccess, showError, showWarning, showConfirm } = useAdminModal();

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number | string>('100');
  const [minOrderAmount, setMinOrderAmount] = useState<number | string>('0');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | string>('');
  const [usageLimit, setUsageLimit] = useState<number | string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const loadPromos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/promo-codes/admin');
      setPromos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showError(err.message || 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setCode('');
    setDescription('');
    setDiscountType('fixed');
    setDiscountValue('100');
    setMinOrderAmount('0');
    setMaxDiscountAmount('');
    setUsageLimit('');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PromoCode) => {
    setEditingPromo(p);
    setCode(p.code);
    setDescription(p.description || '');
    setDiscountType(p.discountType);
    setDiscountValue(p.discountValue);
    setMinOrderAmount(p.minOrderAmount ?? '0');
    setMaxDiscountAmount(p.maxDiscountAmount ?? '');
    setUsageLimit(p.usageLimit ?? '');
    setStartDate(p.startDate ? p.startDate.split('T')[0] : '');
    setEndDate(p.endDate ? p.endDate.split('T')[0] : '');
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showWarning('Please enter a coupon code.');
      return;
    }
    if (Number(discountValue) <= 0) {
      showWarning('Discount value must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        isActive,
      };

      if (editingPromo) {
        await fetchApi(`/promo-codes/admin/${editingPromo.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showSuccess(`Promo code "${code}" updated.`);
      } else {
        await fetchApi('/promo-codes/admin', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showSuccess(`Promo code "${code}" created.`);
      }

      setIsModalOpen(false);
      loadPromos();
    } catch (err: any) {
      showError(err.message || 'Failed to save promo code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, promoCode: string) => {
    const confirmed = await showConfirm(
      `Are you sure you want to delete promo code "${promoCode}"?`,
      {
        title: 'Delete Promo Code',
        confirmText: 'Delete Promo Code',
        confirmVariant: 'danger',
      }
    );
    if (!confirmed) return;

    try {
      await fetchApi(`/promo-codes/admin/${id}`, { method: 'DELETE' });
      showSuccess(`Promo code "${promoCode}" was deleted.`);
      loadPromos();
    } catch (err: any) {
      showError(err.message || 'Failed to delete promo code');
    }
  };

  const handleCopyCode = (promoCode: string) => {
    try {
      navigator.clipboard.writeText(promoCode);
      setCopiedCode(promoCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {}
  };

  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q || p.code.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));

      const isExpired = p.endDate && new Date(p.endDate) < new Date();
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = p.isActive && !isExpired;
      if (statusFilter === 'inactive') matchesStatus = !p.isActive;
      if (statusFilter === 'expired') matchesStatus = !!isExpired;

      return matchesSearch && matchesStatus;
    });
  }, [promos, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Header */}
      <PromoCodesHeader onOpenCreate={handleOpenCreate} />

      {/* 2. Filter Bar */}
      <PromoCodesFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCount={promos.length}
      />

      {/* 3. Promo Codes Table */}
      <PromoCodesTable
        promos={filteredPromos}
        loading={loading}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* 4. Add/Edit Modal */}
      <PromoCodeModal
        isOpen={isModalOpen}
        editingPromo={editingPromo}
        code={code}
        setCode={setCode}
        description={description}
        setDescription={setDescription}
        discountType={discountType}
        setDiscountType={setDiscountType}
        discountValue={discountValue}
        setDiscountValue={setDiscountValue}
        minOrderAmount={minOrderAmount}
        setMinOrderAmount={setMinOrderAmount}
        maxDiscountAmount={maxDiscountAmount}
        setMaxDiscountAmount={setMaxDiscountAmount}
        usageLimit={usageLimit}
        setUsageLimit={setUsageLimit}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        isActive={isActive}
        setIsActive={setIsActive}
        submitting={submitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
