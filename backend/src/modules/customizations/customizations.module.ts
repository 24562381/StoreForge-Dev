import { Module } from '@nestjs/common';
import { CustomizationsController } from './customizations.controller';
import { CustomizationsService } from './customizations.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomizationsController],
  providers: [CustomizationsService],
  exports: [CustomizationsService],
})
export class CustomizationsModule {}
