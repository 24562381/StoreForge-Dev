'use client';

import React, { useState, useCallback } from 'react';
import { CreditCard, Truck, Zap, Edit, X, Shield, RefreshCw, Save, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';

interface PaymentGatewaysSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export const PaymentGatewaysSection = React.memo(function PaymentGatewaysSection({ settings, handleChange }: PaymentGatewaysSectionProps) {
  const { showSuccess, showError } = useAdminModal();
  const [editingPaymentModal, setEditingPaymentModal] = useState<'cod' | 'bkash' | null>(null);
  const [showBkashSecret, setShowBkashSecret] = useState(false);
  const [showBkashPass, setShowBkashPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSavePaymentModal = useCallback(async () => {
    setSaving(true);
    try {
      await fetchApi('/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setEditingPaymentModal(null);
      showSuccess('Payment method configuration saved successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to save payment configuration');
    } finally {
      setSaving(false);
    }
  }, [settings, showSuccess, showError]);

  return (
    <div className="space-y-6">
      {/* 1. Master Payment Methods Switchboard */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Payment Methods Activation Control</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Enable or disable payment options and click <span className="font-bold text-purple-700">Edit</span> to configure credentials & notices in a popup modal.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Method 1: Cash on Delivery */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
            settings.payment_cod_enabled !== 'false'
              ? 'border-emerald-200 bg-emerald-50/30 ring-1 ring-emerald-300/50 shadow-2xs'
              : 'border-slate-200 bg-slate-50/50 opacity-85 shadow-2xs'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</h4>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      settings.payment_cod_enabled !== 'false'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {settings.payment_cod_enabled !== 'false' ? 'ACTIVE & VISIBLE' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment_cod_enabled !== 'false'}
                    onChange={(e) => handleChange('payment_cod_enabled', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <p className="text-xs text-slate-600 mb-2">
                Allows customers to inspect their wooden map parcel upon arrival and pay cash to the courier.
              </p>

              {settings.payment_cod_instructions ? (
                <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 text-[11px] text-slate-600 truncate">
                  <span className="font-semibold text-emerald-800">Notice:</span> {settings.payment_cod_instructions}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">No custom notice set</div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
              <span className="text-[11px] font-medium text-slate-500">
                Standard COD Workflow
              </span>
              <button
                type="button"
                onClick={() => setEditingPaymentModal('cod')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Config</span>
              </button>
            </div>
          </div>

          {/* Method 2: bKash Online Gateway */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
            settings.payment_bkash_enabled !== 'false'
              ? 'border-pink-200 bg-pink-50/30 ring-1 ring-pink-300/50 shadow-2xs'
              : 'border-slate-200 bg-slate-50/50 opacity-85 shadow-2xs'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#E2136E] flex items-center justify-center font-bold text-sm">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">bKash Online Gateway (PGW)</h4>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      settings.payment_bkash_enabled !== 'false'
                        ? 'bg-pink-100 text-[#E2136E]'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {settings.payment_bkash_enabled !== 'false' ? 'ACTIVE & VISIBLE' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment_bkash_enabled !== 'false'}
                    onChange={(e) => handleChange('payment_bkash_enabled', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E2136E]"></div>
                </label>
              </div>

              <p className="text-xs text-slate-600 mb-2">
                Enables direct tokenized online payment processing via official bKash merchant integration or sandbox simulator.
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                  settings.bkash_environment === 'live'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {settings.bkash_environment === 'live' ? '🚀 Live Production' : '🛠️ Sandbox Simulator'}
                </span>
                {settings.payment_bkash_instructions && (
                  <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {settings.payment_bkash_instructions}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
              <span className="text-[11px] font-medium text-slate-500">
                Official bKash PGW API
              </span>
              <button
                type="button"
                onClick={() => setEditingPaymentModal('bkash')}
                className="px-3 py-1.5 rounded-xl bg-[#E2136E] hover:bg-[#c90f61] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COD Popup Modal */}
      {editingPaymentModal === 'cod' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cash on Delivery (COD) Configuration</h3>
                  <p className="text-xs text-slate-500">Manage customer notices and checkout activation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPaymentModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/50">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Enable Cash on Delivery at Checkout</h4>
                  <p className="text-[11px] text-slate-500">When enabled, customers can choose COD during checkout</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment_cod_enabled !== 'false'}
                    onChange={(e) => handleChange('payment_cod_enabled', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-700">Custom COD Notice (Optional)</label>
                <input
                  type="text"
                  value={settings.payment_cod_instructions || ''}
                  onChange={(e) => handleChange('payment_cod_instructions', e.target.value)}
                  placeholder="e.g. ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম চার্জ নেই।"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-500">
                  This text is shown to the customer when they select Cash on Delivery on the checkout page.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Order Security:</strong> COD orders are placed immediately without online gateway redirection. The delivery charge policy configured in the Delivery tab applies.
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 bg-white border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingPaymentModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePaymentModal}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save COD Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* bKash & MFS Popup Modal */}
      {editingPaymentModal === 'bkash' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#E2136E] flex items-center justify-center font-bold text-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">bKash Payment Gateway Configuration</h3>
                  <p className="text-xs text-slate-500">Manage tokenized PGW API credentials and environment mode</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPaymentModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Enable bKash Gateway at Checkout</h4>
                  <p className="text-[11px] text-slate-500">Allows customers to pay via online bKash tokenized gateway</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment_bkash_enabled !== 'false'}
                    onChange={(e) => handleChange('payment_bkash_enabled', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E2136E]"></div>
                </label>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold text-slate-700">bKash Notice / Promo Line (Optional)</label>
                <input
                  type="text"
                  value={settings.payment_bkash_instructions || ''}
                  onChange={(e) => handleChange('payment_bkash_instructions', e.target.value)}
                  placeholder="e.g. বিকাশ অনলাইন পেমেন্টে ইনস্ট্যান্ট কনফার্মেশন।"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#E2136E]"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#e2136e]" />
                  <span>bKash Payment Gateway (PGW) Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">bKash Environment</label>
                    <select
                      value={settings.bkash_environment || 'sandbox'}
                      onChange={(e) => handleChange('bkash_environment', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e]"
                    >
                      <option value="sandbox">🛠️ Sandbox / Testing Mode (with interactive simulator)</option>
                      <option value="live">🚀 Live / Production Tokenized Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">bKash App Key</label>
                    <input
                      type="text"
                      value={settings.bkash_app_key || ''}
                      onChange={(e) => handleChange('bkash_app_key', e.target.value)}
                      placeholder="app_key_..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#e2136e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">bKash App Secret</label>
                    <div className="relative">
                      <input
                        type={showBkashSecret ? 'text' : 'password'}
                        value={settings.bkash_app_secret || ''}
                        onChange={(e) => handleChange('bkash_app_secret', e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#e2136e]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBkashSecret(!showBkashSecret)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showBkashSecret ? 'Hide secret' : 'Show secret'}
                      >
                        {showBkashSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">bKash Merchant Username</label>
                    <input
                      type="text"
                      value={settings.bkash_username || ''}
                      onChange={(e) => handleChange('bkash_username', e.target.value)}
                      placeholder="merchant_username"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#e2136e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">bKash Merchant Password</label>
                    <div className="relative">
                      <input
                        type={showBkashPass ? 'text' : 'password'}
                        value={settings.bkash_password || ''}
                        onChange={(e) => handleChange('bkash_password', e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#e2136e]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBkashPass(!showBkashPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showBkashPass ? 'Hide password' : 'Show password'}
                      >
                        {showBkashPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Sandbox / Fallback Simulation:</strong> If live credentials are empty or environment is set to Sandbox, the checkout automatically uses the built-in interactive bKash simulator.
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 bg-white border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingPaymentModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePaymentModal}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-[#E2136E] hover:bg-[#c90f61] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save bKash Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PaymentGatewaysSection;
