import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  async getPublicSettings() {
    return this.settingsService.getPublic();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  @Get('admin')
  async getAllDetailed() {
    return this.settingsService.getAllDetailed();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.SETTINGS_MANAGE)
  @Put('admin')
  async updateBulk(@Body() body: Record<string, string>) {
    return this.settingsService.updateBulk(body);
  }
}
