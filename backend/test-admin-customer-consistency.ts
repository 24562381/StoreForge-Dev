import * as http from 'http';
import * as https from 'https';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env configuration from root or local directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const envApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.BACKEND_URL ||
  process.env.BASE_URL ||
  (process.env.BACKEND_PORT ? `http://localhost:${process.env.BACKEND_PORT}` : 'http://localhost:8585');

const cleanApiUrl = envApiUrl.replace(/\/+$/, '');
const BASE_URL = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

function request(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
    const postData = body ? JSON.stringify(body) : null;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'x-test-suite': 'true',
    };
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let data: any = rawData;
          try {
            data = JSON.parse(rawData);
          } catch {}
          resolve({ status: res.statusCode || 0, data, headers: res.headers });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runConsistencyAudit() {
  console.log('🔄 Starting Admin vs Customer Configuration Consistency Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? `-> ${details}` : ''}`);
      failed++;
    }
  }

  // 1. Authenticate as Admin
  console.log('--- 1. Admin Authentication ---');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@woodenmap.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const loginRes = await request('POST', '/auth/login', {
    email: adminEmail,
    password: adminPassword,
  });
  const token = loginRes.data?.token || loginRes.data?.accessToken;
  assert(loginRes.status === 200 && !!token, 'Admin Login successful for configuration testing');

  // 2. Settings & Delivery Charges Consistency Test
  console.log('\n--- 2. Store Settings & Delivery Configuration Consistency ---');
  const testStoreName = `Wooden Test Store ${Date.now()}`;
  const testDhakaCharge = '95';
  const testOutsideCharge = '175';

  const updateSettingsRes = await request(
    'PUT',
    '/settings/admin',
    {
      store_name: testStoreName,
      delivery_charge_dhaka: testDhakaCharge,
      delivery_charge_outside: testOutsideCharge,
      contact_phone: '+880 1799-999999',
      contact_whatsapp: '8801799999999',
      policy_privacy_title_bn: 'টেস্ট প্রাইভেসি পলিসি',
    },
    token
  );
  assert(updateSettingsRes.status === 200, 'Admin updates store settings & delivery charges');

  // Verify public endpoint reflects the exact admin config
  const publicSettingsRes = await request('GET', '/settings/public');
  assert(
    publicSettingsRes.status === 200 &&
      publicSettingsRes.data.store_name === testStoreName &&
      publicSettingsRes.data.delivery_charge_dhaka === testDhakaCharge &&
      publicSettingsRes.data.delivery_charge_outside === testOutsideCharge &&
      publicSettingsRes.data.policy_privacy_title_bn === 'টেস্ট প্রাইভেসি পলিসি',
    'Customer-facing /settings/public matches Admin configuration exactly',
    `Expected store_name=${testStoreName}, got=${publicSettingsRes.data.store_name}`
  );

  // Test Customer Order with Inside Dhaka delivery calculation
  const insideOrderRes = await request('POST', '/orders', {
    customerName: 'Dhaka Customer',
    phone: '01711111111',
    address: 'Gulshan, Dhaka',
    district: 'inside_dhaka',
    items: [
      {
        productName: '3D Wooden Map',
        quantity: 1,
        unitPrice: 5000,
      },
    ],
  });
  assert(
    insideOrderRes.status === 201 &&
      Number(insideOrderRes.data.deliveryCharge) === 95 &&
      Number(insideOrderRes.data.total) === 5095,
    'Customer Dhaka Order accurately applies Admin configured delivery charge (95 BDT)',
    `Expected deliveryCharge=95, total=5095, got deliveryCharge=${insideOrderRes.data?.deliveryCharge}, total=${insideOrderRes.data?.total}`
  );

  // Test Customer Order with Outside Dhaka delivery calculation
  const outsideOrderRes = await request('POST', '/orders', {
    customerName: 'Chittagong Customer',
    phone: '01722222222',
    address: 'GEC Circle, Chittagong',
    district: 'outside_dhaka',
    items: [
      {
        productName: '3D Wooden Map',
        quantity: 1,
        unitPrice: 5000,
      },
    ],
  });
  assert(
    outsideOrderRes.status === 201 &&
      Number(outsideOrderRes.data.deliveryCharge) === 175 &&
      Number(outsideOrderRes.data.total) === 5175,
    'Customer Outside Dhaka Order accurately applies Admin configured delivery charge (175 BDT)',
    `Expected deliveryCharge=175, total=5175, got deliveryCharge=${outsideOrderRes.data?.deliveryCharge}, total=${outsideOrderRes.data?.total}`
  );

  // Restore default delivery charges
  await request(
    'PUT',
    '/settings/admin',
    {
      store_name: 'Wooden World Map',
      delivery_charge_dhaka: '80',
      delivery_charge_outside: '150',
    },
    token
  );

  // 3. Products & Pricing Consistency Test
  console.log('\n--- 3. Products & Pricing Consistency ---');
  const testCategoryRes = await request(
    'POST',
    '/categories',
    {
      name: 'Custom Luxury Series',
      slug: `custom-luxury-${Date.now()}`,
      isActive: true,
      displayOrder: 1,
    },
    token
  );
  const testCategoryId = testCategoryRes.data?.id;

  const testProductRes = await request(
    'POST',
    '/products',
    {
      name: 'Handcrafted Heritage Map',
      slug: `heritage-map-${Date.now()}`,
      categoryId: testCategoryId,
      status: 'active',
      min_price: 6500,
      variants: [
        {
          sizeName: 'XL (150x90cm)',
          sku: `SKU-XL-${Date.now()}`,
          price: 7500,
          originalPrice: 9000,
          isDefault: true,
          stock: 25,
        },
      ],
    },
    token
  );
  const testProductId = testProductRes.data?.id;
  const testVariantId = testProductRes.data?.variants?.[0]?.id;

  // Verify customer sees exact product & variant pricing
  const publicProdRes = await request('GET', `/products/slug/${testProductRes.data?.slug}`);
  assert(
    publicProdRes.status === 200 &&
      publicProdRes.data.name === 'Handcrafted Heritage Map' &&
      Number(publicProdRes.data.variants?.[0]?.price) === 7500 &&
      Number(publicProdRes.data.variants?.[0]?.originalPrice) === 9000,
    'Customer storefront product view reflects exact Admin configured variant prices',
    `Price=${publicProdRes.data?.variants?.[0]?.price}`
  );

  // Place order with authoritative variant resolution
  const orderWithVariantRes = await request('POST', '/orders', {
    customerName: 'Heritage Buyer',
    phone: '01733333333',
    address: 'Dhanmondi, Dhaka',
    district: 'inside_dhaka',
    items: [
      {
        productId: testProductId,
        variantId: testVariantId,
        quantity: 2,
      },
    ],
  });
  assert(
    orderWithVariantRes.status === 201 &&
      Number(orderWithVariantRes.data.items?.[0]?.unitPrice) === 7500 &&
      Number(orderWithVariantRes.data.subtotal) === 15000 &&
      Number(orderWithVariantRes.data.total) === 15080,
    'Authoritative backend order placement computes exact Admin variant pricing (2 x 7500 = 15000)',
    `Subtotal=${orderWithVariantRes.data?.subtotal}, Total=${orderWithVariantRes.data?.total}`
  );

  // 4. Promo Code Validation & Discount Consistency
  console.log('\n--- 4. Promo Code Validation & Discount Consistency ---');
  const promoCodeName = `DISC20_${Date.now()}`;
  const createPromoRes = await request(
    'POST',
    '/promo-codes/admin',
    {
      code: promoCodeName,
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 2000,
      maxDiscountAmount: 1000,
      isActive: true,
    },
    token
  );
  const testPromoId = createPromoRes.data?.id;

  // Customer validates promo code with subtotal 4000 (20% of 4000 = 800)
  const validatePromoRes = await request('POST', '/promo-codes/validate', {
    code: promoCodeName,
    subtotal: 4000,
  });
  assert(
    validatePromoRes.status === 200 &&
      validatePromoRes.data.valid === true &&
      Number(validatePromoRes.data.discountAmount) === 800,
    'Customer Promo Code validator computes exact Admin percentage rule (20% of 4000 = 800 BDT)',
    `Valid=${validatePromoRes.data?.valid}, Discount=${validatePromoRes.data?.discountAmount}`
  );

  // Place order with promo code
  const promoOrderRes = await request('POST', '/orders', {
    customerName: 'Promo Buyer',
    phone: '01744444444',
    address: 'Uttara, Dhaka',
    district: 'inside_dhaka',
    promoCode: promoCodeName,
    items: [
      {
        productId: testProductId,
        variantId: testVariantId,
        quantity: 1, // 7500
      },
    ],
  });
  assert(
    promoOrderRes.status === 201 &&
      Number(promoOrderRes.data.discountAmount) === 1000 && // Capped at maxDiscountAmount 1000 (20% of 7500 = 1500 -> 1000)
      Number(promoOrderRes.data.total) === 6580, // (7500 - 1000) + 80 = 6580
    'Order placement accurately enforces Admin discount ceiling cap (1000 BDT cap applied)',
    `Discount=${promoOrderRes.data?.discountAmount}, Total=${promoOrderRes.data?.total}`
  );

  // 5. Customer Reviews Moderation Consistency
  console.log('\n--- 5. Customer Reviews Moderation Consistency ---');
  const reviewSubRes = await request('POST', '/reviews', {
    productId: testProductId,
    customerName: 'Verified Reviewer',
    rating: 5,
    reviewText: 'Outstanding craftsmanship and fast delivery!',
  });
  const reviewId = reviewSubRes.data?.id;

  // Verify review is NOT in public featured list before moderation
  const publicReviewsBefore = await request('GET', '/reviews?featured=true');
  const isFoundBefore = (publicReviewsBefore.data || []).some((r: any) => r.id === reviewId);
  assert(!isFoundBefore, 'New customer review remains unpublished until Admin approval');

  // Admin approves & features review
  await request('PUT', `/reviews/${reviewId}/toggle-publish`, {}, token);
  await request('PUT', `/reviews/${reviewId}/toggle-feature`, {}, token);

  // Verify review IS now in public featured list
  const publicReviewsAfter = await request('GET', '/reviews?featured=true');
  const isFoundAfter = (publicReviewsAfter.data || []).some((r: any) => r.id === reviewId);
  assert(isFoundAfter, 'Approved & Featured review is immediately published on storefront testimonials');

  // 6. Translations Dictionary Consistency
  console.log('\n--- 6. Bilingual Translations Dictionary Consistency ---');
  const customKey = `test_key_${Date.now()}`;
  const upsertTransRes = await request(
    'POST',
    '/translations/admin/upsert',
    {
      key: customKey,
      en: 'Masterpiece Wooden Art',
      bn: 'অনুপম কাঠের শিল্পকলা',
      group: 'homepage',
    },
    token
  );
  assert(upsertTransRes.status === 201, 'Admin upserts new translation key');

  const dictEnRes = await request('GET', '/translations/dictionary?lang=en');
  const dictBnRes = await request('GET', '/translations/dictionary?lang=bn');
  assert(
    dictEnRes.data?.[customKey] === 'Masterpiece Wooden Art' &&
      dictBnRes.data?.[customKey] === 'অনুপম কাঠের শিল্পকলা',
    'Customer Language Dictionary immediately serves Admin updated translations for EN & BN'
  );

  // Clean up
  console.log('\n--- 7. Cleanup Test Records ---');
  if (testProductId) await request('DELETE', `/products/${testProductId}`, null, token);
  if (testCategoryId) await request('DELETE', `/categories/${testCategoryId}`, null, token);
  if (testPromoId) await request('DELETE', `/promo-codes/admin/${testPromoId}`, null, token);
  if (upsertTransRes.data?.id) await request('DELETE', `/translations/admin/${upsertTransRes.data.id}`, null, token);
  console.log('✅ Cleaned up temporary test records.');

  console.log('\n========================================');
  console.log(`📊 Consistency Suite Results: ${passed} Passed | ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runConsistencyAudit().catch((err) => {
  console.error('Fatal Consistency Suite Error:', err);
  process.exit(1);
});
