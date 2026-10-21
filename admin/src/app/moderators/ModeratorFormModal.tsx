'use client';

import React from 'react';
import {
  X,
  UserPlus,
  Edit2,
  Check,
  Lock,
  Sparkles,
  Shield,
  ShieldCheck,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
} from 'lucide-react';
import PhotoUploader from '@/components/PhotoUploader';
import {
  ALL_PERMISSIONS,
  PERMISSION_PRESETS,
  PermissionDefinition,
} from '@/lib/permissions';

interface ModeratorFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  editingId: number | null;
  formData: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    photo: string;
    nidNumber: string;
    nidPhoto: string;
    presentAddress: string;
    permanentAddress: string;
    isActive: boolean;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      password: string;
      role: string;
      phone: string;
      photo: string;
      nidNumber: string;
      nidPhoto: string;
      presentAddress: string;
      permanentAddress: string;
      isActive: boolean;
    }>
  >;
  selectedPermissions: string[];
  setSelectedPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  saving: boolean;
  currentUser?: { role?: string } | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ModeratorFormModal = React.memo(function ModeratorFormModal({
  isOpen,
  isEditing,
  editingId,
  formData,
  setFormData,
  selectedPermissions,
  setSelectedPermissions,
  saving,
  currentUser,
  onClose,
  onSubmit,
}: ModeratorFormModalProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePermission = React.useCallback((permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  }, [setSelectedPermissions]);

  const applyPreset = React.useCallback((perms: string[]) => {
    setSelectedPermissions(perms);
  }, [setSelectedPermissions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-[#c08a46]">
              {isEditing ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">
                {isEditing ? `Edit Staff Member #${editingId}` : 'Add New Staff Member'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure role, granular permissions, and identity verification credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form with Fixed Footer */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Scrollable Form Body */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
            {/* Section 1: Basic Profile */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">
                1. Basic Profile & Authentication
              </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="tanvir@storeforge.io"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isEditing ? 'New Password (Leave blank to keep unchanged)' : 'Initial Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isEditing}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder={isEditing ? '••••••••' : 'Min 6 characters'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Type</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#c08a46]"
                >
                  <option value="moderator">🛡️ Moderator (Granular permissions)</option>
                  {currentUser?.role === 'admin' && (
                    <option value="admin">👑 Super Admin (Full system access)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.value === 'true' }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#c08a46]"
                >
                  <option value="true">🟢 Active (Access granted)</option>
                  <option value="false">🔴 Suspended (Access revoked)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Profile Photo</label>
              <PhotoUploader
                value={formData.photo || ''}
                onChange={(url) => setFormData((prev) => ({ ...prev, photo: url }))}
                label="Upload Staff Avatar Photo"
              />
            </div>
          </div>

          {/* Section 2: Permissions Matrix */}
          {formData.role !== 'admin' && (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Granular Role-Based Permissions
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select exactly which administration modules this moderator is authorized to access
                  </p>
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                  {PERMISSION_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset.permissions)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => applyPreset(ALL_PERMISSIONS.map((p) => p.key))}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors"
                  >
                    All Permissions
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset([])}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px] font-bold transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_PERMISSIONS.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.key);
                  return (
                    <div
                      key={perm.key}
                      onClick={() => togglePermission(perm.key)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                        isChecked
                          ? 'border-[#c08a46] bg-amber-50/40 text-slate-900 shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5 text-[#c08a46]">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs">{perm.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                          {perm.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Identity Verification & Confidential Records */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Identity Verification & Confidential Records
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Securely record staff identification details. Confidential data is visible only to Super Admins.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  National ID (NID) Number
                </label>
                <input
                  type="text"
                  value={formData.nidNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nidNumber: e.target.value }))}
                  placeholder="e.g. 1995XXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  NID Document Photo
                </label>
                <PhotoUploader
                  value={formData.nidPhoto || ''}
                  onChange={(url) => setFormData((prev) => ({ ...prev, nidPhoto: url }))}
                  label="Upload Scanned NID Card"
                  variant="document"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Present Address</label>
                <textarea
                  rows={2}
                  value={formData.presentAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, presentAddress: e.target.value }))
                  }
                  placeholder="House, Road, Area, City, Postal Code"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Address</label>
                <textarea
                  rows={2}
                  value={formData.permanentAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, permanentAddress: e.target.value }))
                  }
                  placeholder="Permanent village/town address"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#c08a46]"
                />
              </div>
            </div>
          </div>
          </div>

          {/* Fixed Modal Footer Toolbar */}
          <div className="p-4 sm:p-5 sm:px-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving Staff...' : isEditing ? 'Update Staff Member' : 'Save Staff Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ModeratorFormModal;
