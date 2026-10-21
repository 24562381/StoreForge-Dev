'use client';

import React from 'react';
import { Key } from 'lucide-react';

interface ProfilePasswordCardProps {
  currentPassword: string;
  setCurrentPassword: (p: string) => void;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  savingPassword: boolean;
}

export const ProfilePasswordCard = React.memo(function ProfilePasswordCard({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  savingPassword,
}: ProfilePasswordCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5 uppercase tracking-wider">
        <Key className="w-4 h-4 text-[#c08a46]" /> Update Account Password
      </h2>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 6 characters"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>

        <button
          type="submit"
          disabled={savingPassword}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer disabled:opacity-50 mt-2"
        >
          {savingPassword ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
});

export default ProfilePasswordCard;
