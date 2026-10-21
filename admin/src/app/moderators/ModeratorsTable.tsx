'use client';

import React from 'react';
import {
  Mail,
  Phone,
  Sparkles,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  Trash2,
  Lock,
  Eye,
  Key,
  CreditCard,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { ALL_PERMISSIONS } from '@/lib/permissions';

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  photo?: string | null;
  nidNumber?: string | null;
  nidPhoto?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  permissions?: string | string[] | null;
  isActive: boolean;
  isConfidentialRedacted?: boolean;
}

interface ModeratorsTableProps {
  staffList: StaffUser[];
  currentUser: StaffUser | null;
  canManageStaff: boolean;
  expandedConfidentialId: number | null;
  setExpandedConfidentialId: (id: number | null) => void;
  onPreviewNid: (url: string) => void;
  onEditStaff: (user: StaffUser) => void;
  onToggleStatus: (user: StaffUser) => void;
  onDeleteStaff: (user: StaffUser) => void;
}

const parsePermissions = (perms: string | string[] | null | undefined): string[] => {
  if (!perms) return [];
  if (Array.isArray(perms)) return perms;
  try {
    return JSON.parse(perms);
  } catch {
    return [];
  }
};

export const ModeratorsTable = React.memo(function ModeratorsTable({
  staffList,
  currentUser,
  canManageStaff,
  expandedConfidentialId,
  setExpandedConfidentialId,
  onPreviewNid,
  onEditStaff,
  onToggleStatus,
  onDeleteStaff,
}: ModeratorsTableProps) {
  if (staffList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <Shield className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#c08a46]" />
        <p className="text-sm font-semibold text-slate-700">No staff accounts found</p>
        <p className="text-xs text-slate-400 mt-0.5">Try refining your search query or role filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {staffList.map((user) => {
        const userPerms = parsePermissions(user.permissions);

        const isSuperAdmin = user.role === 'admin';
        const isCurrentLoggedIn = currentUser?.id === user.id;
        const isExpanded = expandedConfidentialId === user.id;

        return (
          <div
            key={user.id}
            className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden flex flex-col justify-between ${
              user.isActive === false
                ? 'border-red-200 bg-red-50/10'
                : isSuperAdmin
                ? 'border-amber-200/80 ring-1 ring-amber-300/30'
                : 'border-slate-200/90'
            }`}
          >
            <div className="p-5 sm:p-6 space-y-4">
              {/* Header Profile Strip */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-black text-base text-slate-700">
                        {(user.name || 'M').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{user.name}</h3>
                      {isCurrentLoggedIn && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role & Status Badges */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                      isSuperAdmin
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {isSuperAdmin ? '👑 Super Admin' : '🛡️ Moderator'}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      user.isActive !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </div>
              </div>

              {/* Permissions Summary Badges */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Assigned Capabilities:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {isSuperAdmin ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Full Unrestricted Administration (*)</span>
                    </span>
                  ) : userPerms.length > 0 ? (
                    userPerms.map((perm) => {
                      const def = ALL_PERMISSIONS.find((p) => p.key === perm);
                      return (
                        <span
                          key={perm}
                          className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 text-[11px] font-medium"
                        >
                          {def?.label || perm}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                  )}
                </div>
              </div>

              {/* Confidential Verification Details Section */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExpandedConfidentialId(isExpanded ? null : user.id)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 py-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Identity Verification & Confidential Records</span>
                  </div>
                  <span className="text-[11px] text-[#c08a46] hover:underline">
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-fade-in">
                    {user.isConfidentialRedacted ? (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Confidential data is redacted. Only Super Admins or account owners can view NID details.</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" /> National ID:
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {user.nidNumber || 'Not Provided'}
                          </span>
                        </div>

                        {user.nidPhoto && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> NID Document:
                            </span>
                            <button
                              type="button"
                              onClick={() => onPreviewNid(user.nidPhoto!)}
                              className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View Photo
                            </button>
                          </div>
                        )}

                        {user.presentAddress && (
                          <div>
                            <span className="text-slate-500 block mb-0.5 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Present Address:
                            </span>
                            <p className="text-slate-800 font-medium pl-5">{user.presentAddress}</p>
                          </div>
                        )}

                        {user.permanentAddress && (
                          <div>
                            <span className="text-slate-500 block mb-0.5 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Permanent Address:
                            </span>
                            <p className="text-slate-800 font-medium pl-5">{user.permanentAddress}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Bar */}
            {canManageStaff && (
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleStatus(user)}
                  disabled={isCurrentLoggedIn || user.id === 1 || user.email === 'admin@storeforge.io'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 ${
                    user.isActive !== false
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {user.isActive !== false ? 'Suspend Account' : 'Reactivate'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEditStaff(user)}
                    disabled={isSuperAdmin && currentUser?.role !== 'admin'}
                    className="p-2 rounded-lg bg-white hover:bg-[#c08a46] hover:text-white border border-slate-200 text-slate-700 font-bold transition-all shadow-2xs disabled:opacity-40"
                    title="Edit Role & Permissions"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteStaff(user)}
                    disabled={
                      isCurrentLoggedIn ||
                      user.id === 1 ||
                      user.email === 'admin@storeforge.io' ||
                      (isSuperAdmin && currentUser?.role !== 'admin')
                    }
                    className="p-2 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-500 font-bold transition-all shadow-2xs disabled:opacity-40"
                    title="Delete Staff Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default ModeratorsTable;
