import {
  Controller, Delete, Get, Post, Param, Query, Body, ParseIntPipe, Request, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { PdfService } from './pdf/pdf.service';
import { buildReceiptHtml } from './pdf/receipt.template';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly service: TransactionsService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @RequirePermissions('transaction.create')
  create(@Body() dto: CreateTransactionDto, @Request() req: any) {
    return this.service.create(dto, req.user.id);
  }

  @Get()
  @RequirePermissions('transaction.view')
  findAll(
    @Query('studentId') studentId?: string,
    @Query('status') status?: 'aktif' | 'void',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.service.findAll({
      studentId: studentId ? parseInt(studentId, 10) : undefined,
      status,
      dateFrom,
      dateTo,
    });
  }

  @Get(':id/receipt')
  @RequirePermissions('transaction.view')
  async getReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const data = await this.service.getReceiptData(id);
    const html = buildReceiptHtml(data);
    const pdf = await this.pdfService.generateFromHtml(html, { format: 'A4', landscape: true });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="kwitansi-${data.transactionNumber}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @Get(':id')
  @RequirePermissions('transaction.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post(':id/void')
  @RequirePermissions('transaction.void')
  voidTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VoidTransactionDto,
    @Request() req: any,
  ) {
    return this.service.voidTransaction(id, req.user.id, dto.voidReason);
  }

  @Delete(':id')
  @RequirePermissions('transaction.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
