'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface BkashSimulatorCardProps {
  paymentID: string;
  amount: string;
  order: string;
  wallet: string;
  setWallet: (val: string) => void;
  pin: string;
  setPin: (val: string) => void;
  loading: boolean;
  onSimulateAction: (status: 'success' | 'failure' | 'cancel') => void;
}

export const BkashSimulatorCard = React.memo(function BkashSimulatorCard({
  amount,
  order,
  wallet,
  setWallet,
  pin,
  setPin,
  loading,
  onSimulateAction,
}: BkashSimulatorCardProps) {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2136e]/20">
      {/* bKash Header */}
      <div className="bg-[#e2136e] p-6 text-white text-center space-y-2">
        <div className="text-xs uppercase font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full inline-block">
          bKash PGW Mock Simulator
        </div>
        <h1 className="text-2xl font-black">bKash Payment Gateway</h1>
        <p className="text-xs text-white/80">Merchant: StoreForge Checkout</p>
      </div>

      {/* Order Details */}
      <div className="p-6 bg-stone-50 border-b border-stone-200 flex justify-between items-center text-sm">
        <div>
          <span className="text-xs text-stone-500 block">Invoice / Order</span>
          <span className="font-bold text-stone-800">{order}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-500 block">Total Amount</span>
          <span className="text-xl font-extrabold text-[#e2136e]">৳{amount}</span>
        </div>
      </div>

      {/* Mock Form */}
      <div className="p-6 space-y-5">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Your bKash Account Number
            </label>
            <input
              type="tel"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#e2136e]/50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              bKash PIN (Mock: 12345)
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#e2136e]/50 font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => onSimulateAction('success')}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#e2136e] text-white font-bold text-sm hover:bg-[#c00f5c] transition-colors flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulate Successful Payment</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSimulateAction('failure')}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Simulate Failure
            </button>
            <button
              onClick={() => onSimulateAction('cancel')}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Simulate Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-stone-100 text-center text-xs text-stone-500 border-t border-stone-200">
        This is a sandbox simulator environment for developer testing.
      </div>
    </div>
  );
});
