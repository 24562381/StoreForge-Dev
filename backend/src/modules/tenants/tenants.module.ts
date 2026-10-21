import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { MicroserviceAuthGuard } from './tenants.guard';
import { SettingsModule } from '../settings/settings.module';
import { UploadsModule } from '../uploads/uploads.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [SettingsModule, UploadsModule, PrismaModule],
  controllers: [TenantsController],
  providers: [TenantsService, MicroserviceAuthGuard],
  exports: [TenantsService],
})
export class TenantsModule {}
