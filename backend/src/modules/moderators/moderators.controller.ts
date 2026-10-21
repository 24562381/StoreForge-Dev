import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { ModeratorsService } from './moderators.service';

@Controller('moderators')
export class ModeratorsController {
  constructor(private readonly moderatorsService: ModeratorsService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get()
  async getAll(@Request() req: any) {
    const requester = req.staffUser || req.adminUser || req.user;
    return this.moderatorsService.getAllModerators(requester);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any) {
    const requester = req.staffUser || req.adminUser || req.user;
    return this.moderatorsService.getModeratorById(Number(id), requester);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.MODERATORS_MANAGE)
  @Post()
  async create(@Body() body: any, @Request() req: any) {
    const requester = req.staffUser || req.adminUser || req.user;
    return this.moderatorsService.createModerator(body, requester);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.MODERATORS_MANAGE)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const requester = req.staffUser || req.adminUser || req.user;
    return this.moderatorsService.updateModerator(Number(id), body, requester);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.MODERATORS_MANAGE)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    const requester = req.staffUser || req.adminUser || req.user;
    return this.moderatorsService.deleteModerator(Number(id), requester);
  }
}
