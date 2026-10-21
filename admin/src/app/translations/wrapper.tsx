'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Compass,
  Home,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Layers,
  SlidersHorizontal,
  HelpCircle,
  Settings,
  PackageCheck,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { TranslationsHeader } from './TranslationsHeader';
import { TranslationsCategoryNav } from './TranslationsCategoryNav';
import { TranslationsTable, TranslationItem } from './TranslationsTable';
import { TranslationUpsertModal } from './TranslationUpsertModal';

export const CATEGORIES_CONFIG: Record<string, {
  label: string;
  icon: any;
  subCategories: Array<{ id: string; label: string; keys: string[] }>;
}> = {
  header_navigation: {
    label: 'Header & Nav',
    icon: Compass,
    subCategories: [
      { id: 'all', label: 'All Header Elements', keys: [] },
      { id: 'brand_header', label: 'Brand & Language', keys: ['brand_title', 'brand_subtitle', 'header_lang_switcher_title', 'header_mobile_drawer_lang_label', 'nav_lang_toggle'] },
      { id: 'nav_links', label: 'Primary Nav Links', keys: ['nav_home', 'nav_products', 'nav_all_products', 'nav_categories', 'nav_dropdown_title', 'nav_view_all', 'nav_policies', 'nav_policy_dropdown_title', 'nav_track', 'nav_track_order', 'nav_cart', 'header_order_cta', 'mobile_menu_helpline'] },
      { id: 'header_search', label: 'Search Bar', keys: ['header_search_label', 'header_search_placeholder', 'nav_search_placeholder', 'header_search_submit'] },
    ],
  },
  home_page: {
    label: 'Home Page',
    icon: Home,
    subCategories: [
      { id: 'all', label: 'All Home Sections', keys: [] },
      { id: 'hero_intro', label: 'Hero & Features', keys: ['home_banner_label', 'home_banner_alt', 'home_intro_label', 'home_intro_badge', 'home_headline', 'home_intro_message', 'home_feat_1', 'home_feat_2', 'home_feat_3', 'home_order_now_cta', 'home_order_call_btn'] },
      { id: 'home_sections', label: 'Showcase & Best Sellers', keys: ['home_categories_title', 'home_categories_sub', 'home_category_items', 'home_featured_title', 'home_featured_view_details', 'home_featured_buy_now', 'home_best_sellers_title', 'home_best_sellers_sub'] },
      { id: 'order_guide', label: 'Order Guide Steps', keys: ['home_order_guide_title', 'home_order_guide_badge', 'home_order_guide_sub', 'guide_step_1_title', 'guide_step_1_desc', 'guide_step_2_title', 'guide_step_2_desc', 'guide_step_3_title', 'guide_step_3_desc', 'guide_step_4_title', 'guide_step_4_desc'] },
      { id: 'home_reviews_faq', label: 'Reviews, FAQ & Trust', keys: ['home_reviews_title', 'home_reviews_rating_badge', 'home_reviews_sub', 'home_faq_title', 'home_faq_badge', 'home_faq_sub', 'home_why_title', 'home_why_sub', 'faq_more_questions', 'faq_more_questions_sub', 'trust_real_reviews', 'trust_real_reviews_sub', 'trust_cod_inspect', 'trust_cod_inspect_sub', 'trust_replacement', 'trust_replacement_sub'] },
    ],
  },
  product_catalog: {
    label: 'Product Catalog',
    icon: ShoppingBag,
    subCategories: [
      { id: 'all', label: 'All Catalog Elements', keys: [] },
      { id: 'catalog_grid', label: 'Catalog Grid & Badges', keys: ['all_products_heading', 'catalog_details', 'view_details', 'catalog_add_cart', 'product_out_of_stock', 'product_in_stock', 'product_in_stock_ready', 'product_save_badge', 'catalog_price_unavailable', 'exclusive_badge', 'signature_piece', 'explore', 'prev_page', 'next_page', 'search_results_count', 'search_no_results'] },
      { id: 'filters_sorting', label: 'Filters & Sorting', keys: ['filter_price_title', 'all_prices', 'price_under_2000', 'price_2000_5000', 'price_5000_15000', 'price_above_15000', 'filter_sort_title', 'sort_popular', 'sort_best_selling', 'sort_trending', 'sort_newest', 'sort_top_rated', 'sort_price_asc', 'sort_price_desc', 'reset_filters', 'search_reset'] },
    ],
  },
  product_details: {
    label: 'Product Details',
    icon: Layers,
    subCategories: [
      { id: 'all', label: 'All Product Detail Elements', keys: [] },
      { id: 'details_main', label: 'Details & Actions', keys: ['product_tax_note', 'product_select_size_label', 'product_select_size', 'product_select_color_label', 'product_select_color', 'order_label_quantity', 'product_quantity', 'hero_cta_order', 'product_order_now', 'product_add_to_cart', 'cart_added_toast', 'details_related_title','details_related_sub','similar_products_eyebrow', 'product_btn_details', 'product_not_found', 'home_browse', 'home_search_link', 'popular_links', 'search_catalog', 'not_found_title', 'not_found_desc'] },
      { id: 'guarantee_badges', label: 'Guarantees & Tags', keys: ['guarantee_delivery_title', 'guarantee_delivery_desc', 'guarantee_cod_title', 'guarantee_cod_desc', 'guarantee_quality_title', 'guarantee_quality_desc', 'guarantee_replacement_title', 'guarantee_replacement_desc', 'product_delivery_guarantee', 'feat_tag_birch', 'feat_tag_layers', 'feat_tag_cod'] },
      { id: 'details_tabs', label: 'Specs & Shipping Tabs', keys: ['tab_description', 'product_description_tab', 'tab_specifications', 'product_features_tab', 'tab_reviews', 'product_reviews_tab', 'tab_shipping', 'spec_size', 'spec_dimensions', 'spec_finish', 'spec_price', 'spec_status', 'shipping_tab_delivery_title', 'shipping_tab_delivery_desc', 'shipping_tab_pkg_title', 'shipping_tab_pkg_desc', 'shipping_tab_care_title', 'shipping_tab_care_desc'] },
      { id: 'product_reviews', label: 'Reviews & Feedback', keys: ['heading_write_review', 'review_verified_buyer', 'review_no_reviews_desc', 'review_placeholder_name', 'review_label_ordernum', 'review_placeholder_ordernum', 'review_hint_order', 'review_placeholder_phone', 'review_hint_phone', 'track_rating_label', 'track_review_text_label', 'track_review_text_placeholder', 'track_btn_submitting', 'track_btn_submit_review', 'review_success_submitted', 'review_err_generic', 'review_err_name_required', 'review_err_text_required', 'rating_text_5', 'rating_text_4', 'rating_text_3', 'rating_text_2', 'rating_text_1'] },
    ],
  },
  cart_checkout: {
    label: 'Cart & Checkout',
    icon: ShoppingCart,
    subCategories: [
      { id: 'all', label: 'All Cart & Checkout', keys: [] },
      { id: 'cart_drawer_page', label: 'Cart Drawer', keys: ['cart_eyebrow', 'cart_title', 'cart_items_suffix', 'items_count_label', 'cart_empty_title', 'cart_empty_sub', 'cart_empty_body', 'cart_start_shopping', 'cart_proceed_checkout', 'continue_shopping', 'cart_remove', 'cart_each', 'cart_calc_at_checkout'] },
      { id: 'checkout_flow', label: 'Checkout Headers & Badges', keys: ['checkout_page_title', 'checkout_breadcrumb', 'checkout_back_store', 'checkout_badge_secure', 'checkout_title', 'checkout_subtitle', 'checkout_step_cart', 'checkout_step_info_payment', 'checkout_step_confirm', 'checkout_home_delivery_badge', 'checkout_secure_badge', 'checkout_instant_confirm', 'checkout_encryption_note', 'checkout_cod_applicable', 'checkout_helpline_text', 'form_required_error'] },
      { id: 'customer_form', label: 'Customer & Address Form', keys: ['order_sec_delivery_info', 'checkout_delivery_info_title', 'order_label_fullname', 'checkout_name_label', 'order_placeholder_name', 'order_label_phone', 'checkout_phone_label', 'order_placeholder_phone', 'order_phone_digits_hint', 'order_help_phone', 'order_label_location', 'checkout_city_label', 'order_opt_dhaka', 'checkout_city_dhaka', 'order_opt_outside', 'checkout_city_outside', 'order_delivery_dhaka_eta', 'order_delivery_outside_eta', 'order_label_area', 'order_placeholder_area', 'order_label_address', 'checkout_address_label', 'order_placeholder_address', 'order_label_note', 'checkout_notes_label', 'order_placeholder_note', 'order_label_email'] },
      { id: 'payment_methods', label: 'Payment Options', keys: ['order_sec_payment_method', 'checkout_payment_title', 'order_payment_cod', 'checkout_payment_cod', 'order_cod_desc', 'order_payment_bkash', 'checkout_payment_bkash', 'order_bkash_desc', 'order_payment_method'] },
      { id: 'order_summary', label: 'Summary & Promos', keys: ['order_summary_title', 'checkout_summary_title', 'order_subtotal', 'order_delivery_charge', 'order_shipping', 'order_total_payable', 'order_total', 'order_processing', 'order_btn_confirm', 'checkout_place_order_btn', 'order_trust_1', 'order_trust_2', 'order_trust_3', 'order_promo_discount', 'checkout_promo_placeholder', 'promo_apply_btn', 'promo_flat_discount', 'promo_saved_text'] },
    ],
  },
  order_confirmation: {
    label: 'Order Confirmation',
    icon: PackageCheck,
    subCategories: [
      { id: 'all', label: 'All Confirmation Elements', keys: [] },
      { id: 'confirmation_header', label: 'Confirmation Banner', keys: ['confirm_badge', 'confirm_title', 'confirm_subtitle', 'confirm_order_id_label', 'confirm_copy_btn', 'confirm_copied_btn'] },
      { id: 'confirmation_actions', label: 'Action Buttons', keys: ['confirm_btn_whatsapp', 'confirm_btn_track', 'confirm_btn_call'] },
      { id: 'confirmation_security', label: 'Security & Access Code', keys: ['order_security_notice', 'order_security_desc', 'track_access_code_label', 'track_access_code_hint'] },
      { id: 'confirmation_details', label: 'Product & Address Summary', keys: ['confirm_delivery_address', 'confirm_item_col', 'confirm_qty_col', 'confirm_price_col'] },
    ],
  },
  order_tracking: {
    label: 'Order Tracking',
    icon: Truck,
    subCategories: [
      { id: 'all', label: 'All Tracking Elements', keys: [] },
      {
        id: 'tracking_form',
        label: 'Tracking Lookup Form',
        keys: [
          'track_badge',
          'track_heading',
          'track_page_title',
          'track_subheading',
          'track_page_sub',
          'track_form_order_label',
          'track_input_label',
          'track_form_order_placeholder',
          'track_form_phone_label',
          'track_form_phone_placeholder',
          'track_access_code_label',
          'track_access_code_placeholder',
          'track_security_hint',
          'track_form_submit',
          'track_btn',
          'track_err_missing_credentials',
          'track_err_not_found',
          'track_error_card_title',
          'required_badge',
          'optional_badge',
        ],
      },
      {
        id: 'tracking_timeline',
        label: 'Timeline & Nodes',
        keys: [
          'track_status_timeline_title',
          'status_pending',
          'track_status_pending',
          'track_step_pending_desc',
          'status_confirmed',
          'track_status_confirmed',
          'track_step_confirmed_desc',
          'status_processing',
          'track_status_processing',
          'track_step_processing_desc',
          'status_shipped',
          'track_status_shipped',
          'track_step_shipped_desc',
          'status_delivered',
          'track_status_delivered',
          'track_step_delivered_desc',
          'track_order_cancelled_title',
          'track_status_cancelled',
          'track_order_cancelled_desc',
          'track_timeline_in_progress',
          'track_timeline_done',
          'track_timeline_pending',
          'track_eta_inside_dhaka',
          'track_eta_outside_dhaka',
        ],
      },
      {
        id: 'tracking_status_banners',
        label: 'Status Summary Banners',
        keys: [
          'track_summary_pending_title',
          'track_summary_pending_msg',
          'track_summary_pending_badge',
          'track_summary_confirmed_title',
          'track_summary_confirmed_msg',
          'track_summary_confirmed_badge',
          'track_summary_processing_title',
          'track_summary_processing_msg',
          'track_summary_processing_badge',
          'track_summary_shipped_title',
          'track_summary_shipped_msg',
          'track_summary_shipped_badge',
          'track_summary_delivered_title',
          'track_summary_delivered_msg',
          'track_summary_delivered_badge',
          'track_summary_cancelled_title',
          'track_summary_cancelled_msg',
          'track_summary_cancelled_badge',
        ],
      },
      {
        id: 'tracking_parcel_details',
        label: 'Parcel, Address & Billing',
        keys: [
          'order_number_title',
          'copy_order_number',
          'copied_success',
          'zone_inside_dhaka',
          'zone_outside_dhaka',
          'track_cod_amount_payable',
          'track_prepaid_status',
          'order_package_items',
          'items_count_label',
          'track_verified_parcel',
          'order_label_quantity',
          'track_reviewed_badge',
          'track_btn_review',
          'track_delivery_address_title',
          'track_delivery_sub',
          'track_privacy_masked_notice',
          'order_label_fullname',
          'order_label_phone',
          'verified_contact',
          'order_label_address',
          'track_delivery_note_label',
          'track_payment_summary_title',
          'track_payment_sub',
          'payment_method_cod',
          'payment_method_online',
          'order_payment_status_label',
          'track_payment_paid_badge',
          'track_payment_unpaid_badge',
          'track_support_box_title',
          'track_support_box_desc',
          'track_browse_catalog_btn',
        ],
      },
      {
        id: 'tracking_review_modal',
        label: 'Customer Review Modal',
        keys: [
          'track_modal_title',
          'track_modal_rating_label',
          'track_modal_review_label',
          'track_modal_review_placeholder',
          'track_modal_cancel_btn',
          'track_modal_submit_btn',
          'track_rating_5',
          'track_rating_4',
          'track_rating_3',
          'track_rating_2',
          'track_rating_1',
          'track_review_feedback_required',
          'review_success_submitted',
          'review_err_generic',
        ],
      },
    ],
  },
  search_page: {
    label: 'Search & Filters',
    icon: SlidersHorizontal,
    subCategories: [
      { id: 'all', label: 'All Search Elements', keys: ['search_filters_heading', 'search_query_label', 'search_query_placeholder', 'search_category_label', 'search_all_categories', 'search_size_label', 'search_all_sizes', 'search_color_label', 'search_all_colors', 'search_price_heading', 'search_min_price', 'search_max_price', 'search_sort_label', 'search_sort_newest', 'search_sort_price_low', 'search_sort_price_high', 'search_sort_name', 'search_apply', 'search_filtered_label', 'search_filter_active_count'] },
    ],
  },
  footer_support: {
    label: 'Footer & Support',
    icon: HelpCircle,
    subCategories: [
      { id: 'all', label: 'All Footer Elements', keys: [] },
      { id: 'bottom_guarantee_strip', label: 'Guarantee Strip', keys: ['footer_strip_cod_title', 'footer_strip_cod_desc', 'footer_strip_guarantee_title', 'footer_strip_replacement_title', 'footer_strip_guarantee_desc', 'footer_strip_wood_title', 'footer_strip_wood_desc', 'footer_strip_delivery_title', 'footer_strip_delivery_desc'] },
      { id: 'footer_content', label: 'Links & Brand Info', keys: ['footer_brand_desc', 'footer_brand_tagline', 'footer_quick_links_title', 'footer_links_title', 'footer_shopping_title', 'footer_shop_title', 'footer_browse_catalog', 'footer_new_products', 'footer_contact_title', 'footer_copyright', 'footer_rights'] },
      { id: 'floating_support', label: 'Support & Help Widget', keys: ['whatsapp_inquiry_msg', 'whatsapp_chat_tooltip', 'call_customer_care_tooltip', 'pwa_install_btn', 'pwa_install_hint', 'policy_sidebar_nav_title', 'policy_assistance_title', 'policy_assistance_desc'] },
    ],
  },
  common_system: {
    label: 'System & Alerts',
    icon: Settings,
    subCategories: [
      { id: 'all', label: 'All Common Strings', keys: ['loading', 'network_error_retry', 'remove', 'close'] },
    ],
  },
};

export const getSubcategoryInfo = (category: string, key: string) => {
  const catConfig = CATEGORIES_CONFIG[category];
  if (!catConfig) return { id: 'general', label: 'General Strings' };
  const sub = catConfig.subCategories.find((s) => s.keys.includes(key));
  if (sub) return sub;
  return { id: 'other', label: 'Other Elements' };
};

export default function Wrapper() {
  const { showSuccess, showError, showWarning, showConfirm } = useAdminModal();
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('header_navigation');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<TranslationItem> | null>(null);

  const loadTranslations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/translations/admin/list');
      const staticOnly = (data || []).filter(
        (t: TranslationItem) =>
          !t.key.startsWith('category.') &&
          !t.key.startsWith('product.') &&
          !t.key.startsWith('faq.')
      );
      setTranslations(staticOnly);
    } catch (err: any) {
      showError(err.message || 'Failed to load translations');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  const handleSyncCache = useCallback(async () => {
    setSyncing(true);
    try {
      await fetchApi('/translations/sync', { method: 'POST' });
      showSuccess('Translation cache refreshed and synced successfully!');
      loadTranslations();
    } catch (err: any) {
      showError(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }, [showSuccess, showError, loadTranslations]);

  const handleDelete = useCallback(async (item: TranslationItem) => {
    const confirmed = await showConfirm(`Are you sure you want to delete translation key "${item.key}"?`, {
      title: 'Delete Translation Key',
      confirmText: 'Delete Key',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;

    try {
      await fetchApi(`/translations/admin/${item.id}`, { method: 'DELETE' });
      showSuccess('Translation deleted successfully');
      loadTranslations();
    } catch (err: any) {
      showError(err.message || 'Delete failed');
    }
  }, [showConfirm, showSuccess, showError, loadTranslations]);

  const handleSaveItem = useCallback(async (formData: Partial<TranslationItem>) => {
    if (!formData.key || !formData.bn || !formData.en) {
      showWarning('Key, Bangla, and English fields are required.');
      return;
    }

    try {
      if (formData.id) {
        await fetchApi(`/translations/admin/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            bn: formData.bn.trim(),
            en: formData.en.trim(),
            category: formData.category,
            description: formData.description,
          }),
        });
        showSuccess('Translation updated successfully');
      } else {
        await fetchApi('/translations/admin/upsert', {
          method: 'POST',
          body: JSON.stringify({
            key: formData.key.trim(),
            bn: formData.bn.trim(),
            en: formData.en.trim(),
            category: formData.category || selectedCategory,
            description: formData.description || '',
          }),
        });
        showSuccess('Translation created successfully');
      }
      setModalOpen(false);
      setEditingItem(null);
      loadTranslations();
    } catch (err: any) {
      showError(err.message || 'Save failed');
    }
  }, [selectedCategory, showWarning, showSuccess, showError, loadTranslations]);

  const itemsCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    translations.forEach((t) => {
      const cat = t.category || 'header_navigation';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [translations]);

  const filteredItems = useMemo(() => {
    return translations.filter((item) => {
      const cat = item.category || 'header_navigation';
      if (cat !== selectedCategory) return false;

      if (selectedSubCategory !== 'all') {
        const subInfo = getSubcategoryInfo(cat, item.key);
        if (subInfo.id !== selectedSubCategory) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKey = item.key.toLowerCase().includes(q);
        const matchBn = item.bn?.toLowerCase().includes(q);
        const matchEn = item.en?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        return matchKey || matchBn || matchEn || matchDesc;
      }

      return true;
    });
  }, [translations, selectedCategory, selectedSubCategory, searchQuery]);

  return (
    <div className="space-y-6 w-full pb-16">
      <TranslationsHeader
        onOpenAddModal={() => {
          setEditingItem({ category: selectedCategory });
          setModalOpen(true);
        }}
        onSyncCache={handleSyncCache}
        syncing={syncing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <TranslationsCategoryNav
          categoriesConfig={CATEGORIES_CONFIG}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          itemsCountMap={itemsCountMap}
        />

        <TranslationsTable
          filteredItems={filteredItems}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={loading}
          onEdit={(item) => {
            setEditingItem(item);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          categoryLabel={CATEGORIES_CONFIG[selectedCategory]?.label || selectedCategory}
          getSubcategoryInfo={getSubcategoryInfo}
        />
      </div>

      <TranslationUpsertModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
        categoriesConfig={CATEGORIES_CONFIG}
        onSave={handleSaveItem}
      />
    </div>
  );
}
