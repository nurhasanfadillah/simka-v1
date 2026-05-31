import { Module } from '@nestjs/common';
import { PaymentTemplatesService } from './payment-templates.service';
import { PaymentTemplatesController } from './payment-templates.controller';

@Module({
  providers: [PaymentTemplatesService],
  controllers: [PaymentTemplatesController],
})
export class PaymentTemplatesModule {}
