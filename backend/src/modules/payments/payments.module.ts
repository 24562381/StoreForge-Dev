import { Module } from '@nestjs/common';
import { BkashService } from './bkash.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController],
  providers: [BkashService],
  exports: [BkashService],
})
export class PaymentsModule {}
