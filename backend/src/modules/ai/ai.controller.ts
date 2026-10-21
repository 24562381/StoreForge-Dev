import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Get('default-provider')
  async getDefaultProvider() {
    const providerId = await this.aiService.getDefaultProviderId();
    return { providerId };
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Post('default-provider')
  async setDefaultProvider(@Body() body: { providerId?: string; provider?: string }) {
    const providerId = body?.providerId || body?.provider || '';
    return this.aiService.setDefaultProviderId(providerId);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Get('agents')
  async getAgents() {
    return this.aiService.getAllAgents();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Post('agents')
  async createAgent(@Body() body: any) {
    return this.aiService.createAgent(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Put('agents/:id')
  async updateAgent(@Param('id') id: string, @Body() body: any) {
    return this.aiService.updateAgent(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Delete('agents/:id')
  async deleteAgent(@Param('id') id: string) {
    return this.aiService.deleteAgent(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Post('complete')
  async executeCompletion(@Body() body: any) {
    return this.aiService.executeAiCompletion(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Post('translate')
  async translateText(@Body() body: any) {
    return this.aiService.translateText(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Post('translate-product')
  async translateProduct(@Body() body: any) {
    return this.aiService.translateProduct(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.AI_MANAGE)
  @Post('proofread-product')
  async proofreadProduct(@Body() body: any) {
    return this.aiService.proofreadProduct(body);
  }
}

