'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Palette,
  Ruler,
  DollarSign,
  Calendar,
  FileText,
  Save,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  Ban,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface CustomizationDetailModalProps {
  request: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export const CustomizationDetailModal = React.memo(function CustomizationDetailModal({
  request,
  isOpen,
  onClose,
  onUpdated,
  showSuccess,
  showError,
}: CustomizationDetailModalProps) {
  const [status, setStatus] = useState<string>('pending');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Escape key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  // Clean phone for WhatsApp / tel
  const rawPhone = (request.customerPhone || '').replace(/[^0-9]/g, '');
  const waNumber = rawPhone.startsWith('880')
    ? rawPhone
    : rawPhone.startsWith('0')
    ? `88${rawPhone}`
    : rawPhone;

  const safeReferenceImage =
    request.referenceImage &&
    (request.referenceImage.startsWith('/uploads/') ||
      request.referenceImage.startsWith('https://') ||
      request.referenceImage.startsWith('http://'))
      ? request.referenceImage
      : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchApi(`/customizations/admin/${request.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          adminNotes: adminNotes.trim(),
        }),
      });
      showSuccess(`Request #${request.id} updated successfully.`);
      onUpdated();
      onClose();
    } catch (err: any) {
      showError(err.message || 'Failed to update request');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Phone className="w-3 h-3" />
            <span>Contacted</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <Wrench className="w-3 h-3" />
            <span>In Progress</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {s}
          </span>
        );
    }
  };

  const formattedDate = request.createdAt
    ? new Date(request.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'N/A';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-[#c08a46] border border-amber-200/60">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Custom Request #{request.id}</h3>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Submitted on {formattedDate}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Customer Contact & Quick Actions */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Customer Information
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {request.customerPhone && (
                  <>
                    <a
                      href={`tel:${encodeURIComponent(request.customerPhone)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
                      title="Direct Phone Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://wa.me/${encodeURIComponent(waNumber)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors shadow-2xs"
                      title="Open WhatsApp Chat"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer Name</span>
                <span className="font-bold text-slate-900 text-sm">{request.customerName}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Phone Number</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{request.customerPhone}</span>
              </div>

              {request.customerEmail && (
                <div>
                  <span className="text-slate-400 block font-medium">Email Address</span>
                  <a
                    href={`mailto:${request.customerEmail}`}
                    className="font-semibold text-slate-800 hover:text-[#c08a46] flex items-center gap-1 truncate"
                  >
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{request.customerEmail}</span>
                  </a>
                </div>
              )}

              {request.customerAddress && (
                <div>
                  <span className="text-slate-400 block font-medium">Delivery Address / City</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{request.customerAddress}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Customization Requirements */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2">
              Specifications & Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Ruler className="w-3.5 h-3.5 text-[#c08a46]" />
                  <span>Size / Dimensions</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {request.preferredSize || 'Default / Not Specified'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Palette className="w-3.5 h-3.5 text-[#c08a46]" />
                  <span>Color / Wood Stain</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {request.preferredColor || 'Standard'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Budget Range</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {request.estimatedBudget || 'Flexible'}
                </div>
              </div>
            </div>

            {/* Description / Instructions */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-700 block mb-1.5">
                Customer Description & Requested Add-ons:
              </span>
              <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                {request.description}
              </p>
            </div>

            {/* Reference Image Preview */}
            {safeReferenceImage && (
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Attached Reference Photo:</span>
                  <a
                    href={safeReferenceImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#c08a46] hover:underline flex items-center gap-1"
                  >
                    <span>Open Full Size</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="max-w-xs rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                  <img
                    src={safeReferenceImage}
                    alt="Reference attached by customer"
                    className="w-full h-auto object-cover max-h-56"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Admin Status & Internal Notes */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Staff Management & Status
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Update Request Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#c08a46] cursor-pointer"
                >
                  <option value="pending">Pending (New Unattended)</option>
                  <option value="contacted">Contacted (Customer Called)</option>
                  <option value="in_progress">In Progress (Crafting / Design)</option>
                  <option value="completed">Completed (Delivered / Settled)</option>
                  <option value="cancelled">Cancelled (Declined / Inactive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Internal Staff Notes & Quoted Price
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Quoted ৳ 12,500 with LED frame. Customer agreed on Dark Walnut. Dispatch by Tuesday."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Updates</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default CustomizationDetailModal;
