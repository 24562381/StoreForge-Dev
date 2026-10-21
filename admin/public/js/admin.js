/**
 * StoreForge - Admin Panel Interactive Client Script
 */

/**
 * Safely escapes HTML special characters to prevent XSS.
 * Available globally across all admin templates and scripts.
 * @param {string|any} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
}

/**
 * Standardized Admin Toast Notification System
 * Appends dismissible alert cards to .admin-toast-container.
 * @param {string} arg1 - Type ('success'|'error'|'info'|'warning') or Message
 * @param {string} [arg2] - Message or Type
 */
function showAdminToast(arg1, arg2) {
  let type = 'success';
  let message = '';
  const knownTypes = ['success', 'error', 'danger', 'info', 'warning'];
  if (knownTypes.includes(String(arg1 || '').toLowerCase())) {
    type = String(arg1).toLowerCase() === 'error' ? 'danger' : String(arg1).toLowerCase();
    message = String(arg2 || '');
  } else {
    message = String(arg1 || '');
    if (arg2) {
      type = String(arg2).toLowerCase() === 'error' ? 'danger' : String(arg2).toLowerCase();
    }
  }

  const container = document.querySelector('.admin-toast-container') || document.querySelector('.admin-content-inner') || document.body;
  if (!container) return;

  const alert = document.createElement('div');
  const alertClass = type === 'danger' ? 'danger' : (type === 'warning' ? 'warning' : (type === 'info' ? 'info' : 'success'));
  alert.className = `admin-alert alert-${alertClass}`;
  alert.style.animation = 'fadeIn 0.3s ease';
  const iconClass = alertClass === 'danger' ? 'fa-circle-exclamation' : (alertClass === 'warning' ? 'fa-triangle-exclamation' : (alertClass === 'info' ? 'fa-circle-info' : 'fa-circle-check'));
  const safeMsg = typeof window.escapeHtml === 'function' ? window.escapeHtml(message) : escapeHtml(message);

  alert.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${safeMsg}</span>
    <button type="button" class="alert-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.prepend(alert);
  setTimeout(() => {
    alert.style.transition = 'opacity 0.4s ease';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 400);
  }, 4500);
}
if (typeof window !== 'undefined') {
  window.showAdminToast = showAdminToast;
}

/**
 * AI Translation UI Module
 * Standardizes button loading state, input field highlighting, and status alert rendering.
 */
function setAiButtonLoading(btn, text = 'Translating...') {
  if (!btn) return '';
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`;
  return original;
}

function restoreAiButton(btn, originalHtml) {
  if (!btn || originalHtml === undefined) return;
  btn.disabled = false;
  btn.innerHTML = originalHtml;
}

function setAndHighlightField(el, value) {
  if (!el) return;
  if (value !== undefined && value !== null) {
    el.value = value;
    el.classList.remove('ai-highlight-glow');
    void el.offsetWidth;
    el.classList.add('ai-highlight-glow');
  } else if (arguments.length === 1) {
    el.classList.remove('ai-highlight-glow');
    void el.offsetWidth;
    el.classList.add('ai-highlight-glow');
  }
}

function renderAiAlert(alertBox, type, messageHtml, extraHtml = '') {
  if (!alertBox) return;
  alertBox.style.display = 'block';
  if (type === 'loading') {
    alertBox.innerHTML = `
      <div style="background: #EEF2FF; border: 1px solid #C7D2FE; color: #3730A3; border-radius: 6px; padding: 10px 14px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-wand-magic-sparkles fa-spin" style="color: #6366F1;"></i>
        <span>${messageHtml}</span>
      </div>
    `;
  } else if (type === 'success') {
    alertBox.innerHTML = `
      <div style="background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; border-radius: 6px; padding: 10px 14px; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <i class="fa-solid fa-circle-check" style="color: #10B981;"></i>
          ${messageHtml}
        </div>
        <button type="button" onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; color:#059669; font-size:1.1rem; cursor:pointer;">&times;</button>
      </div>
    `;
  } else if (type === 'warning') {
    alertBox.innerHTML = `
      <div style="background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; border-radius: 6px; padding: 10px 14px; font-size: 0.85rem;">
        <i class="fa-solid fa-triangle-exclamation"></i> ${messageHtml}
      </div>
    `;
  } else if (type === 'error') {
    alertBox.innerHTML = `
      <div style="background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; border-radius: 6px; padding: 10px 14px; font-size: 0.85rem; display: flex; align-items: flex-start; justify-content: space-between;">
        <div>
          <i class="fa-solid fa-circle-exclamation" style="color: #EF4444;"></i>
          <strong>Translation failed:</strong> ${messageHtml}
          ${extraHtml || '<div style="margin-top: 4px;"><a href="/admin/settings#ai-configuration" target="_blank" style="color: #4F46E5; font-weight: 600; text-decoration: underline;">Check Gemini API Key in Settings</a></div>'}
        </div>
        <button type="button" onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; color:#DC2626; font-size:1.1rem; cursor:pointer;">&times;</button>
      </div>
    `;
  }
}

function applyAiTranslationToEditor(targetId, htmlContent) {
  const targetEditor = (typeof window !== 'undefined' && window.tiptapEditors && window.tiptapEditors[targetId]) ? window.tiptapEditors[targetId] : null;
  const targetContainer = document.getElementById('container_' + targetId);
  const targetSourceEl = document.getElementById('html_source_' + targetId);

  if (targetEditor) {
    targetEditor.commands.setContent(htmlContent);
  }
  if (targetContainer) {
    const targetHidden = targetContainer.querySelector('.tiptap-hidden-input');
    if (targetHidden) targetHidden.value = htmlContent;
  }
  if (targetSourceEl) {
    targetSourceEl.value = htmlContent;
  }
  if (typeof window !== 'undefined' && typeof window.updateStats === 'function') {
    window.updateStats(targetId, htmlContent);
  }
}

/**
 * CSRF-Aware Admin Fetch API Wrapper
 * Automatically discovers CSRF token from DOM and attaches required headers.
 * Resolves to the parsed JSON body, decorated with response metadata (.ok, .status, .json()).
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function adminFetch(url, options = {}) {
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  const inputToken = document.querySelector('input[name="_csrf"]')?.value;
  const token = metaToken || inputToken || (typeof csrfToken !== 'undefined' ? csrfToken : '') || '';

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'CSRF-Token': token, 'X-CSRF-Token': token } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = {};
  }

  if (typeof data !== 'object' || data === null) {
    data = { value: data };
  }
  if (!response.ok && !data.message) {
    data.message = `Server error (${response.status})`;
  }
  if (!('ok' in data)) data.ok = response.ok;
  if (!('status' in data)) data.status = response.status;
  data._response = response;
  data.json = async () => data;

  return data;
}

/**
 * Dynamic Form List Row Generator & Manager
 * Handles declarative adding, removing, and lifecycle callbacks for dynamic rows.
 * @param {Object} options
 * @param {string|HTMLElement} options.container - Container element or ID
 * @param {string|HTMLElement} [options.addButton] - Add button element or ID
 * @param {string} [options.removeSelector] - CSS selector for remove buttons (default '.btn-remove-row')
 * @param {string} [options.rowSelector] - CSS selector to identify the row element
 * @param {Function|string} options.rowRenderer - Generator function or HTML string
 * @param {Function} [options.onAdd] - Callback(newRow, container)
 * @param {Function} [options.onRemove] - Callback(removedRow, container)
 * @param {Function} [options.confirmRemove] - Interceptor Callback(row, removeCallback)
 */
function initDynamicList(options) {
  if (!options) return null;
  const container = typeof options.container === 'string'
    ? document.getElementById(options.container)
    : options.container;
  const addBtn = typeof options.addButton === 'string'
    ? document.getElementById(options.addButton)
    : options.addButton;

  if (!container) return null;

  const removeSelector = options.removeSelector || '.btn-remove-row';

  function createRow() {
    let rowEl;
    if (typeof options.rowRenderer === 'function') {
      const result = options.rowRenderer();
      if (typeof result === 'string') {
        const temp = document.createElement('div');
        temp.innerHTML = result.trim();
        rowEl = temp.firstElementChild;
      } else {
        rowEl = result;
      }
    } else if (typeof options.rowRenderer === 'string') {
      const tpl = document.getElementById(options.rowRenderer);
      if (tpl && tpl.content) {
        rowEl = tpl.content.cloneNode(true).firstElementChild;
      } else {
        const temp = document.createElement('div');
        temp.innerHTML = options.rowRenderer.trim();
        rowEl = temp.firstElementChild;
      }
    }
    return rowEl;
  }

  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const newRow = createRow();
      if (newRow) {
        container.appendChild(newRow);
        if (typeof options.onAdd === 'function') {
          options.onAdd(newRow, container);
        }
      }
    });
  }

  container.addEventListener('click', (e) => {
    const removeBtn = e.target.closest(removeSelector);
    if (!removeBtn) return;
    e.preventDefault();

    const row = (options.rowSelector ? removeBtn.closest(options.rowSelector) : null) || removeBtn.closest('[data-list-row]') || removeBtn.parentElement;
    if (!row) return;

    if (typeof options.confirmRemove === 'function') {
      options.confirmRemove(row, () => {
        row.remove();
        if (typeof options.onRemove === 'function') options.onRemove(row, container);
      });
    } else {
      row.remove();
      if (typeof options.onRemove === 'function') options.onRemove(row, container);
    }
  });

  return {
    addRow: () => {
      const r = createRow();
      if (r) {
        container.appendChild(r);
        if (typeof options.onAdd === 'function') options.onAdd(r, container);
      }
      return r;
    }
  };
}

if (typeof window !== 'undefined') {
  window.setAiButtonLoading = setAiButtonLoading;
  window.restoreAiButton = restoreAiButton;
  window.setAndHighlightField = setAndHighlightField;
  window.renderAiAlert = renderAiAlert;
  window.applyAiTranslationToEditor = applyAiTranslationToEditor;
  window.adminFetch = adminFetch;
  window.initDynamicList = initDynamicList;
}

document.addEventListener('DOMContentLoaded', function () {
  // Auto-dismiss toast alerts
  const alerts = document.querySelectorAll('.admin-toast-container .admin-alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.animation = 'fadeOutRight 0.3s ease-in forwards';
      setTimeout(() => alert.remove(), 300);
    }, 4000);
  });

  // Mobile Sidebar Toggle, Close Button & Backdrop
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const adminSidebar = document.getElementById('adminSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  function openAdminSidebar() {
    if (adminSidebar) adminSidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAdminSidebar() {
    if (adminSidebar) adminSidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (sidebarToggle && adminSidebar) {
    sidebarToggle.addEventListener('click', function () {
      if (window.innerWidth > 768) {
        // Desktop toggle
        adminSidebar.classList.toggle('collapsed');
      } else {
        // Mobile toggle
        if (adminSidebar.classList.contains('open')) {
          closeAdminSidebar();
        } else {
          openAdminSidebar();
        }
      }
    });
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeAdminSidebar);
  }

  if (sidebarBackdrop && adminSidebar) {
    sidebarBackdrop.addEventListener('click', closeAdminSidebar);
  }

  // Close sidebar on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && adminSidebar && adminSidebar.classList.contains('open')) {
      closeAdminSidebar();
    }
  });

  // Close sidebar when clicking any navigation link on mobile
  if (adminSidebar) {
    const navLinks = adminSidebar.querySelectorAll('.sidebar-link:not(.external-link)');
    navLinks.forEach(link => {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          closeAdminSidebar();
        }
      });
    });
  }

  // Auto-dismiss general alert messages after 5 seconds if any outside toast container
  const pageAlerts = document.querySelectorAll('.admin-alert:not(.admin-toast-container .admin-alert)');
  pageAlerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.4s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 400);
    }, 4500);
  });
});

// Quick Order Status Updater via AJAX
window.quickUpdateOrderStatus = async function (orderId, newStatus, targetEl) {
  const selectEl = targetEl || (typeof window !== 'undefined' && window.event ? window.event.target : null);
  const originalClass = selectEl ? selectEl.className : '';
  const originalStatus = selectEl ? (selectEl.dataset.currentStatus || selectEl.value) : newStatus;

  try {
    if (selectEl) {
      selectEl.disabled = true;
      selectEl.style.opacity = '0.6';
    }

    const data = await adminFetch(`/admin/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ 
        status: newStatus
      })
    });

    if (data.ok && data.success) {
      if (selectEl) {
        selectEl.disabled = false;
        selectEl.style.opacity = '1';
        selectEl.dataset.currentStatus = newStatus;
        // Remove old status class and add new
        selectEl.className = `status-select status-${newStatus}`;
        
        // Dynamically sync print buttons in this table row or card
        const rowOrCard = selectEl.closest('tr') || selectEl.closest('.order-mobile-card');
        const printBtns = rowOrCard 
          ? rowOrCard.querySelectorAll('.print-btn, .mobile-print-btn') 
          : document.querySelectorAll(`button[data-order-id="${orderId}"].print-btn, button[data-order-id="${orderId}"].mobile-print-btn`);
        
        const disabledStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
        const isNowDisabled = disabledStatuses.includes(newStatus);
        printBtns.forEach(btn => {
          if (isNowDisabled) {
            btn.setAttribute('disabled', 'disabled');
            let reason = newStatus;
            if (newStatus === 'shipped') reason = 'already shipped';
            if (newStatus === 'delivered') reason = 'already delivered';
            btn.title = `Printing disabled: Order is ${reason}`;
            btn.removeAttribute('href');
            btn.removeAttribute('target');
            btn.onclick = function(e) { if (e && e.preventDefault) e.preventDefault(); return false; };
          } else {
            btn.removeAttribute('disabled');
            btn.title = 'Print 3x5 Delivery Slip';
            btn.setAttribute('href', `/admin/orders/${orderId}/print`);
            btn.setAttribute('target', '_blank');
            btn.onclick = function(e) { if (typeof openPrintLabel === 'function') openPrintLabel(orderId, e); };
          }
        });

        // Show temporary green ring
        selectEl.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.4)';
        setTimeout(() => {
          selectEl.style.boxShadow = '';
        }, 1200);
      }
    } else {
      alert('Failed to update order status: ' + (data.error || 'Server error'));
      if (selectEl) {
        selectEl.disabled = false;
        selectEl.style.opacity = '1';
        selectEl.className = originalClass;
        selectEl.value = originalStatus;
      }
    }
  } catch (err) {
    console.error('Error updating status:', err);
    alert('Network error while updating status. Please refresh the page and try again.');
    if (selectEl) {
      selectEl.disabled = false;
      selectEl.style.opacity = '1';
      selectEl.className = originalClass;
      selectEl.value = originalStatus;
    }
  }
};

// Quick Review Status Updater via AJAX
window.quickUpdateReviewStatus = async function (reviewId, newStatus, targetEl) {
  const selectEl = targetEl || (typeof window !== 'undefined' && window.event ? window.event.target : null);
  const originalClass = selectEl ? selectEl.className : '';
  const originalStatus = selectEl ? (selectEl.dataset.currentStatus || selectEl.value) : newStatus;
  const isPublished = (newStatus === 'true' || newStatus === true);

  try {
    if (selectEl) {
      selectEl.disabled = true;
      selectEl.style.opacity = '0.6';
    }

    const data = await adminFetch(`/admin/reviews/${reviewId}/status`, {
      method: 'POST',
      body: JSON.stringify({ 
        status: isPublished,
        is_published: isPublished
      })
    });

    if (data.ok && data.success) {
      if (selectEl) {
        selectEl.disabled = false;
        selectEl.style.opacity = '1';
        selectEl.dataset.currentStatus = String(data.is_published);
        selectEl.value = String(data.is_published);
        selectEl.className = `status-select status-${data.is_published ? 'published' : 'not_published'}`;
        
        selectEl.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.4)';
        setTimeout(() => {
          selectEl.style.boxShadow = '';
        }, 1200);
      }
    } else {
      alert('Failed to update review status: ' + (data.error || 'Server error'));
      if (selectEl) {
        selectEl.disabled = false;
        selectEl.style.opacity = '1';
        selectEl.className = originalClass;
        selectEl.value = originalStatus;
      }
    }
  } catch (err) {
    console.error('Error updating review status:', err);
    alert('Network error while updating status. Please refresh the page.');
    if (selectEl) {
      selectEl.disabled = false;
      selectEl.style.opacity = '1';
      selectEl.className = originalClass;
      selectEl.value = originalStatus;
    }
  }
};

// Quick Home Featured Review Toggle via AJAX
window.toggleHomeFeaturedReview = async function (reviewId, btnElement) {
  const btn = btnElement || document.getElementById(`btnFeatured-${reviewId}`);
  try {
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }

    const data = await adminFetch(`/admin/reviews/${reviewId}/toggle-featured`, {
      method: 'POST',
      body: JSON.stringify({})
    });

    if (data.ok && data.success) {
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        const isFeatured = !!data.is_featured;
        btn.className = `btn btn-xs ${isFeatured ? 'btn-featured-active' : 'btn-featured-inactive'}`;
        btn.setAttribute('title', isFeatured ? 'Click to remove from home page' : 'Click to display on home page');
        btn.innerHTML = `<i class="fa-solid fa-star ${isFeatured ? 'text-gold' : 'text-muted'}"></i> <span class="btn-featured-label">${isFeatured ? 'Featured on Home' : 'Choose for Home'}</span>`;
        btn.style.boxShadow = '0 0 0 3px rgba(234, 179, 8, 0.4)';
        setTimeout(() => { btn.style.boxShadow = ''; }, 1200);
      }
    } else {
      alert('Failed to update featured status: ' + (data.error || 'Server error'));
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    }
  } catch (err) {
    console.error('Error toggling featured review:', err);
    alert('Network error while updating featured status.');
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }
};

// Quick FAQ Status Updater via AJAX
window.quickUpdateFaqStatus = async function (faqId, newStatus, targetEl) {
  const selectEl = targetEl || (typeof window !== 'undefined' && window.event ? window.event.target : null);
  const originalClass = selectEl ? selectEl.className : '';
  const originalStatus = selectEl ? (selectEl.dataset.currentStatus || selectEl.value) : newStatus;
  const isPublished = (newStatus === 'true' || newStatus === true);

  try {
    if (selectEl) {
      selectEl.disabled = true;
      selectEl.style.opacity = '0.6';
    }

    const data = await adminFetch(`/admin/faqs/${faqId}/status`, {
      method: 'POST',
      body: JSON.stringify({ 
        status: isPublished,
        is_published: isPublished
      })
    });

    if (data.ok && data.success) {
      if (selectEl) {
        selectEl.disabled = false;
        selectEl.style.opacity = '1';
        selectEl.dataset.currentStatus = String(data.is_published);
        selectEl.value = String(data.is_published);
        selectEl.className = `status-select status-${data.is_published ? 'published' : 'not_published'}`;
        
        selectEl.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.4)';
        setTimeout(() => {
          selectEl.style.boxShadow = '';
        }, 1200);
      }
    } else {
      alert('Failed to update FAQ status: ' + (data.error || 'Server error'));
      if (selectEl) {
        selectEl.disabled = false;
        selectEl.style.opacity = '1';
        selectEl.className = originalClass;
        selectEl.value = originalStatus;
      }
    }
  } catch (err) {
    console.error('Error updating FAQ status:', err);
    alert('Network error while updating status. Please refresh the page.');
    if (selectEl) {
      selectEl.disabled = false;
      selectEl.style.opacity = '1';
      selectEl.className = originalClass;
      selectEl.value = originalStatus;
    }
  }
};

// Copy Text to Clipboard with visual feedback for Admin
window.copyAdminText = async function (text, btnEl) {
  if (!text) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }

    if (btnEl) {
      const originalHTML = btnEl.innerHTML;
      btnEl.classList.add('copied');
      btnEl.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        btnEl.classList.remove('copied');
        btnEl.innerHTML = originalHTML;
      }, 1800);
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
};

// Toggle password or masked text visibility (eye icon)
function togglePasswordVisibility(target, btnEl) {
  let input = null;
  if (typeof target === 'string') {
    input = document.getElementById(target.startsWith('#') ? target.slice(1) : target) || document.querySelector(target);
  } else if (target && target.nodeType) {
    input = target;
  }
  if (!input) return;
  const icon = btnEl ? btnEl.querySelector('i') : null;

  if (input.classList.contains('api-key-masked')) {
    input.classList.remove('api-key-masked');
    input.classList.add('api-key-unmasked');
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  } else if (input.classList.contains('api-key-unmasked')) {
    input.classList.remove('api-key-unmasked');
    input.classList.add('api-key-masked');
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  } else {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    if (icon) {
      if (isPassword) {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    }
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

// Declarative password toggle support via data-toggle-password attribute
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-toggle-password]');
  if (!btn) return;
  e.preventDefault();
  const target = btn.dataset.togglePassword;
  if (target) {
    togglePasswordVisibility(target, btn);
  }
});

// Open Change Password Modal
window.openChangePasswordModal = function () {
  const modal = document.getElementById('adminPasswordModal');
  if (modal) {
    modal.style.display = 'flex';
    const alertBox = document.getElementById('modalPasswordAlert');
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.textContent = '';
      alertBox.className = 'admin-alert mb-3';
    }
    const form = document.getElementById('globalChangePasswordForm');
    if (form) form.reset();
    setTimeout(() => {
      const firstInput = document.getElementById('modal_curr_pwd');
      if (firstInput) firstInput.focus();
    }, 100);
  }
};

// Close Change Password Modal
window.closeChangePasswordModal = function () {
  const modal = document.getElementById('adminPasswordModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Handle Global Change Password Form Submit via Fetch
window.handleGlobalPasswordSubmit = async function (e) {
  e.preventDefault();
  const alertBox = document.getElementById('modalPasswordAlert');
  const submitBtn = document.getElementById('modalPwdSubmitBtn');
  const currPwd = document.getElementById('modal_curr_pwd')?.value;
  const newPwd = document.getElementById('modal_new_pwd')?.value;
  const confPwd = document.getElementById('modal_conf_pwd')?.value;

  if (!currPwd || !newPwd || !confPwd) {
    showModalAlert('Please fill in all password fields.', 'danger');
    return;
  }
  if (newPwd !== confPwd) {
    showModalAlert('New password and confirmation do not match.', 'danger');
    return;
  }
  if (newPwd.length < 6) {
    showModalAlert('New password must be at least 6 characters long.', 'danger');
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    const data = await adminFetch('/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currPwd,
        new_password: newPwd,
        confirm_password: confPwd
      })
    });

    if (data.ok && data.success) {
      showModalAlert(data.message || 'Password changed successfully!', 'success');
      setTimeout(() => {
        closeChangePasswordModal();
      }, 1600);
    } else {
      showModalAlert(data.message || 'Failed to update password. Please check your current password.', 'danger');
    }
  } catch (err) {
    console.error('Password change error:', err);
    showModalAlert('Network error occurred. Please try again.', 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save New Password';
    }
  }

  function showModalAlert(msg, type) {
    if (!alertBox) return;
    alertBox.style.display = 'flex';
    alertBox.className = `admin-alert alert-${type} mb-3`;
    alertBox.innerHTML = `
      <i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i>
      <span>${msg}</span>
    `;
  }
};

/* ==========================================================================
   Admin PWA Support & External Storefront Link Handler
   ========================================================================== */

// 1. Register Service Worker for Admin PWA installability (SW handles start_url navigation fresh)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function (err) {
    console.warn('[Admin PWA] Service worker registration notice:', err.message);
  });
}

// 2. Admin App Cross-Device Install Prompt handling
var adminInstallPrompt = null;
var adminInstallBtn = document.getElementById('adminInstallBtn');

function checkAdminStandalone() {
  var isStandalone = Boolean(
    (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
    (typeof navigator !== 'undefined' && navigator.standalone === true) ||
    (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://'))
  );
  if (isStandalone) {
    if (typeof document !== 'undefined' && document.body) document.body.classList.add('is-standalone');
    if (adminInstallBtn) {
      adminInstallBtn.style.display = 'none';
      adminInstallBtn.classList.add('installed');
    }
  } else if (adminInstallBtn) {
    adminInstallBtn.style.display = 'inline-flex';
  }
  return isStandalone;
}

// Run check immediately
checkAdminStandalone();
window.addEventListener('DOMContentLoaded', checkAdminStandalone);

window.addEventListener('beforeinstallprompt', function (e) {
  // Prevent default mini-infobar on mobile browsers
  e.preventDefault();
  adminInstallPrompt = e;
  if (adminInstallBtn && !checkAdminStandalone()) {
    adminInstallBtn.style.display = 'inline-flex';
  }
});

if (adminInstallBtn) {
  adminInstallBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    if (adminInstallPrompt) {
      adminInstallPrompt.prompt();
      try {
        var choice = await adminInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          adminInstallBtn.style.display = 'none';
          adminInstallBtn.classList.add('installed');
        }
      } catch (err) {
        console.warn('[Admin PWA] Install choice error:', err);
      }
      adminInstallPrompt = null;
    } else {
      // Browser didn't provide prompt or already supported via browser UI
      showAdminInstallGuideModal();
    }
  });
}

window.addEventListener('appinstalled', function () {
  if (adminInstallBtn) {
    adminInstallBtn.style.display = 'none';
    adminInstallBtn.classList.add('installed');
  }
  adminInstallPrompt = null;
});

function showAdminInstallGuideModal() {
  var existing = document.getElementById('adminInstallGuideModal');
  if (existing) existing.remove();

  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  var stepInstructions = '';
  if (isSafari) {
    stepInstructions = `
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <span style="font-weight:700;color:#D97706;background:rgba(217,119,6,0.18);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
        <div>Click <strong>File</strong> in the macOS menu bar at the top of your screen.</div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-weight:700;color:#D97706;background:rgba(217,119,6,0.18);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>
        <div>Select <strong>Add to Dock...</strong> to run the Admin Console as a native Mac app.</div>
      </div>
    `;
  } else if (isFirefox) {
    stepInstructions = `
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <span style="font-weight:700;color:#D97706;background:rgba(217,119,6,0.18);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
        <div>For desktop application mode on PC, open this dashboard in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.</div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-weight:700;color:#D97706;background:rgba(217,119,6,0.18);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>
        <div>Or bookmark this page (<kbd style="background:#334155;padding:2px 6px;border-radius:4px;color:#fff;">Ctrl+D</kbd>) for instant access.</div>
      </div>
    `;
  } else {
    stepInstructions = `
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <span style="font-weight:700;color:#D97706;background:rgba(217,119,6,0.18);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
        <div>Look at the right side of your browser's <strong>Address Bar</strong> (top right of your screen).</div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <span style="font-weight:700;color:#D97706;background:rgba(217,119,6,0.18);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>
        <div>Click the <strong>Install App icon (⊕ or computer with arrow)</strong> to install to your PC desktop.</div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-weight:700;color:#D97706;background:rgba(217,119,6,0.18);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">3</span>
        <div>Alternatively, open browser <strong>Menu (⋮)</strong> &rarr; <strong>Install StoreForge Admin Console...</strong></div>
      </div>
    `;
  }

  var modal = document.createElement('div');
  modal.id = 'adminInstallGuideModal';
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.zIndex = '99999';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.background = 'rgba(12, 14, 18, 0.75)';
  modal.style.backdropFilter = 'blur(6px)';
  modal.style.padding = '20px';

  modal.innerHTML = `
    <div style="max-width: 460px; width: 100%; background: #181d24; border: 1px solid rgba(217, 119, 6, 0.35); border-radius: 18px; padding: 26px; color: #F8FAFC; box-shadow: 0 24px 48px rgba(0,0,0,0.6); position: relative;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(217, 119, 6, 0.16); display: flex; align-items: center; justify-content: center; color: #F59E0B;">
            <i class="fa-solid fa-download" style="font-size: 1.2rem;"></i>
          </div>
          <div>
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #FFFFFF;">Install Admin App</h4>
            <div style="font-size: 0.8rem; color: #94A3B8;">Desktop & Mobile Console</div>
          </div>
        </div>
        <button type="button" onclick="document.getElementById('adminInstallGuideModal').remove()" style="background: none; border: none; color: #94A3B8; font-size: 1.4rem; cursor: pointer; padding: 4px 8px; border-radius: 6px;">&times;</button>
      </div>

      <div style="background: rgba(12, 14, 18, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; font-size: 0.9rem; line-height: 1.6; color: #E2E8F0; margin-bottom: 22px;">
        ${stepInstructions}
      </div>

      <div style="display: flex; justify-content: flex-end;">
        <button type="button" onclick="document.getElementById('adminInstallGuideModal').remove()" style="padding: 9px 22px; border-radius: 9px; background: #D97706; color: #FFFFFF; border: none; font-weight: 600; font-size: 0.9rem; cursor: pointer; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);">Understood</button>
      </div>
    </div>
  `;

  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
}

// 3. Guarantee Storefront Links Open Outside the Admin App in Default System Browser
document.addEventListener('click', function (e) {
  var link = e.target.closest('a');
  if (!link) return;

  var href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

  // Identify links pointing to the customer storefront or outside the admin console
  var isStoreLink = link.classList.contains('open-storefront-link') ||
                    link.id === 'topbarStoreLink' ||
                    link.id === 'sidebarStoreLink' ||
                    (link.getAttribute('target') === '_blank' && (!link.pathname || !link.pathname.startsWith('/admin'))) ||
                    (href === '/' || (href.startsWith('/') && !href.startsWith('/admin')));

  if (isStoreLink) {
    // Check if running inside standalone PWA window or webview
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://');

    if (isStandalone) {
      e.preventDefault();
      // In standalone display-mode, window.open with _blank and noopener/noreferrer tells
      // the OS window manager to launch the URL in the system's default full web browser
      window.open(link.href, '_blank', 'noopener,noreferrer');
    }
  }
});

