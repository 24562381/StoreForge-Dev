'use client';

import React, { useState } from 'react';
import { Store, Languages, LayoutGrid, Check, Globe, ChevronRight } from 'lucide-react';
import StoreLogoUploader from '@/components/StoreLogoUploader';
import FaviconUploader from '@/components/FaviconUploader';
import { HomepageWhyUsSection } from './HomepageWhyUsSection';

interface GeneralSettingsSectionProps {
  settings: Record<string, string>;
  handleChange: (key: string, value: string) => void;
}

export const GeneralSettingsSection = React.memo(function GeneralSettingsSection({ settings, handleChange }: GeneralSettingsSectionProps) {
  const [brandNameLang, setBrandNameLang] = useState<'en' | 'bn'>('en');
  const [taglineLang, setTaglineLang] = useState<'en' | 'bn'>('bn');

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3">
        <Store className="w-5 h-5 text-[#c08a46]" />
        <span className="text-base">Store Identity, Branding & Presentation</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Store Brand Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Store Brand Name
              <span className="ml-1.5 text-[10px] font-normal text-slate-500 font-mono">
                ({brandNameLang === 'en' ? 'English' : 'বাংলা'})
              </span>
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setBrandNameLang('en')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  brandNameLang === 'en'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => setBrandNameLang('bn')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  brandNameLang === 'bn'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🇧🇩 বাংলা
              </button>
            </div>
          </div>

          {brandNameLang === 'en' ? (
            <input
              type="text"
              value={settings.store_name_en !== undefined ? settings.store_name_en : settings.store_name || 'StoreForge'}
              onChange={(e) => {
                handleChange('store_name_en', e.target.value);
                handleChange('store_name', e.target.value);
                handleChange('site_name', e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46]"
              placeholder="e.g. StoreForge"
            />
          ) : (
            <input
              type="text"
              value={settings.store_name_bn || ''}
              onChange={(e) => {
                handleChange('store_name_bn', e.target.value);
                handleChange('site_name_bn', e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46]"
              placeholder="e.g. স্টোরফোর্জ"
            />
          )}
          <span className="text-[11px] text-slate-400 mt-1 block">
            {brandNameLang === 'en'
              ? 'English store brand text (displayed when browsing in English)'
              : 'বাংলা ভাষায় স্টোর ব্রাউজ করার সময় প্রদর্শিত ব্র্যান্ডের নাম'}
          </span>
        </div>

        {/* Store Tagline / Slogan */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Store Tagline / Slogan
              <span className="ml-1.5 text-[10px] font-normal text-slate-500 font-mono">
                ({taglineLang === 'en' ? 'English' : 'বাংলা'})
              </span>
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setTaglineLang('en')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  taglineLang === 'en'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                type="button"
                onClick={() => setTaglineLang('bn')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  taglineLang === 'bn'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🇧🇩 বাংলা
              </button>
            </div>
          </div>

          {taglineLang === 'en' ? (
            <input
              type="text"
              value={settings.store_tagline_en || ''}
              onChange={(e) => handleChange('store_tagline_en', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46]"
              placeholder="e.g. Handcrafted Luxury 3D Wooden Maps & Wall Art"
            />
          ) : (
            <input
              type="text"
              value={settings.store_tagline_bn !== undefined ? settings.store_tagline_bn : settings.store_tagline || 'স্টোরফোর্জ — প্রিমিয়াম অনলাইন শপ'}
              onChange={(e) => {
                handleChange('store_tagline_bn', e.target.value);
                handleChange('store_tagline', e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#c08a46]"
              placeholder="e.g. স্টোরফোর্জ — প্রিমিয়াম অনলাইন শপ"
            />
          )}
          <span className="text-[11px] text-slate-400 mt-1 block">
            {taglineLang === 'en'
              ? 'English slogan/tagline for header, search and social meta'
              : 'বাংলা ভাষায় প্রদর্শিত স্টোরের মূল স্লোগান বা বিবরণ'}
          </span>
        </div>

        <StoreLogoUploader
          value={settings.store_logo_url || ''}
          onChange={(url) => handleChange('store_logo_url', url)}
        />

        <FaviconUploader
          label="Storefront Favicon (Public)"
          type="store"
          value={settings.store_favicon_url || ''}
          onChange={(url) => handleChange('store_favicon_url', url)}
        />

        <FaviconUploader
          label="Admin Panel Favicon"
          type="admin"
          value={settings.admin_favicon_url || ''}
          onChange={(url) => handleChange('admin_favicon_url', url)}
        />

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Currency Symbol & Code</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={settings.currency_symbol || '৳'}
              onChange={(e) => handleChange('currency_symbol', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold text-center focus:bg-white focus:outline-none focus:border-[#c08a46]"
              placeholder="৳"
            />
            <input
              type="text"
              value={settings.currency_code || 'BDT'}
              onChange={(e) => handleChange('currency_code', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold text-center focus:bg-white focus:outline-none focus:border-[#c08a46]"
              placeholder="BDT"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Order Number Prefix</span>
            <span className="text-[10px] font-normal text-slate-400">Prefix for newly generated order IDs</span>
          </label>
          <input
            type="text"
            value={settings.order_prefix !== undefined ? settings.order_prefix : 'SF'}
            onChange={(e) => {
              const val = e.target.value.replace(/^#+/, '').toUpperCase();
              handleChange('order_prefix', val);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm font-bold uppercase focus:bg-white focus:outline-none focus:border-[#c08a46]"
            placeholder="SF"
            maxLength={16}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 mt-1 gap-1">
            <span>Default is <strong>SF</strong>. e.g. SF, ORD, WWM</span>
            <span className="font-mono text-slate-600 font-semibold">
              Live Preview: <span className="text-[#c08a46] font-bold">#{(settings.order_prefix !== undefined ? settings.order_prefix : 'SF').trim().replace(/^#+/, '').toUpperCase() || 'SF'}000106</span>
            </span>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Customer Storefront Live Base URL</span>
            <span className="text-[10px] font-normal text-slate-400">Used by [View Store] &amp; [Visit Live Store]</span>
          </label>
          <input
            type="text"
            value={settings.store_url || ''}
            onChange={(e) => handleChange('store_url', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:bg-white focus:outline-none focus:border-[#c08a46]"
            placeholder="e.g. https://yourdomain.com or http://20.204.59.105:3000"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Overrides the FRONTEND_URL / NEXT_PUBLIC_STORE_URL from .env when saved. Leave empty to use server .env.
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
          <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-[#c08a46]" />
            <span>Default Language (Customer Side)</span>
          </label>
          <select
            value={settings.default_language || 'bn'}
            onChange={(e) => handleChange('default_language', e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#c08a46] cursor-pointer"
          >
            <option value="bn">বাংলা — Bengali (BN)</option>
            <option value="en">English — English (EN)</option>
          </select>
          <span className="text-[11px] text-amber-900/70 mt-1 block">
            Default language loaded for customer visitors
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 mb-1">Free Delivery Min Order (৳)</label>
          <input
            type="number"
            value={settings.free_delivery_min_amount || '0'}
            onChange={(e) => handleChange('free_delivery_min_amount', e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-[#c08a46]"
            placeholder="0 (Set to 0 to disable)"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Leave 0 if standard delivery applies to all
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 mb-1">Store Maintenance Mode</label>
          <select
            value={settings.maintenance_mode || 'off'}
            onChange={(e) => handleChange('maintenance_mode', e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-[#c08a46]"
          >
            <option value="off">🟢 Live & Accepting Orders</option>
            <option value="on">🔴 Maintenance Mode</option>
          </select>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Enables maintenance notice for visitors
          </span>
        </div>
      </div>

      {/* Homepage Category Card Style Selection */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-900 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#c08a46]" />
              <span>Homepage Category Card Style</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Choose how categories are displayed on the storefront homepage selection section.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200">
            Active: {(settings.category_card_style || 'capsule') === 'grid' ? 'Classic Vertical Card' : 'Modern Capsule (Default)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Modern Horizontal Capsule (Default) */}
          <button
            type="button"
            onClick={() => handleChange('category_card_style', 'capsule')}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
              (settings.category_card_style || 'capsule') !== 'grid'
                ? 'border-[#c08a46] bg-amber-50/40 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Modern Horizontal Capsule</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  New / Default
                </span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  (settings.category_card_style || 'capsule') !== 'grid'
                    ? 'border-[#c08a46] bg-[#c08a46] text-white'
                    : 'border-slate-300'
                }`}
              >
                {(settings.category_card_style || 'capsule') !== 'grid' && (
                  <Check className="w-2.5 h-2.5" />
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Horizontal pill capsule with rounded icon box, category name, product count, and subtle right chevron.
            </p>

            {/* Visual Miniature Mockup */}
            <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#EADDCF] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFE5D8] border border-[#DFCEBD] flex items-center justify-center text-slate-700 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Featured Collection</div>
                <div className="text-[10px] text-slate-500">1 Items</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </div>
          </button>

          {/* Option 2: Classic Vertical Card */}
          <button
            type="button"
            onClick={() => handleChange('category_card_style', 'grid')}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
              settings.category_card_style === 'grid'
                ? 'border-[#c08a46] bg-amber-50/40 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Classic Vertical Card</span>
                <span className="text-[10px] font-semibold text-slate-400">Classic</span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  settings.category_card_style === 'grid'
                    ? 'border-[#c08a46] bg-[#c08a46] text-white'
                    : 'border-slate-300'
                }`}
              >
                {settings.category_card_style === 'grid' && (
                  <Check className="w-2.5 h-2.5" />
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Traditional vertical card with square top image, centered category title, and item count underneath.
            </p>

            {/* Visual Miniature Mockup */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center text-center w-28 mx-auto">
              <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#8E5A35] mb-1">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-slate-900">Collection</div>
              <div className="text-[9px] text-slate-400">1 Items</div>
            </div>
          </button>
        </div>
      </div>

      {/* Homepage Why Choose Us Section Settings (Cards vs Paragraph Mode) */}
      <HomepageWhyUsSection settings={settings} handleChange={handleChange} />
    </div>
  );
});

export default GeneralSettingsSection;
