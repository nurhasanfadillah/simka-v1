import { Module } from '@nestjs/common';
import { PaymentPostsService } from './payment-posts.service';
import { PaymentPostsController } from './payment-posts.controller';

@Module({
  providers: [PaymentPostsService],
  controllers: [PaymentPostsController],
})
export class PaymentPostsModule {}
