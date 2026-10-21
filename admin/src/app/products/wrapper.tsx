'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { ProductListHeader } from './ProductListHeader';
import { ProductListTable } from './ProductListTable';

export default function Wrapper() {
  const { showConfirm, showError, showSuccess } = useAdminModal();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadProducts = useCallback(() => {
    setLoading(true);
    fetchApi('/products?status=all&limit=100')
      .then((data) => {
        setProducts(data.items || data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggleExclusive = useCallback(
    async (id: number, currentExclusive: boolean) => {
      const nextExclusive = !currentExclusive;
      setTogglingId(id);

      // Optimistic state update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isExclusive: nextExclusive, is_exclusive: nextExclusive } : p
        )
      );

      try {
        await fetchApi(`/products/${id}/exclusive`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isExclusive: nextExclusive }),
        });
        showSuccess(
          nextExclusive
            ? 'Product marked as Exclusive spotlight'
            : 'Exclusive spotlight removed'
        );
      } catch (err: any) {
        // Revert on error
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isExclusive: currentExclusive, is_exclusive: currentExclusive } : p
          )
        );
        showError(err.message || 'Failed to update exclusive status');
      } finally {
        setTogglingId(null);
      }
    },
    [showSuccess, showError]
  );

  const handleDelete = useCallback(
    async (id: number, name: string) => {
      const confirmed = await showConfirm(
        `Are you sure you want to delete "${name}"? This will permanently remove its variants and images.`,
        {
          title: 'Delete Product',
          confirmText: 'Delete Product',
          confirmVariant: 'danger',
        }
      );
      if (!confirmed) return;

      try {
        await fetchApi(`/products/${id}`, { method: 'DELETE' });
        await showSuccess(`"${name}" was deleted successfully.`);
        loadProducts();
      } catch (err: any) {
        showError(err.message || 'Failed to delete product');
      }
    },
    [showConfirm, showSuccess, showError, loadProducts]
  );

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Products Header */}
      <ProductListHeader />

      {/* 2. Products Table */}
      <ProductListTable
        products={products}
        loading={loading}
        onDelete={handleDelete}
        onToggleExclusive={handleToggleExclusive}
        togglingId={togglingId}
      />
    </div>
  );
}
