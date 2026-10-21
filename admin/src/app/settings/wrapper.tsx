'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { setCachedStoreUrl } from '@/lib/storeUrl';
import { SettingsHeader } from './SettingsHeader';
import { SettingsTabNav, TabType } from './SettingsTabNav';
import { GeneralSettingsSection } from './GeneralSettingsSection';
import { ProductDefaultsSection } from './ProductDefaultsSection';
import { CustomMapSettingsSection } from './CustomMapSettingsSection';
import { ContactSocialSection } from './ContactSocialSection';
import { DeliveryCourierSection } from './DeliveryCourierSection';
import { PaymentGatewaysSection } from './PaymentGatewaysSection';
import { SeoAnalyticsSection } from './SeoAnalyticsSection';
import { SmsGatewaysSection } from './SmsGatewaysSection';
import { InvoicePrintSection } from './InvoicePrintSection';
import { AiStudioSection, AiAgent } from './AiStudioSection';
import { AdminSecuritySection } from './AdminSecuritySection';
import { StorageSettingsSection } from './StorageSettingsSection';
import { SettingsFloatingBar } from './SettingsFloatingBar';

export default function Wrapper() {
  const { showSuccess, showError } = useAdminModal();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [aiAgents, setAiAgents] = useState<AiAgent[]>([]);

  const loadSettings = useCallback(async () => {
    try {
      let data: Record<string, string> = {};
      try {
        const adminData = await fetchApi('/settings/admin', { cache: 'no-store' });
        if (Array.isArray(adminData)) {
          for (const item of adminData) {
            if (item && item.key) {
              data[item.key] = item.value ?? '';
            }
          }
        } else if (adminData && typeof adminData === 'object') {
          data = adminData;
        }
      } catch {
        const publicData = await fetchApi('/settings/public', { cache: 'no-store' });
        data = publicData || {};
      }

      const merged: Record<string, string> = {
        facebook_url: 'https://facebook.com/woodenworldmapbd',
        instagram_url: 'https://instagram.com/woodenworldmap',
        youtube_url: '',
        tiktok_url: '',
        contact_address: 'House 12, Road 5, Dhanmondi, Dhaka, Bangladesh',
        contact_phone_secondary: '+880 1900-000000',
        ...(data || {}),
      };
      setSettings(merged);
      const resolvedStoreUrl = merged?.store_url || merged?.frontend_url;
      if (resolvedStoreUrl) {
        setCachedStoreUrl(resolvedStoreUrl);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAiAgents = useCallback(async () => {
    try {
      const agents = await fetchApi('/ai/agents');
      if (Array.isArray(agents) && agents.length > 0) {
        setAiAgents(agents);
      }
    } catch (err) {
      console.error('Failed to load AI agents', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadAiAgents();
  }, [loadSettings, loadAiAgents]);

  const handleChange = useCallback((key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveSettings = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const dhakaVal = settings.delivery_charge_dhaka !== undefined && settings.delivery_charge_dhaka !== null && settings.delivery_charge_dhaka !== ''
      ? String(settings.delivery_charge_dhaka).trim()
      : '80';

    const outsideVal = settings.delivery_charge_outside !== undefined && settings.delivery_charge_outside !== null && settings.delivery_charge_outside !== ''
      ? String(settings.delivery_charge_outside).trim()
      : '150';

    const updatedSettings: Record<string, string> = {
      ...settings,
      delivery_charge_dhaka: dhakaVal || '80',
      delivery_charge_outside: outsideVal || '150',
    };

    if (updatedSettings.store_url !== undefined) {
      updatedSettings.frontend_url = updatedSettings.store_url;
    }

    try {
      await fetchApi('/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(updatedSettings),
      });
      setSettings(updatedSettings);
      if (updatedSettings.store_url !== undefined) {
        setCachedStoreUrl(updatedSettings.store_url);
      }
      if (updatedSettings.store_name_en || updatedSettings.store_name) {
        const newTitle = updatedSettings.store_name_en || updatedSettings.store_name;
        try {
          localStorage.setItem('sf_admin_site_title', newTitle);
          window.dispatchEvent(new CustomEvent('sf_site_title_updated', { detail: newTitle }));
        } catch {}
      }
      if (updatedSettings.admin_favicon_url) {
        try {
          localStorage.setItem('sf_admin_favicon', updatedSettings.admin_favicon_url);
          window.dispatchEvent(new CustomEvent('sf_favicon_updated', { detail: updatedSettings.admin_favicon_url }));
        } catch {}
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      showSuccess('All store settings saved successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [settings, showSuccess, showError]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700">Loading System Configuration & Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-28">
      <SettingsHeader />

      <SettingsTabNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="space-y-6">
        {activeTab === 'general' && (
          <GeneralSettingsSection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'product_defaults' && (
          <ProductDefaultsSection settings={settings} handleChange={handleChange} onNavigateToTab={setActiveTab} />
        )}

        {activeTab === 'custom_modal' && (
          <CustomMapSettingsSection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'contact' && (
          <ContactSocialSection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'delivery' && (
          <DeliveryCourierSection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'payments' && (
          <PaymentGatewaysSection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'seo' && (
          <SeoAnalyticsSection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'sms' && (
          <SmsGatewaysSection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'invoice' && (
          <InvoicePrintSection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'ai' && (
          <AiStudioSection
            aiAgents={aiAgents}
            setAiAgents={setAiAgents}
            loadAiAgents={loadAiAgents}
          />
        )}

        {activeTab === 'security' && (
          <AdminSecuritySection settings={settings} handleChange={handleChange} />
        )}

        {activeTab === 'storage' && (
          <StorageSettingsSection />
        )}
      </div>

      {activeTab !== 'storage' && (
        <SettingsFloatingBar
          onSave={handleSaveSettings}
          saving={saving}
          savedSuccess={savedSuccess}
        />
      )}
    </div>
  );
}
