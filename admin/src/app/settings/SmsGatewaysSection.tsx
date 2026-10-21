'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

interface SmsGatewaysSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export const SmsGatewaysSection = React.memo(function SmsGatewaysSection({ settings, handleChange }: SmsGatewaysSectionProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
        <MessageSquare className="w-5 h-5 text-emerald-600" />
        <span className="text-base">SMS Notification Gateways (GreenWeb, BulkSMSBD, ElitBuzz)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">SMS Provider</label>
          <select
            value={settings.sms_provider || 'none'}
            onChange={(e) => handleChange('sms_provider', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="none">Disabled (No SMS)</option>
            <option value="greenweb">Greenweb SMS</option>
            <option value="bulksmsbd">BulkSMSBD</option>
            <option value="elitbuzz">ElitBuzz SMS</option>
            <option value="alphasms">Alpha Net SMS</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">SMS API Key / Token</label>
          <input
            type="password"
            value={settings.sms_api_key || ''}
            onChange={(e) => handleChange('sms_api_key', e.target.value)}
            placeholder="••••••••••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Sender ID / Masking</label>
          <input
            type="text"
            value={settings.sms_sender_id || ''}
            onChange={(e) => handleChange('sms_sender_id', e.target.value)}
            placeholder="WOODENMAP"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Order Placed Customer SMS Template
          </label>
          <textarea
            rows={2}
            value={
              settings.sms_order_placed_template ||
              'Dear {customer_name}, your order #{order_number} for ৳{amount} has been received! Track status: {track_url}. Wooden Map BD'
            }
            onChange={(e) => handleChange('sms_order_placed_template', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
          />
          <span className="text-[11px] text-slate-400">
            Supported placeholders: {'{customer_name}'}, {'{order_number}'}, {'{amount}'}, {'{track_url}'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Admin Alert Mobile Number (for instant new order alerts)
          </label>
          <input
            type="text"
            value={settings.admin_alert_phone || ''}
            onChange={(e) => handleChange('admin_alert_phone', e.target.value)}
            placeholder="01700000000"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>
    </div>
  );
});

export default SmsGatewaysSection;
