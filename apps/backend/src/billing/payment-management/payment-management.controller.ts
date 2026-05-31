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
import { PaymentManagementService } from './payment-management.service';
import { CreateBillsDto, EditBillAmountDto } from './dto/payment-management.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('billing/payment-management')
export class PaymentManagementController {
  constructor(private readonly service: PaymentManagementService) {}

  @Get('template')
  @RequirePermissions('bill.view')
  getTemplate(
    @Query('paymentPostId', ParseIntPipe) paymentPostId: number,
    @Query('schoolYearId', ParseIntPipe) schoolYearId: number,
  ) {
    return this.service.getTemplate(paymentPostId, schoolYearId);
  }

  @Get('with-bills')
  @RequirePermissions('bill.view')
  getWithBills(
    @Query('paymentPostId', ParseIntPipe) paymentPostId: number,
    @Query('schoolYearId', ParseIntPipe) schoolYearId: number,
    @Query('classId') classId?: string,
    @Query('unitId') unitId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.getWithBills(paymentPostId, schoolYearId, {
      classId: classId ? parseInt(classId, 10) : undefined,
      unitId: unitId ? parseInt(unitId, 10) : undefined,
      search,
    });
  }

  @Get('without-bills')
  @RequirePermissions('bill.view')
  getWithoutBills(
    @Query('paymentPostId', ParseIntPipe) paymentPostId: number,
    @Query('schoolYearId', ParseIntPipe) schoolYearId: number,
    @Query('classId') classId?: string,
    @Query('unitId') unitId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.getWithoutBills(paymentPostId, schoolYearId, {
      classId: classId ? parseInt(classId, 10) : undefined,
      unitId: unitId ? parseInt(unitId, 10) : undefined,
      search,
    });
  }

  @Post('bills')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('bill.create')
  createBills(@Body() dto: CreateBillsDto) {
    return this.service.createBills(dto);
  }

  @Patch('bills/:id')
  @RequirePermissions('bill.create')
  editBillAmount(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditBillAmountDto,
  ) {
    return this.service.editBillAmount(id, dto);
  }

  @Delete('bills/:id')
  @RequirePermissions('bill.create')
  removeBill(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeBill(id);
  }
}
