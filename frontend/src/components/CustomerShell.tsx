'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { CartDrawer } from './CartDrawer';

export function CustomerShell({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // 1. Immediately warm up the browser cache with no-image.svg
    if (typeof window !== 'undefined') {
      const preloadImg = new Image();
      preloadImg.src = '/no-image.svg';

      // 2. Global capture-phase listener for ALL <img> elements on the page.
      // Standard DOM 'error' events on <img> elements do not bubble, but are caught in the capture phase.
      const handleImageError = (event: Event) => {
        const target = event.target;
        if (target && target instanceof HTMLImageElement) {
          if (!target.getAttribute('data-fallback-applied')) {
            target.setAttribute('data-fallback-applied', 'true');
            target.src = '/no-image.svg';
          }
        }
      };

      window.addEventListener('error', handleImageError, true);
      return () => {
        window.removeEventListener('error', handleImageError, true);
      };
    }
  }, []);

  return (
    <>
      <Header />
      <main id="mainContent">{children}</main>
      <Footer />
      <FloatingContact />
      <CartDrawer />
    </>
  );
}
