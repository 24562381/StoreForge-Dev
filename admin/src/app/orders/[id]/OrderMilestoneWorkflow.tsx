'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface OrderMilestoneWorkflowProps {
  statuses: Array<{ key: string; label: string; color: string }>;
  currentStatus: string;
  updatingStatus: boolean;
  onUpdateStatus: (status: string) => void;
}

export const OrderMilestoneWorkflow = React.memo(function OrderMilestoneWorkflow({
  statuses,
  currentStatus,
  updatingStatus,
  onUpdateStatus,
}: OrderMilestoneWorkflowProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Update Order Milestone</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {statuses.map((st) => (
          <button
            key={st.key}
            disabled={updatingStatus || currentStatus === st.key}
            onClick={() => onUpdateStatus(st.key)}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 border ${
              currentStatus === st.key
                ? 'bg-[#c08a46] text-white border-[#c08a46] shadow-sm scale-105'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {currentStatus === st.key && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{st.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

export default OrderMilestoneWorkflow;
