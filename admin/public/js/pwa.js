/* ==========================================================================
   PWA Client Manager
   Service Worker Registration, Install Banner, Offline Alerts, Reconnection
   ========================================================================== */

(function () {
  'use strict';

  let deferredInstallPrompt = null;

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(function (reg) {
          // Listen for new service worker updates
          reg.addEventListener('updatefound', function () {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', function () {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showToast((window.t && window.t('pwa_update_available')) || 'App update available! Refreshing...', 'info');
                }
              });
            }
          });
        })
        .catch(function (err) {
          console.warn('[PWA] ServiceWorker registration error:', err);
        });
    });
  }

  // 2. Handle beforeinstallprompt (PWA Installation Prompt)
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;

    // Show Install elements
    const drawerInstallBox = document.getElementById('pwaDrawerInstallBox');
    if (drawerInstallBox) {
      drawerInstallBox.style.display = 'block';
    }

    const floatingInstallBtn = document.getElementById('pwaFloatingInstallBtn');
    if (floatingInstallBtn) {
      floatingInstallBtn.style.display = 'inline-flex';
    }
  });

  // Handler for install buttons
  function triggerInstall() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function (choiceResult) {
      if (choiceResult.outcome === 'accepted') {
        showToast((window.t && window.t('pwa_installed_success')) || 'App installed successfully!', 'success');
      }
      deferredInstallPrompt = null;
      hideInstallButtons();
    });
  }

  function hideInstallButtons() {
    const drawerInstallBox = document.getElementById('pwaDrawerInstallBox');
    if (drawerInstallBox) drawerInstallBox.style.display = 'none';
    const floatingInstallBtn = document.getElementById('pwaFloatingInstallBtn');
    if (floatingInstallBtn) floatingInstallBtn.style.display = 'none';
  }

  window.addEventListener('appinstalled', function () {
    hideInstallButtons();
    deferredInstallPrompt = null;
  });

  // Attach click listeners on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    const drawerBtn = document.getElementById('pwaDrawerInstallBtn');
    if (drawerBtn) drawerBtn.addEventListener('click', triggerInstall);

    const floatingBtn = document.getElementById('pwaFloatingInstallBtn');
    if (floatingBtn) floatingBtn.addEventListener('click', triggerInstall);

    // Prevent Customer App from navigating to Admin Console
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      if (window.location.pathname.startsWith('/admin')) {
        window.location.replace('/');
      }
    }

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (href.startsWith('/admin') || (link.pathname && link.pathname.startsWith('/admin'))) {
        e.preventDefault();
        e.stopPropagation();
        showToast((window.t && window.t('pwa_page_not_found')) || 'Page does not exist!', 'warning');
      }
    }, true);
  });

  // 3. Online/Offline detection toasts on live pages with debounce
  let netToastTimeout = null;
  window.addEventListener('offline', function () {
    clearTimeout(netToastTimeout);
    netToastTimeout = setTimeout(function () {
      showToast((window.t && window.t('pwa_browsing_offline')) || 'You are currently browsing offline. Saved pages remain accessible.', 'warning');
    }, 200);
  });

  window.addEventListener('online', function () {
    clearTimeout(netToastTimeout);
    netToastTimeout = setTimeout(function () {
      showToast((window.t && window.t('pwa_online_restored')) || 'Internet connection restored!', 'success');
    }, 200);
  });

  // Global Toast Utility for PWA
  function showToast(message, type) {
    type = type || 'info';
    const existing = document.getElementById('pwa-global-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pwa-global-toast';
    toast.className = 'pwa-toast pwa-toast-' + type;

    let iconClass = 'fa-circle-info';
    if (type === 'warning') iconClass = 'fa-wifi';
    if (type === 'success') iconClass = 'fa-circle-check';

    toast.innerHTML =
      '<i class="fa-solid ' + iconClass + '"></i>' +
      '<span>' + message + '</span>' +
      '<button type="button" class="pwa-toast-close" onclick="this.parentElement.remove()">&times;</button>';

    document.body.appendChild(toast);

    setTimeout(function () {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(16px)';
        setTimeout(function () {
          if (toast.parentElement) toast.remove();
        }, 300);
      }
    }, 4500);
  }

  // Export helper
  window.triggerPwaInstall = triggerInstall;
})();
