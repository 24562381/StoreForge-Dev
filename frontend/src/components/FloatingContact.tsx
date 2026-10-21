'use client';

import React, { useMemo } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { useSettings } from '../lib/SettingsContext';

const NON_DIGITS_REGEX = /\D/g;
const WHITESPACE_REGEX = /\s+/g;

export const FloatingContact: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useSettings();

  const { waNumber, phone } = useMemo(() => {
    return {
      waNumber: (settings.contact_whatsapp || '8801700000000').replace(NON_DIGITS_REGEX, ''),
      phone: (settings.contact_phone || '+880 1700-000000').replace(WHITESPACE_REGEX, ''),
    };
  }, [settings.contact_whatsapp, settings.contact_phone]);

  return (
    <>
      <div className="floating-contact">
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
            t('whatsapp_inquiry_msg', 'Hello! I would like to inquire about the 3D Wooden World Map.')
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-btn whatsapp-btn"
          title={t('whatsapp_chat_tooltip', 'Chat on WhatsApp')}
          id="whatsappFloatingBtn"
        >
          <i className="fa-brands fa-whatsapp"></i>
          <span className="floating-tooltip">
            {t('whatsapp_chat_tooltip', 'Chat With Us')}
          </span>
        </a>

        {phone && (
          <a
            href={`tel:${phone}`}
            className="floating-btn phone-btn"
            title={t('call_customer_care_tooltip', 'Call Customer Care')}
            id="callFloatingBtn"
          >
            <i className="fa-solid fa-phone"></i>
          </a>
        )}
      </div>

      <button
        type="button"
        className="pwa-floating-install-pill"
        id="pwaFloatingInstallBtn"
        aria-label={t('pwa_install_btn', 'Install App')}
        title={t('pwa_install_btn', 'Install App')}
        onClick={() => {
          alert(t('pwa_install_hint', 'Add this web app to your home screen from your browser menu.'));
        }}
      >
        <i className="fa-solid fa-download"></i>
        <span>{t('pwa_install_btn', 'Install App')}</span>
      </button>
    </>
  );
};
