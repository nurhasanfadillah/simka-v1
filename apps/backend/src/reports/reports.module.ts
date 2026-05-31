import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ExcelService } from './excel.service';
import { PdfReportsService } from './pdf-reports.service';
import { PdfService } from '../transactions/pdf/pdf.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ExcelService, PdfReportsService, PdfService],
})
export class ReportsModule {}
