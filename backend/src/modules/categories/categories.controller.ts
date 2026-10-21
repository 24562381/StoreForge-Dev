import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.categoriesService.findAll(activeOnly === 'true');
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.CATEGORIES_MANAGE)
  @Post()
  async create(@Body() body: any) {
    return this.categoriesService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.CATEGORIES_MANAGE)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.categoriesService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.CATEGORIES_MANAGE)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}
