import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('minPrice') minPrice?: string,
    @Query('min_price') min_price?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('max_price') max_price?: string,
    @Query('size') size?: string,
    @Query('color') color?: string,
    @Query('status') status?: string,
    @Query('isExclusive') isExclusive?: string,
    @Query('is_exclusive') is_exclusive?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const minVal = minPrice || min_price;
    const maxVal = maxPrice || max_price;
    const exclusiveVal = isExclusive ?? is_exclusive;
    return this.productsService.findAll({
      category,
      q,
      minPrice: minVal && minVal !== '' ? parseFloat(minVal) : undefined,
      maxPrice: maxVal && maxVal !== '' ? parseFloat(maxVal) : undefined,
      size,
      color,
      status,
      isExclusive: exclusiveVal !== undefined ? exclusiveVal === 'true' : undefined,
      sort,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
    });
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Post()
  async create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Patch(':id/exclusive')
  async toggleExclusive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isExclusive?: boolean; is_exclusive?: boolean }
  ) {
    const isExclusive = body.isExclusive ?? body.is_exclusive ?? false;
    return this.productsService.updateExclusive(id, isExclusive);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }

  // Variants
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Post(':id/variants')
  async addVariant(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.productsService.addVariant(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Put('variants/:variantId')
  async updateVariant(@Param('variantId', ParseIntPipe) variantId: number, @Body() body: any) {
    return this.productsService.updateVariant(variantId, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Delete('variants/:variantId')
  async deleteVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.productsService.deleteVariant(variantId);
  }

  // Images
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Post(':id/images')
  async addImage(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.productsService.addImage(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.PRODUCTS_EDIT)
  @Delete('images/:imageId')
  async deleteImage(@Param('imageId', ParseIntPipe) imageId: number) {
    return this.productsService.deleteImage(imageId);
  }
}
