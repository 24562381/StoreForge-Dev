'use client';

import React from 'react';
import { Users, UserPlus } from 'lucide-react';

interface ModeratorsHeaderProps {
  canManageStaff: boolean;
  onOpenAddModal: () => void;
}

export const ModeratorsHeader = React.memo(function ModeratorsHeader({ canManageStaff, onOpenAddModal }: ModeratorsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-[#c08a46] border border-amber-200/60">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Moderators</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular Role-Based Access Control (RBAC), team permissions, and confidential identity verification
            </p>
          </div>
        </div>
      </div>

      {canManageStaff && (
        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Staff</span>
        </button>
      )}
    </div>
  );
});

export default ModeratorsHeader;
