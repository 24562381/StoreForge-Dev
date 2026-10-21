'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface NidPreviewModalProps {
  photoUrl: string | null;
  onClose: () => void;
}

export const NidPreviewModal = React.memo(function NidPreviewModal({ photoUrl, onClose }: NidPreviewModalProps) {
  if (!photoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">National ID Verification Document</h3>
          <div className="flex items-center gap-2">
            <a
              href={photoUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Size</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center max-h-[75vh]">
          <img
            src={photoUrl}
            alt="NID Card"
            loading="lazy"
            decoding="async"
            className="max-w-full max-h-[75vh] object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
});

export default NidPreviewModal;
