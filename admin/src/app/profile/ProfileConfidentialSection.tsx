'use client';

import React from 'react';
import { CreditCard, Lock, Info } from 'lucide-react';
import PhotoUploader from '@/components/PhotoUploader';

interface ProfileConfidentialSectionProps {
  nidNumber: string;
  setNidNumber: (nid: string) => void;
  nidPhoto: string;
  setNidPhoto: (photo: string) => void;
  presentAddress: string;
  setPresentAddress: (addr: string) => void;
  permanentAddress: string;
  setPermanentAddress: (addr: string) => void;
  canEditConfidential: boolean;
}

export const ProfileConfidentialSection = React.memo(function ProfileConfidentialSection({
  nidNumber,
  setNidNumber,
  nidPhoto,
  setNidPhoto,
  presentAddress,
  setPresentAddress,
  permanentAddress,
  setPermanentAddress,
  canEditConfidential,
}: ProfileConfidentialSectionProps) {
  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <CreditCard className="w-4 h-4 text-[#c08a46]" /> Confidential Verification Records
        </h2>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Secure NID
        </span>
      </div>

      {!canEditConfidential && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Administrative Change Policy</div>
            <div className="text-[11px] text-amber-800 mt-0.5">
              Your National ID and official residential addresses are locked for security compliance. If you need to update them, please submit a request to the system administrator.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">National ID (NID) Number</label>
          <input
            type="text"
            disabled={!canEditConfidential}
            value={nidNumber}
            onChange={(e) => setNidNumber(e.target.value)}
            placeholder="Not provided"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
              canEditConfidential
                ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c08a46]'
                : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
            }`}
          />
        </div>

        <div>
          <PhotoUploader
            label="NID Document Photo"
            value={nidPhoto}
            onChange={setNidPhoto}
            variant="document"
            disabled={!canEditConfidential}
            hint="Upload front/back of NID card or verification document."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Present Address</label>
          <textarea
            rows={2}
            disabled={!canEditConfidential}
            value={presentAddress}
            onChange={(e) => setPresentAddress(e.target.value)}
            placeholder="Not provided"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
              canEditConfidential
                ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c08a46]'
                : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Address</label>
          <textarea
            rows={2}
            disabled={!canEditConfidential}
            value={permanentAddress}
            onChange={(e) => setPermanentAddress(e.target.value)}
            placeholder="Not provided"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
              canEditConfidential
                ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c08a46]'
                : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
            }`}
          />
        </div>
      </div>
    </div>
  );
});

export default ProfileConfidentialSection;
