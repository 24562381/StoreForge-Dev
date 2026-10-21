interface TestResult {
  name: string;
  method: string;
  endpoint: string;
  status: number;
  expectedStatus: number[];
  success: boolean;
  latencyMs: number;
  error?: string;
  response?: any;
}

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

// Strip trailing slash and trailing /api since test-api-suite paths begin with /api
const BASE_URL = envApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
let adminToken = '';

async function request(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; latencyMs: number; headers: any }> {
  const start = Date.now();
  const url = `${BASE_URL}${path}`;
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  let reqBody: string | undefined;
  if (body) {
    reqBody = typeof body === 'string' ? body : JSON.stringify(body);
    reqHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: reqBody,
  });

  const latencyMs = Date.now() - start;
  let parsed: any;
  const raw = await res.text();
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = raw;
  }

  return {
    status: res.status,
    data: parsed,
    latencyMs,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

async function runTestSuite() {
  console.log('🧪 Starting Full System API Audit & Bug Testing Suite...\n');
  const results: TestResult[] = [];

  async function test(
    name: string,
    method: string,
    endpoint: string,
    expectedStatus: number[],
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<any> {
    try {
      const res = await request(method, endpoint, body, headers);
      const isSuccess = expectedStatus.includes(res.status);
      const result: TestResult = {
        name,
        method,
        endpoint,
        status: res.status,
        expectedStatus,
        success: isSuccess,
        latencyMs: res.latencyMs,
        response: res.data,
        error: isSuccess ? undefined : `Unexpected status ${res.status}: ${JSON.stringify(res.data)}`,
      };
      results.push(result);
      const icon = isSuccess ? '✅' : '❌';
      console.log(
        `${icon} [${method}] ${endpoint.padEnd(45)} | Status: ${res.status} | Latency: ${res.latencyMs}ms - ${name}`
      );
      if (!isSuccess) {
        console.error('   Error response:', JSON.stringify(res.data));
      }
      return res.data;
    } catch (err: any) {
      const result: TestResult = {
        name,
        method,
        endpoint,
        status: 0,
        expectedStatus,
        success: false,
        latencyMs: 0,
        error: err.message,
      };
      results.push(result);
      console.log(`❌ [${method}] ${endpoint.padEnd(45)} | Connection Failed: ${err.message}`);
      return null;
    }
  }

  // 1. PUBLIC ENDPOINTS
  console.log('\n--- 1. Testing Public Endpoints ---');
  await test('Public Settings', 'GET', '/api/settings/public', [200]);
  const categories = await test('Public Categories', 'GET', '/api/categories', [200]);
  const products = await test('Public Products', 'GET', '/api/products', [200]);
  await test('Public FAQs', 'GET', '/api/faqs', [200]);
  await test('Public Reviews', 'GET', '/api/reviews', [200]);
  await test('Public Translations Dictionary EN', 'GET', '/api/translations/dictionary?lang=en', [200]);
  await test('Public Translations Dictionary BN', 'GET', '/api/translations/dictionary?lang=bn', [200]);

  // Product Details & Slug
  let productSlug = '';
  let productId = '';
  if (Array.isArray(products) && products.length > 0) {
    productSlug = products[0].slug;
    productId = products[0].id;
    await test('Get Product By Slug', 'GET', `/api/products/slug/${productSlug}`, [200]);
    await test('Get Product By ID', 'GET', `/api/products/${productId}`, [200]);
  } else if (products && Array.isArray(products.data) && products.data.length > 0) {
    productSlug = products.data[0].slug;
    productId = products.data[0].id;
    await test('Get Product By Slug', 'GET', `/api/products/slug/${productSlug}`, [200]);
    await test('Get Product By ID', 'GET', `/api/products/${productId}`, [200]);
  }

  // Category Details & Slug
  if (Array.isArray(categories) && categories.length > 0) {
    const catSlug = categories[0].slug;
    const catId = categories[0].id;
    await test('Get Category By Slug', 'GET', `/api/categories/slug/${catSlug}`, [200]);
    await test('Get Category By ID', 'GET', `/api/categories/${catId}`, [200]);
  }

  // Promo Code Validation
  await test('Validate Invalid Promo Code', 'POST', '/api/promo-codes/validate', [200], {
    code: 'NON_EXISTENT_CODE',
    subtotal: 1000,
  });

  // Barcode Generation
  await test('Generate Code128 Barcode', 'GET', '/api/barcode/code128/WM-TEST-12345', [200]);
  await test('Generate QR Code', 'GET', '/api/barcode/qr/WM-TEST-12345', [200]);

  // Review Submission
  if (productId) {
    await test('Submit Customer Review', 'POST', '/api/reviews', [200, 201], {
      productId,
      customerName: 'Test Customer',
      customerPhone: '01700000000',
      rating: 5,
      comment: 'Awesome wooden map! High quality finish.',
    });
  }

  // Order Placement & Lifecycle
  console.log('\n--- 2. Testing Order Placement & Tracking ---');
  const newOrder = await test('Place New Order', 'POST', '/api/orders', [200, 201], {
    customerName: 'Sakib Test',
    customerPhone: '01711223344',
    customerAddress: 'House 12, Road 5, Dhanmondi, Dhaka',
    customerCity: 'inside_dhaka',
    shippingMethod: 'inside_dhaka',
    paymentMethod: 'cod',
    items: [
      {
        productId: productId || '1',
        quantity: 1,
        unitPrice: 2500,
        title: '3D Wooden World Map',
      },
    ],
  });

  let testOrderNumber = '';
  let testOrderId = '';
  let testAccessToken = '';
  if (newOrder && newOrder.orderNumber) {
    testOrderNumber = newOrder.orderNumber;
    testOrderId = newOrder.id;
    testAccessToken = newOrder.accessToken || '';
    await test('Lookup Order with Token (Secure)', 'GET', `/api/orders/lookup/${encodeURIComponent(testOrderNumber)}?token=${encodeURIComponent(testAccessToken)}`, [200]);
    await test('Track Order by Phone & Number', 'GET', `/api/orders/track?phone=01711223344&orderNumber=${encodeURIComponent(testOrderNumber)}`, [200]);
    await test('Initiate bKash Payment', 'POST', `/api/payment/bkash/initiate/${encodeURIComponent(testOrderNumber)}`, [200, 201]);
  }

  // 3. AUTHENTICATION & SECURITY GUARD TESTING
  console.log('\n--- 3. Testing Auth & Security Guards ---');
  await test('Unauthorized Access to Admin Settings', 'GET', '/api/settings/admin', [401, 403]);
  await test('Unauthorized Access to Admin Orders', 'GET', '/api/orders/admin/list', [401, 403]);

  const testAdminEmail = process.env.ADMIN_EMAIL || 'admin@woodenmap.com';
  const testAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Invalid login attempt
  await test('Invalid Login Rejection', 'POST', '/api/auth/login', [400, 401], {
    email: testAdminEmail,
    password: 'wrongpassword',
  });

  // Valid login
  const loginRes = await test('Valid Admin Login', 'POST', '/api/auth/login', [200, 201], {
    email: testAdminEmail,
    password: testAdminPassword,
  });

  if (loginRes && (loginRes.accessToken || loginRes.token)) {
    adminToken = loginRes.accessToken || loginRes.token;
  }

  const authHeader = { Authorization: `Bearer ${adminToken}` };

  // 4. ADMIN PROTECTED ENDPOINTS
  console.log('\n--- 4. Testing Admin Protected Operations ---');
  await test('Admin Auth Me', 'GET', '/api/auth/me', [200], undefined, authHeader);
  await test('Admin Settings Fetch', 'GET', '/api/settings/admin', [200], undefined, authHeader);
  await test('Admin Orders Stats', 'GET', '/api/orders/admin/stats', [200], undefined, authHeader);
  await test('Admin Orders List', 'GET', '/api/orders/admin/list?page=1&limit=10', [200], undefined, authHeader);
  await test('Admin Reviews List', 'GET', '/api/reviews/admin/list', [200], undefined, authHeader);
  await test('Admin Translations List', 'GET', '/api/translations/admin/list', [200], undefined, authHeader);
  await test('Admin Promo Codes List', 'GET', '/api/promo-codes/admin', [200], undefined, authHeader);
  await test('Admin AI Providers', 'GET', '/api/ai/default-provider', [200], undefined, authHeader);
  await test('Admin AI Agents', 'GET', '/api/ai/agents', [200], undefined, authHeader);

  // Promo Code CRUD
  const createdPromo = await test('Admin Create Promo Code', 'POST', '/api/promo-codes/admin', [200, 201], {
    code: `TESTPROMO_${Date.now().toString().slice(-4)}`,
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 500,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 864000000).toISOString(),
    isActive: true,
  }, authHeader);

  if (createdPromo && createdPromo.id) {
    await test('Admin Get Promo Code', 'GET', `/api/promo-codes/admin/${createdPromo.id}`, [200], undefined, authHeader);
    await test('Admin Update Promo Code', 'PUT', `/api/promo-codes/admin/${createdPromo.id}`, [200], {
      discountValue: 15,
    }, authHeader);
    await test('Admin Delete Promo Code', 'DELETE', `/api/promo-codes/admin/${createdPromo.id}`, [200], undefined, authHeader);
  }

  // Category CRUD
  const createdCat = await test('Admin Create Category', 'POST', '/api/categories', [200, 201], {
    name: 'Test Wooden Collection',
    slug: `test-cat-${Date.now().toString().slice(-4)}`,
    description: 'A test category for automated audit',
  }, authHeader);

  if (createdCat && createdCat.id) {
    await test('Admin Update Category', 'PUT', `/api/categories/${createdCat.id}`, [200], {
      name: 'Updated Test Wooden Collection',
    }, authHeader);
    await test('Admin Delete Category', 'DELETE', `/api/categories/${createdCat.id}`, [200], undefined, authHeader);
  }

  // FAQ CRUD
  const createdFaq = await test('Admin Create FAQ', 'POST', '/api/faqs', [200, 201], {
    question: 'How is the wooden map mounted?',
    answer: 'It comes with double-sided special mounting tape included in the box.',
    displayOrder: 99,
  }, authHeader);

  if (createdFaq && createdFaq.id) {
    await test('Admin Update FAQ', 'PUT', `/api/faqs/${createdFaq.id}`, [200], {
      question: 'How is the wooden map mounted on wall?',
    }, authHeader);
    await test('Admin Delete FAQ', 'DELETE', `/api/faqs/${createdFaq.id}`, [200], undefined, authHeader);
  }

  // Order Admin operations
  if (testOrderId) {
    await test('Admin Get Order Details', 'GET', `/api/orders/${testOrderId}`, [200], undefined, authHeader);
    await test('Admin Update Order Status', 'PUT', `/api/orders/${testOrderId}/status`, [200], {
      status: 'confirmed',
    }, authHeader);
    await test('Admin Update Order Admin Note', 'PUT', `/api/orders/${testOrderId}/admin-note`, [200], {
      adminNote: 'Verified order via automated testing suite.',
    }, authHeader);

    // Create a bkash order to test switch-cod
    const bkashOrder = await test('Place bKash Order for COD switch', 'POST', '/api/orders', [200, 201], {
      customerName: 'bKash Customer',
      customerPhone: '01811223344',
      customerAddress: 'Banani, Dhaka',
      district: 'inside_dhaka',
      paymentMethod: 'bkash',
      items: [{ productId: productId || 1, quantity: 1, unitPrice: 4500 }],
    });

    if (bkashOrder && bkashOrder.id) {
      await test('Admin Switch Order to COD', 'PUT', `/api/orders/${bkashOrder.id}/switch-cod`, [200], undefined, authHeader);
    }
  }

  // 5. PRODUCT CRUD & VARIANTS
  console.log('\n--- 5. Testing Product Management & Variants ---');
  const createdProd = await test('Admin Create Product', 'POST', '/api/products', [200, 201], {
    name: 'Handcrafted Wooden Desk Globe',
    slug: `wooden-desk-globe-${Date.now().toString().slice(-4)}`,
    tagline: 'Miniature Globe for Elegant Desks',
    shortDescription: 'Solid mahogany handcrafted desk globe with 3D relief.',
    fullDescription: '<p>A masterpiece for your study or executive desk.</p>',
    price: 3200,
    status: 'active',
  }, authHeader);

  if (createdProd && createdProd.id) {
    await test('Admin Update Product', 'PUT', `/api/products/${createdProd.id}`, [200], {
      name: 'Handcrafted Wooden Desk Globe Deluxe',
      price: 3500,
    }, authHeader);

    const createdVariant = await test('Admin Add Product Variant', 'POST', `/api/products/${createdProd.id}/variants`, [200, 201], {
      sizeName: '8 Inch',
      dimensions: '20 x 20 cm',
      price: 3500,
      originalPrice: 4200,
      stockStatus: 'in_stock',
    }, authHeader);

    if (createdVariant && createdVariant.id) {
      await test('Admin Update Product Variant', 'PUT', `/api/products/variants/${createdVariant.id}`, [200], {
        price: 3600,
      }, authHeader);
      await test('Admin Delete Product Variant', 'DELETE', `/api/products/variants/${createdVariant.id}`, [200], undefined, authHeader);
    }

    await test('Admin Delete Product', 'DELETE', `/api/products/${createdProd.id}`, [200], undefined, authHeader);
  }

  // 6. REVIEWS MANAGEMENT
  console.log('\n--- 6. Testing Reviews Admin Moderation ---');
  const adminReviews = await test('Admin Get Reviews List', 'GET', '/api/reviews/admin/list', [200], undefined, authHeader);
  let reviewIdToTest: number | null = null;
  if (Array.isArray(adminReviews) && adminReviews.length > 0) {
    reviewIdToTest = adminReviews[0].id;
  } else if (adminReviews && Array.isArray(adminReviews.data) && adminReviews.data.length > 0) {
    reviewIdToTest = adminReviews.data[0].id;
  }

  if (reviewIdToTest) {
    await test('Admin Toggle Review Published', 'PUT', `/api/reviews/${reviewIdToTest}/toggle-publish`, [200], undefined, authHeader);
    await test('Admin Toggle Review Featured', 'PUT', `/api/reviews/${reviewIdToTest}/toggle-feature`, [200], undefined, authHeader);
    await test('Admin Update Review Details', 'PUT', `/api/reviews/${reviewIdToTest}`, [200], {
      reviewText: 'Updated verified customer feedback via automated test suite.',
    }, authHeader);
  }

  // 7. SETTINGS & TRANSLATIONS
  console.log('\n--- 7. Testing Settings & Translations Updates ---');
  await test('Admin Update Settings', 'PUT', '/api/settings/admin', [200], {
    settings: {
      site_title: '3D Wooden World Map | Premium Wall Decor',
    },
  }, authHeader);

  const singleUpsert = await test('Admin Upsert Translation', 'POST', '/api/translations/admin/upsert', [200, 201], {
    key: `test_key_${Date.now().toString().slice(-4)}`,
    category: 'general',
    textEn: 'Test Translation En',
    textBn: 'টেস্ট অনুবাদ বাংলা',
  }, authHeader);

  await test('Admin Bulk Upsert Translations', 'POST', '/api/translations/admin/upsert-bulk', [200, 201], {
    translations: [
      { key: `bulk_key_1_${Date.now().toString().slice(-4)}`, category: 'ui', textEn: 'Cart', textBn: 'কার্ট' },
      { key: `bulk_key_2_${Date.now().toString().slice(-4)}`, category: 'ui', textEn: 'Checkout', textBn: 'চেকআউট' },
    ],
  }, authHeader);

  if (singleUpsert && singleUpsert.id) {
    await test('Admin Delete Translation', 'DELETE', `/api/translations/admin/${singleUpsert.id}`, [200], undefined, authHeader);
  }

  // 8. AI AGENTS MANAGEMENT & COMPLETION
  console.log('\n--- 8. Testing AI Module & Agent Management ---');
  await test('Admin Update AI Default Provider', 'POST', '/api/ai/default-provider', [200, 201], {
    provider: 'gemini',
  }, authHeader);

  const createdAgent = await test('Admin Create AI Agent', 'POST', '/api/ai/agents', [200, 201], {
    name: 'Copywriter Assistant',
    role: 'product_copywriter',
    systemPrompt: 'You are an expert luxury home decor copywriter.',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    isActive: true,
  }, authHeader);

  if (createdAgent && createdAgent.id) {
    await test('Admin Update AI Agent', 'PUT', `/api/ai/agents/${createdAgent.id}`, [200], {
      name: 'Senior Copywriter Assistant',
    }, authHeader);
    await test('Admin Delete AI Agent', 'DELETE', `/api/ai/agents/${createdAgent.id}`, [200], undefined, authHeader);
  }

  // 9. PASSWORD CHANGE SECURITY TEST
  console.log('\n--- 9. Testing Password Change & Security Workflow ---');
  await test('Admin Change Password Validation', 'POST', '/api/auth/change-password', [400, 401], {
    currentPassword: 'wrongpassword',
    newPassword: 'newsecurepassword123',
  }, authHeader);

  await test('Admin Change Password Success', 'POST', '/api/auth/change-password', [200, 201], {
    currentPassword: 'admin123',
    newPassword: 'adminnewpassword123',
  }, authHeader);

  // Restore password back to admin123
  await test('Admin Restore Default Password', 'POST', '/api/auth/change-password', [200, 201], {
    currentPassword: 'adminnewpassword123',
    newPassword: 'admin123',
  }, authHeader);

  // 10. FILE UPLOADS TEST
  console.log('\n--- 10. Testing File Uploads & MIME Filter ---');
  try {
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');
    const formData = new FormData();
    const fileBlob = new Blob([pngBuffer], { type: 'image/png' });
    formData.append('file', fileBlob, 'test-pixel.png');

    const uploadStart = Date.now();
    const uploadRes = await fetch(`${BASE_URL}/api/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });
    const uploadLatency = Date.now() - uploadStart;
    const uploadData: any = await uploadRes.json();
    const uploadSuccess = uploadRes.status === 200 || uploadRes.status === 201;

    results.push({
      name: 'Admin Upload Image File',
      method: 'POST',
      endpoint: '/api/uploads',
      status: uploadRes.status,
      expectedStatus: [200, 201],
      success: uploadSuccess,
      latencyMs: uploadLatency,
      response: uploadData,
    });
    console.log(
      `${uploadSuccess ? '✅' : '❌'} [POST] ${'/api/uploads'.padEnd(45)} | Status: ${uploadRes.status} | Latency: ${uploadLatency}ms - Admin Upload Image File`
    );
  } catch (err: any) {
    console.error('Upload test error:', err.message);
  }

  // Summary
  console.log('\n========================================');
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const avgLatency = Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length);
  console.log(`📊 Test Suite Finished: ${passed}/${results.length} Passed | ${failed} Failed | Avg Latency: ${avgLatency}ms`);
  console.log('========================================\n');

  return { results, passed, failed, avgLatency };
}

runTestSuite().catch(console.error);
