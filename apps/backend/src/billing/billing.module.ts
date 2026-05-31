import { Module } from '@nestjs/common';
import { PaymentTemplatesModule } from './payment-templates/payment-templates.module';
import { PaymentManagementModule } from './payment-management/payment-management.module';
import { BillsModule } from './bills/bills.module';

@Module({
  imports: [PaymentTemplatesModule, PaymentManagementModule, BillsModule],
})
export class BillingModule {}
