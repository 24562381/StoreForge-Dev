'use client';

import React from 'react';
import { Clock, Save } from 'lucide-react';

interface OrderInternalNotesCardProps {
  adminNote: string;
  setAdminNote: (val: string) => void;
  savingNote: boolean;
  onSaveAdminNote: () => void;
}

export const OrderInternalNotesCard = React.memo(function OrderInternalNotesCard({
  adminNote,
  setAdminNote,
  savingNote,
  onSaveAdminNote,
}: OrderInternalNotesCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#c08a46]" /> Internal Verification Notes
      </h2>
      <textarea
        rows={4}
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        placeholder="Add internal verification notes, courier tracking number..."
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
      />
      <button
        onClick={onSaveAdminNote}
        disabled={savingNote}
        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <Save className="w-3.5 h-3.5" />
        <span>{savingNote ? 'Saving...' : 'Save Internal Note'}</span>
      </button>
    </div>
  );
});

export default OrderInternalNotesCard;
