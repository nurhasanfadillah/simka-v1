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
  Query,
} from '@nestjs/common';
import { PaymentTemplatesService } from './payment-templates.service';
import { CreatePaymentTemplateDto } from './dto/create-payment-template.dto';
import { UpdatePaymentTemplateDto } from './dto/update-payment-template.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('billing/payment-templates')
export class PaymentTemplatesController {
  constructor(private readonly service: PaymentTemplatesService) {}

  @Get()
  @RequirePermissions('payment_template.view')
  findAll(
    @Query('schoolYearId') schoolYearId?: string,
  ) {
    return this.service.findAll(
      schoolYearId ? parseInt(schoolYearId, 10) : undefined,
    );
  }

  @Get(':id')
  @RequirePermissions('payment_template.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('payment_template.create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePaymentTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('payment_template.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentTemplateDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('payment_template.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
