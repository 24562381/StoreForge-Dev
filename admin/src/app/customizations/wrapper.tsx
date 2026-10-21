'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomizationsHeader } from './CustomizationsHeader';
import { CustomizationsFilterBar } from './CustomizationsFilterBar';
import { CustomizationsTable } from './CustomizationsTable';
import { CustomizationDetailModal } from './CustomizationDetailModal';

export default function Wrapper() {
  const { showError, showSuccess, showConfirm } = useAdminModal();

  const [requests, setRequests] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected for modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadStats = useCallback(() => {
    fetchApi('/customizations/admin/stats')
      .then((data) => {
        if (data) {
          setStats({
            total: Number(data.total || 0),
            pending: Number(data.pending || 0),
            contacted: Number(data.contacted || 0),
            inProgress: Number(data.inProgress || 0),
            completed: Number(data.completed || 0),
            cancelled: Number(data.cancelled || 0),
          });
        }
      })
      .catch(() => {});
  }, []);

  const loadRequests = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (statusFilter && statusFilter !== 'all') {
      params.append('status', statusFilter);
    }
    if (search.trim()) {
      params.append('search', search.trim());
    }

    fetchApi(`/customizations/admin?${params.toString()}`)
      .then((data) => {
        setRequests(data?.items || []);
        setTotalCount(data?.total || 0);
        setTotalPages(data?.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [page, limit, statusFilter, search]);

  const loadAll = useCallback(() => {
    loadStats();
    loadRequests();
  }, [loadStats, loadRequests]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRequests();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadRequests]);

  const handleViewDetails = (req: any) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number, customerName: string) => {
    const confirmed = await showConfirm(
      `Are you sure you want to permanently delete custom order request #${id} from "${customerName}"?`,
      {
        title: 'Delete Custom Request',
        confirmText: 'Delete Request',
        confirmVariant: 'danger',
      }
    );
    if (!confirmed) return;

    try {
      await fetchApi(`/customizations/admin/${id}`, { method: 'DELETE' });
      showSuccess(`Custom request #${id} deleted.`);
      loadAll();
    } catch (err: any) {
      showError(err.message || 'Failed to delete custom request');
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Header with KPI Cards */}
      <CustomizationsHeader stats={stats} onRefresh={loadAll} />

      {/* 2. Filter Bar with Tabs & Search */}
      <CustomizationsFilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        search={search}
        setSearch={setSearch}
        stats={stats}
      />

      {/* 3. Requests Table */}
      <CustomizationsTable
        requests={requests}
        loading={loading}
        onViewDetails={handleViewDetails}
        onDelete={handleDelete}
      />

      {/* 4. Pagination */}
      {totalCount > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing {Math.min((page - 1) * limit + 1, totalCount)} to{' '}
              {Math.min(page * limit, totalCount)} of {totalCount} requests
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800 cursor-pointer"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-slate-900 font-mono">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Request Details & Management Modal */}
      <CustomizationDetailModal
        request={selectedRequest}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        onUpdated={loadAll}
        showSuccess={showSuccess}
        showError={showError}
      />
    </div>
  );
}
