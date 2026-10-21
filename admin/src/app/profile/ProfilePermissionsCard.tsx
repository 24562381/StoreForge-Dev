'use client';

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { ALL_PERMISSIONS } from '@/lib/permissions';

interface ProfilePermissionsCardProps {
  isSuperAdmin: boolean;
  userPerms: string[];
}

export const ProfilePermissionsCard = React.memo(function ProfilePermissionsCard({ isSuperAdmin, userPerms }: ProfilePermissionsCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5 uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4 text-[#c08a46]" /> Active Role & Access
      </h2>

      <div className="space-y-2">
        <div className="text-xs text-slate-600">
          You are currently authenticated as a{' '}
          <span className="font-bold text-slate-900">{isSuperAdmin ? 'Super Administrator' : 'Moderator'}</span>.
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {isSuperAdmin ? (
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Unrestricted All Modules (*)</span>
            </span>
          ) : userPerms.length > 0 ? (
            userPerms.map((perm) => {
              const def = ALL_PERMISSIONS.find((p) => p.key === perm);
              return (
                <span
                  key={perm}
                  className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold"
                >
                  {def?.label || perm}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 italic">No assigned module permissions</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProfilePermissionsCard;
