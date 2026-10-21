import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';

@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get('dictionary')
  async getDictionary(@Query('lang') lang?: 'bn' | 'en') {
    return this.translationsService.getTranslations(lang || 'bn');
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.TRANSLATIONS_MANAGE)
  @Get('admin/list')
  async getAll() {
    return this.translationsService.getAll();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.TRANSLATIONS_MANAGE)
  @Put('admin/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: { bn: string; en: string; description?: string; category?: string }) {
    return this.translationsService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.TRANSLATIONS_MANAGE)
  @Delete('admin/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.translationsService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.TRANSLATIONS_MANAGE)
  @Post('admin/upsert-bulk')
  async upsertBulk(@Body() body: any) {
    const rawItems = Array.isArray(body) ? body : (body?.items || body?.translations || []);
    const items = rawItems.map((it: any) => ({
      key: it.key,
      bn: it.bn ?? it.textBn ?? '',
      en: it.en ?? it.textEn ?? '',
      category: it.category || 'general',
      description: it.description,
    }));
    return this.translationsService.upsertBulk(items);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.TRANSLATIONS_MANAGE)
  @Post('admin/upsert')
  async upsert(@Body() body: any) {
    const key = body?.key;
    const bn = body?.bn ?? body?.textBn ?? '';
    const en = body?.en ?? body?.textEn ?? '';
    const category = body?.category || 'general';
    const description = body?.description;
    return this.translationsService.upsert(key, bn, en, category, description);
  }
}
