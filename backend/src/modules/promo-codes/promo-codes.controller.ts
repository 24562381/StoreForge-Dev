import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { PromoCodesService } from './promo-codes.service';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  /**
   * Public endpoint to validate promo code on customer checkout
   */
  @RateLimit({ limit: 20, ttl: 60000 })
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validatePromoCode(@Body() body: { code: string; subtotal: number }) {
    return this.promoCodesService.validatePromoCode(body.code, Number(body.subtotal) || 0);
  }

  /**
   * Admin: List all promo codes
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PROMO_CODES_MANAGE)
  @Get('admin')
  async getAllAdmin() {
    return this.promoCodesService.getAllAdmin();
  }

  /**
   * Admin: Get single promo code
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PROMO_CODES_MANAGE)
  @Get('admin/:id')
  async getByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.promoCodesService.getByIdAdmin(id);
  }

  /**
   * Admin: Create promo code
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PROMO_CODES_MANAGE)
  @Post('admin')
  async createAdmin(@Body() body: any) {
    return this.promoCodesService.createAdmin(body);
  }

  /**
   * Admin: Update promo code
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PROMO_CODES_MANAGE)
  @Put('admin/:id')
  async updateAdmin(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.promoCodesService.updateAdmin(id, body);
  }

  /**
   * Admin: Delete promo code
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PROMO_CODES_MANAGE)
  @Delete('admin/:id')
  async deleteAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.promoCodesService.deleteAdmin(id);
  }
}
