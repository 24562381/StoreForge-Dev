import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getFrontendUrl } from '../../common/utils/urls';

@Injectable()
export class BkashService {
  private readonly logger = new Logger(BkashService.name);

  // OPTIMIZATION: In-memory token cache for bKash authentication.
  // bKash grant tokens are valid for 3600 seconds (1 hour).
  // Caching the id_token for 50 minutes avoids redundant remote API calls on every transaction, saving 300-600ms latency.
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;
  private readonly TOKEN_CACHE_DURATION_MS = 50 * 60 * 1000; // 50 minutes

  constructor(private readonly prisma: PrismaService) {}

  private isMock(): boolean {
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return (
      process.env.BKASH_SANDBOX_MOCK === 'true' ||
      !process.env.BKASH_APP_KEY ||
      process.env.BKASH_APP_KEY === 'mock_app_key'
    );
  }

  async grantToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && now < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const tokenUrl = `${process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'}/tokenized/checkout/token/grant`;
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        username: process.env.BKASH_USERNAME || '',
        password: process.env.BKASH_PASSWORD || '',
      },
      body: JSON.stringify({
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET,
      }),
    });
    const data = await res.json();
    if (data && data.id_token) {
      this.cachedToken = data.id_token;
      this.tokenExpiresAt = now + this.TOKEN_CACHE_DURATION_MS;
      return data.id_token;
    }
    return data?.id_token || '';
  }

  async initiatePayment(order: any, callbackUrlOverride?: string) {
    const isMock = this.isMock();
    const cleanNum = order.orderNumber.replace('#', '');
    const baseUrl = getFrontendUrl();
    const callbackURL = callbackUrlOverride || `${baseUrl}/api/payment/bkash/callback`;

    if (isMock) {
      const mockPaymentId = `TR0011g${Date.now()}`;
      const simulatorUrl = `${baseUrl}/payment/bkash/simulator?paymentID=${mockPaymentId}&amount=${order.total}&order=${encodeURIComponent(order.orderNumber)}&callbackURL=${encodeURIComponent(callbackURL)}`;

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: mockPaymentId,
          paymentStatus: 'pending',
          paymentMethod: 'bkash',
        },
      });

      return {
        paymentID: mockPaymentId,
        bkashURL: simulatorUrl,
        statusCode: '0000',
        statusMessage: 'Successful',
      };
    }

    // Live or real sandbox bKash tokenized payment integration
    const token = await this.grantToken();
    const createUrl = `${process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'}/tokenized/checkout/create`;

    const requestBody = {
      mode: '0011',
      payerReference: order.phone,
      callbackURL,
      amount: String(order.total),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: cleanNum,
    };

    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY || '',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    if (data.statusCode !== '0000') {
      throw new Error(`bKash Create Payment Failed: ${data.statusMessage || 'Unknown error'}`);
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: data.paymentID,
        paymentStatus: 'pending',
        paymentMethod: 'bkash',
      },
    });

    return {
      paymentID: data.paymentID,
      bkashURL: data.bkashURL,
      statusCode: data.statusCode,
      statusMessage: data.statusMessage,
    };
  }



  async handleCallback(params: { paymentID: string; status: string; expectedAmount: number | string }) {
    const { paymentID, status, expectedAmount } = params;

    if (status === 'cancel') {
      return { status: 'cancelled', success: false, message: 'User cancelled payment' };
    }

    if (status === 'failure') {
      return { status: 'failed', success: false, message: 'bKash reported payment failure' };
    }

    if (this.isMock()) {
      const mockTrxId = `MOCK_TRX_${Date.now()}`;
      return {
        status: 'completed',
        success: true,
        trxID: mockTrxId,
        amount: expectedAmount,
        raw: { paymentID, trxID: mockTrxId, status: 'Completed', amount: expectedAmount, isMock: true },
      };
    }

    // Execute payment on live bKash
    const token = await this.grantToken();
    const executeUrl = `${process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'}/tokenized/checkout/execute`;

    const res = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        'X-APP-Key': process.env.BKASH_APP_KEY || '',
      },
      body: JSON.stringify({ paymentID }),
    });

    const data = await res.json();
    if (data.statusCode === '0000' && data.transactionStatus === 'Completed') {
      const paidAmount = Number(data.amount);
      if (isNaN(paidAmount) || Math.abs(paidAmount - Number(expectedAmount)) > 0.01) {
        return {
          status: 'failed',
          success: false,
          message: `Payment amount mismatch: expected ${expectedAmount}, received ${data.amount}`,
          statusCode: '9999',
          raw: data,
        };
      }
      return {
        status: 'completed',
        success: true,
        trxID: data.trxID,
        amount: data.amount,
        raw: data,
      };
    }

    return {
      status: 'failed',
      success: false,
      message: data.statusMessage || 'Execution failed',
      statusCode: data.statusCode,
      raw: data,
    };
  }
}
