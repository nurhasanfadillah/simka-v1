import { Module } from '@nestjs/common';
import { PaymentManagementService } from './payment-management.service';
import { PaymentManagementController } from './payment-management.controller';

@Module({
  providers: [PaymentManagementService],
  controllers: [PaymentManagementController],
})
export class PaymentManagementModule {}
