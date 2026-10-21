'use client';

import React from 'react';
import {
  Eye,
  Trash2,
  Phone,
  MessageCircle,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  Wrench,
  Ban,
  Calendar,
} from 'lucide-react';

interface CustomizationsTableProps {
  requests: any[];
  loading: boolean;
  onViewDetails: (request: any) => void;
  onDelete: (id: number, customerName: string) => void;
}

export const CustomizationsTable = React.memo(function CustomizationsTable({
  requests,
  loading,
  onViewDetails,
  onDelete,
}: CustomizationsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center text-slate-500 shadow-sm">
        <div className="w-8 h-8 border-3 border-[#c08a46] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading customization requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">No customization requests found.</p>
        <p className="text-xs text-slate-400 mt-1">
          When customers submit custom map requests from the storefront, they will show up here.
        </p>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-2.5 h-2.5" />
            <span>Pending</span>
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Phone className="w-2.5 h-2.5" />
            <span>Contacted</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <Wrench className="w-2.5 h-2.5" />
            <span>In Progress</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-2.5 h-2.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[900px]">
          <thead className="text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/70">
            <tr>
              <th className="p-4 whitespace-nowrap">Req #</th>
              <th className="p-4 whitespace-nowrap min-w-[140px]">Customer</th>
              <th className="p-4 whitespace-nowrap min-w-[120px]">Size & Color</th>
              <th className="p-4 min-w-[200px]">Requirements</th>
              <th className="p-4 text-center whitespace-nowrap">Reference</th>
              <th className="p-4 whitespace-nowrap">Budget</th>
              <th className="p-4 whitespace-nowrap">Status</th>
              <th className="p-4 whitespace-nowrap">Date</th>
              <th className="p-4 text-right whitespace-nowrap min-w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {requests.map((req) => {
              const rawPhone = (req.customerPhone || '').replace(/[^0-9]/g, '');
              const waNumber = rawPhone.startsWith('880')
                ? rawPhone
                : rawPhone.startsWith('0')
                ? `88${rawPhone}`
                : rawPhone;

              const dateStr = req.createdAt
                ? new Date(req.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A';

              const safeReferenceImage =
                req.referenceImage &&
                (req.referenceImage.startsWith('/uploads/') ||
                  req.referenceImage.startsWith('https://') ||
                  req.referenceImage.startsWith('http://'))
                  ? req.referenceImage
                  : null;

              return (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Request ID */}
                  <td className="p-4 font-mono font-bold text-[#c08a46]">
                    #{req.id}
                  </td>

                  {/* Customer Info & Direct Comms */}
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{req.customerName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-slate-600 text-[11px]">{req.customerPhone}</span>
                      <a
                        href={`https://wa.me/${encodeURIComponent(waNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${encodeURIComponent(req.customerPhone)}`}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    {req.customerAddress && (
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                        {req.customerAddress}
                      </div>
                    )}
                  </td>

                  {/* Size & Color */}
                  <td className="p-4">
                    <div className="font-bold text-slate-800">
                      {req.preferredSize || 'Default'}
                    </div>
                    <div className="text-[11px] text-amber-800 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block mt-0.5 font-medium max-w-[150px] truncate">
                      {req.preferredColor || 'Standard'}
                    </div>
                  </td>

                  {/* Requirements / Description Snippet */}
                  <td className="p-4 max-w-xs">
                    <p className="text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {req.description}
                    </p>
                    {req.adminNotes && (
                      <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                        Note: {req.adminNotes}
                      </span>
                    )}
                  </td>

                  {/* Reference Image Thumbnail */}
                  <td className="p-4 text-center">
                    {safeReferenceImage ? (
                      <a
                        href={safeReferenceImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block relative group"
                        title="Click to view reference image"
                      >
                        <img
                          src={safeReferenceImage}
                          alt="Customer Reference"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ) : (
                      <span className="text-slate-300">
                        <ImageIcon className="w-4 h-4 mx-auto" />
                      </span>
                    )}
                  </td>

                  {/* Budget */}
                  <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                    {req.estimatedBudget || 'Flexible'}
                  </td>

                  {/* Status */}
                  <td className="p-4 whitespace-nowrap">
                    {renderStatusBadge(req.status)}
                  </td>

                  {/* Date */}
                  <td className="p-4 whitespace-nowrap text-slate-500 font-medium">
                    {dateStr}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(req)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#c08a46] hover:text-white text-slate-700 transition-colors cursor-pointer"
                        title="View & Edit Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(req.id, req.customerName)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors cursor-pointer border border-rose-100"
                        title="Delete Request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default CustomizationsTable;
