import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PaymentPostsService } from './payment-posts.service';
import { CreatePaymentPostDto } from './dto/create-payment-post.dto';
import { UpdatePaymentPostDto } from './dto/update-payment-post.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('master/payment-posts')
export class PaymentPostsController {
  constructor(private readonly service: PaymentPostsService) {}

  @Get()
  @RequirePermissions('payment_post.view')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermissions('payment_post.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('payment_post.create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePaymentPostDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('payment_post.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentPostDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('payment_post.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
