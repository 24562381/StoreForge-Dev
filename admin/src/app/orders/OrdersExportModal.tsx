'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Calendar,
  Filter,
  Search,
  Package,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  CreditCard,
  Hash,
} from 'lucide-react';
import { fetchApi, getBaseApiUrl, getAdminToken } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';

interface OrdersExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSearch?: string;
  currentStatus?: string;
}

type DatePreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | '7days'
  | '30days'
  | 'this_month'
  | 'last_month'
  | 'custom';

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const OrdersExportModal: React.FC<OrdersExportModalProps> = ({
  isOpen,
  onClose,
  currentSearch = '',
  currentStatus = 'all',
}) => {
  const { showSuccess, showError } = useAdminModal();

  // Filters State
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>(currentStatus || 'all');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<string>('all');
  const [productId, setProductId] = useState<string>('all');
  const [search, setSearch] = useState<string>(currentSearch || '');

  // Products List State
  const [products, setProducts] = useState<Array<{ id: number; name: string }>>([]);

  // Live Summary State
  const [summary, setSummary] = useState<{ count: number; totalAmount: number } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  // Synchronize when opened with current list filters
  useEffect(() => {
    if (isOpen) {
      if (currentStatus && currentStatus !== 'all') {
        setStatus(currentStatus);
      }
      if (currentSearch && currentSearch.trim()) {
        setSearch(currentSearch.trim());
      }
    }
  }, [isOpen, currentStatus, currentSearch]);

  // Load Products for dropdown
  useEffect(() => {
    if (!isOpen) return;
    fetchApi('/products?status=all&limit=100')
      .then((data) => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products.map((p: any) => ({ id: p.id, name: p.name })));
        } else if (Array.isArray(data)) {
          setProducts(data.map((p: any) => ({ id: p.id, name: p.name })));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Handle Date Preset Click
  const handlePresetChange = useCallback((preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = formatDate(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = formatDate(y);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(formatDate(past));
      setEndDate(formatDate(now));
    } else if (preset === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(now));
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(now));
    } else if (preset === 'last_month') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(formatDate(firstDayLastMonth));
      setEndDate(formatDate(lastDayLastMonth));
    } else if (preset === 'custom') {
      // Keep existing custom dates
    }
  }, []);

  // Compute live summary of matching orders (Debounced)
  useEffect(() => {
    if (!isOpen) return;

    setLoadingSummary(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (status && status !== 'all') params.set('status', status);
      if (paymentStatus && paymentStatus !== 'all') params.set('paymentStatus', paymentStatus);
      if (paymentMethod && paymentMethod !== 'all') params.set('paymentMethod', paymentMethod);
      if (productId && productId !== 'all') params.set('productId', productId);
      if (search && search.trim()) params.set('search', search.trim());

      fetchApi(`/orders/admin/export-summary?${params.toString()}`)
        .then((res) => {
          if (res) {
            setSummary({
              count: Number(res.count) || 0,
              totalAmount: Number(res.totalAmount) || 0,
            });
          }
        })
        .catch(() => {
          setSummary(null);
        })
        .finally(() => {
          setLoadingSummary(false);
        });
    }, 280);

    return () => clearTimeout(timer);
  }, [isOpen, startDate, endDate, status, paymentStatus, paymentMethod, productId, search]);

  // Reset all filters to default
  const handleReset = useCallback(() => {
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setStatus('all');
    setPaymentStatus('all');
    setPaymentMethod('all');
    setProductId('all');
    setSearch('');
  }, []);

  // Download Excel File (.xlsx)
  const handleDownload = async () => {
    if (downloading) return;
    if (summary && summary.count === 0) {
      showError('No orders match your chosen filters. Please adjust criteria.');
      return;
    }

    setDownloading(true);

    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (status && status !== 'all') params.set('status', status);
      if (paymentStatus && paymentStatus !== 'all') params.set('paymentStatus', paymentStatus);
      if (paymentMethod && paymentMethod !== 'all') params.set('paymentMethod', paymentMethod);
      if (productId && productId !== 'all') params.set('productId', productId);
      if (search && search.trim()) params.set('search', search.trim());

      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${getBaseApiUrl()}/orders/admin/export-excel?${params.toString()}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Export request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;

      // Clean descriptive filename
      const datePart = startDate && endDate
        ? `${startDate}_to_${endDate}`
        : startDate
        ? `from_${startDate}`
        : endDate
        ? `until_${endDate}`
        : 'All_Time';
      a.download = `StoreForge_Orders_${datePart}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showSuccess('✨ Excel orders report downloaded successfully!');
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to generate Excel report');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 id="export-modal-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                Export Orders to Excel
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Generate and download formatted .xlsx spreadsheet with custom filters
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs flex-1">
          {/* 1. Date Range & Quick Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Date Range Selection</span>
            </label>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'custom', label: 'Custom' },
              ].map((p) => {
                const isActive = datePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetChange(p.id as DatePreset)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Start and End Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">From Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">To Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Order Status & Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Order Status</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="all">All Statuses (Pending, Shipped, etc.)</option>
                <option value="pending">⏳ Pending (New Orders)</option>
                <option value="confirmed">✓ Confirmed</option>
                <option value="processing">📦 Processing</option>
                <option value="shipped">🚚 Shipped / In Transit</option>
                <option value="delivered">🎉 Delivered</option>
                <option value="cancelled">✕ Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Payment Status</span>
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">✓ Paid (Online / Verified)</option>
                <option value="unpaid">⏱ Unpaid / Cash on Delivery</option>
              </select>
            </div>
          </div>

          {/* 3. Product Filter & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>Specific Product Filter</span>
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="all">All Products in Store</option>
                {products.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Payment Method</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="all">All Methods (COD & Online)</option>
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="bkash">bKash PGW</option>
              </select>
            </div>
          </div>

          {/* 4. Comprehensive Custom Search Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Custom Search Filter</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search phone number, name, product, address, #order..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Matches customer name, phone number, product title, delivery address, district, or order #.
            </p>
          </div>

          {/* 5. Live Summary Preview Callout */}
          <div className="p-3.5 sm:p-4 rounded-xl border transition-all bg-slate-50/80 border-slate-200/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {loadingSummary ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                ) : summary && summary.count > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <span>Matching Orders:</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                      {loadingSummary ? '...' : (summary?.count ?? 0)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {loadingSummary ? (
                      'Calculating total order values...'
                    ) : summary && summary.count > 0 ? (
                      `Total Revenue: ৳ ${(summary.totalAmount || 0).toLocaleString()}`
                    ) : (
                      'No orders match the current criteria'
                    )}
                  </div>
                </div>
              </div>

              {/* Reset button inside summary */}
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Toolbar */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || loadingSummary || (summary !== null && summary.count === 0)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Excel File...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  Download Excel ({summary ? summary.count : 0} Orders)
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersExportModal;
