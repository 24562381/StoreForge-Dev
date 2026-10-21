import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  async findAll(@Query('published') published?: string) {
    return this.faqsService.findAll(published === 'true');
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.faqsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.FAQS_MANAGE)
  @Post()
  async create(@Body() body: any) {
    return this.faqsService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.FAQS_MANAGE)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.faqsService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.FAQS_MANAGE)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.faqsService.delete(id);
  }
}
