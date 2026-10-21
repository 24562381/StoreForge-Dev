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

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runSingleReviewPerProductOrderSuite() {
  console.log('🧪 Starting Single Review Per Product Per Order Verification Suite...\n');
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

  // 1. Create Two Distinct Products (Product A and Product B) and an Unpurchased Product C
  const prodA = await prisma.product.create({
    data: {
      name: `Multi-Item Product A ${Date.now()}`,
      slug: `product-a-${Date.now()}`,
      status: 'active',
    },
  });
  const productAId = prodA.id;

  const prodB = await prisma.product.create({
    data: {
      name: `Multi-Item Product B ${Date.now()}`,
      slug: `product-b-${Date.now()}`,
      status: 'active',
    },
  });
  const productBId = prodB.id;

  const prodC = await prisma.product.create({
    data: {
      name: `Unpurchased Product C ${Date.now()}`,
      slug: `product-c-${Date.now()}`,
      status: 'active',
    },
  });
  const productCId = prodC.id;

  assert(!!productAId && !!productBId && !!productCId, 'Created Test Products A, B, and C');

  // 3. Place a single order containing both Product A and Product B
  const orderRes = await request('POST', '/orders', {
    customerName: 'Multi-Product Reviewer',
    phone: '01799887766',
    address: 'Banani, Dhaka',
    district: 'inside_dhaka',
    items: [
      {
        productId: productAId,
        productName: 'Product A',
        quantity: 1,
        unitPrice: 3000,
      },
      {
        productId: productBId,
        productName: 'Product B',
        quantity: 1,
        unitPrice: 4000,
      },
    ],
  });
  const orderNumber = orderRes.data?.orderNumber;
  const accessToken = orderRes.data?.accessToken;
  const customerPhone = '01799887766';
  assert(orderRes.status === 201 && !!orderNumber && !!accessToken, 'Placed Single Order with Products A & B', `Order: ${orderNumber}, Token: ${accessToken}`);

  // 3a. Security Test: Missing Phone Number -> MUST BE REJECTED (400)
  const missingPhoneRes = await request('POST', '/reviews', {
    productId: productAId,
    orderNumber: orderNumber,
    secretToken: accessToken,
    customerName: 'Multi-Product Reviewer',
    rating: 5,
    reviewText: 'Attempting review without phone number.',
  });
  assert(
    missingPhoneRes.status === 400,
    'Review without phone number is strictly BLOCKED with 400 Bad Request',
    `Status=${missingPhoneRes.status}, Message=${missingPhoneRes.data?.message}`
  );

  // 3b. Security Test: Missing Secret Token -> MUST BE REJECTED (400)
  const missingTokenRes = await request('POST', '/reviews', {
    productId: productAId,
    orderNumber: orderNumber,
    phone: customerPhone,
    customerName: 'Multi-Product Reviewer',
    rating: 5,
    reviewText: 'Attempting review without secret token.',
  });
  assert(
    missingTokenRes.status === 400,
    'Review without secret token is strictly BLOCKED with 400 Bad Request',
    `Status=${missingTokenRes.status}, Message=${missingTokenRes.data?.message}`
  );

  // 3c. Security Test: Invalid Secret Token -> MUST BE REJECTED (400)
  const invalidTokenRes = await request('POST', '/reviews', {
    productId: productAId,
    orderNumber: orderNumber,
    phone: customerPhone,
    secretToken: 'wrong_secret_token_123',
    customerName: 'Multi-Product Reviewer',
    rating: 5,
    reviewText: 'Attempting review with forged secret token.',
  });
  assert(
    invalidTokenRes.status === 400,
    'Review with invalid secret token is strictly BLOCKED with 400 Bad Request',
    `Status=${invalidTokenRes.status}, Message=${invalidTokenRes.data?.message}`
  );

  // 3d. Security Test: Mismatched Phone Number -> MUST BE REJECTED (400)
  const wrongPhoneRes = await request('POST', '/reviews', {
    productId: productAId,
    orderNumber: orderNumber,
    phone: '01811223344',
    secretToken: accessToken,
    customerName: 'Multi-Product Reviewer',
    rating: 5,
    reviewText: 'Attempting review with non-matching phone number.',
  });
  assert(
    wrongPhoneRes.status === 400,
    'Review with mismatched phone number is strictly BLOCKED with 400 Bad Request',
    `Status=${wrongPhoneRes.status}, Message=${wrongPhoneRes.data?.message}`
  );

  // 4. Submit 1st review for Product A under this order -> MUST SUCCEED (201)
  const reviewA1 = await request('POST', '/reviews', {
    productId: productAId,
    orderNumber: orderNumber,
    phone: customerPhone,
    secretToken: accessToken,
    customerName: 'Multi-Product Reviewer',
    rating: 5,
    reviewText: 'Product A is gorgeous and fits nicely on my living room wall.',
  });
  assert(
    reviewA1.status === 201 && !!reviewA1.data?.id,
    'User successfully placed 1st review for Product A under order',
    `Status=${reviewA1.status}`
  );

  // 5. Attempt 2nd review for Product A under the SAME order -> MUST BE REJECTED (400)
  const reviewA2 = await request('POST', '/reviews', {
    productId: productAId,
    orderNumber: orderNumber,
    phone: customerPhone,
    secretToken: accessToken,
    customerName: 'Multi-Product Reviewer',
    rating: 4,
    reviewText: 'Attempting duplicate review for Product A under same order.',
  });
  assert(
    reviewA2.status === 400,
    'Duplicate review for Product A under the same order is strictly BLOCKED with 400 Bad Request',
    `Status=${reviewA2.status}, Message=${reviewA2.data?.message}`
  );

  // 6. Submit 1st review for Product B under the SAME order (with Bengali numerals in phone!) -> MUST SUCCEED (201)
  const reviewB1 = await request('POST', '/reviews', {
    productId: productBId,
    orderNumber: orderNumber,
    phone: '০১৭৯৯৮৮৭৭৬৬', // Bengali numerals support
    secretToken: accessToken,
    customerName: 'Multi-Product Reviewer',
    rating: 5,
    reviewText: 'Product B is also superb! Excellent craftsmanship.',
  });
  assert(
    reviewB1.status === 201 && !!reviewB1.data?.id,
    'User successfully placed 1st review for Product B under the same order (using Bengali phone digits)',
    `Status=${reviewB1.status}`
  );

  // 7. Attempt 2nd review for Product B under the SAME order -> MUST BE REJECTED (400)
  const reviewB2 = await request('POST', '/reviews', {
    productId: productBId,
    orderNumber: orderNumber,
    phone: customerPhone,
    secretToken: accessToken,
    customerName: 'Multi-Product Reviewer',
    rating: 5,
    reviewText: 'Attempting duplicate review for Product B under same order.',
  });
  assert(
    reviewB2.status === 400,
    'Duplicate review for Product B under the same order is strictly BLOCKED with 400 Bad Request',
    `Status=${reviewB2.status}, Message=${reviewB2.data?.message}`
  );

  // 8. Attempt review for Product C (which was NOT in this order) under this order -> MUST BE REJECTED (400)
  const reviewC1 = await request('POST', '/reviews', {
    productId: productCId,
    orderNumber: orderNumber,
    phone: customerPhone,
    secretToken: accessToken,
    customerName: 'Multi-Product Reviewer',
    rating: 5,
    reviewText: 'Attempting review for product C not in this order.',
  });
  assert(
    reviewC1.status === 400,
    'Review for unpurchased Product C under this order is rejected with 400 Bad Request',
    `Status=${reviewC1.status}, Message=${reviewC1.data?.message}`
  );

  // 9. Verify Order Tracking endpoint returns both reviewedProductIds
  const trackRes = await request(
    'GET',
    `/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${customerPhone}&token=${encodeURIComponent(accessToken)}`
  );
  const reviewedIds: number[] = trackRes.data?.reviewedProductIds || [];
  assert(
    trackRes.status === 200 &&
      reviewedIds.includes(productAId) &&
      reviewedIds.includes(productBId) &&
      !reviewedIds.includes(productCId),
    'Track Order endpoint returns accurately populated reviewedProductIds array for UI badging',
    `ReviewedIDs=${JSON.stringify(reviewedIds)}`
  );

  // Clean up test reviews, orders, and products
  try {
    await prisma.review.deleteMany({ where: { orderNumber } });
    await prisma.orderItem.deleteMany({ where: { order: { orderNumber } } });
    await prisma.order.deleteMany({ where: { orderNumber } });
    await prisma.product.deleteMany({ where: { id: { in: [productAId, productBId, productCId] } } });
  } catch (err) {
    console.warn('Cleanup warning:', err);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n========================================');
  console.log(`📊 Single Review Suite Results: ${passed} Passed | ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
}

runSingleReviewPerProductOrderSuite().catch((err) => {
  console.error('Fatal Suite Error:', err);
  process.exit(1);
});
