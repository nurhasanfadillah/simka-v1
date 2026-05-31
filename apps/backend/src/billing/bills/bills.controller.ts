import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BillsService } from './bills.service';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('billing/bills')
export class BillsController {
  constructor(private readonly service: BillsService) {}

  @Get()
  @RequirePermissions('bill.view')
  findAll(
    @Query('studentId') studentId?: string,
    @Query('classId') classId?: string,
    @Query('schoolYearId') schoolYearId?: string,
    @Query('paymentTemplateId') paymentTemplateId?: string,
    @Query('paymentPostId') paymentPostId?: string,
    @Query('status') status?: 'belum_bayar' | 'cicilan' | 'lunas',
  ) {
    return this.service.findAll({
      studentId: studentId ? parseInt(studentId, 10) : undefined,
      classId: classId ? parseInt(classId, 10) : undefined,
      schoolYearId: schoolYearId ? parseInt(schoolYearId, 10) : undefined,
      paymentTemplateId: paymentTemplateId ? parseInt(paymentTemplateId, 10) : undefined,
      paymentPostId: paymentPostId ? parseInt(paymentPostId, 10) : undefined,
      status,
    });
  }

  @Get('tunggakan')
  @RequirePermissions('bill.view')
  findTunggakan(
    @Query('classId') classId?: string,
    @Query('schoolYearId') schoolYearId?: string,
  ) {
    return this.service.findTunggakan({
      classId: classId ? parseInt(classId, 10) : undefined,
      schoolYearId: schoolYearId ? parseInt(schoolYearId, 10) : undefined,
    });
  }

  @Get('tunggakan/summary')
  @RequirePermissions('bill.view')
  getTunggakanSummary(@Query('schoolYearId') schoolYearId?: string) {
    return this.service.getTunggakanSummary(schoolYearId ? parseInt(schoolYearId, 10) : undefined);
  }

  @Get('student-transaction/:studentId')
  @RequirePermissions('transaction.create')
  getStudentTransaction(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.service.getStudentTransactionData(studentId);
  }

  @Get(':id')
  @RequirePermissions('bill.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
