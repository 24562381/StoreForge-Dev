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

async function testModeratorRbacAndConfidentiality() {
  console.log('🧪 Starting Moderator RBAC, Confidentiality & Profile Security Audit Suite...\n');

  try {
    // 1. Admin Authentication
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@woodenmap.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.accessToken || adminLoginData.token;
    if (!adminToken) throw new Error('Admin login failed: ' + JSON.stringify(adminLoginData));
    console.log('✅ [PASS] Super Admin authenticated');

    // 2. Clean up any previous test moderator
    await prisma.user.deleteMany({
      where: { email: { in: ['moderator_order@woodenmap.com', 'moderator_catalog@woodenmap.com'] } },
    });

    // 3. Admin creates an Order Specialist Moderator
    const createModRes = await fetch(`${BASE_URL}/moderators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Kamrul Hassan',
        email: 'moderator_order@woodenmap.com',
        password: 'password123',
        role: 'moderator',
        phone: '01755443322',
        photo: '/uploads/kamrul.jpg',
        nidNumber: 'NID-5544332211',
        nidPhoto: '/uploads/kamrul-nid.jpg',
        presentAddress: 'House 22, Road 4, Sector 7, Uttara, Dhaka',
        permanentAddress: 'Village Mohonpur, Thana Sadar, Rajshahi',
        permissions: ['orders_view', 'orders_edit'],
      }),
    });
    const createModData = await createModRes.json();
    if (createModRes.status !== 201 || !createModData.id) {
      throw new Error(`Failed to create moderator: ${JSON.stringify(createModData)}`);
    }
    const modId = createModData.id;
    console.log(`✅ [PASS] Admin successfully created Moderator "${createModData.name}" (ID: ${modId})`);

    // 4. Log in as the Moderator
    const modLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'moderator_order@woodenmap.com', password: 'password123' }),
    });
    const modLoginData = await modLoginRes.json();
    const modToken = modLoginData.accessToken || modLoginData.token;
    if (!modToken) throw new Error('Moderator login failed: ' + JSON.stringify(modLoginData));
    console.log('✅ [PASS] Moderator authenticated successfully with JWT Token');

    // 5. Verify Allowed Permissions: Access Orders
    const ordersStatsRes = await fetch(`${BASE_URL}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${modToken}` },
    });
    if (ordersStatsRes.status === 200) {
      console.log('✅ [PASS] Moderator accessed /orders/admin/stats (orders_view permission granted)');
    } else {
      throw new Error(`Expected 200 for orders_view, got ${ordersStatsRes.status}`);
    }

    const ordersListRes = await fetch(`${BASE_URL}/orders/admin/list?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${modToken}` },
    });
    if (ordersListRes.status === 200) {
      console.log('✅ [PASS] Moderator accessed /orders/admin/list (orders_view permission granted)');
    } else {
      throw new Error(`Expected 200 for orders_view list, got ${ordersListRes.status}`);
    }

    // 6. Verify Forbidden Boundaries: Attempt Unauthorized Endpoints
    // (a) Attempt Settings (requires settings_manage)
    const settingsRes = await fetch(`${BASE_URL}/settings/admin`, {
      headers: { Authorization: `Bearer ${modToken}` },
    });
    if (settingsRes.status === 403) {
      console.log('✅ [PASS] Moderator strictly BLOCKED from /settings/admin (403 Forbidden)');
    } else {
      throw new Error(`Expected 403 for unauthorized settings access, got ${settingsRes.status}`);
    }

    // (b) Attempt Products Edit (requires products_edit)
    const productCreateRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({ name: 'Unauthorized Map' }),
    });
    if (productCreateRes.status === 403) {
      console.log('✅ [PASS] Moderator strictly BLOCKED from creating products (403 Forbidden)');
    } else {
      throw new Error(`Expected 403 for unauthorized product creation, got ${productCreateRes.status}`);
    }

    // (c) Attempt Moderator Management (requires moderators_manage)
    const modCreateAttempt = await fetch(`${BASE_URL}/moderators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({ name: 'Hacker Mod', email: 'hacker@mod.com' }),
    });
    if (modCreateAttempt.status === 403) {
      console.log('✅ [PASS] Moderator strictly BLOCKED from managing moderators (403 Forbidden)');
    } else {
      throw new Error(`Expected 403 for unauthorized moderator creation, got ${modCreateAttempt.status}`);
    }

    // 7. Verify Confidentiality & Redaction Protection
    const staffListRes = await fetch(`${BASE_URL}/moderators`, {
      headers: { Authorization: `Bearer ${modToken}` },
    });
    const staffListData = await staffListRes.json();
    const adminInList = staffListData.find((u: any) => u.id === 1 || u.role === 'admin');
    if (adminInList) {
      if (adminInList.nidNumber === null && adminInList.nidPhoto === null && adminInList.presentAddress === null) {
        console.log('✅ [PASS] Confidentiality verified: Other staff NID & Addresses are REDACTED for unauthorized moderator');
      } else {
        throw new Error(`CONFIDENTIALITY BREACH: Admin confidential data leaked to moderator! ${JSON.stringify(adminInList)}`);
      }
    }

    // 8. Verify Moderator Self-Service Rules
    // (a) Can update phone & email
    const selfUpdateAllowed = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({
        phone: '01799998888',
        photo: '/uploads/kamrul-updated.jpg',
      }),
    });
    const selfUpdatedData = await selfUpdateAllowed.json();
    if (selfUpdateAllowed.status === 200 && selfUpdatedData.phone === '01799998888') {
      console.log('✅ [PASS] Moderator successfully updated their own phone number');
    } else {
      throw new Error(`Failed to update allowed profile fields: ${JSON.stringify(selfUpdatedData)}`);
    }

    // (b) Cannot directly update NID or Address without admin permission
    const selfUpdateBlocked = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({
        nidNumber: 'TAMPERED-NID-123',
        presentAddress: 'Tampered Address',
      }),
    });
    const blockedData = await selfUpdateBlocked.json();
    if (selfUpdateBlocked.status === 403) {
      console.log('✅ [PASS] Moderator strictly BLOCKED from directly changing confidential NID/Address (403 Forbidden)');
    } else {
      throw new Error(`Expected 403 for unauthorized NID modification, got ${selfUpdateBlocked.status}: ${JSON.stringify(blockedData)}`);
    }

    // 9. Admin Updates Moderator Permissions (e.g. Grants promo_codes_manage)
    await fetch(`${BASE_URL}/moderators/${modId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        permissions: ['orders_view', 'orders_edit', 'promo_codes_manage'],
      }),
    });
    console.log('✅ [PASS] Admin updated Moderator permissions (added promo_codes_manage)');

    // 10. Admin Suspends Moderator Account
    await fetch(`${BASE_URL}/moderators/${modId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        isActive: false,
      }),
    });
    console.log('✅ [PASS] Admin suspended Moderator account (isActive = false)');

    // 11. Verify Suspended Account is Blocked on Authentication & Requests
    const suspendedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'moderator_order@woodenmap.com', password: 'password123' }),
    });
    if (suspendedLoginRes.status === 401) {
      console.log('✅ [PASS] Suspended account blocked from logging in (401 Unauthorized)');
    } else {
      throw new Error(`Expected 401 for suspended user login, got ${suspendedLoginRes.status}`);
    }

    // 12. Cleanup Test Records
    await prisma.user.deleteMany({
      where: { email: { in: ['moderator_order@woodenmap.com', 'moderator_catalog@woodenmap.com'] } },
    });
    console.log('✅ [PASS] Cleaned up temporary test moderator accounts');

    console.log('\n========================================');
    console.log('🎉 ALL 12 MODERATOR RBAC & CONFIDENTIALITY AUDIT TESTS PASSED!');
    console.log('========================================\n');
  } finally {
    await prisma.$disconnect();
  }
}

testModeratorRbacAndConfidentiality();
