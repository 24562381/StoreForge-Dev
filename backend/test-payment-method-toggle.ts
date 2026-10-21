import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env configuration from root or local directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const prisma = new PrismaClient();

const envApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  process.env.BACKEND_URL ||
  process.env.BASE_URL ||
  (process.env.BACKEND_PORT ? `http://localhost:${process.env.BACKEND_PORT}` : 'http://localhost:8585');

const cleanApiUrl = envApiUrl.replace(/\/+$/, '');
const BASE_URL = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

async function testPaymentMethodToggles() {
  console.log('--- Testing Payment Method Enable/Disable & Consistency ---');

  try {
    // 1. Admin login
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@storeforge.io';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const loginData = await loginRes.json();
    const token = loginData.accessToken || loginData.access_token || loginData.token;
    if (!token) throw new Error('Admin login failed: ' + JSON.stringify(loginData));
    console.log('✅ Admin login succeeded');

    // 2. Disable COD
    const updateRes1 = await fetch(`${BASE_URL}/settings/admin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_cod_enabled: 'false',
        payment_cod_instructions: 'COD is disabled for testing',
        payment_bkash_enabled: 'true',
      }),
    });
    console.log('✅ Admin disabled COD in settings');

    // 3. Verify public settings
    const pubRes1 = await fetch(`${BASE_URL}/settings/public`);
    const pubSettings1 = await pubRes1.json();
    if (pubSettings1.payment_cod_enabled !== 'false') {
      throw new Error(`Expected payment_cod_enabled to be 'false', got ${pubSettings1.payment_cod_enabled}`);
    }
    if (pubSettings1.bkash_app_secret || pubSettings1.bkash_password || pubSettings1.jwt_secret) {
      throw new Error('SECURITY VIOLATION: Private secrets leaked in /settings/public!');
    }
    console.log('✅ /settings/public verified: COD disabled and secrets securely withheld');

    // 4. Attempt order with COD (must fail with 400)
    const product = await prisma.product.findFirst({ include: { variants: true } });
    if (!product || !product.variants[0]) throw new Error('No test product found');

    const codOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test Customer',
        phone: '01700000000',
        address: 'House 1, Road 2, Gulshan, Dhaka',
        district: 'inside_dhaka',
        paymentMethod: 'cod',
        items: [
          {
            productId: product.id,
            variantId: product.variants[0].id,
            productName: product.name,
            sizeName: product.variants[0].sizeName,
            unitPrice: product.variants[0].price,
            quantity: 1,
          },
        ],
      }),
    });
    const codOrderData = await codOrderRes.json();
    const codErrMsg = codOrderData.error?.message || codOrderData.message || '';
    if (codOrderRes.status === 400 && codErrMsg.includes('Cash on Delivery is currently unavailable')) {
      console.log('✅ Backend rejected COD order when COD disabled (400 Bad Request)');
    } else {
      throw new Error(`Expected 400 rejection for disabled COD, got ${codOrderRes.status}: ${JSON.stringify(codOrderData)}`);
    }

    // 5. Create order with bKash (should succeed)
    const bkashOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test bKash Customer',
        phone: '01711111111',
        address: 'House 3, Road 4, Dhanmondi, Dhaka',
        district: 'inside_dhaka',
        paymentMethod: 'bkash',
        items: [
          {
            productId: product.id,
            variantId: product.variants[0].id,
            productName: product.name,
            sizeName: product.variants[0].sizeName,
            unitPrice: product.variants[0].price,
            quantity: 1,
          },
        ],
      }),
    });
    const bkashOrderData = await bkashOrderRes.json();
    if (bkashOrderRes.status === 201 && bkashOrderData.orderNumber) {
      console.log(`✅ Order created successfully with enabled bKash: ${bkashOrderData.orderNumber}`);
    } else {
      throw new Error(`bKash order creation failed: ${JSON.stringify(bkashOrderData)}`);
    }

    // 6. Disable bKash and attempt bKash order
    await fetch(`${BASE_URL}/settings/admin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_cod_enabled: 'true',
        payment_bkash_enabled: 'false',
      }),
    });
    console.log('✅ Admin disabled bKash in settings');

    const bkashOrderRes2 = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Test bKash Customer 2',
        phone: '01711111111',
        address: 'House 3, Road 4, Dhanmondi, Dhaka',
        district: 'inside_dhaka',
        paymentMethod: 'bkash',
        items: [
          {
            productId: product.id,
            variantId: product.variants[0].id,
            productName: product.name,
            sizeName: product.variants[0].sizeName,
            unitPrice: product.variants[0].price,
            quantity: 1,
          },
        ],
      }),
    });
    const bkashOrderData2 = await bkashOrderRes2.json();
    const bkashErrMsg = bkashOrderData2.error?.message || bkashOrderData2.message || '';
    if (bkashOrderRes2.status === 400 && bkashErrMsg.includes('bKash online payment is currently unavailable')) {
      console.log('✅ Backend rejected bKash order when bKash disabled (400 Bad Request)');
    } else {
      throw new Error(`Expected 400 rejection for disabled bKash, got ${bkashOrderRes2.status}: ${JSON.stringify(bkashOrderData2)}`);
    }

    // 7. Test bKash initiate endpoint rejection when bKash disabled
    const initRes = await fetch(`${BASE_URL}/payment/bkash/initiate/${bkashOrderData.orderNumber.replace('#', '')}`, {
      method: 'POST',
    });
    const initData = await initRes.json();
    const initErrMsg = initData.error?.message || initData.message || '';
    if (initRes.status === 400 && initErrMsg.includes('bKash payment gateway is currently disabled')) {
      console.log('✅ Backend payment initiate rejected when bKash disabled');
    } else {
      throw new Error(`Expected 400 rejection on bKash initiate, got ${initRes.status}: ${JSON.stringify(initData)}`);
    }

    // 8. Restore both payment methods to active
    await fetch(`${BASE_URL}/settings/admin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_cod_enabled: 'true',
        payment_cod_instructions: '',
        payment_bkash_enabled: 'true',
        payment_bkash_instructions: '',
      }),
    });
    console.log('✅ Restored both COD and bKash to active state in settings');

    // Clean up test orders
    await prisma.orderItem.deleteMany({
      where: { order: { phone: { in: ['01700000000', '01711111111'] } } },
    });
    await prisma.order.deleteMany({
      where: { phone: { in: ['01700000000', '01711111111'] } },
    });

    console.log('🎉 ALL PAYMENT METHOD ACTIVATION TESTS PASSED PERFECTLY!');
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentMethodToggles();
