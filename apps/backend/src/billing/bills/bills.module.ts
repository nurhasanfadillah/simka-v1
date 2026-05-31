import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { PdfService } from '../../transactions/pdf/pdf.service';

@Module({
  providers: [BillsService, PdfService],
  controllers: [BillsController],
})
export class BillsModule {}
