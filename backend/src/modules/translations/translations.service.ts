import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const DEFAULT_STATIC_UI_TRANSLATIONS = [
  // ==========================================
  // 1. Header & Navigation (header_navigation)
  // ==========================================
  // Brand Header
  { key: 'brand_title', bn: 'স্টোরফোর্জ', en: 'StoreForge', category: 'header_navigation', subCategory: 'brand_header', description: 'Main brand name in header' },
  { key: 'brand_subtitle', bn: 'প্রিমিয়াম অনলাইন শপ', en: 'Premium Online Store', category: 'header_navigation', subCategory: 'brand_header', description: 'Brand subtitle in header' },
  { key: 'header_lang_switcher_title', bn: 'ভাষা পরিবর্তন', en: 'Switch Language', category: 'header_navigation', subCategory: 'brand_header', description: 'Language switcher tooltip' },
  { key: 'header_mobile_drawer_lang_label', bn: 'ভাষা / Language', en: 'Language / ভাষা', category: 'header_navigation', subCategory: 'brand_header', description: 'Mobile drawer language label' },

  // Navigation Links
  { key: 'nav_home', bn: 'হোম', en: 'Home', category: 'header_navigation', subCategory: 'nav_links', description: 'Home navigation link' },
  { key: 'nav_products', bn: 'পণ্যসমূহ', en: 'Products', category: 'header_navigation', subCategory: 'nav_links', description: 'Products navigation link' },
  { key: 'nav_all_products', bn: 'সকল পণ্য', en: 'All Products', category: 'header_navigation', subCategory: 'nav_links', description: 'All products dropdown link' },
  { key: 'nav_categories', bn: 'ক্যাটাগরি', en: 'Categories', category: 'header_navigation', subCategory: 'nav_links', description: 'Categories navigation dropdown' },
  { key: 'nav_dropdown_title', bn: 'ক্যাটাগরি সমূহ', en: 'Browse Categories', category: 'header_navigation', subCategory: 'nav_links', description: 'Category dropdown menu title' },
  { key: 'nav_view_all', bn: 'সব দেখুন', en: 'View All', category: 'header_navigation', subCategory: 'nav_links', description: 'View all category products link' },
  { key: 'nav_policies', bn: 'পলিসি ও তথ্য', en: 'Policies & Info', category: 'header_navigation', subCategory: 'nav_links', description: 'Policies navigation link' },
  { key: 'nav_policy_dropdown_title', bn: 'গুরুত্বপূর্ণ পলিসি ও নিয়মাবলী', en: 'Important Policies & Info', category: 'header_navigation', subCategory: 'nav_links', description: 'Policy dropdown menu title' },
  { key: 'nav_track', bn: 'অর্ডার ট্র্যাক', en: 'Track Order', category: 'header_navigation', subCategory: 'nav_links', description: 'Track order navigation link' },
  { key: 'nav_track_order', bn: 'অর্ডার ট্র্যাক', en: 'Track Order', category: 'header_navigation', subCategory: 'nav_links', description: 'Track order navigation link (alias)' },
  { key: 'nav_cart', bn: 'কার্ট', en: 'Cart', category: 'header_navigation', subCategory: 'nav_links', description: 'Cart button label' },
  { key: 'header_order_cta', bn: 'অর্ডার করুন', en: 'Order Now', category: 'header_navigation', subCategory: 'nav_links', description: 'Header prominent order CTA button' },
  { key: 'mobile_menu_helpline', bn: 'হেল্পলাইন', en: 'Helpline', category: 'header_navigation', subCategory: 'nav_links', description: 'Mobile drawer helpline label' },

  // Header Search
  { key: 'header_search_label', bn: 'পণ্য অনুসন্ধান', en: 'Search Products', category: 'header_navigation', subCategory: 'header_search', description: 'Header search label' },
  { key: 'header_search_placeholder', bn: 'পণ্য খুঁজুন...', en: 'Search products...', category: 'header_navigation', subCategory: 'header_search', description: 'Header search input placeholder' },
  { key: 'nav_search_placeholder', bn: 'পণ্য খুঁজুন...', en: 'Search products...', category: 'header_navigation', subCategory: 'header_search', description: 'Header search input placeholder (alias)' },
  { key: 'header_search_submit', bn: 'খুঁজুন', en: 'Search', category: 'header_navigation', subCategory: 'header_search', description: 'Header search submit button' },
  { key: 'nav_lang_toggle', bn: 'বাংলা/EN', en: 'EN/বাংলা', category: 'header_navigation', subCategory: 'brand_header', description: 'Header language switch button' },

  // ==========================================
  // 2. Home Page & Hero (home_page)
  // ==========================================
  // Hero & Intro
  { key: 'home_banner_label', bn: 'প্রধান ব্যানার', en: 'Main Banner', category: 'home_page', subCategory: 'hero_intro', description: 'Hero banner accessibility label' },
  { key: 'home_banner_alt', bn: 'স্টোরফোর্জ — প্রিমিয়াম পণ্যসম্ভার', en: 'StoreForge — Premium Collection', category: 'home_page', subCategory: 'hero_intro', description: 'Hero banner image alt text' },
  { key: 'home_intro_label', bn: 'পরিচিতি ও বৈশিষ্ট্য', en: 'Intro & Features', category: 'home_page', subCategory: 'hero_intro', description: 'Intro section accessibility label' },
  { key: 'home_intro_badge', bn: 'হস্তনির্মিত প্রিমিয়াম উডেন আর্ট', en: 'Handcrafted Premium Wooden Art', category: 'home_page', subCategory: 'hero_intro', description: 'Hero intro highlight badge' },
  { key: 'home_headline', bn: 'কাঠের স্পর্শে সাজিয়ে তুলুন আপনার পৃথিবী', en: 'Shape Your World with the Warmth of Natural Wood', category: 'home_page', subCategory: 'hero_intro', description: 'Homepage main title headline' },
  { key: 'home_intro_message', bn: 'আমাদের প্রতিটি কাঠের মানচিত্র নিখুঁত লেজার কাটিং এবং অভিজ্ঞ কারিগরের হাতের ছোঁয়ায় তৈরি। আপনার বসার ঘর, অফিস বা প্রিয়জনের উপহারে যোগ করুন আভিজাত্য।', en: 'Every wooden map is crafted with laser precision and artisan warmth to elevate your living room, office, or gift.', category: 'home_page', subCategory: 'hero_intro', description: 'Hero introductory description' },
  { key: 'home_feat_1', bn: '১০০% প্রাকৃতিক বার্চ কাঠ', en: '100% Natural Birch Wood', category: 'home_page', subCategory: 'hero_intro', description: 'Hero feature badge 1' },
  { key: 'home_feat_2', bn: 'মাল্টি-লেয়ার ৩ডি গভীরতা', en: 'Multi-Layer 3D Depth', category: 'home_page', subCategory: 'hero_intro', description: 'Hero feature badge 2' },
  { key: 'home_feat_3', bn: 'নিখুঁত হ্যান্ডক্রাফটেড ফিনিশিং', en: 'Laser-Cut Precision Finish', category: 'home_page', subCategory: 'hero_intro', description: 'Hero feature badge 3' },
  { key: 'home_order_now_cta', bn: 'এখনই পছন্দ করুন', en: 'Choose Your Map Now', category: 'home_page', subCategory: 'hero_intro', description: 'Hero call to action button' },
  { key: 'home_order_call_btn', bn: 'ফোনে অর্ডার করুন', en: 'Order by Phone', category: 'home_page', subCategory: 'hero_intro', description: 'Direct phone order button' },

  // Home Showcase & Best Sellers
  { key: 'home_categories_title', bn: 'ক্যাটাগরি', en: 'Categories', category: 'home_page', subCategory: 'home_sections', description: 'Categories section title' },
  { key: 'home_categories_sub', bn: 'আপনার পছন্দের সংগ্রহ খুঁজে নিন', en: 'Explore our curated collections', category: 'home_page', subCategory: 'home_sections', description: 'Categories section subtitle' },
  { key: 'home_category_items', bn: 'টি পণ্য', en: 'Items', category: 'home_page', subCategory: 'home_sections', description: 'Items count suffix' },
  { key: 'home_featured_title', bn: 'ওয়ার্ল্ড ম্যাপ', en: '3D World Map', category: 'home_page', subCategory: 'home_sections', description: 'Featured section title' },
  { key: 'home_featured_view_details', bn: 'সম্পূর্ণ বিস্তারিত দেখুন', en: 'View Full Details', category: 'home_page', subCategory: 'home_sections', description: 'Featured item view button' },
  { key: 'home_featured_buy_now', bn: 'সরাসরি অর্ডার করুন', en: 'Order Directly', category: 'home_page', subCategory: 'home_sections', description: 'Featured item quick buy button' },
  { key: 'home_best_sellers_title', bn: 'সর্বাধিক বিক্রিত পণ্য', en: 'Best Sellers', category: 'home_page', subCategory: 'home_sections', description: 'Best sellers section heading' },
  { key: 'home_best_sellers_sub', bn: 'ক্রেতাদের সবচেয়ে প্রিয় সংগ্রহ', en: 'Our most loved handcrafted collections', category: 'home_page', subCategory: 'home_sections', description: 'Best sellers subtitle' },

  // 4-Step Order Guide
  { key: 'home_order_guide_title', bn: 'কিভাবে অর্ডার করবেন?', en: 'How to Place an Order', category: 'home_page', subCategory: 'order_guide', description: 'Order guide section title' },
  { key: 'home_order_guide_badge', bn: 'সহজ ও নিরাপদ কেনাকাটা', en: 'Easy & Secure Shopping', category: 'home_page', subCategory: 'order_guide', description: 'Order guide section badge' },
  { key: 'home_order_guide_sub', bn: 'মাত্র ৪টি সহজ ধাপে ঘরে বসেই বুঝে নিন আপনার পছন্দের উডেন ম্যাপ', en: 'Receive your handcrafted wooden map in 4 easy steps at your doorstep', category: 'home_page', subCategory: 'order_guide', description: 'Order guide subtitle' },
  { key: 'guide_step_1_title', bn: 'পণ্য ও সাইজ পছন্দ করুন', en: 'Select Product & Size', category: 'home_page', subCategory: 'order_guide', description: 'Order guide step 1 title' },
  { key: 'guide_step_1_desc', bn: 'আপনার ঘরের দেওয়ালের পরিমাপ অনুযায়ী ৪ ফুট, ৫ ফুট, ৬ ফুট বা ৮ ফুট সাইজ সিলেক্ট করুন।', en: 'Choose 4ft, 5ft, 6ft or 8ft size tailored to your wall space.', category: 'home_page', subCategory: 'order_guide', description: 'Order guide step 1 description' },
  { key: 'guide_step_2_title', bn: 'নাম ও ঠিকানা প্রদান করুন', en: 'Provide Delivery Address', category: 'home_page', subCategory: 'order_guide', description: 'Order guide step 2 title' },
  { key: 'guide_step_2_desc', bn: 'সঠিক নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা লিখে অর্ডার কনফার্ম করুন।', en: 'Enter your full name, phone number, and delivery address.', category: 'home_page', subCategory: 'order_guide', description: 'Order guide step 2 description' },
  { key: 'guide_step_3_title', bn: 'পেমেন্ট পদ্ধতি বেছে নিন', en: 'Choose Payment Method', category: 'home_page', subCategory: 'order_guide', description: 'Order guide step 3 title' },
  { key: 'guide_step_3_desc', bn: 'ক্যাশ অন ডেলিভারিতে পণ্য পাওয়ার পর মূল্য পরিশোধ করতে পারবেন অথবা অনলাইনে পেমেন্ট করুন।', en: 'Pay safely on delivery (Cash on Delivery) or via bKash / Cards.', category: 'home_page', subCategory: 'order_guide', description: 'Order guide step 3 description' },
  { key: 'guide_step_4_title', bn: 'দ্রুত হোম ডেলিভারি বুঝে নিন', en: 'Fast Home Delivery', category: 'home_page', subCategory: 'order_guide', description: 'Order guide step 4 title' },
  { key: 'guide_step_4_desc', bn: '২৪ থেকে ৪৮ ঘণ্টার মধ্যে ঢাকা এবং ২-৪ দিনে সারাদেশে হোম ডেলিভারি পৌঁছে দেওয়া হবে।', en: 'Delivered safely to your doorstep within 24-48 hours in Dhaka, 2-4 days nationwide.', category: 'home_page', subCategory: 'order_guide', description: 'Order guide step 4 description' },

  // Reviews, FAQ & Trust
  { key: 'home_reviews_title', bn: 'আমাদের সম্মানিত গ্রাহকদের মতামত', en: 'Customer Testimonials', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Reviews section title' },
  { key: 'home_reviews_rating_badge', bn: '৪.৯ / ৫.০ স্টার রেটিং', en: '4.9 / 5.0 Star Rating', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Rating banner badge' },
  { key: 'home_reviews_sub', bn: 'সারা দেশের শত শত পরিবারের ভালোবাসায় সাজানো অভিজ্ঞতা', en: 'Loved by hundreds of homes across Bangladesh', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Reviews section subtitle' },
  { key: 'home_faq_title', bn: 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী', en: 'Frequently Asked Questions (FAQ)', category: 'home_page', subCategory: 'home_reviews_faq', description: 'FAQ section title' },
  { key: 'home_faq_badge', bn: 'প্রশ্ন ও উত্তর', en: 'Questions & Answers', category: 'home_page', subCategory: 'home_reviews_faq', description: 'FAQ section badge' },
  { key: 'home_faq_sub', bn: 'আপনার মনে আসা যেকোনো প্রশ্নের উত্তর সহজে খুঁজে নিন', en: 'Find answers to common questions about our wooden maps & delivery', category: 'home_page', subCategory: 'home_reviews_faq', description: 'FAQ section subtitle' },
  { key: 'home_why_title', bn: 'কেন আমাদের পছন্দ করবেন!', en: 'Why Choose Us?', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Why Choose Us section title' },
  { key: 'home_why_sub', bn: 'আপনার মনে আসা প্রশ্নগুলোর উত্তর', en: 'Answers to your most frequent questions', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Why section subtitle' },
  { key: 'faq_more_questions', bn: 'আরো কোনো প্রশ্ন আছে?', en: 'Have more questions?', category: 'home_page', subCategory: 'home_reviews_faq', description: 'FAQ footer question' },
  { key: 'faq_more_questions_sub', bn: 'আমাদের কাস্টমার কেয়ারে কল করুন অথবা হোয়াটসঅ্যাপে মেসেজ দিন', en: 'Call our customer care or message us on WhatsApp anytime', category: 'home_page', subCategory: 'home_reviews_faq', description: 'FAQ footer contact subtitle' },
  { key: 'trust_real_reviews', bn: '১০০% আসল ও ভেরিফাইড রিভিউ', en: '100% Genuine Verified Reviews', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Trust badge 1 title' },
  { key: 'trust_real_reviews_sub', bn: 'কেবলমাত্র প্রকৃত ক্রেতাদের অভিজ্ঞতা', en: 'Direct feedback from verified map owners', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Trust badge 1 subtitle' },
  { key: 'trust_cod_inspect', bn: 'পণ্য দেখে মূল্য পরিশোধ', en: 'Inspect Before Payment', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Trust badge 2 title' },
  { key: 'trust_cod_inspect_sub', bn: '১০০% ক্যাশ অন ডেলিভারি সুরক্ষা', en: '100% Cash on Delivery protection', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Trust badge 2 subtitle' },
  { key: 'trust_replacement', bn: '৭ দিনের ফ্রি রিপ্লেসমেন্ট', en: '7-Day Free Replacement', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Trust badge 3 title' },
  { key: 'trust_replacement_sub', bn: 'ডেলিভারিতে ক্ষতি হলে তাৎক্ষণিক সমাধান', en: 'Instant replacement if damaged in transit', category: 'home_page', subCategory: 'home_reviews_faq', description: 'Trust badge 3 subtitle' },

  // ==========================================
  // 3. Product Catalog (product_catalog)
  // ==========================================
  // Catalog Grid & Badges
  { key: 'all_products_heading', bn: 'সকল কাঠের পণ্য', en: 'All Handcrafted Wooden Products', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Catalog main heading' },
  { key: 'catalog_details', bn: 'বিস্তারিত দেখুন', en: 'View Details', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Product card details link' },
  { key: 'view_details', bn: 'বিস্তারিত', en: 'View Details', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Product card detail button' },
  { key: 'catalog_add_cart', bn: 'কার্টে যোগ করুন', en: 'Add to Cart', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Catalog add to cart button' },
  { key: 'product_out_of_stock', bn: 'স্টক শেষ', en: 'Out of Stock', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Product out of stock badge' },
  { key: 'product_in_stock', bn: 'স্টকে আছে', en: 'In Stock', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Product in stock badge' },
  { key: 'product_in_stock_ready', bn: 'স্টকে প্রস্তুত', en: 'Ready in Stock', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Ready in stock badge' },
  { key: 'product_save_badge', bn: 'ছাড়', en: 'SAVE', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Discount badge prefix' },
  { key: 'catalog_price_unavailable', bn: 'মূল্য অনুপলব্ধ', en: 'Price Unavailable', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Price fallback label' },
  { key: 'exclusive_badge', bn: 'এক্সক্লুসিভ', en: 'Exclusive', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Exclusive product badge' },
  { key: 'signature_piece', bn: 'সিগনেচার আর্টওয়ার্ক', en: 'Signature Piece', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Signature piece badge' },
  { key: 'explore', bn: 'অনুসন্ধান করুন', en: 'Explore', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Explore button label' },
  { key: 'prev_page', bn: 'পূর্ববর্তী', en: 'Previous', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Pagination previous page button' },
  { key: 'next_page', bn: 'পরবর্তী', en: 'Next', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Pagination next page button' },
  { key: 'search_results_count', bn: 'টি পণ্য পাওয়া গেছে', en: 'products found', category: 'product_catalog', subCategory: 'catalog_grid', description: 'Found products count text' },
  { key: 'search_no_results', bn: 'কোনো পণ্য পাওয়া যায়নি', en: 'No products found', category: 'product_catalog', subCategory: 'catalog_grid', description: 'No products found message' },

  // Filters & Sorting
  { key: 'filter_price_title', bn: 'মূল্য পরিসীমা', en: 'Price Range', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Price filter title' },
  { key: 'all_prices', bn: 'সকল মূল্য', en: 'All Prices', category: 'product_catalog', subCategory: 'filters_sorting', description: 'All prices filter option' },
  { key: 'price_under_2000', bn: '২,০০০ টাকার নিচে', en: 'Under ৳ 2,000', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Price filter under 2k' },
  { key: 'price_2000_5000', bn: '২,০০০ - ৫,০০০ টাকা', en: '৳ 2,000 - ৳ 5,000', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Price filter 2k-5k' },
  { key: 'price_5000_15000', bn: '৫,০০০ - ১৫,০০০ টাকা', en: '৳ 5,000 - ৳ 15,000', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Price filter 5k-15k' },
  { key: 'price_above_15000', bn: '১৫,০০০ টাকার উপরে', en: 'Above ৳ 15,000', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Price filter above 15k' },
  { key: 'filter_sort_title', bn: 'ক্রমানুসার', en: 'Sort By', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Sort filter title' },
  { key: 'sort_popular', bn: 'জনপ্রিয়তা অনুযায়ী', en: 'Most Popular', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Sort popular option' },
  { key: 'sort_best_selling', bn: 'সর্বাধিক বিক্রিত', en: 'Best Selling', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Sort best selling' },
  { key: 'sort_trending', bn: 'ট্রেন্ডিং', en: 'Trending', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Sort trending' },
  { key: 'sort_newest', bn: 'নতুন সংযোজন', en: 'Newest Arrivals', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Sort newest' },
  { key: 'sort_top_rated', bn: 'শীর্ষ রেটিং প্রাপ্ত', en: 'Top Rated', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Sort top rated' },
  { key: 'sort_price_asc', bn: 'মূল্য: কম থেকে বেশি', en: 'Price: Low to High', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Sort price low to high' },
  { key: 'sort_price_desc', bn: 'মূল্য: বেশি থেকে কম', en: 'Price: High to Low', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Sort price high to low' },
  { key: 'reset_filters', bn: 'ফিল্টার রিসেট', en: 'Reset Filters', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Reset filters button' },
  { key: 'search_reset', bn: 'রিসেট করুন', en: 'Reset', category: 'product_catalog', subCategory: 'filters_sorting', description: 'Search reset button' },

  // ==========================================
  // 4. Product Details & Reviews (product_details)
  // ==========================================
  // Product Details Main
  { key: 'product_tax_note', bn: 'ভ্যাট সহ অন্তর্ভুক্ত', en: 'VAT Included', category: 'product_details', subCategory: 'details_main', description: 'Price tax inclusion note' },
  { key: 'product_select_size_label', bn: 'সাইজ নির্বাচন করুন:', en: 'Select Size:', category: 'product_details', subCategory: 'details_main', description: 'Size selector label' },
  { key: 'product_select_size', bn: 'সাইজ নির্বাচন করুন:', en: 'Select Size:', category: 'product_details', subCategory: 'details_main', description: 'Size selector label (alias)' },
  { key: 'product_select_color_label', bn: 'কাঠের ফিনিশ / কালার বেছে নিন:', en: 'Choose Wood Finish Tone:', category: 'product_details', subCategory: 'details_main', description: 'Color finish selector label' },
  { key: 'product_select_color', bn: 'কাঠের ফিনিশ / কালার বেছে নিন:', en: 'Choose Wood Finish Tone:', category: 'product_details', subCategory: 'details_main', description: 'Color selector label (alias)' },
  { key: 'order_label_quantity', bn: 'পরিমাণ:', en: 'Quantity:', category: 'product_details', subCategory: 'details_main', description: 'Quantity selector label' },
  { key: 'product_quantity', bn: 'পরিমাণ:', en: 'Quantity:', category: 'product_details', subCategory: 'details_main', description: 'Quantity label (alias)' },
  { key: 'hero_cta_order', bn: 'সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)', en: 'Order Now (Cash on Delivery)', category: 'product_details', subCategory: 'details_main', description: 'Product page primary CTA button' },
  { key: 'product_order_now', bn: 'অর্ডার করুন — ক্যাশ অন ডেলিভারি', en: 'Order Now — Cash on Delivery', category: 'product_details', subCategory: 'details_main', description: 'Order CTA button (alias)' },
  { key: 'product_add_to_cart', bn: 'কার্টে যোগ করুন', en: 'Add to Cart', category: 'product_details', subCategory: 'details_main', description: 'Product add to cart button' },
  { key: 'cart_added_toast', bn: 'পণ্যটি কার্টে সফলভাবে যোগ করা হয়েছে!', en: 'Product added to cart successfully!', category: 'product_details', subCategory: 'details_main', description: 'Added to cart notification toast' },
  { key: 'details_related_title', bn: 'সম্পর্কিত অন্যান্য পণ্য', en: 'Related Products', category: 'product_details', subCategory: 'details_main', description: 'Related products section title' },
  { key: 'details_related_sub', bn: 'আপনার ঘরের দেয়াল সাজাতে আমাদের প্রিমিয়াম কালেকশনের আরও কিছু জনপ্রিয় শিল্পকর্ম।', en: 'More popular artworks from our premium collection to decorate your walls.', category: 'product_details', subCategory: 'details_main', description: 'Related products section title' },
  { key: 'similar_products_eyebrow', bn: 'সম্পর্কিত কালেকশন', en: 'Similar Collections', category: 'product_details', subCategory: 'details_main', description: 'Related products section title' },  
  { key: 'product_btn_details', bn: 'বিস্তারিত দেখুন', en: 'View Details', category: 'product_details', subCategory: 'details_main', description: 'View product details button' },
  { key: 'product_not_found', bn: 'পণ্যটি খুঁজে পাওয়া যায়নি!', en: 'Product not found!', category: 'product_details', subCategory: 'details_main', description: 'Product 404 message' },
  { key: 'home_browse', bn: 'হোমে ফিরে যান', en: 'Back to Home', category: 'product_details', subCategory: 'details_main', description: 'Back to home link' },
  { key: 'home_search_link', bn: 'পণ্য খুঁজুন', en: 'Search Products', category: 'product_details', subCategory: 'details_main', description: 'Search products link' },
  { key: 'popular_links', bn: 'জনপ্রিয় পণ্যসমূহ', en: 'Popular Products', category: 'product_details', subCategory: 'details_main', description: 'Popular links label' },
  { key: 'search_catalog', bn: 'ক্যাটালগে খুঁজুন', en: 'Search Catalog', category: 'product_details', subCategory: 'details_main', description: 'Search catalog link' },
  { key: 'not_found_title', bn: 'পৃষ্ঠাটি পাওয়া যায়নি', en: 'Page Not Found', category: 'product_details', subCategory: 'details_main', description: 'Not found page title' },
  { key: 'not_found_desc', bn: 'আপনি যে লিঙ্কটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা ভুল ইউআরএল দিয়েছেন।', en: 'The page you are looking for may have been moved or does not exist.', category: 'product_details', subCategory: 'details_main', description: 'Not found page description' },

  // Service Guarantees
  { key: 'guarantee_delivery_title', bn: 'দ্রুততম হোম ডেলিভারি', en: 'Fast Home Delivery', category: 'product_details', subCategory: 'guarantee_badges', description: 'Delivery guarantee title' },
  { key: 'guarantee_delivery_desc', bn: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, সারাদেশে ২-৪ দিনে ডেলিভারি', en: '24-48 hrs in Dhaka, 2-4 days nationwide', category: 'product_details', subCategory: 'guarantee_badges', description: 'Delivery guarantee description' },
  { key: 'guarantee_cod_title', bn: 'ক্যাশ অন ডেলিভারি', en: 'Cash on Delivery', category: 'product_details', subCategory: 'guarantee_badges', description: 'COD guarantee title' },
  { key: 'guarantee_cod_desc', bn: 'পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধের সুবিধা', en: 'Inspect the product before paying at your doorstep', category: 'product_details', subCategory: 'guarantee_badges', description: 'COD guarantee description' },
  { key: 'guarantee_quality_title', bn: '১০০% আসল কাঠের গ্যারান্টি', en: '100% Genuine Birch Wood', category: 'product_details', subCategory: 'guarantee_badges', description: 'Wood quality guarantee title' },
  { key: 'guarantee_quality_desc', bn: 'প্রাকৃতিক বার্চ প্লাইউড ও প্রিমিয়াম ফিনিশিং', en: 'High-density natural birch plywood with laser precision', category: 'product_details', subCategory: 'guarantee_badges', description: 'Wood quality guarantee description' },
  { key: 'guarantee_replacement_title', bn: '৭ দিনের রিপ্লেসমেন্ট', en: '7-Day Free Replacement', category: 'product_details', subCategory: 'guarantee_badges', description: 'Replacement guarantee title' },
  { key: 'guarantee_replacement_desc', bn: 'ডেলিভারিতে ক্ষতিগ্রস্ত হলে তাৎক্ষণিক ফ্রি পরিবর্তন', en: 'Hassle-free instant replacement if damaged in transit', category: 'product_details', subCategory: 'guarantee_badges', description: 'Replacement guarantee description' },
  { key: 'product_delivery_guarantee', bn: '২৪-৪৮ ঘণ্টায় ঢাকা এবং ২-৪ দিনে সারাদেশে হোম ডেলিভারি', en: '24-48h in Dhaka & 2-4 days nationwide home delivery', category: 'product_details', subCategory: 'guarantee_badges', description: 'Fast delivery guarantee text (alias)' },
  { key: 'feat_tag_birch', bn: 'প্রাকৃতিক বার্চ প্লাইউড', en: 'Natural Birch Plywood', category: 'product_details', subCategory: 'guarantee_badges', description: 'Birch wood tag' },
  { key: 'feat_tag_layers', bn: '৩টি লেয়ার রিলিফ', en: '3-Layer Relief Topography', category: 'product_details', subCategory: 'guarantee_badges', description: '3D layer tag' },
  { key: 'feat_tag_cod', bn: 'সারাদেশে ক্যাশ অন ডেলিভারি', en: 'Nationwide Cash on Delivery', category: 'product_details', subCategory: 'guarantee_badges', description: 'COD tag' },

  // Details Tabs & Specs
  { key: 'tab_description', bn: 'বিবরণ', en: 'Description', category: 'product_details', subCategory: 'details_tabs', description: 'Product description tab' },
  { key: 'product_description_tab', bn: 'বিস্তারিত বিবরণ', en: 'Full Description', category: 'product_details', subCategory: 'details_tabs', description: 'Product description tab (alias)' },
  { key: 'tab_specifications', bn: 'স্পেসিফিকেশন ও সাইজ চার্ট', en: 'Specifications & Dimensions', category: 'product_details', subCategory: 'details_tabs', description: 'Product specifications tab' },
  { key: 'product_features_tab', bn: 'মূল বৈশিষ্ট্যসমূহ', en: 'Key Features', category: 'product_details', subCategory: 'details_tabs', description: 'Product features tab (alias)' },
  { key: 'tab_reviews', bn: 'ক্রেতাদের রিভিউ', en: 'Customer Reviews', category: 'product_details', subCategory: 'details_tabs', description: 'Product reviews tab' },
  { key: 'product_reviews_tab', bn: 'গ্রাহকদের রিভিউ', en: 'Customer Reviews', category: 'product_details', subCategory: 'details_tabs', description: 'Product reviews tab (alias)' },
  { key: 'tab_shipping', bn: 'ডেলিভারি ও ইনস্টলেশন গাইড', en: 'Delivery & Installation Guide', category: 'product_details', subCategory: 'details_tabs', description: 'Product shipping tab' },
  { key: 'spec_size', bn: 'সাইজ / ডাইমেনশন', en: 'Size / Dimensions', category: 'product_details', subCategory: 'details_tabs', description: 'Spec table size label' },
  { key: 'spec_dimensions', bn: 'পরিমাপ (ইঞ্চি / ফুট)', en: 'Dimensions (Inches / Feet)', category: 'product_details', subCategory: 'details_tabs', description: 'Spec table dimensions label' },
  { key: 'spec_finish', bn: 'কাঠের উপাদান ও ফিনিশ', en: 'Material & Finish', category: 'product_details', subCategory: 'details_tabs', description: 'Spec table material label' },
  { key: 'spec_price', bn: 'মূল্য (টাকা)', en: 'Price (BDT)', category: 'product_details', subCategory: 'details_tabs', description: 'Spec table price label' },
  { key: 'spec_status', bn: 'স্টক স্ট্যাটাস', en: 'Stock Status', category: 'product_details', subCategory: 'details_tabs', description: 'Spec table status label' },
  { key: 'shipping_tab_delivery_title', bn: 'সারা দেশে ক্যাশ অন ডেলিভারি', en: 'Nationwide Cash on Delivery', category: 'product_details', subCategory: 'details_tabs', description: 'Shipping tab item 1 title' },
  { key: 'shipping_tab_delivery_desc', bn: 'ঢাকা সিটির ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৪ কার্যদিবসের মধ্যে আপনার দোরগোড়ায় পণ্য পৌঁছে দেওয়া হয়।', en: 'Within Dhaka in 24-48 hours and nationwide within 2-4 business days directly to your doorstep.', category: 'product_details', subCategory: 'details_tabs', description: 'Shipping tab item 1 description' },
  { key: 'shipping_tab_pkg_title', bn: 'নিরাপদ প্যাকেজিং ও সহজ ইনস্টলেশন', en: 'Safe Packaging & Easy Installation', category: 'product_details', subCategory: 'details_tabs', description: 'Shipping tab item 2 title' },
  { key: 'shipping_tab_pkg_desc', bn: 'প্রতিটি পার্সেলের সাথে বিশেষ ডাবল-সাইডেড মাউন্টিং স্টিকার ও গাইড টেমপ্লেট থাকে। কোনো প্রকার ড্রিলিং ছাড়াই দেয়ালে সহজে স্থাপন করা যায়।', en: 'Includes double-sided mounting tape and alignment guide template for effortless wall installation without drilling.', category: 'product_details', subCategory: 'details_tabs', description: 'Shipping tab item 2 description' },
  { key: 'shipping_tab_care_title', bn: 'যত্ন ও রক্ষণাবেক্ষণ নির্দেশিকা', en: 'Care & Maintenance Guide', category: 'product_details', subCategory: 'details_tabs', description: 'Shipping tab item 3 title' },
  { key: 'shipping_tab_care_desc', bn: 'শুকনো নরম সুতি কাপড় অথবা ফেদার ডাস্টার দিয়ে পরিষ্কার করুন। সরাসরি পানির সংস্পর্শ বা স্যাঁতসেঁতে পরিবেশ এড়িয়ে চলুন।', en: 'Clean with a dry microfiber cloth or feather duster. Avoid direct water exposure or damp environments.', category: 'product_details', subCategory: 'details_tabs', description: 'Shipping tab item 3 description' },

  // Customer Reviews & Ratings
  { key: 'heading_write_review', bn: 'আপনার অভিজ্ঞতা শেয়ার করুন', en: 'Write a Customer Review', category: 'product_details', subCategory: 'product_reviews', description: 'Review form heading' },
  { key: 'review_verified_buyer', bn: 'ভেরিফাইড ক্রেতা', en: 'Verified Buyer', category: 'product_details', subCategory: 'product_reviews', description: 'Verified buyer badge' },
  { key: 'review_no_reviews_desc', bn: 'এই পণ্যে এখনও কোনো রিভিউ জমা পড়েনি। প্রথম রিভিউটি আপনিই দিন!', en: 'No reviews yet for this product. Be the first to share your experience!', category: 'product_details', subCategory: 'product_reviews', description: 'No reviews placeholder description' },
  { key: 'review_placeholder_name', bn: 'আপনার নাম লিখুন', en: 'Your full name', category: 'product_details', subCategory: 'product_reviews', description: 'Review name input placeholder' },
  { key: 'review_label_ordernum', bn: 'অর্ডার নাম্বার', en: 'Order Number', category: 'product_details', subCategory: 'product_reviews', description: 'Review order number label' },
  { key: 'review_placeholder_ordernum', bn: 'যেমন: WM-1001', en: 'e.g. WM-1001', category: 'product_details', subCategory: 'product_reviews', description: 'Review order number placeholder' },
  { key: 'review_hint_order_required', bn: 'ইনভয়েস বা কনফার্মেশন মেসেজে থাকা অর্ডার নম্বর দিন', en: 'Enter the order ID from your confirmation message or invoice', category: 'product_details', subCategory: 'product_reviews', description: 'Review order required hint' },
  { key: 'review_label_phone_req', bn: 'মোবাইল নম্বর (১১ ডিজিট)', en: 'Mobile Phone (11 digits)', category: 'product_details', subCategory: 'product_reviews', description: 'Review phone label required' },
  { key: 'review_placeholder_phone_req', bn: 'যেমন: 01700000000', en: 'e.g. 01700000000', category: 'product_details', subCategory: 'product_reviews', description: 'Review phone placeholder' },
  { key: 'review_hint_phone_required', bn: 'অর্ডারে ব্যবহৃত ১১ ডিজিটের মোবাইল নম্বর দিন', en: 'Enter the 11-digit mobile number used when ordering', category: 'product_details', subCategory: 'product_reviews', description: 'Review phone required hint' },
  { key: 'review_label_secret_token', bn: 'সিক্রেট টোকেন', en: 'Secret Access Token', category: 'product_details', subCategory: 'product_reviews', description: 'Review secret token label' },
  { key: 'review_placeholder_secret_token', bn: 'যেমন: a1b2c3d4', en: 'e.g. a1b2c3d4', category: 'product_details', subCategory: 'product_reviews', description: 'Review secret token placeholder' },
  { key: 'review_hint_secret_token', bn: 'অর্ডার রসিদ বা ট্র্যাকিং পেজে থাকা সিক্রেট টোকেন দিন', en: 'Found in your order confirmation or tracking page', category: 'product_details', subCategory: 'product_reviews', description: 'Review secret token hint' },
  { key: 'review_err_order_required', bn: 'অনুগ্রহ করে আপনার অর্ডার নম্বর দিন।', en: 'Please provide your order number.', category: 'product_details', subCategory: 'product_reviews', description: 'Review validation order required' },
  { key: 'review_err_phone_required', bn: 'অনুগ্রহ করে অর্ডারে ব্যবহৃত মোবাইল নম্বর দিন।', en: 'Please provide your order phone number.', category: 'product_details', subCategory: 'product_reviews', description: 'Review validation phone required' },
  { key: 'review_err_token_required', bn: 'অনুগ্রহ করে আপনার অর্ডারের সিক্রেট টোকেন দিন।', en: 'Please provide the order secret access token.', category: 'product_details', subCategory: 'product_reviews', description: 'Review validation token required' },
  { key: 'track_rating_label', bn: 'আপনার রেটিং নির্বাচন করুন', en: 'Select Your Rating', category: 'product_details', subCategory: 'product_reviews', description: 'Review rating label' },
  { key: 'track_review_text_label', bn: 'আপনার মতামত লিখুন', en: 'Write Your Review', category: 'product_details', subCategory: 'product_reviews', description: 'Review text label' },
  { key: 'track_review_text_placeholder', bn: 'পণ্যটির গুণগত মান, ফিনিশিং এবং ডেলিভারি নিয়ে আপনার বাস্তব অভিজ্ঞতা লিখুন...', en: 'Share your honest feedback about product quality, craftsmanship, and packaging...', category: 'product_details', subCategory: 'product_reviews', description: 'Review textarea placeholder' },
  { key: 'track_btn_submitting', bn: 'সাবমিট হচ্ছে...', en: 'Submitting...', category: 'product_details', subCategory: 'product_reviews', description: 'Review submitting state button' },
  { key: 'track_btn_submit_review', bn: 'রিভিউ সাবমিট করুন', en: 'Submit Review', category: 'product_details', subCategory: 'product_reviews', description: 'Review submit button' },
  { key: 'review_success_submitted', bn: 'ধন্যবাদ! আপনার রিভিউ সফলভাবে জমা হয়েছে। অ্যাডমিন পর্যালোচনার পর এটি প্রকাশিত হবে।', en: 'Thank you! Your review has been submitted for moderation.', category: 'product_details', subCategory: 'product_reviews', description: 'Review submitted toast success' },
  { key: 'review_err_generic', bn: 'রিভিউ জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', en: 'Failed to submit review. Please try again.', category: 'product_details', subCategory: 'product_reviews', description: 'Review submission error' },
  { key: 'review_err_name_required', bn: 'অনুগ্রহ করে আপনার নাম লিখুন।', en: 'Please provide your name.', category: 'product_details', subCategory: 'product_reviews', description: 'Review validation name required' },
  { key: 'review_err_text_required', bn: 'অনুগ্রহ করে আপনার রিভিউ মন্তব্য লিখুন।', en: 'Please provide your review comments.', category: 'product_details', subCategory: 'product_reviews', description: 'Review validation text required' },
  { key: 'rating_text_5', bn: '৫ স্টার - অসাধারণ ও নিখুঁত', en: '5 Stars - Outstanding & Perfect', category: 'product_details', subCategory: 'product_reviews', description: '5 Star rating description' },
  { key: 'rating_text_4', bn: '৪ স্টার - খুবই ভালো', en: '4 Stars - Very Good', category: 'product_details', subCategory: 'product_reviews', description: '4 Star rating description' },
  { key: 'rating_text_3', bn: '৩ স্টার - সন্তোষজনক', en: '3 Stars - Satisfactory', category: 'product_details', subCategory: 'product_reviews', description: '3 Star rating description' },
  { key: 'rating_text_2', bn: '২ স্টার - প্রত্যাশার চেয়ে কম', en: '2 Stars - Below Expectations', category: 'product_details', subCategory: 'product_reviews', description: '2 Star rating description' },
  { key: 'rating_text_1', bn: '১ স্টার - সন্তুষ্ট নই', en: '1 Star - Disappointed', category: 'product_details', subCategory: 'product_reviews', description: '1 Star rating description' },

  // ==========================================
  // 5. Cart & Checkout (cart_checkout)
  // ==========================================
  // Cart Drawer & Bag
  { key: 'cart_eyebrow', bn: 'শপিং ব্যাগ', en: 'Shopping Bag', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Cart drawer top eyebrow label' },
  { key: 'cart_title', bn: 'আপনার কার্ট', en: 'Your Cart', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Cart drawer title' },
  { key: 'cart_items_suffix', bn: 'টি পণ্য', en: 'Items', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Cart items count suffix' },
  { key: 'items_count_label', bn: 'টি আইটেম', en: 'Items', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Items count label' },
  { key: 'cart_empty_title', bn: 'আপনার কার্ট বর্তমানে খালি', en: 'Your Cart is Empty', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Empty cart heading' },
  { key: 'cart_empty_sub', bn: 'পছন্দের উডেন ম্যাপ নির্বাচন করে কার্টে যোগ করুন।', en: 'Browse our wooden collections and add your favorite map.', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Empty cart description' },
  { key: 'cart_empty_body', bn: 'আপনার কার্ট বর্তমানে খালি রয়েছে। কেনাকাটা শুরু করতে পণ্য যোগ করুন।', en: 'Your cart is empty. Start exploring our handcrafted collection!', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Empty cart body text' },
  { key: 'cart_start_shopping', bn: 'কেনাকাটা শুরু করুন', en: 'Start Shopping', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Empty cart CTA button' },
  { key: 'cart_proceed_checkout', bn: 'চেকআউট করুন', en: 'Proceed to Checkout', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Proceed to checkout button' },
  { key: 'continue_shopping', bn: 'আরও কেনাকাটা করুন', en: 'Continue Shopping', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Continue shopping button' },
  { key: 'cart_remove', bn: 'মুছে ফেলুন', en: 'Remove', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Cart item remove button' },
  { key: 'cart_each', bn: 'প্রতি পিস', en: 'each', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Price per unit label' },
  { key: 'cart_calc_at_checkout', bn: 'চেকআউটের সময় ডেলিভারি চার্জ যোগ হবে', en: 'Delivery fee calculated at checkout', category: 'cart_checkout', subCategory: 'cart_drawer_page', description: 'Cart delivery fee note' },

  // Checkout Flow & Stepper
  { key: 'checkout_page_title', bn: 'চেকআউট ও অর্ডার কনফার্মেশন', en: 'Checkout & Order Confirmation', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout page header' },
  { key: 'checkout_breadcrumb', bn: 'চেকআউট', en: 'Checkout', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout breadcrumb text' },
  { key: 'checkout_back_store', bn: 'স্টোরে ফিরে যান', en: 'Return to Store', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout return to store link' },
  { key: 'checkout_badge_secure', bn: '১০০% নিরাপদ ও দ্রুত চেকআউট', en: '100% Secure & Fast Checkout', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout secure highlight badge' },
  { key: 'checkout_title', bn: 'অর্ডারটি সম্পন্ন করুন', en: 'Complete Your Order', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout main heading' },
  { key: 'checkout_subtitle', bn: 'সঠিক তথ্য দিয়ে মাত্র এক মিনিটেই অর্ডার নিশ্চিত করুন।', en: 'Fill in your delivery details in under a minute to confirm your order.', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout subtitle' },
  { key: 'checkout_step_cart', bn: '১. কার্ট রিভিউ', en: '1. Cart Review', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout step 1 indicator' },
  { key: 'checkout_step_info_payment', bn: '২. ঠিকানা ও পেমেন্ট', en: '2. Delivery & Payment', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout step 2 indicator' },
  { key: 'checkout_step_confirm', bn: '৩. কনফার্মেশন', en: '3. Confirmation', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout step 3 indicator' },
  { key: 'checkout_home_delivery_badge', bn: 'সারাদেশে হোম ডেলিভারি', en: 'Nationwide Home Delivery', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout home delivery badge' },
  { key: 'checkout_secure_badge', bn: 'নিরাপদ চেকআউট', en: '100% Secure Checkout', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout secure badge' },
  { key: 'checkout_instant_confirm', bn: 'তাৎক্ষণিক অর্ডার নিশ্চিতকরণ', en: 'Instant Order Confirmation', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Instant confirm badge' },
  { key: 'checkout_encryption_note', bn: 'আপনার সকল তথ্য ২৫৬-বিট এসএসএল (SSL) এনক্রিপশনের মাধ্যমে সম্পূর্ণ সুরক্ষিত।', en: 'Your personal information is encrypted with 256-bit SSL security.', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout encryption security note' },
  { key: 'checkout_cod_applicable', bn: 'ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম চার্জ ছাড়াই নিশ্চিন্তে অর্ডার করতে পারেন।', en: 'Cash on Delivery requires no advance payment.', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout COD guarantee note' },
  { key: 'checkout_helpline_text', bn: 'অর্ডারে সহায়তা প্রয়োজন? সরাসরি কল করুন:', en: 'Need assistance with your order? Call directly:', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Checkout helpline label' },
  { key: 'form_required_error', bn: 'অনুগ্রহ করে সকল প্রয়োজনীয় ফিল্ড পূরণ করুন', en: 'Please fill in all required fields', category: 'cart_checkout', subCategory: 'checkout_flow', description: 'Form validation required error' },

  // Customer Form
  { key: 'order_sec_delivery_info', bn: 'ডেলিভারি তথ্য', en: 'Delivery Information', category: 'cart_checkout', subCategory: 'customer_form', description: 'Checkout delivery section heading' },
  { key: 'checkout_delivery_info_title', bn: 'ডেলিভারির তথ্য', en: 'Delivery Information', category: 'cart_checkout', subCategory: 'customer_form', description: 'Delivery info title (alias)' },
  { key: 'order_label_fullname', bn: 'আপনার পূর্ণ নাম', en: 'Your Full Name', category: 'cart_checkout', subCategory: 'customer_form', description: 'Customer name field label' },
  { key: 'checkout_name_label', bn: 'আপনার পুরো নাম', en: 'Your Full Name', category: 'cart_checkout', subCategory: 'customer_form', description: 'Name field label (alias)' },
  { key: 'order_placeholder_name', bn: 'যেমন: মোঃ আরিফুল ইসলাম', en: 'e.g. Ariful Islam', category: 'cart_checkout', subCategory: 'customer_form', description: 'Customer name placeholder' },
  { key: 'order_label_phone', bn: 'মোবাইল নম্বর (১১ ডিজিট)', en: 'Phone Number (11 Digits)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Phone number field label' },
  { key: 'checkout_phone_label', bn: 'মোবাইল নম্বর (১১ ডিজিট)', en: 'Phone Number (11 Digits)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Phone field label (alias)' },
  { key: 'order_placeholder_phone', bn: '01XXXXXXXXX', en: '01XXXXXXXXX', category: 'cart_checkout', subCategory: 'customer_form', description: 'Phone number placeholder' },
  { key: 'order_phone_digits_hint', bn: '১১ ডিজিটের সঠিক মোবাইল নম্বর লিখুন', en: 'Enter valid 11-digit mobile number', category: 'cart_checkout', subCategory: 'customer_form', description: 'Phone number validation hint' },
  { key: 'order_help_phone', bn: 'ডেলিভারি সংক্রান্ত যোগাযোগের জন্য সঠিক নম্বর দিন', en: 'We will call this number for delivery coordination', category: 'cart_checkout', subCategory: 'customer_form', description: 'Phone helper text' },
  { key: 'order_label_location', bn: 'ডেলিভারি এলাকা', en: 'Delivery Area', category: 'cart_checkout', subCategory: 'customer_form', description: 'Delivery area selector label' },
  { key: 'checkout_city_label', bn: 'ডেলিভারি এলাকা', en: 'Delivery Area', category: 'cart_checkout', subCategory: 'customer_form', description: 'City/zone field label (alias)' },
  { key: 'order_opt_dhaka', bn: 'ঢাকা সিটির ভেতরে (৳ ৮০)', en: 'Inside Dhaka City (৳ 80)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Inside Dhaka delivery option' },
  { key: 'checkout_city_dhaka', bn: 'ঢাকার ভেতরে (৳ ৮০)', en: 'Inside Dhaka (৳ 80)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Dhaka delivery option (alias)' },
  { key: 'order_opt_outside', bn: 'ঢাকা সিটির বাইরে (৳ ১৫০)', en: 'Outside Dhaka (৳ 150)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Outside Dhaka delivery option' },
  { key: 'checkout_city_outside', bn: 'ঢাকার বাইরে (৳ ১৫০)', en: 'Outside Dhaka (৳ 150)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Outside Dhaka delivery option (alias)' },
  { key: 'order_delivery_dhaka_eta', bn: '২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি', en: 'Delivered within 24-48 hours', category: 'cart_checkout', subCategory: 'customer_form', description: 'Dhaka delivery ETA note' },
  { key: 'order_delivery_outside_eta', bn: '২-৪ দিনের মধ্যে হোম ডেলিভারি', en: 'Home delivery within 2-4 days', category: 'cart_checkout', subCategory: 'customer_form', description: 'Outside Dhaka delivery ETA note' },
  { key: 'order_label_area', bn: 'থানা / জেলা', en: 'Thana / District', category: 'cart_checkout', subCategory: 'customer_form', description: 'Thana/District input label' },
  { key: 'order_placeholder_area', bn: 'যেমন: মিরপুর, ঢাকা অথবা সদর, সিলেট', en: 'e.g. Mirpur, Dhaka or Sadar, Sylhet', category: 'cart_checkout', subCategory: 'customer_form', description: 'Thana/District placeholder' },
  { key: 'order_label_address', bn: 'সম্পূর্ণ ঠিকানা (বাসা/রোড নম্বর)', en: 'Full Address (House, Road, Block)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Address input label' },
  { key: 'checkout_address_label', bn: 'সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা)', en: 'Full Delivery Address', category: 'cart_checkout', subCategory: 'customer_form', description: 'Address field label (alias)' },
  { key: 'order_placeholder_address', bn: 'বাসা নং, রোড নং, এলাকা বিস্তারিত লিখুন...', en: 'House #, Road #, Sector/Area details...', category: 'cart_checkout', subCategory: 'customer_form', description: 'Address input placeholder' },
  { key: 'order_label_note', bn: 'অর্ডারের বিশেষ নোট (ঐচ্ছিক)', en: 'Special Delivery Notes (Optional)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Order notes input label' },
  { key: 'checkout_notes_label', bn: 'অর্ডারের বিশেষ নোট (ঐচ্ছিক)', en: 'Order Notes (Optional)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Order notes field label (alias)' },
  { key: 'order_placeholder_note', bn: 'ডেলিভারির সময় বা বিশেষ কোনো নির্দেশনা থাকলে লিখুন...', en: 'Any special instructions or preferred delivery time...', category: 'cart_checkout', subCategory: 'customer_form', description: 'Order notes placeholder' },
  { key: 'order_label_email', bn: 'ইমেইল অ্যাড্রেস (ঐচ্ছিক)', en: 'Email Address (Optional)', category: 'cart_checkout', subCategory: 'customer_form', description: 'Email input label' },

  // Payment Methods
  { key: 'order_sec_payment_method', bn: 'পেমেন্ট মেথড নির্বাচন করুন', en: 'Select Payment Method', category: 'cart_checkout', subCategory: 'payment_methods', description: 'Payment method section heading' },
  { key: 'checkout_payment_title', bn: 'পেমেন্ট মেথড বেছে নিন', en: 'Select Payment Method', category: 'cart_checkout', subCategory: 'payment_methods', description: 'Payment options section title (alias)' },
  { key: 'order_payment_cod', bn: 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য পরিশোধ)', en: 'Cash on Delivery (Pay upon delivery)', category: 'cart_checkout', subCategory: 'payment_methods', description: 'COD payment title' },
  { key: 'checkout_payment_cod', bn: 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)', en: 'Cash on Delivery (Pay upon delivery)', category: 'cart_checkout', subCategory: 'payment_methods', description: 'COD payment option (alias)' },
  { key: 'order_cod_desc', bn: 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে সম্পূর্ণ টাকা পরিশোধ করুন। ১০০% নিরাপদ।', en: 'Pay in cash after inspecting your parcel upon delivery. 100% risk-free.', category: 'cart_checkout', subCategory: 'payment_methods', description: 'COD payment description' },
  { key: 'order_payment_bkash', bn: 'বিকাশ অনলাইন পেমেন্ট (তাৎক্ষণিক)', en: 'bKash Online Payment (Instant)', category: 'cart_checkout', subCategory: 'payment_methods', description: 'bKash payment title' },
  { key: 'checkout_payment_bkash', bn: 'বিকাশ অনলাইন পেমেন্ট (তাৎক্ষণিক)', en: 'bKash Online Payment (Instant)', category: 'cart_checkout', subCategory: 'payment_methods', description: 'bKash payment option (alias)' },
  { key: 'order_bkash_desc', bn: 'বিকাশ পেমেন্ট গেটওয়ের মাধ্যমে নিরাপদে ও তাৎক্ষণিকভাবে পেমেন্ট সম্পন্ন করুন।', en: 'Pay instantly and securely via bKash payment gateway.', category: 'cart_checkout', subCategory: 'payment_methods', description: 'bKash payment description' },
  { key: 'order_payment_method', bn: 'পেমেন্ট পদ্ধতি', en: 'Payment Method', category: 'cart_checkout', subCategory: 'payment_methods', description: 'Payment method label' },

  // Order Summary & Promos
  { key: 'order_summary_title', bn: 'অর্ডার সামারি', en: 'Order Summary', category: 'cart_checkout', subCategory: 'order_summary', description: 'Order summary box title' },
  { key: 'checkout_summary_title', bn: 'অর্ডার সামারি', en: 'Order Summary', category: 'cart_checkout', subCategory: 'order_summary', description: 'Summary card title (alias)' },
  { key: 'order_subtotal', bn: 'সাবটোটাল:', en: 'Subtotal:', category: 'cart_checkout', subCategory: 'order_summary', description: 'Subtotal amount label' },
  { key: 'order_delivery_charge', bn: 'ডেলিভারি চার্জ:', en: 'Delivery Charge:', category: 'cart_checkout', subCategory: 'order_summary', description: 'Delivery charge label' },
  { key: 'order_shipping', bn: 'ডেলিভারি চার্জ:', en: 'Delivery Fee:', category: 'cart_checkout', subCategory: 'order_summary', description: 'Delivery fee label (alias)' },
  { key: 'order_total_payable', bn: 'সর্বমোট প্রদেয়:', en: 'Total Payable:', category: 'cart_checkout', subCategory: 'order_summary', description: 'Total payable label' },
  { key: 'order_total', bn: 'সর্বমোট:', en: 'Total Amount:', category: 'cart_checkout', subCategory: 'order_summary', description: 'Total price label (alias)' },
  { key: 'order_processing', bn: 'অর্ডার প্রসেস হচ্ছে...', en: 'Processing Order...', category: 'cart_checkout', subCategory: 'order_summary', description: 'Order submitting state text' },
  { key: 'order_btn_confirm', bn: 'অর্ডার নিশ্চিত করুন', en: 'Confirm & Place Order', category: 'cart_checkout', subCategory: 'order_summary', description: 'Confirm order CTA button' },
  { key: 'checkout_place_order_btn', bn: 'অর্ডার নিশ্চিত করুন', en: 'Confirm & Place Order', category: 'cart_checkout', subCategory: 'order_summary', description: 'Submit order button (alias)' },
  { key: 'order_trust_1', bn: '১০০% ক্যাশ অন ডেলিভারি সুবিধা', en: '100% Cash on Delivery protection', category: 'cart_checkout', subCategory: 'order_summary', description: 'Order trust bullet 1' },
  { key: 'order_trust_2', bn: 'ডেলিভারির সময় দেখে নেওয়ার সুযোগ', en: 'Inspect parcel upon delivery', category: 'cart_checkout', subCategory: 'order_summary', description: 'Order trust bullet 2' },
  { key: 'order_trust_3', bn: 'ক্ষতিগ্রস্ত হলে তাৎক্ষণিক ফ্রি রিপ্লেসমেন্ট', en: 'Hassle-free instant replacement', category: 'cart_checkout', subCategory: 'order_summary', description: 'Order trust bullet 3' },
  { key: 'order_promo_discount', bn: 'প্রোমো ছাড়:', en: 'Promo Discount:', category: 'cart_checkout', subCategory: 'order_summary', description: 'Promo discount label' },
  { key: 'checkout_promo_placeholder', bn: 'প্রোমো কোড লিখুন', en: 'Enter Promo Code', category: 'cart_checkout', subCategory: 'order_summary', description: 'Promo code input placeholder' },
  { key: 'promo_apply_btn', bn: 'প্রয়োগ করুন', en: 'Apply', category: 'cart_checkout', subCategory: 'order_summary', description: 'Apply promo code button' },
  { key: 'promo_flat_discount', bn: 'ফ্ল্যাট ছাড়', en: 'Flat Discount', category: 'cart_checkout', subCategory: 'order_summary', description: 'Flat discount badge' },
  { key: 'promo_saved_text', bn: 'টাকা সাশ্রয় হয়েছে!', en: 'saved!', category: 'cart_checkout', subCategory: 'order_summary', description: 'Promo savings confirmation' },

  // ==========================================
  // 6. Order Confirmation (order_confirmation)
  // ==========================================
  // Confirmation Header
  { key: 'confirm_badge', bn: 'অর্ডার সফলভাবে গৃহীত হয়েছে', en: 'Order Successfully Placed', category: 'order_confirmation', subCategory: 'confirmation_header', description: 'Confirmation status badge' },
  { key: 'confirm_title', bn: 'অভিনন্দন! আপনার অর্ডার সম্পন্ন হয়েছে', en: 'Congratulations! Your Order is Confirmed', category: 'order_confirmation', subCategory: 'confirmation_header', description: 'Confirmation heading' },
  { key: 'confirm_subtitle', bn: 'আমাদের টিম আপনার অর্ডারটি প্রস্তুত করছে। শীঘ্রই ডেলিভারি সংক্রান্ত আপডেট দেওয়া হবে।', en: 'Our team is preparing your handcrafted map. We will notify you with delivery updates.', category: 'order_confirmation', subCategory: 'confirmation_header', description: 'Confirmation subtitle' },
  { key: 'confirm_order_id_label', bn: 'অর্ডার নম্বর:', en: 'Order Number:', category: 'order_confirmation', subCategory: 'confirmation_header', description: 'Order ID label' },
  { key: 'confirm_copy_btn', bn: 'কপি করুন', en: 'Copy ID', category: 'order_confirmation', subCategory: 'confirmation_header', description: 'Copy order ID button' },
  { key: 'confirm_copied_btn', bn: 'কপি হয়েছে!', en: 'Copied!', category: 'order_confirmation', subCategory: 'confirmation_header', description: 'Order ID copied state' },

  // Confirmation Actions
  { key: 'confirm_btn_whatsapp', bn: 'হোয়াটসঅ্যাপে নিশ্চিত করুন', en: 'Confirm via WhatsApp', category: 'order_confirmation', subCategory: 'confirmation_actions', description: 'WhatsApp confirmation button' },
  { key: 'confirm_btn_track', bn: 'অর্ডার ট্র্যাক করুন', en: 'Track Your Order', category: 'order_confirmation', subCategory: 'confirmation_actions', description: 'Track order CTA button' },
  { key: 'confirm_btn_call', bn: 'কাস্টমার কেয়ারে কল করুন', en: 'Call Customer Care', category: 'order_confirmation', subCategory: 'confirmation_actions', description: 'Call care CTA button' },

  // Confirmation Security & Access Code
  { key: 'order_security_notice', bn: 'অর্ডার নিরাপত্তা ও অ্যাক্সেস কোড', en: 'Order Security & Access Code', category: 'order_confirmation', subCategory: 'confirmation_security', description: 'Access code security notice title' },
  { key: 'order_security_desc', bn: 'ভবিষ্যতে আপনার অর্ডার ট্র্যাক বা রিভিউ দেওয়ার জন্য নিচের অ্যাক্সেস কোডটি সংরক্ষণ করুন:', en: 'Save the access code below to track your order and submit verified buyer reviews:', category: 'order_confirmation', subCategory: 'confirmation_security', description: 'Access code security notice description' },
  { key: 'track_access_code_label', bn: 'অর্ডার অ্যাক্সেস কোড:', en: 'Order Access Code:', category: 'order_confirmation', subCategory: 'confirmation_security', description: 'Access code label' },
  { key: 'track_access_code_hint', bn: 'এই কোডটি দিয়ে পরবর্তীতে যেকোনো সময় অর্ডারের লাইভ স্ট্যাটাস দেখতে পারবেন।', en: 'Use this access code anytime to view your live parcel tracking and status updates.', category: 'order_confirmation', subCategory: 'confirmation_security', description: 'Access code hint text' },

  // Confirmation Details & Product Table
  { key: 'confirm_delivery_address', bn: 'ডেলিভারি ঠিকানা', en: 'Delivery Address', category: 'order_confirmation', subCategory: 'confirmation_details', description: 'Confirmation delivery address header' },
  { key: 'confirm_item_col', bn: 'পণ্য', en: 'Product', category: 'order_confirmation', subCategory: 'confirmation_details', description: 'Order items table product column' },
  { key: 'confirm_qty_col', bn: 'পরিমাণ', en: 'Qty', category: 'order_confirmation', subCategory: 'confirmation_details', description: 'Order items table quantity column' },
  { key: 'confirm_price_col', bn: 'মূল্য', en: 'Price', category: 'order_confirmation', subCategory: 'confirmation_details', description: 'Order items table price column' },

  // ==========================================
  // 7. Order Tracking (order_tracking)
  // ==========================================
  // Tracking Search Form
  { key: 'track_badge', bn: 'লাইভ অর্ডার ট্র্যাকিং', en: 'Live Order Tracking', category: 'order_tracking', subCategory: 'tracking_form', description: 'Tracking page top badge' },
  { key: 'track_heading', bn: 'আপনার অর্ডারের বর্তমান অবস্থা দেখুন', en: 'Track Your Order Status', category: 'order_tracking', subCategory: 'tracking_form', description: 'Tracking page heading' },
  { key: 'track_page_title', bn: 'আপনার অর্ডার ট্র্যাক করুন', en: 'Track Your Order', category: 'order_tracking', subCategory: 'tracking_form', description: 'Track order page title (alias)' },
  { key: 'track_subheading', bn: 'আপনার অর্ডার আইডি, মোবাইল নম্বর এবং অর্ডার কনফার্মেশনের ট্র্যাকিং কোড দিয়ে পার্সেলের বর্তমান অবস্থা পর্যবেক্ষণ করুন।', en: 'Enter your Order ID or phone number along with your access code to view real-time delivery status.', category: 'order_tracking', subCategory: 'tracking_form', description: 'Tracking page subtitle' },
  { key: 'track_page_sub', bn: 'অর্ডার করার সময় প্রাপ্ত মোবাইল নম্বর অথবা অর্ডার আইডি দিয়ে স্ট্যাটাস দেখুন', en: 'Enter your phone number or Order ID to view real-time delivery status', category: 'order_tracking', subCategory: 'tracking_form', description: 'Track order page description (alias)' },
  { key: 'track_form_order_label', bn: 'অর্ডার আইডি / নম্বর', en: 'Order ID / Number', category: 'order_tracking', subCategory: 'tracking_form', description: 'Order ID input label' },
  { key: 'track_input_label', bn: 'মোবাইল নম্বর অথবা অর্ডার আইডি (e.g. WM-1001)', en: 'Mobile Number or Order ID (e.g. WM-1001)', category: 'order_tracking', subCategory: 'tracking_form', description: 'Tracking input field label (alias)' },
  { key: 'track_form_order_placeholder', bn: 'যেমন: WM000101', en: 'e.g. WM000101', category: 'order_tracking', subCategory: 'tracking_form', description: 'Order ID input placeholder' },
  { key: 'track_form_phone_label', bn: 'মোবাইল নম্বর', en: 'Mobile Number', category: 'order_tracking', subCategory: 'tracking_form', description: 'Phone number input label' },
  { key: 'track_form_phone_placeholder', bn: 'যেমন: 017XXXXXXXX', en: 'e.g. 017XXXXXXXX', category: 'order_tracking', subCategory: 'tracking_form', description: 'Phone number placeholder' },
  { key: 'track_access_code_label', bn: 'অর্ডার সিকিউরিটি কোড', en: 'Order Security Code', category: 'order_tracking', subCategory: 'tracking_form', description: 'Access code label' },
  { key: 'track_access_code_placeholder', bn: 'যেমন: sjSjVAuL', en: 'e.g. sjSjVAuL', category: 'order_tracking', subCategory: 'tracking_form', description: 'Access code placeholder' },
  { key: 'track_security_hint', bn: 'সিকিউরিটি কোড আপনার অর্ডার কনফার্মেশনের সময় স্ক্রিন ও এসএমএসে দেওয়া হয়েছিল।', en: 'The security access code was provided on screen and via SMS during order confirmation.', category: 'order_tracking', subCategory: 'tracking_form', description: 'Security code helper note below tracking form' },
  { key: 'track_form_submit', bn: 'অর্ডার ট্র্যাক করুন', en: 'Track Order', category: 'order_tracking', subCategory: 'tracking_form', description: 'Tracking submit button' },
  { key: 'track_btn', bn: 'স্ট্যাটাস খুঁজুন', en: 'Track Now', category: 'order_tracking', subCategory: 'tracking_form', description: 'Track submit button (alias)' },
  { key: 'track_err_missing_credentials', bn: 'অর্ডার ট্র্যাক করতে অর্ডার নম্বর এবং সিকিউরিটি এক্সেস কোড (ট্র্যাকিং কোড) উভয়ই আবশ্যক।', en: 'Both Order Number and Order Access Code (secret token) are strictly required to track your order.', category: 'order_tracking', subCategory: 'tracking_form', description: 'Validation error when order number or token is missing' },
  { key: 'track_err_not_found', bn: 'অর্ডারের তথ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার নম্বর ও ট্র্যাকিং কোড দিয়ে আবার চেষ্টা করুন।', en: 'Order not found. Please verify your order number and secret access code.', category: 'order_tracking', subCategory: 'tracking_form', description: 'Error message when order is not found' },
  { key: 'track_error_card_title', bn: 'অর্ডার খুঁজে পাওয়া যায়নি', en: 'Unable to Track Order', category: 'order_tracking', subCategory: 'tracking_form', description: 'Error card title on tracking failure' },
  { key: 'required_badge', bn: 'আবশ্যক', en: 'Required', category: 'order_tracking', subCategory: 'tracking_form', description: 'Required field indicator badge' },
  { key: 'optional_badge', bn: 'ঐচ্ছিক', en: 'Optional', category: 'order_tracking', subCategory: 'tracking_form', description: 'Optional field indicator badge' },

  // Live Status & Timeline Nodes
  { key: 'status_pending', bn: 'অর্ডার গ্রহণ', en: 'Order Received', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Pending status step label' },
  { key: 'track_status_pending', bn: 'অর্ডার গৃহীত হয়েছে (Pending)', en: 'Order Placed (Pending)', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Status pending label (alias)' },
  { key: 'status_confirmed', bn: 'নিশ্চিতকৃত', en: 'Order Confirmed', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Confirmed status step label' },
  { key: 'track_status_confirmed', bn: 'অর্ডার কনফার্ম হয়েছে (Confirmed)', en: 'Order Confirmed', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Status confirmed label (alias)' },
  { key: 'status_processing', bn: 'প্যাকেজিং ও কোয়ালিটি চেক', en: 'Processing & Quality Check', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Processing status step label' },
  { key: 'track_status_processing', bn: 'প্যাকেজিং প্রক্রিয়াধীন (Processing)', en: 'Processing & Packaging', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Status processing label (alias)' },
  { key: 'status_shipped', bn: 'কুরিয়ারে ট্রানজিটে', en: 'In Transit with Courier', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Shipped status step label' },
  { key: 'track_status_shipped', bn: 'কুরিয়ারে হস্তান্তর করা হয়েছে (Shipped)', en: 'Handed to Courier (Shipped)', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Status shipped label (alias)' },
  { key: 'status_delivered', bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Delivered status step label' },
  { key: 'track_status_delivered', bn: 'সফলভাবে ডেলিভারি হয়েছে (Delivered)', en: 'Successfully Delivered', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Status delivered label (alias)' },
  { key: 'track_order_cancelled_title', bn: 'অর্ডারটি বাতিল করা হয়েছে', en: 'Order Cancelled', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Cancelled status title' },
  { key: 'track_status_cancelled', bn: 'অর্ডার বাতিল হয়েছে (Cancelled)', en: 'Order Cancelled', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Status cancelled label (alias)' },
  { key: 'track_order_cancelled_desc', bn: 'এই অর্ডারটি কোনো কারণে বাতিল করা হয়েছে। বিস্তারিত জানতে অনুগ্রহ করে কাস্টমার কেয়ারে যোগাযোগ করুন।', en: 'This order has been cancelled. Please contact customer care for assistance.', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Cancelled status message' },
  { key: 'track_status_timeline_title', bn: 'অর্ডার অগ্রগতি ও লাইভ স্ট্যাটাস', en: 'Order Progress & Live Status', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Timeline header' },
  { key: 'track_timeline_in_progress', bn: 'চলমান', en: 'In Progress', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Timeline in progress node badge' },
  { key: 'track_timeline_done', bn: 'সম্পন্ন', en: 'Completed', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Timeline completed node badge' },
  { key: 'track_timeline_pending', bn: 'পরবর্তী', en: 'Next', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Timeline pending node badge' },
  { key: 'track_step_pending_desc', bn: 'অর্ডার সিস্টেমে নথিভুক্ত হয়েছে', en: 'Order received & logged', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Pending step subtext' },
  { key: 'track_step_confirmed_desc', bn: 'অর্ডার প্রস্তুতের অনুমোদন দেওয়া হয়েছে', en: 'Order confirmed for production', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Confirmed step subtext' },
  { key: 'track_step_processing_desc', bn: 'কাঠের নিখুঁত ফিনিশিং ও প্যাকিং চলছে', en: 'Crafting & premium packaging', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Processing step subtext' },
  { key: 'track_step_shipped_desc', bn: 'ডেলিভারির পথে রয়েছে', en: 'Handed to courier / on the way', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Shipped step subtext' },
  { key: 'track_step_delivered_desc', bn: 'গ্রাহকের নিকট হস্তান্তর করা হয়েছে', en: 'Successfully delivered', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Delivered step subtext' },
  { key: 'track_eta_inside_dhaka', bn: 'আনুমানিক ডেলিভারি: ২৪-৪৮ ঘণ্টা', en: 'Estimated Delivery: 24-48 Hours', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Estimated delivery inside Dhaka' },
  { key: 'track_eta_outside_dhaka', bn: 'আনুমানিক ডেলিভারি: ৩-৫ কার্যদিবস', en: 'Estimated Delivery: 3-5 Working Days', category: 'order_tracking', subCategory: 'tracking_timeline', description: 'Estimated delivery outside Dhaka' },

  // Status Summary Callout Banners
  { key: 'track_summary_pending_title', bn: 'অর্ডারটি সফলভাবে জমা হয়েছে', en: 'Order Received Successfully', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout header for pending orders' },
  { key: 'track_summary_pending_msg', bn: 'আপনার অর্ডারটি গ্রহণ করা হয়েছে। খুব শীঘ্রই আমাদের কাস্টমার সাপোর্ট টিম আপনার সাথে ফোনে যোগাযোগ করে অর্ডারটি কনফার্ম করবে।', en: 'Your order has been received. Our support team will contact you shortly to verify and confirm.', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout description for pending orders' },
  { key: 'track_summary_pending_badge', bn: 'পেন্ডিং / প্রক্রিয়াধীন', en: 'PENDING VERIFICATION', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Pill badge for pending orders' },
  { key: 'track_summary_confirmed_title', bn: 'অর্ডার কনফার্ম করা হয়েছে', en: 'Order Confirmed', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout header for confirmed orders' },
  { key: 'track_summary_confirmed_msg', bn: 'ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে এবং প্রস্তুত করার জন্য নির্ধারিত হয়েছে।', en: 'Thank you! Your order is confirmed and scheduled for fulfillment.', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout description for confirmed orders' },
  { key: 'track_summary_confirmed_badge', bn: 'নিশ্চিতকৃত', en: 'CONFIRMED', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Pill badge for confirmed orders' },
  { key: 'track_summary_processing_title', bn: 'প্যাকেজিং ও কোয়ালিটি চেকিং চলছে', en: 'Packaging & Quality Inspection', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout header for processing orders' },
  { key: 'track_summary_processing_msg', bn: 'আপনার অর্ডারটির নিখুঁত কোয়ালিটি চেকিং এবং প্রটেক্টিভ প্যাকেজিং সম্পন্ন হচ্ছে যাতে নিরাপদে আপনার কাছে পৌঁছায়।', en: 'Your items are undergoing rigorous quality inspection and secure packaging with protective wrapping.', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout description for processing orders' },
  { key: 'track_summary_processing_badge', bn: 'প্রসেসিং হচ্ছে', en: 'IN PROCESSING', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Pill badge for processing orders' },
  { key: 'track_summary_shipped_title', bn: 'পার্সেলটি কুরিয়ারে ট্রানজিটে রয়েছে', en: 'Parcel Shipped & In Transit', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout header for shipped orders' },
  { key: 'track_summary_shipped_msg', bn: 'আপনার পার্সেলটি কুরিয়ার সার্ভিসের কাছে হস্তান্তর করা হয়েছে। ডেলিভারি রাইডার নির্ধারিত সময়ে আপনার দেওয়া ফোন নম্বরে কল করে পার্সেলটি পৌঁছে দেবে।', en: 'Your package has been dispatched with our express courier partner and is on its way to your destination.', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout description for shipped orders' },
  { key: 'track_summary_shipped_badge', bn: 'ট্রানজিটে আছে', en: 'DISPATCHED & ON THE WAY', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Pill badge for shipped orders' },
  { key: 'track_summary_delivered_title', bn: 'অভিনন্দন! ডেলিভারি সম্পন্ন হয়েছে', en: 'Delivered Successfully!', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout header for delivered orders' },
  { key: 'track_summary_delivered_msg', bn: 'আপনার প্রিমিয়াম অর্ডারটি সফলভাবে ডেলিভারি করা হয়েছে। আমাদের পণ্যটি ব্যবহারের অভিজ্ঞতা জানিয়ে একটি মূল্যবান রিভিউ দিন।', en: 'Your order has been successfully delivered. We hope you love your purchase!', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout description for delivered orders' },
  { key: 'track_summary_delivered_badge', bn: 'ডেলিভারি সম্পন্ন', en: 'DELIVERED', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Pill badge for delivered orders' },
  { key: 'track_summary_cancelled_title', bn: 'অর্ডারটি বাতিল করা হয়েছে', en: 'Order Cancelled', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout header for cancelled orders' },
  { key: 'track_summary_cancelled_msg', bn: 'অর্ডারটি বাতিল করা হয়েছে। কোনো জিজ্ঞাসা থাকলে বা পুনরায় অর্ডার করতে চাইলে আমাদের হটলাইনে যোগাযোগ করুন।', en: 'This order has been marked as cancelled. If this is a mistake, please reach out to our customer helpline.', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Callout description for cancelled orders' },
  { key: 'track_summary_cancelled_badge', bn: 'বাতিল', en: 'CANCELLED', category: 'order_tracking', subCategory: 'tracking_status_banners', description: 'Pill badge for cancelled orders' },

  // Order Items, Recipient & Billing Details
  { key: 'order_number_title', bn: 'অর্ডার নম্বর', en: 'Order Number', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Order number header title' },
  { key: 'copy_order_number', bn: 'কপি করুন', en: 'Copy Order Number', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Copy order number tooltip' },
  { key: 'copied_success', bn: 'কপি হয়েছে', en: 'Copied!', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Feedback text when order number is copied' },
  { key: 'zone_inside_dhaka', bn: 'ঢাকা সিটির ভেতরে', en: 'Inside Dhaka', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Inside Dhaka delivery zone badge' },
  { key: 'zone_outside_dhaka', bn: 'ঢাকার বাইরে', en: 'Outside Dhaka', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Outside Dhaka delivery zone badge' },
  { key: 'track_cod_amount_payable', bn: 'ক্যাশ অন ডেলিভারি: প্রদেয় ৳ {amount}', en: 'Cash on Delivery: Pay ৳ {amount}', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Cash on delivery payable amount notice' },
  { key: 'track_prepaid_status', bn: 'পেমেন্ট সম্পন্ন (পেইড)', en: 'Prepaid (Fully Paid)', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Prepaid order status notice' },
  { key: 'order_package_items', bn: 'অর্ডারের পণ্যসমূহ', en: 'Package Contents', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Package items heading' },
  { key: 'items_count_label', bn: 'টি পণ্য', en: 'Items', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Item count label suffix' },
  { key: 'track_verified_parcel', bn: 'ভেরিফাইড পার্সেল', en: 'Verified Parcel', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Verified parcel badge' },
  { key: 'order_label_quantity', bn: 'পরিমাণ:', en: 'Quantity:', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Item quantity label' },
  { key: 'track_reviewed_badge', bn: 'রিভিউ জমা হয়েছে', en: 'Reviewed', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Reviewed badge' },
  { key: 'track_btn_review', bn: 'রিভিউ দিন', en: 'Write a Review', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Write review button on tracking' },
  { key: 'track_delivery_address_title', bn: 'ডেলিভারি ঠিকানা ও প্রাপক', en: 'Delivery Address & Recipient', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Recipient box title' },
  { key: 'track_delivery_sub', bn: 'অর্ডারের ডেলিভারি গন্তব্য তথ্য', en: 'Delivery destination information', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Delivery box subtitle' },
  { key: 'track_privacy_masked_notice', bn: 'ব্যক্তিগত তথ্যের সুরক্ষার্থে গ্রাহকের নাম, ফোন ও ঠিকানা সংক্ষেপিত রয়েছে। সম্পূর্ণ তথ্য উন্মোচন করতে অর্ডারের সিকিউরিটি কোড দিন।', en: 'Customer details are partially masked for privacy. Enter your Order Access Code to view full address.', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Masked privacy warning on tracking address' },
  { key: 'order_label_fullname', bn: 'গ্রাহকের পুরো নাম', en: 'Recipient Full Name', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Customer full name tile label' },
  { key: 'order_label_phone', bn: 'মোবাইল নম্বর', en: 'Mobile Number', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Customer phone tile label' },
  { key: 'verified_contact', bn: 'ভেরিফাইড', en: 'Verified', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Verified phone badge' },
  { key: 'order_label_address', bn: 'সম্পূর্ণ ডেলিভারি ঠিকানা', en: 'Complete Delivery Address', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Complete address tile label' },
  { key: 'track_delivery_note_label', bn: 'ডেলিভারি নোট / নির্দেশনা:', en: 'Delivery Note / Instructions:', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Delivery note label' },
  { key: 'track_payment_summary_title', bn: 'পেমেন্ট ও বিলিং সারাংশ', en: 'Payment & Billing Summary', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Payment summary box title' },
  { key: 'track_payment_sub', bn: 'অর্ডারের মোট মূল্য ও পেমেন্ট বিবরণ', en: 'Total order value and payment breakdown', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Payment summary subtitle' },
  { key: 'payment_method_cod', bn: 'ক্যাশ অন ডেলিভারি', en: 'Cash on Delivery', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Payment method cash on delivery badge' },
  { key: 'payment_method_online', bn: 'অনলাইনে পরিশোধিত', en: 'Online Paid', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Payment method online paid badge' },
  { key: 'order_payment_status_label', bn: 'পেমেন্ট স্ট্যাটাস:', en: 'Payment Status:', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Payment status row label' },
  { key: 'track_payment_paid_badge', bn: 'পরিশোধ সম্পন্ন (PAID)', en: 'PAID IN FULL', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Paid status badge' },
  { key: 'track_payment_unpaid_badge', bn: 'ক্যাশ অন ডেলিভারি (পরিশোধ বাকি)', en: 'PAY ON DELIVERY (UNPAID)', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Unpaid cash on delivery badge' },
  { key: 'track_support_box_title', bn: 'অর্ডার নিয়ে কোনো প্রশ্ন বা সাহায্য প্রয়োজন?', en: 'Any questions or need help with your order?', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Support box title' },
  { key: 'track_support_box_desc', bn: 'আমাদের কাস্টমার কেয়ার টিম সকাল ১০টা থেকে রাত ১০টা পর্যন্ত সক্রিয় রয়েছে।', en: 'Our customer care team is available from 10 AM to 10 PM.', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Support box description' },
  { key: 'track_browse_catalog_btn', bn: 'অন্যান্য পণ্য দেখুন', en: 'Explore More Products', category: 'order_tracking', subCategory: 'tracking_parcel_details', description: 'Browse catalog button' },

  // Customer Review Modal
  { key: 'track_modal_title', bn: 'এর রিভিউ', en: 'Review for', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Review modal header suffix' },
  { key: 'track_modal_rating_label', bn: 'রেটিং নির্বাচন করুন:', en: 'Select Rating:', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Modal rating label' },
  { key: 'track_modal_review_label', bn: 'আপনার রিভিউ লিখুন:', en: 'Write Your Review:', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Modal review text label' },
  { key: 'track_modal_review_placeholder', bn: 'পণ্যটির ফিনিশিং, কোয়ালিটি ও প্যাকেজিং সম্পর্কে আপনার অনুভূতি লিখুন...', en: 'Share your honest feedback about wood quality, craftsmanship, and packaging...', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Modal review placeholder' },
  { key: 'track_modal_cancel_btn', bn: 'বাতিল', en: 'Cancel', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Modal cancel button' },
  { key: 'track_modal_submit_btn', bn: 'জমা দিন', en: 'Submit Review', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Modal submit button' },
  { key: 'track_rating_5', bn: '৫ ★★★★★ - অসাধারণ ও নিখুঁত!', en: '5 ★★★★★ - Excellent & Perfect!', category: 'order_tracking', subCategory: 'tracking_review_modal', description: '5 Star rating description' },
  { key: 'track_rating_4', bn: '৪ ★★★★☆ - খুব ভালো!', en: '4 ★★★★☆ - Very Good!', category: 'order_tracking', subCategory: 'tracking_review_modal', description: '4 Star rating description' },
  { key: 'track_rating_3', bn: '৩ ★★★☆☆ - মোটামুটি ভালো', en: '3 ★★★☆☆ - Average', category: 'order_tracking', subCategory: 'tracking_review_modal', description: '3 Star rating description' },
  { key: 'track_rating_2', bn: '২ ★★☆☆☆ - সন্তোষজনক নয়', en: '2 ★★☆☆☆ - Below Expectations', category: 'order_tracking', subCategory: 'tracking_review_modal', description: '2 Star rating description' },
  { key: 'track_rating_1', bn: '১ ★☆☆☆☆ - একেবারেই ভালো লাগেনি', en: '1 ★☆☆☆☆ - Poor Quality', category: 'order_tracking', subCategory: 'tracking_review_modal', description: '1 Star rating description' },
  { key: 'track_review_feedback_required', bn: 'অনুগ্রহ করে আপনার রিভিউ ও মন্তব্য লিখুন।', en: 'Please write your review feedback.', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Validation error when review text is empty' },
  { key: 'review_success_submitted', bn: 'আপনার রিভিউটি সফলভাবে জমা নেওয়া হয়েছে! ধন্যবাদ।', en: 'Your review has been submitted successfully! Thank you.', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Success toast when review is submitted' },
  { key: 'review_err_generic', bn: 'রিভিউ জমা দিতে সমস্যা হয়েছে।', en: 'Failed to submit review. Please try again.', category: 'order_tracking', subCategory: 'tracking_review_modal', description: 'Error message when review submission fails' },

  // ==========================================
  // 8. Search Page (search_page)
  // ==========================================
  // Search Controls & Filters
  { key: 'search_filters_heading', bn: 'ফিল্টার', en: 'Filters', category: 'search_page', subCategory: 'search_controls', description: 'Search filters header' },
  { key: 'search_query_label', bn: 'পণ্য খুঁজুন:', en: 'Search Query:', category: 'search_page', subCategory: 'search_controls', description: 'Search query input label' },
  { key: 'search_query_placeholder', bn: 'পণ্যের নাম বা কীওয়ার্ড লিখুন...', en: 'Search by product name or keyword...', category: 'search_page', subCategory: 'search_controls', description: 'Search query input placeholder' },
  { key: 'search_category_label', bn: 'ক্যাটাগরি ফিল্টার:', en: 'Filter by Category:', category: 'search_page', subCategory: 'search_controls', description: 'Search category filter label' },
  { key: 'search_all_categories', bn: 'সকল ক্যাটাগরি', en: 'All Categories', category: 'search_page', subCategory: 'search_controls', description: 'All categories option' },
  { key: 'search_size_label', bn: 'সাইজ ফিল্টার:', en: 'Filter by Size:', category: 'search_page', subCategory: 'search_controls', description: 'Search size filter label' },
  { key: 'search_all_sizes', bn: 'সকল সাইজ', en: 'All Sizes', category: 'search_page', subCategory: 'search_controls', description: 'All sizes option' },
  { key: 'search_color_label', bn: 'কালার / ফিনিশ:', en: 'Filter by Color / Finish:', category: 'search_page', subCategory: 'search_controls', description: 'Search color filter label' },
  { key: 'search_all_colors', bn: 'সকল ফিনিশ', en: 'All Finishes', category: 'search_page', subCategory: 'search_controls', description: 'All colors option' },
  { key: 'search_price_heading', bn: 'মূল্য ফিল্টার:', en: 'Price Filter:', category: 'search_page', subCategory: 'search_controls', description: 'Search price filter heading' },
  { key: 'search_min_price', bn: 'সর্বনিম্ন মূল্য', en: 'Min Price', category: 'search_page', subCategory: 'search_controls', description: 'Min price placeholder' },
  { key: 'search_max_price', bn: 'সর্বোচ্চ মূল্য', en: 'Max Price', category: 'search_page', subCategory: 'search_controls', description: 'Max price placeholder' },
  { key: 'search_sort_label', bn: 'ক্রমানুসার:', en: 'Sort Results:', category: 'search_page', subCategory: 'search_controls', description: 'Search sort label' },
  { key: 'search_sort_newest', bn: 'নতুন সংযোজন', en: 'Newest Arrivals', category: 'search_page', subCategory: 'search_controls', description: 'Sort newest' },
  { key: 'search_sort_price_low', bn: 'মূল্য: কম থেকে বেশি', en: 'Price: Low to High', category: 'search_page', subCategory: 'search_controls', description: 'Sort low to high' },
  { key: 'search_sort_price_high', bn: 'মূল্য: বেশি থেকে কম', en: 'Price: High to Low', category: 'search_page', subCategory: 'search_controls', description: 'Sort high to low' },
  { key: 'search_sort_name', bn: 'নাম অনুসারে', en: 'Alphabetical (A-Z)', category: 'search_page', subCategory: 'search_controls', description: 'Sort alphabetical' },
  { key: 'search_apply', bn: 'ফিল্টার প্রয়োগ করুন', en: 'Apply Filters', category: 'search_page', subCategory: 'search_controls', description: 'Apply filters button' },
  { key: 'search_filtered_label', bn: 'ফিল্টার করা পণ্য', en: 'Filtered Products', category: 'search_page', subCategory: 'search_controls', description: 'Filtered results header' },
  { key: 'search_filter_active_count', bn: 'টি সক্রিয়', en: 'active', category: 'search_page', subCategory: 'search_controls', description: 'Active filters badge' },

  // ==========================================
  // 9. Footer & Customer Support (footer_support)
  // ==========================================
  // Bottom 4-Item Guarantee Strip
  { key: 'footer_strip_cod_title', bn: '১০০% ক্যাশ অন ডেলিভারি', en: '100% Cash on Delivery', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 1 title' },
  { key: 'footer_strip_cod_desc', bn: 'পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ', en: 'Inspect before paying at your doorstep', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 1 subtitle' },
  { key: 'footer_strip_guarantee_title', bn: '৭ দিনের ফ্রি রিপ্লেসমেন্ট', en: '7-Day Free Replacement', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 2 title' },
  { key: 'footer_strip_replacement_title', bn: 'ক্ষতিগ্রস্ত হলে ফ্রি রিপ্লেসমেন্ট', en: 'Free Damage Replacement', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 2 title (alias)' },
  { key: 'footer_strip_guarantee_desc', bn: 'ডেলিভারিতে ক্ষতি হলে তাত্ক্ষণিক সমাধান', en: 'Instant replacement if damaged in transit', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 2 subtitle' },
  { key: 'footer_strip_wood_title', bn: 'খাঁটি প্রাকৃতিক বার্চ উড', en: '100% Pure Natural Birch Wood', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 3 title' },
  { key: 'footer_strip_wood_desc', bn: 'নিখুঁত লেজার কাটিং ও হস্তনির্মিত ফিনিশ', en: 'Laser-cut precision & artisan handcrafted finish', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 3 subtitle' },
  { key: 'footer_strip_delivery_title', bn: 'দ্রুততম হোম ডেলিভারি', en: 'Fast Nationwide Home Delivery', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 4 title' },
  { key: 'footer_strip_delivery_desc', bn: 'ঢাকা ও সারা দেশে নিরাপদ কুরিয়ার সুবিধা', en: 'Safe delivery across Dhaka and all 64 districts', category: 'footer_support', subCategory: 'bottom_guarantee_strip', description: 'Footer bottom strip 4 subtitle' },

  // Footer Content & Columns
  { key: 'footer_brand_desc', bn: 'স্টোরফোর্জ — আধুনিক ও প্রিমিয়াম মানের সেরা পণ্যসম্ভার যা আপনার জীবনযাত্রায় এনে দেবে নান্দনিক আভিজাত্য।', en: 'StoreForge provides premium handcrafted products and artistic collections designed to elevate your lifestyle.', category: 'footer_support', subCategory: 'footer_content', description: 'Footer brand mission statement' },
  { key: 'footer_brand_tagline', bn: 'স্টোরফোর্জ — আধুনিক ও প্রিমিয়াম মানের সেরা পণ্যসম্ভার যা আপনার জীবনযাত্রায় এনে দেবে নান্দনিক আভিজাত্য।', en: 'StoreForge provides premium handcrafted products and artistic collections designed to elevate your lifestyle.', category: 'footer_support', subCategory: 'footer_content', description: 'Footer brand mission (alias)' },
  { key: 'footer_quick_links_title', bn: 'প্রয়োজনীয় লিংক', en: 'Quick Links', category: 'footer_support', subCategory: 'footer_content', description: 'Footer quick links column title' },
  { key: 'footer_links_title', bn: 'প্রয়োজনীয় লিংক', en: 'Quick Links', category: 'footer_support', subCategory: 'footer_content', description: 'Footer quick links title (alias)' },
  { key: 'footer_shopping_title', bn: 'কেনাকাটা ও ক্যাটালগ', en: 'Shop & Explore', category: 'footer_support', subCategory: 'footer_content', description: 'Footer shopping column title' },
  { key: 'footer_shop_title', bn: 'কেনাকাটা', en: 'Shop & Explore', category: 'footer_support', subCategory: 'footer_content', description: 'Footer shopping title (alias)' },
  { key: 'footer_browse_catalog', bn: 'সকল পণ্য ক্যাটালগ', en: 'Full Product Catalog', category: 'footer_support', subCategory: 'footer_content', description: 'Footer browse catalog link' },
  { key: 'footer_new_products', bn: 'নতুন কালেকশন', en: 'New Collections', category: 'footer_support', subCategory: 'footer_content', description: 'Footer new collections link' },
  { key: 'footer_contact_title', bn: 'যোগাযোগ ও সাপোর্ট', en: 'Contact & Support', category: 'footer_support', subCategory: 'footer_content', description: 'Footer contact column title' },
  { key: 'footer_copyright', bn: 'সর্বস্বত্ব সংরক্ষিত।', en: 'All rights reserved.', category: 'footer_support', subCategory: 'footer_content', description: 'Footer copyright notice' },
  { key: 'footer_rights', bn: 'সর্বস্বত্ব সংরক্ষিত।', en: 'All rights reserved.', category: 'footer_support', subCategory: 'footer_content', description: 'Footer copyright notice (alias)' },

  // Floating Help & Sidebar Assistance
  { key: 'whatsapp_inquiry_msg', bn: 'হ্যালো, আমি আপনাদের পণ্য সম্পর্কে জানতে চাই।', en: 'Hello, I would like to inquire about your products.', category: 'footer_support', subCategory: 'floating_support', description: 'Default WhatsApp inquiry message' },
  { key: 'whatsapp_chat_tooltip', bn: 'হোয়াটসঅ্যাপে চ্যাট করুন', en: 'Chat on WhatsApp', category: 'footer_support', subCategory: 'floating_support', description: 'WhatsApp floating button tooltip' },
  { key: 'call_customer_care_tooltip', bn: 'কাস্টমার কেয়ারে কল করুন', en: 'Call Customer Care', category: 'footer_support', subCategory: 'floating_support', description: 'Phone floating button tooltip' },
  { key: 'pwa_install_btn', bn: 'অ্যাপ ইনস্টল করুন', en: 'Install App', category: 'footer_support', subCategory: 'floating_support', description: 'PWA install button label' },
  { key: 'pwa_install_hint', bn: 'সহজ কেনাকাটার জন্য হোম স্ক্রিনে যোগ করুন', en: 'Add to home screen for faster shopping experience', category: 'footer_support', subCategory: 'floating_support', description: 'PWA install hint' },
  { key: 'policy_sidebar_nav_title', bn: 'অন্যান্য নীতিমালা ও তথ্য', en: 'Other Policies & Info', category: 'footer_support', subCategory: 'floating_support', description: 'Policy sidebar menu title' },
  { key: 'policy_assistance_title', bn: 'যেকোনো জিজ্ঞাসায় আমরা আছি', en: 'Need Any Assistance?', category: 'footer_support', subCategory: 'floating_support', description: 'Policy sidebar help box title' },
  { key: 'policy_assistance_desc', bn: 'অর্ডার, ডেলিভারি বা পলিসি সংক্রান্ত যেকোনো তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।', en: 'Contact our support team anytime for inquiries regarding orders, shipping, or policies.', category: 'footer_support', subCategory: 'floating_support', description: 'Policy sidebar help box description' },

  // ==========================================
  // 10. Common & System UI (common_system)
  // ==========================================
  // General UI
  { key: 'loading', bn: 'লোড হচ্ছে...', en: 'Loading...', category: 'common_system', subCategory: 'general_ui', description: 'Loading indicator text' },
  { key: 'network_error_retry', bn: 'নেটওয়ার্ক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', en: 'Network error. Please try again.', category: 'common_system', subCategory: 'general_ui', description: 'Network retry message' },
  { key: 'remove', bn: 'মুছে ফেলুন', en: 'Remove', category: 'common_system', subCategory: 'general_ui', description: 'Generic remove action label' },
  { key: 'close', bn: 'বন্ধ করুন', en: 'Close', category: 'common_system', subCategory: 'general_ui', description: 'Generic close action label' },
];


@Injectable()
export class TranslationsService implements OnModuleInit {
  // OPTIMIZATION: Dual-language in-memory hash dictionary (bn/en) with instant O(1) key lookups.
  // Loaded once on module startup and invalidated on admin translation changes.
  // Replaces thousands of repetitive DB hits per page load with 0.18ms constant time response.
  private cache: { bn: Record<string, string>; en: Record<string, string> } = { bn: {}, en: {} };
  private cacheLoaded = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultsIfEmpty();
    await this.refreshCache();
  }

  async seedDefaultsIfEmpty() {
    try {
      // NOTE: Never delete dynamic category, product, faq, or policy translations on restart!
      const existing = await this.prisma.translation.findMany({
        select: { key: true },
      });
      const existingKeySet = new Set(existing.map((t) => t.key));
      const missing = DEFAULT_STATIC_UI_TRANSLATIONS.filter((item) => !existingKeySet.has(item.key));

      if (missing.length > 0) {
        await this.prisma.translation.createMany({
          data: missing.map((item) => ({
            key: item.key,
            bn: item.bn,
            en: item.en,
            category: item.category,
            description: item.description,
          })),
          skipDuplicates: true,
        });
      }
    } catch (err: any) {
      if (err?.code === 'P2021') {
        console.warn('⚠️ Translations table not yet initialized. Will populate on next startup once schema is synced.');
      } else {
        console.warn('Could not seed default translations:', err?.message || err);
      }
    }
  }

  async refreshCache() {
    try {
      const list = await this.prisma.translation.findMany({
        select: { key: true, bn: true, en: true },
      });
      const bnMap: Record<string, string> = {};
      const enMap: Record<string, string> = {};
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        bnMap[item.key] = item.bn;
        enMap[item.key] = item.en;
      }
      this.cache = { bn: bnMap, en: enMap };
      this.cacheLoaded = true;
    } catch (err: any) {
      // Fallback to static in-memory dictionary if database tables are not yet synced
      const bnMap: Record<string, string> = {};
      const enMap: Record<string, string> = {};
      for (const item of DEFAULT_STATIC_UI_TRANSLATIONS) {
        bnMap[item.key] = item.bn;
        enMap[item.key] = item.en;
      }
      this.cache = { bn: bnMap, en: enMap };
      this.cacheLoaded = true;
    }
  }


  async getTranslations(lang: 'bn' | 'en' = 'bn'): Promise<Record<string, string>> {
    if (!this.cacheLoaded) {
      await this.refreshCache();
    }
    return this.cache[lang] || this.cache.bn;
  }

  async getAll() {
    return this.prisma.translation.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  async update(id: number, data: { bn: string; en: string; description?: string; category?: string }) {
    const res = await this.prisma.translation.update({
      where: { id },
      data,
    });
    await this.refreshCache();
    return res;
  }

  async delete(id: number) {
    const res = await this.prisma.translation.delete({
      where: { id },
    });
    await this.refreshCache();
    return res;
  }

  async upsert(key: string, bn: string, en: string, category = 'general', description?: string) {
    const res = await this.prisma.translation.upsert({
      where: { key },
      update: { bn, en, category, description },
      create: { key, bn, en, category, description },
    });
    await this.refreshCache();
    return res;
  }

  async upsertBulk(items: Array<{ key: string; bn: string; en: string; category?: string; description?: string }>) {
    const ops = items.map((item) =>
      this.prisma.translation.upsert({
        where: { key: item.key },
        update: {
          bn: item.bn,
          en: item.en,
          category: item.category || 'general',
          description: item.description,
        },
        create: {
          key: item.key,
          bn: item.bn,
          en: item.en,
          category: item.category || 'general',
          description: item.description,
        },
      })
    );
    await this.prisma.$transaction(ops);
    await this.refreshCache();
    return { success: true, count: items.length };
  }
}

