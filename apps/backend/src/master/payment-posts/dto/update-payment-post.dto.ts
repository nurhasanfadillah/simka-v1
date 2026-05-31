import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentPostDto } from './create-payment-post.dto';

export class UpdatePaymentPostDto extends PartialType(CreatePaymentPostDto) {}
