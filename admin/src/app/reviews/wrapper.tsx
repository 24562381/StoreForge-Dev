'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';

import { ReviewsHeader } from './ReviewsHeader';
import { ReviewsTable } from './ReviewsTable';
import { AddReviewModal } from './AddReviewModal';

export default function Wrapper() {
  const { showError, showSuccess, showConfirm } = useAdminModal();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadReviews = useCallback(() => {
    setLoading(true);
    fetchApi('/reviews/admin/list')
      .then((data) => {
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleTogglePublish = useCallback(
    async (id: number) => {
      try {
        await fetchApi(`/reviews/${id}/toggle-publish`, { method: 'PUT' });
        loadReviews();
        showSuccess('Review publication status updated.');
      } catch (err: any) {
        showError(err.message || 'Action failed');
      }
    },
    [loadReviews, showSuccess, showError]
  );

  const handleToggleFeature = useCallback(
    async (id: number) => {
      try {
        await fetchApi(`/reviews/${id}/toggle-feature`, { method: 'PUT' });
        loadReviews();
        showSuccess('Review featured status updated.');
      } catch (err: any) {
        showError(err.message || 'Action failed');
      }
    },
    [loadReviews, showSuccess, showError]
  );

  const handleDeleteReview = useCallback(
    async (id: number, customerName: string) => {
      const confirmed = await showConfirm(
        `Are you sure you want to permanently delete the review by "${customerName}"?`,
        {
          title: 'Delete Customer Review',
          confirmText: 'Delete Review',
          confirmVariant: 'danger',
        }
      );
      if (!confirmed) return;

      try {
        await fetchApi(`/reviews/${id}`, { method: 'DELETE' });
        loadReviews();
        showSuccess(`Review by "${customerName}" was deleted.`);
      } catch (err: any) {
        showError(err.message || 'Failed to delete review');
      }
    },
    [loadReviews, showConfirm, showSuccess, showError]
  );

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Header with Add Button */}
      <ReviewsHeader onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* 2. Reviews Table with Delete & Toggles */}
      <ReviewsTable
        reviews={reviews}
        loading={loading}
        onTogglePublish={handleTogglePublish}
        onToggleFeature={handleToggleFeature}
        onDeleteReview={handleDeleteReview}
      />

      {/* 3. Popup Modal for Adding Dummy Product Reviews */}
      <AddReviewModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadReviews}
        showSuccess={showSuccess}
        showError={showError}
      />
    </div>
  );
}
