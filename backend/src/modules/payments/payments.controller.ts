import { Controller, Get, Post, Param, Query, Res, Req, BadRequestException } from '@nestjs/common';
import { BkashService } from './bkash.service';
import { OrdersService } from '../orders/orders.service';
import { Response, Request } from 'express';

@Controller('payment')
export class PaymentsController {
  constructor(
    private readonly bkashService: BkashService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('bkash/initiate/:orderNumber')
  async initiatePayment(@Param('orderNumber') orderNumber: string, @Req() req: Request) {
    const bkashSetting = await (this.ordersService as any).prisma.setting.findUnique({
      where: { key: 'payment_bkash_enabled' },
    });
    if (bkashSetting && bkashSetting.value === 'false') {
      throw new BadRequestException('bKash payment gateway is currently disabled by store administration.');
    }
    const order = await this.ordersService.findByOrderNumber(orderNumber);

    // Object-Level Authorization: Prevent modifying paid or cancelled orders
    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('This order has already been paid for.');
    }
    if (order.status === 'cancelled') {
      throw new BadRequestException('Cannot initiate payment for a cancelled order.');
    }

    // Verify order authorization token for non-staff callers
    const cookies = (req as any).cookies || {};
    const clientToken =
      (req.query?.token as string) ||
      (req.headers?.['x-order-token'] as string) ||
      cookies['sf_last_order_token'];

    const user = (req as any).user;
    const isStaff = user && (user.role === 'admin' || user.role === 'moderator');
    if (order.accessToken && !isStaff) {
      if (!clientToken || clientToken.trim() !== order.accessToken.trim()) {
        throw new BadRequestException('Invalid order authorization token.');
      }
    }

    return this.bkashService.initiatePayment(order);
  }

  @Get('bkash/callback')
  async handleCallback(
    @Query('paymentID') paymentID: string,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    if (!paymentID) {
      throw new BadRequestException('paymentID missing');
    }

    const order = await (this.ordersService as any).prisma.order.findFirst({
      where: { paymentId: paymentID },
    });

    if (!order) {
      return res.redirect(`/payment/bkash/status/unknown?status=failed&msg=Order+not+found`);
    }

    const cleanOrderNum = order.orderNumber.replace('#', '');
    const result = await this.bkashService.handleCallback({
      paymentID,
      status,
      expectedAmount: Number(order.total),
    });

    if (result.status === 'cancelled') {
      await this.ordersService.updatePaymentInfo(order.id, {
        paymentStatus: 'cancelled',
        paymentDetails: { reason: 'User cancelled on bKash screen' },
      });
      return res.redirect(`/payment/bkash/status/${cleanOrderNum}?status=cancelled`);
    }

    if (result.status === 'failed' || !result.success) {
      await this.ordersService.updatePaymentInfo(order.id, {
        paymentStatus: 'failed',
        paymentDetails: result.raw,
      });
      return res.redirect(`/payment/bkash/status/${cleanOrderNum}?status=failed&msg=${encodeURIComponent(result.message || 'Failed')}`);
    }

    if (result.status === 'completed' && result.trxID) {
      await this.ordersService.updatePaymentInfo(order.id, {
        status: 'confirmed',
        paymentStatus: 'paid',
        trxId: result.trxID,
        paymentDetails: result.raw,
      });

      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('sf_last_order_num', order.orderNumber, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: isProd,
      });
      if (order.accessToken) {
        res.cookie('sf_last_order_token', order.accessToken, {
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
          secure: isProd,
        });
      }

      return res.redirect('/order/confirmation');
    }

    return res.redirect(`/payment/bkash/status/${cleanOrderNum}?status=unknown`);
  }
}
