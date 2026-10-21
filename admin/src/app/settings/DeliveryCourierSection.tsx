'use client';

import React from 'react';
import { Truck, Package } from 'lucide-react';

interface DeliveryCourierSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export const DeliveryCourierSection = React.memo(function DeliveryCourierSection({ settings, handleChange }: DeliveryCourierSectionProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
        <Truck className="w-5 h-5 text-[#c08a46]" />
        <span className="text-base">Nationwide Shipping Rates & Delivery Timeframes</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Inside Dhaka Delivery Charge (৳ BDT)
          </label>
          <input
            type="number"
            value={settings.delivery_charge_dhaka ?? ''}
            onChange={(e) => handleChange('delivery_charge_dhaka', e.target.value)}
            placeholder="80"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-[#c08a46]"
          />
          <p className="text-[11px] text-slate-500">Applied automatically when customer selects Dhaka district (Default: ৳80)</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Outside Dhaka Delivery Charge (৳ BDT)
          </label>
          <input
            type="number"
            value={settings.delivery_charge_outside ?? ''}
            onChange={(e) => handleChange('delivery_charge_outside', e.target.value)}
            placeholder="150"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-[#c08a46]"
          />
          <p className="text-[11px] text-slate-500">Applied for all 63 districts outside Dhaka (Default: ৳150)</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Timeline (Inside Dhaka)</label>
          <input
            type="text"
            value={settings.delivery_time_dhaka ?? ''}
            onChange={(e) => handleChange('delivery_time_dhaka', e.target.value)}
            placeholder="24-48 Hours"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Timeline (Outside Dhaka)</label>
          <input
            type="text"
            value={settings.delivery_time_outside ?? ''}
            onChange={(e) => handleChange('delivery_time_outside', e.target.value)}
            placeholder="2-4 Business Days"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46]"
          />
        </div>
      </div>

      {/* Courier API Gateways */}
      <div className="pt-6 border-t border-slate-100 space-y-5">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Package className="w-5 h-5 text-blue-600" />
          <span className="text-base">Courier & Automated Consignment APIs</span>
        </div>

        {/* Steadfast Courier */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Steadfast Courier API
            </span>
            <span className="text-[11px] text-slate-400">One-click parcel booking</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Steadfast API Key</label>
              <input
                type="text"
                value={settings.steadfast_api_key || ''}
                onChange={(e) => handleChange('steadfast_api_key', e.target.value)}
                placeholder="e.g. stdf_apikey_..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Steadfast Secret Key</label>
              <input
                type="password"
                value={settings.steadfast_secret_key || ''}
                onChange={(e) => handleChange('steadfast_secret_key', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Pathao Courier */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Pathao Courier Merchant API
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pathao Client ID</label>
              <input
                type="text"
                value={settings.pathao_client_id || ''}
                onChange={(e) => handleChange('pathao_client_id', e.target.value)}
                placeholder="Client ID"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pathao Client Secret</label>
              <input
                type="password"
                value={settings.pathao_client_secret || ''}
                onChange={(e) => handleChange('pathao_client_secret', e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Store / Warehouse ID</label>
              <input
                type="text"
                value={settings.pathao_store_id || ''}
                onChange={(e) => handleChange('pathao_store_id', e.target.value)}
                placeholder="e.g. 10452"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DeliveryCourierSection;
