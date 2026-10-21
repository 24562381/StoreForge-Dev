'use client';

import React, { useState, useCallback } from 'react';
import { Shield, Lock, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, KeyRound, Server } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface AdminSecuritySectionProps {
  settings?: Record<string, string>;
  handleChange?: (key: string, value: string) => void;
}

export const AdminSecuritySection = React.memo(function AdminSecuritySection({ settings, handleChange }: AdminSecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetchApi('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      setPasswordSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 text-slate-900 font-bold border-b border-slate-100 pb-3.5">
        <div className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-600">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900 block">Admin Credentials & Security Protection</span>
          <span className="text-xs text-slate-500 font-normal">
            Manage administrator authentication credentials, access controls, and platform security best practices
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Column 1: Admin Password Change Form */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Update the master account password for the admin portal. Requires verifying your current active password.
              </p>
            </div>

            <form id="change-pwd-form" onSubmit={handleChangePassword} className="space-y-3.5 pt-1">
              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password (Min 6 chars)</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-red-600"
                />
              </div>
            </form>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <button
              type="submit"
              form="change-pwd-form"
              disabled={updatingPassword}
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow disabled:opacity-50"
            >
              {updatingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{updatingPassword ? 'Updating...' : 'Change Password'}</span>
            </button>
          </div>
        </div>

        {/* Column 2: Platform Security & Best Practice Guidelines */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Access Control & Protection Standards</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                StoreForge employs multi-tiered backend security defenses to protect your administrative operations.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Server className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Subdomain & Network Isolation</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  The Admin Portal operates on an isolated service port (<span className="font-mono font-semibold text-slate-700">4000</span>). In production, keep this restricted to a dedicated subdomain (e.g. <span className="font-mono font-semibold text-slate-700">admin.yourstore.com</span>) or protected behind Cloudflare Zero Trust / IP whitelisting.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Active Database Identity Enforcement</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Every administrative request is verified in real-time against the database. If an account is suspended or role permissions are revoked, all active sessions are instantly invalidated.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Automated Brute-Force Rate Limiting</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Authentication endpoints are protected by rate-limiting tiers that automatically block rapid credential stuffing and dictionary attacks.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>StoreForge Security Architecture v2.0 Active</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdminSecuritySection;

