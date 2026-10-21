import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../../common/guards/admin.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PERMISSIONS } from '../../common/constants/permissions';
import { CustomizationsService } from './customizations.service';
import { CreateCustomizationDto, UpdateCustomizationStatusDto } from './dto/create-customization.dto';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('customizations')
export class CustomizationsController {
  constructor(private readonly customizationsService: CustomizationsService) {}

  /**
   * Public: Customer submits custom map request
   */
  @RateLimit({ limit: 10, ttl: 60000 })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCustomizationDto) {
    return this.customizationsService.create(dto);
  }

  /**
   * Admin: List all customization requests
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.CUSTOMIZATIONS_MANAGE)
  @Get('admin')
  async findAllAdmin(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customizationsService.findAllAdmin({
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  /**
   * Admin: Summary statistics
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.CUSTOMIZATIONS_MANAGE)
  @Get('admin/stats')
  async getStatsAdmin() {
    return this.customizationsService.getStatsAdmin();
  }

  /**
   * Admin: Get single request
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.CUSTOMIZATIONS_MANAGE)
  @Get('admin/:id')
  async findByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.customizationsService.findByIdAdmin(id);
  }

  /**
   * Admin: Update status / notes
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.CUSTOMIZATIONS_MANAGE)
  @Patch('admin/:id')
  async updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomizationStatusDto,
  ) {
    return this.customizationsService.updateAdmin(id, dto);
  }

  /**
   * Admin: Delete request
   */
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @RequirePermissions(PERMISSIONS.CUSTOMIZATIONS_MANAGE)
  @Delete('admin/:id')
  async deleteAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.customizationsService.deleteAdmin(id);
  }
}
