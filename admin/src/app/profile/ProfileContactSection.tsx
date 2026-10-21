'use client';

import React from 'react';
import { User } from 'lucide-react';
import PhotoUploader from '@/components/PhotoUploader';

interface ProfileContactSectionProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  photo: string;
  setPhoto: (photo: string) => void;
  canEditConfidential: boolean;
}

export const ProfileContactSection = React.memo(function ProfileContactSection({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  photo,
  setPhoto,
  canEditConfidential,
}: ProfileContactSectionProps) {
  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 uppercase tracking-wider">
        <User className="w-4 h-4 text-[#c08a46]" /> Contact & Profile Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Full Legal Name</span>
            {!canEditConfidential && (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Locked
              </span>
            )}
          </label>
          <input
            type="text"
            disabled={!canEditConfidential}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs ${
              canEditConfidential
                ? 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:border-[#c08a46]'
                : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="017XXXXXXXX"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>

        <div className="sm:col-span-2 pt-1 border-t border-slate-100">
          <PhotoUploader
            label="Profile Avatar Photo"
            value={photo}
            onChange={setPhoto}
            variant="avatar"
            hint="Upload an avatar image (JPG, PNG, WebP). Max 10MB."
          />
        </div>
      </div>
    </div>
  );
});

export default ProfileContactSection;
