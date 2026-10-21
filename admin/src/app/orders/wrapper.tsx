'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminPrefix } from '@/lib/useAdminPrefix';

import { OrdersHeader } from './OrdersHeader';
import { OrdersFilterBar } from './OrdersFilterBar';
import { OrdersTable } from './OrdersTable';
import { OrdersPagination } from './OrdersPagination';
import { OrdersExportModal } from './OrdersExportModal';

export default function Wrapper() {
  const prefix = useAdminPrefix();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    paidOrders: 0,
  });

  const loadStats = useCallback(() => {
    fetchApi('/orders/admin/stats')
      .then((data) => {
        if (data) {
          setStats({
            totalOrders: data.totalOrders || data.total_orders || 0,
            totalRevenue: Number(data.totalRevenue || data.total_revenue || 0),
            pendingOrders: data.pendingOrders || data.pending_count || 0,
            deliveredOrders: data.deliveredOrders || data.delivered_count || 0,
            paidOrders: data.paidOrders || data.paid_count || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const loadOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
      paymentMethod: paymentMethodFilter,
      district: districtFilter,
      sortBy: sortBy,
      search: search.trim(),
    });

    fetchApi(`/orders/admin/list?${params.toString()}`)
      .then((data) => {
        setOrders(data.orders || data.items || []);
        setTotalCount(data.totalCount || data.total || 0);
        setTotalPages(data.totalPages || Math.ceil((data.totalCount || 1) / limit) || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, limit, statusFilter, paymentStatusFilter, paymentMethodFilter, districtFilter, sortBy, search]);

  useEffect(() => {
    loadStats();
    loadOrders();
  }, [loadStats, loadOrders]);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setPaymentMethodFilter('all');
    setDistrictFilter('all');
    setSearch('');
    setSortBy('date_desc');
    setPage(1);
  };

  const handleOpenLabelPopup = (orderId: number) => {
    const width = 850;
    const height = 900;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      `${prefix}/orders/${orderId}/shipping-label`,
      `shipping_label_${orderId}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`
    );
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Orders Header & Statistics */}
      <OrdersHeader
        stats={stats}
        onRefresh={() => {
          loadStats();
          loadOrders();
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* 2. Filter & Search Bar */}
      <OrdersFilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        districtFilter={districtFilter}
        setDistrictFilter={setDistrictFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Orders Table */}
      <OrdersTable
        orders={orders}
        loading={loading}
        onOpenLabelPopup={handleOpenLabelPopup}
      />

      {/* 4. Pagination */}
      <OrdersPagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        setPage={setPage}
        setLimit={setLimit}
      />

      {/* 5. Orders Excel Export Popup Modal */}
      <OrdersExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentSearch={search}
        currentStatus={statusFilter}
      />
    </div>
  );
}
