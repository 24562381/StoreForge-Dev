'use client';

import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  id?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = React.memo(function LanguageToggle({
  className = '',
  id = 'langToggle',
}) {
  const { lang, setLang } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const isEn = lang === 'en';

  const handleToggle = () => {
    setLang(isEn ? 'bn' : 'en');
  };

  return (
    <>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isEn}
        data-lang={lang}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        className={`lang-switch-pill ${className}`}
        title={isEn ? 'Language: English. Click to switch to Bangla' : 'Language: Bangla. Click to switch to English'}
        aria-label={isEn ? 'Language: English. Click to switch to Bangla' : 'Language: Bangla. Click to switch to English'}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'center',
          width: '76px',
          height: '34px',
          minWidth: '76px',
          maxWidth: '76px',
          minHeight: '34px',
          maxHeight: '34px',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          border: `1.5px solid ${isHovered ? '#7d4a25' : '#9c6644'}`,
          borderRadius: '999px',
          background: 'linear-gradient(180deg, #ffffff 0%, #fdf6ef 52%, #f7e8da 100%)',
          boxShadow: isHovered
            ? '0 1px 2px rgba(120, 70, 30, 0.08), 0 5px 14px rgba(120, 70, 30, 0.16)'
            : '0 1px 2px rgba(120, 70, 30, 0.06), 0 3px 8px rgba(120, 70, 30, 0.10)',
          transform: isActive ? 'scale(0.96)' : 'scale(1)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
          flexShrink: 0,
          verticalAlign: 'middle',
          outline: 'none',
          boxSizing: 'border-box',
          overflow: 'hidden',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Label: BN or EN */}
        <span
          className="lang-switch-label"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: isEn ? '28px' : '6px',
            width: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#4e2b16',
            transition: 'left 0.3s cubic-bezier(0.65, 0, 0.25, 1)',
            userSelect: 'none',
            pointerEvents: 'none',
            boxSizing: 'border-box',
            lineHeight: 1,
          }}
        >
          {isEn ? 'EN' : 'BN'}
        </span>

        {/* Flag Knob */}
        <span
          className="lang-switch-knob"
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: isEn ? '6px' : '48px',
            width: '22px',
            height: '22px',
            margin: 0,
            marginTop: 0,
            marginBottom: 0,
            borderRadius: '50%',
            padding: '1px',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 0 1.5px #ffffff, 0 3px 8px rgba(100, 50, 15, 0.28)',
            transition: 'left 0.3s cubic-bezier(0.65, 0, 0.25, 1)',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        >
          <span
            className="lang-switch-flag"
            style={{
              position: 'relative',
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12)',
            }}
          >
            {/* Bangladesh Flag */}
            <svg
              className="f-bd"
              viewBox="0 0 60 60"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                opacity: isEn ? 0 : 1,
                transition: 'opacity 0.25s ease',
              }}
            >
              <rect width="60" height="60" fill="#006a4e" />
              <circle cx="27" cy="30" r="14" fill="#f42a41" />
            </svg>

            {/* USA Flag */}
            <svg
              className="f-us"
              viewBox="0 0 110 100"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                opacity: isEn ? 1 : 0,
                transition: 'opacity 0.25s ease',
              }}
            >
              <rect width="110" height="100" fill="#fff" />
              <g fill="#b22234">
                <rect y="0" width="110" height="7.7" />
                <rect y="15.4" width="110" height="7.7" />
                <rect y="30.8" width="110" height="7.7" />
                <rect y="46.2" width="110" height="7.7" />
                <rect y="61.5" width="110" height="7.7" />
                <rect y="76.9" width="110" height="7.7" />
                <rect y="92.3" width="110" height="7.7" />
              </g>
              <rect width="62" height="53.9" fill="#3c3b6e" />
              <g fill="#fff">
                <circle cx="9" cy="8" r="2.4" />
                <circle cx="21" cy="8" r="2.4" />
                <circle cx="33" cy="8" r="2.4" />
                <circle cx="45" cy="8" r="2.4" />
                <circle cx="57" cy="8" r="2.4" />
                <circle cx="15" cy="17" r="2.4" />
                <circle cx="27" cy="17" r="2.4" />
                <circle cx="39" cy="17" r="2.4" />
                <circle cx="51" cy="17" r="2.4" />
                <circle cx="9" cy="26" r="2.4" />
                <circle cx="21" cy="26" r="2.4" />
                <circle cx="33" cy="26" r="2.4" />
                <circle cx="45" cy="26" r="2.4" />
                <circle cx="57" cy="26" r="2.4" />
                <circle cx="15" cy="35" r="2.4" />
                <circle cx="27" cy="35" r="2.4" />
                <circle cx="39" cy="35" r="2.4" />
                <circle cx="51" cy="35" r="2.4" />
                <circle cx="9" cy="44" r="2.4" />
                <circle cx="21" cy="44" r="2.4" />
                <circle cx="33" cy="44" r="2.4" />
                <circle cx="45" cy="44" r="2.4" />
                <circle cx="57" cy="44" r="2.4" />
              </g>
            </svg>

            {/* Glass shine highlight */}
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                pointerEvents: 'none',
                background: 'linear-gradient(155deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.12))',
              }}
            />
          </span>
        </span>
      </button>

      <style>{`
        .lang-switch-pill {
          width: 76px !important;
          height: 34px !important;
        }
        .lang-switch-pill .lang-switch-knob {
          top: 50% !important;
          transform: translateY(-50%) !important;
          margin-top: 0 !important;
          margin: 0 !important;
          width: 22px !important;
          height: 22px !important;
        }
        .lang-switch-pill[data-lang="bn"] .lang-switch-knob {
          left: 48px !important;
        }
        .lang-switch-pill[data-lang="en"] .lang-switch-knob {
          left: 6px !important;
        }
        .lang-switch-pill[data-lang="bn"] .lang-switch-label {
          left: 6px !important;
        }
        .lang-switch-pill[data-lang="en"] .lang-switch-label {
          left: 28px !important;
        }
      `}</style>
    </>
  );
});

export default LanguageToggle;
