import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findPublished(
    @Query('productId') productId?: string,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findPublished({
      productId: productId ? parseInt(productId, 10) : undefined,
      isFeatured: featured === 'true' ? true : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.REVIEWS_MANAGE)
  @Get('admin/list')
  async findAll(@Query() query: any) {
    return this.reviewsService.findAll({
      productId: query.productId ? parseInt(query.productId, 10) : undefined,
      rating: query.rating ? parseInt(query.rating, 10) : undefined,
      isPublished: query.isPublished !== undefined ? query.isPublished === 'true' : undefined,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
    });
  }

  @RateLimit({ limit: 10, ttl: 60000 })
  @Post()
  async create(@Body() body: any) {
    // Public reviews from storefront customers require order, phone, and secret token verification
    return this.reviewsService.create(
      {
        ...body,
        isPublished: false,
        isFeatured: false,
      },
      false,
    );
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.REVIEWS_MANAGE)
  @Post('admin')
  async createAdmin(@Body() body: any) {
    return this.reviewsService.create(body, true);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.REVIEWS_MANAGE)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.reviewsService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.REVIEWS_MANAGE)
  @Put(':id/toggle-publish')
  async togglePublish(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.togglePublish(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.REVIEWS_MANAGE)
  @Put(':id/toggle-feature')
  async toggleFeature(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.toggleFeature(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.REVIEWS_MANAGE)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.delete(id);
  }
}
