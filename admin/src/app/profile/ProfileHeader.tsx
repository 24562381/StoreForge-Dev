'use client';

import React from 'react';
import { Save, Check } from 'lucide-react';

interface ProfileHeaderProps {
  photo: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  onSave: (e: React.FormEvent) => void;
  savingProfile: boolean;
  savedSuccess: boolean;
}

export const ProfileHeader = React.memo(function ProfileHeader({
  photo,
  name,
  email,
  isSuperAdmin,
  onSave,
  savingProfile,
  savedSuccess,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-black text-2xl flex items-center justify-center overflow-hidden shadow-md shrink-0">
          {photo ? (
            <img
              src={photo}
              alt={name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{(name || 'Staff').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900">{name}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isSuperAdmin
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}
            >
              {isSuperAdmin ? '👑 Super Administrator' : '🛡️ Moderator'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={savingProfile}
        className="px-5 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
      >
        {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
        <span>{savingProfile ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Changes'}</span>
      </button>
    </div>
  );
});

export default ProfileHeader;
