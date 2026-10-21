'use client';

import React from 'react';
import { Globe, Search } from 'lucide-react';

interface SeoAnalyticsSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export const SeoAnalyticsSection = React.memo(function SeoAnalyticsSection({ settings, handleChange }: SeoAnalyticsSectionProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
        <Globe className="w-5 h-5 text-indigo-600" />
        <span className="text-base">Search Engine Optimization (SEO) & Tracking Pixels</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Meta Title</label>
          <input
            type="text"
            value={settings.meta_title || settings.site_title || '3D Wooden World Map — Luxury Handcrafted Wall Art Bangladesh'}
            onChange={(e) => {
              handleChange('meta_title', e.target.value);
              handleChange('site_title', e.target.value);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
            placeholder="3D Wooden World Map..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Description (150-160 characters)</label>
          <textarea
            rows={3}
            value={
              settings.meta_description ||
              'Premium handcrafted 3D wooden world map made with multi-layered birch wood. Laser-cut perfection with nationwide cash on delivery.'
            }
            onChange={(e) => handleChange('meta_description', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
            placeholder="Premium handcrafted 3D wooden world map..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Meta Keywords (Comma separated)</label>
          <input
            type="text"
            value={settings.meta_keywords || 'wooden world map, 3d wall map, home decor bangladesh, luxury interior, birch wood map'}
            onChange={(e) => handleChange('meta_keywords', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
            placeholder="wooden world map, 3d map, ..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">OpenGraph Social Share Image URL</label>
          <input
            type="text"
            value={settings.meta_og_image || '/images/og-share.jpg'}
            onChange={(e) => handleChange('meta_og_image', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
            placeholder="/images/og-share.jpg"
          />
        </div>
      </div>

      {/* Tracking Pixels */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Search className="w-5 h-5 text-indigo-600" />
          <span className="text-base">Analytics & Conversion Tracking</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Google Analytics 4 Measurement ID</label>
            <input
              type="text"
              value={settings.google_analytics_id || ''}
              onChange={(e) => handleChange('google_analytics_id', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook / Meta Pixel ID</label>
            <input
              type="text"
              value={settings.facebook_pixel_id || ''}
              onChange={(e) => handleChange('facebook_pixel_id', e.target.value)}
              placeholder="e.g. 123456789012345"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Custom Header Scripts (e.g. GTM, Clarity, TikTok Pixel)</label>
          <textarea
            rows={4}
            value={settings.custom_header_scripts || ''}
            onChange={(e) => handleChange('custom_header_scripts', e.target.value)}
            placeholder="<script>...</script>"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
});

export default SeoAnalyticsSection;
