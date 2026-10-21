/**
 * 3D Wooden World Map - Storefront Interactive Client Script
 */

document.addEventListener('DOMContentLoaded', function () {
  // Mobile Menu Drawer Toggle & Backdrop with Complete Scroll Lock
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileClose = document.getElementById('mobileDrawerClose');
  const mobileBackdrop = document.getElementById('mobileDrawerBackdrop');

  let savedScrollY = 0;

  function openMobileMenu() {
    if (!mobileDrawer || mobileDrawer.classList.contains('open')) return;

    // Capture the exact vertical scroll position before locking
    savedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileToggle.setAttribute('aria-expanded', 'true');
    if (mobileBackdrop) mobileBackdrop.classList.add('active');
    mobileClose?.focus();

    // Lock both <html> and <body> against scrolling (iOS Safari, Android Chrome, Desktop)
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function closeMobileMenu(targetSectionId = null) {
    if (!mobileDrawer || !mobileDrawer.classList.contains('open')) return;

    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');

    // Unlock <html> and <body>
    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // Restore exact scroll position
    window.scrollTo(0, savedScrollY);
    mobileToggle?.focus();

    // If an on-page section link was clicked, smoothly navigate to it after unlocking
    if (targetSectionId) {
      setTimeout(() => {
        const targetEl = document.getElementById(targetSectionId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openMobileMenu);
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', () => closeMobileMenu());
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', () => closeMobileMenu());
    // Prevent dragging or touch scroll on the backdrop from scrolling background
    mobileBackdrop.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, { passive: false });
  }

  // Prevent scroll propagation from non-scrollable header and footer of drawer
  const drawerHeader = document.querySelector('.mobile-drawer-header');
  const drawerFooter = document.querySelector('.mobile-drawer-footer');
  if (drawerHeader) {
    drawerHeader.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, { passive: false });
  }
  if (drawerFooter) {
    drawerFooter.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, { passive: false });
  }

  // Close drawer on actual navigation link click & handle on-page anchors smoothly
  document.querySelectorAll('a.mobile-nav-link, a.mobile-sub-link, a.mobile-drawer-cta, a.drawer-brand').forEach(link => {
    link.addEventListener('click', function (e) {
      // Do not close drawer if clicking summary accordion toggles
      if (this.tagName === 'SUMMARY' || this.closest('summary')) {
        return;
      }

      const href = this.getAttribute('href') || '';
      const hashIndex = href.indexOf('#');

      if (hashIndex !== -1 && (window.location.pathname === '/' || href.startsWith('#'))) {
        const targetId = href.substring(hashIndex + 1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          closeMobileMenu(targetId);
          return;
        }
      }

      closeMobileMenu();
    });
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Gallery Thumbnail Swapper
  const mainGalleryImg = document.getElementById('mainGalleryImage');
  const galleryTitle = document.getElementById('galleryImageTitle');
  const thumbBtns = document.querySelectorAll('.thumb-btn');

  thumbBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      thumbBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const newUrl = this.getAttribute('data-img-url');
      const newTitle = this.getAttribute('data-img-title');

      if (mainGalleryImg && newUrl) {
        mainGalleryImg.style.opacity = '0.4';
        setTimeout(() => {
          mainGalleryImg.src = newUrl;
          mainGalleryImg.style.opacity = '1';
        }, 120);
      }

      if (galleryTitle && newTitle) {
        galleryTitle.textContent = newTitle;
      }
    });
  });

  // Intercept Order Form Submit to show spinner & track analytics
  const orderForm = document.getElementById('storefrontOrderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      const nameInput = document.getElementById('customer_name');
      const phoneInput = document.getElementById('phone');
      const addrInput = document.getElementById('address');

      if (!nameInput.value.trim()) {
        alert((window.t && window.t('validation_name_required')) || 'Please enter your full name.');
        nameInput.focus();
        e.preventDefault();
        return;
      }

      if (!phoneInput.value.trim() || phoneInput.value.trim().length < 10) {
        alert((window.t && window.t('validation_phone_required')) || 'Please enter a valid mobile phone number (at least 10-11 digits).');
        phoneInput.focus();
        e.preventDefault();
        return;
      }

      if (!addrInput.value.trim()) {
        alert((window.t && window.t('validation_address_required')) || 'Please provide your complete delivery address.');
        addrInput.focus();
        e.preventDefault();
        return;
      }

      const submitBtn = document.getElementById('submitOrderBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        const textSpan = submitBtn.querySelector('.btn-text');
        const spinSpan = submitBtn.querySelector('.btn-spinner');
        if (textSpan) textSpan.style.display = 'none';
        if (spinSpan) spinSpan.style.display = 'inline-flex';
      }

      // Track event
      if (window.trackEcommerceEvent) {
        window.trackEcommerceEvent('InitiateCheckout', {
          product: '3D Wooden World Map',
          variant_id: document.getElementById('formVariantId')?.value
        });
      }
    });
  }
});

// Global state for calculations
let currentVariant = null;
let currentQuantity = 1;
let currentDistrict = 'inside_dhaka';

function initProductState() {
  if (!window.PRODUCT_DATA) {
    const jsonEl = document.getElementById('product-data-json');
    if (jsonEl && jsonEl.textContent) {
      try {
        window.PRODUCT_DATA = JSON.parse(jsonEl.textContent);
      } catch (err) {
        console.error('Failed to parse #product-data-json', err);
      }
    }
  }

  if (!window.PRODUCT_DATA || !window.PRODUCT_DATA.variants) return;

  const districtEl = document.getElementById('district');
  if (districtEl) {
    currentDistrict = districtEl.value || 'inside_dhaka';
  }

  const initialFormId = document.getElementById('formVariantId')?.value;
  currentVariant = window.PRODUCT_DATA.variants.find(v => v.id == initialFormId) || window.PRODUCT_DATA.variants[0];
  recalculateOrderSummary();
}

// Variant Selection (Only for landing showcase with #product-data-json)
if (document.getElementById('product-data-json') || !window.selectVariant) {
  window.selectVariant = function (variantId) {
  if (!window.PRODUCT_DATA) {
    const jsonEl = document.getElementById('product-data-json');
    if (jsonEl && jsonEl.textContent) {
      try {
        window.PRODUCT_DATA = JSON.parse(jsonEl.textContent);
      } catch (err) {
        console.error('Failed to parse #product-data-json', err);
      }
    }
  }
  if (!window.PRODUCT_DATA || !window.PRODUCT_DATA.variants) return;
  const found = window.PRODUCT_DATA.variants.find(v => v.id == variantId);
  if (!found) return;

  currentVariant = found;

  // Update Size Cards on Product Showcase
  document.querySelectorAll('.size-card').forEach(card => {
    if (card.getAttribute('data-variant-id') == variantId) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // Update Size switch buttons in Order Summary
  document.querySelectorAll('.size-switch-btn').forEach(btn => {
    if (btn.getAttribute('data-id') == variantId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Hidden Form input
  const hiddenInput = document.getElementById('formVariantId');
  if (hiddenInput) hiddenInput.value = variantId;

  // Update Price Display on Product Showcase
  const curPriceEl = document.getElementById('selectedPrice');
  const origPriceEl = document.getElementById('selectedOrigPrice');
  const discEl = document.getElementById('selectedDiscount');
  const curr = window.PRODUCT_DATA.currency || '৳';

  const priceNum = parseFloat(found.price);
  if (curPriceEl) curPriceEl.textContent = `${curr}${formatLocalNumber(priceNum)}`;

  if (found.original_price && parseFloat(found.original_price) > priceNum) {
    const origNum = parseFloat(found.original_price);
    const saved = origNum - priceNum;
    const saveLabel = (window.PRODUCT_DATA && window.PRODUCT_DATA.labels && window.PRODUCT_DATA.labels.save) || 'SAVE';
    if (origPriceEl) {
      origPriceEl.textContent = `${curr}${formatLocalNumber(origNum)}`;
      origPriceEl.style.display = 'inline';
    }
    if (discEl) {
      discEl.textContent = `${saveLabel} ${curr}${formatLocalNumber(saved)}`;
      discEl.style.display = 'inline-block';
    }
  } else {
    if (origPriceEl) origPriceEl.style.display = 'none';
    if (discEl) discEl.style.display = 'none';
  }

  // Update Summary Card
  const sizeDisplay = document.getElementById('summarySizeDisplay');
  const unitPriceDisplay = document.getElementById('summaryUnitPrice');
  if (sizeDisplay) sizeDisplay.textContent = found.localized_display || `${found.size_name} (${found.dimensions})`;
  if (unitPriceDisplay) unitPriceDisplay.textContent = `${curr}${formatLocalNumber(priceNum)}`;

  recalculateOrderSummary();
};
}

window.selectVariantAndOrder = function (variantId) {
  selectVariant(variantId);
  scrollToOrderForm();
};

window.scrollToOrderForm = function () {
  const orderSec = document.getElementById('order-section');
  if (orderSec) {
    orderSec.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('customer_name')?.focus();
    }, 500);
  }
};

window.updateQty = function (delta) {
  const qtyInput = document.getElementById('orderQuantity');
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value, 10) || 1;
  val = Math.max(1, Math.min(10, val + delta));
  qtyInput.value = val;
  currentQuantity = val;
  recalculateOrderSummary();
};

window.updateDeliveryCharge = function (districtVal) {
  currentDistrict = districtVal;
  recalculateOrderSummary();
};

function formatLocalNumber(val) {
  if (val === null || val === undefined) return '';
  const str = Number(val).toLocaleString('en-US');
  if (window.PRODUCT_DATA && window.PRODUCT_DATA.lang === 'bn') {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[0-9]/g, d => bnDigits[parseInt(d, 10)]);
  }
  return str;
}

function recalculateOrderSummary() {
  if (!window.CART_DATA) {
    const cartJson = document.getElementById('cart-data-json');
    if (cartJson && cartJson.textContent) {
      try {
        window.CART_DATA = JSON.parse(cartJson.textContent);
      } catch (err) {
        console.error('Failed to parse #cart-data-json', err);
      }
    }
  }

  if (window.CART_DATA) {
    const curr = window.CART_DATA.currency || '৳';
    const deliveryCharges = window.CART_DATA.deliveryCharges || {};
    const deliveryFee = currentDistrict === 'outside_dhaka'
      ? deliveryCharges.outside_dhaka
      : deliveryCharges.inside_dhaka;
    const subtotal = Number(window.CART_DATA.subtotal) || 0;
    const total = subtotal + (Number(deliveryFee) || 0);
    const format = value => `${curr}${formatLocalNumber(value)}`;
    document.getElementById('summarySubtotal')?.replaceChildren(format(subtotal));
    document.getElementById('summaryDelivery')?.replaceChildren(format(deliveryFee));
    document.getElementById('summaryTotal')?.replaceChildren(format(total));
    document.getElementById('btnTotalText')?.replaceChildren(format(total));
    const labels = window.CART_DATA.labels || {};
    const districtLabel = document.getElementById('summaryDistrictLabel');
    if (districtLabel) {
      districtLabel.textContent = currentDistrict === 'outside_dhaka'
        ? (labels.outside_dhaka || (window.t && window.t('form_district_outside')) || 'Outside Dhaka')
        : (labels.inside_dhaka || (window.t && window.t('form_district_dhaka')) || 'Inside Dhaka');
    }
    return;
  }

  if (!window.PRODUCT_DATA || !currentVariant) return;

  const curr = window.PRODUCT_DATA.currency || '৳';
  const unitPrice = parseFloat(currentVariant.price);
  const subtotal = unitPrice * currentQuantity;

  const charges = window.PRODUCT_DATA.deliveryCharges || { inside_dhaka: 80, outside_dhaka: 150 };
  const deliveryFee = currentDistrict === 'outside_dhaka' ? charges.outside_dhaka : charges.inside_dhaka;
  const total = subtotal + deliveryFee;

  const subtotalEl = document.getElementById('summarySubtotal');
  const deliveryEl = document.getElementById('summaryDelivery');
  const totalEl = document.getElementById('summaryTotal');
  const districtLabel = document.getElementById('summaryDistrictLabel');
  const btnTotalText = document.getElementById('btnTotalText');
  const labels = window.PRODUCT_DATA.labels || {};

  if (subtotalEl) subtotalEl.textContent = `${curr}${formatLocalNumber(subtotal)}`;
  if (deliveryEl) deliveryEl.textContent = `${curr}${formatLocalNumber(deliveryFee)}`;
  if (totalEl) totalEl.textContent = `${curr}${formatLocalNumber(total)}`;
  if (btnTotalText) btnTotalText.textContent = `${curr}${formatLocalNumber(total)}`;
  if (districtLabel) {
    districtLabel.textContent = currentDistrict === 'outside_dhaka'
      ? (labels.outside_dhaka || (window.t && window.t('form_district_outside')) || 'Outside Dhaka')
      : (labels.inside_dhaka || (window.t && window.t('form_district_dhaka')) || 'Inside Dhaka');
  }
}

// Payment Method Selection (COD vs bKash)
let currentPaymentMethod = 'cod';
window.onPaymentMethodSelect = function (method) {
  currentPaymentMethod = method;
  const isBkash = method === 'bkash';

  // Toggle active styling on payment cards
  document.querySelectorAll('.payment-method-card').forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    if (radio && radio.value === method) {
      card.classList.add('active');
      radio.checked = true;
    } else {
      card.classList.remove('active');
    }
  });

  // Update Submit Button Style & Text
  const submitBtn = document.getElementById('submitOrderBtn');
  if (submitBtn) {
    const textSpan = submitBtn.querySelector('.btn-text');
    const isBn = !window.PRODUCT_DATA || window.PRODUCT_DATA.lang === 'bn';
    const btnTotalSpan = document.getElementById('btnTotalText');
    const currentPriceText = btnTotalSpan ? btnTotalSpan.textContent : '';

    if (isBkash) {
      submitBtn.classList.add('btn-bkash-theme');
      if (textSpan) {
        const bkashBtnText = (window.t && window.t('order_pay_bkash_btn')) || (isBn ? 'বিকাশ দিয়ে পেমেন্ট করুন' : 'Pay with bKash');
        textSpan.innerHTML = `${bkashBtnText} (<span id="btnTotalText">${currentPriceText}</span>)`;
      }
    } else {
      submitBtn.classList.remove('btn-bkash-theme');
      if (textSpan) {
        const confirmBtnText = (window.t && window.t('order_btn_confirm_total')) || (isBn ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order');
        textSpan.innerHTML = `${confirmBtnText} (<span id="btnTotalText">${currentPriceText}</span>)`;
      }
    }
  }
};

window.toggleFaq = function (button) {
  if (!button) return;
  const item = button.closest ? button.closest('.faq-item') : button.parentElement;
  if (!item) return;
  const isActive = item.classList.contains('active');

  // Close other open items
  document.querySelectorAll('.faq-item').forEach(i => {
    if (i !== item) {
      i.classList.remove('active');
      i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    }
  });

  if (isActive) {
    item.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
  } else {
    item.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
  }
};

// Delegated click listener for FAQ accordion
document.addEventListener('click', function (e) {
  const faqBtn = e.target.closest ? e.target.closest('.faq-question') : null;
  if (faqBtn) {
    e.preventDefault();
    window.toggleFaq(faqBtn);
    return;
  }

  // Size card selection delegation
  const sizeCard = e.target.closest ? e.target.closest('.size-card') : null;
  if (sizeCard) {
    const vId = sizeCard.getAttribute('data-variant-id');
    if (vId) window.selectVariant(vId);
    return;
  }

  // Size switch button in summary delegation
  const sizeBtn = e.target.closest ? e.target.closest('.size-switch-btn') : null;
  if (sizeBtn) {
    const vId = sizeBtn.getAttribute('data-id');
    if (vId) window.selectVariant(vId);
    return;
  }
});

// Initialize state
initProductState();
