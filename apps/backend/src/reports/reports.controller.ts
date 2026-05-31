import { Controller, Get, ParseIntPipe, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ExcelService } from './excel.service';
import { PdfReportsService } from './pdf-reports.service';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly service: ReportsService,
    private readonly excelService: ExcelService,
    private readonly pdfReportsService: PdfReportsService,
  ) {}

  private setExcelHeaders(res: Response, filename: string) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  }

  private setPdfHeaders(res: Response, filename: string) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  }

  @Get('dashboard')
  @RequirePermissions('report.view')
  getDashboard() {
    return this.service.getDashboardStats();
  }

  @Get('harian/export/pdf')
  @RequirePermissions('report.view')
  async exportHarianPdf(@Res() res: Response, @Query('date') date: string) {
    const d = date ?? new Date().toISOString().slice(0, 10);
    const buffer = await this.pdfReportsService.generateHarian(d);
    this.setPdfHeaders(res, `laporan-harian-${d}.pdf`);
    res.end(buffer);
  }

  @Get('harian/export/excel')
  @RequirePermissions('report.view')
  async exportHarian(@Query('date') date: string, @Res() res: Response) {
    const d = date ?? new Date().toISOString().slice(0, 10);
    const buffer = await this.excelService.exportHarian(d);
    this.setExcelHeaders(res, `laporan-harian-${d}.xlsx`);
    res.end(buffer);
  }

  @Get('harian')
  @RequirePermissions('report.view')
  getLaporanHarian(@Query('date') date: string) {
    return this.service.getLaporanHarian(
      date ?? new Date().toISOString().slice(0, 10),
    );
  }

  @Get('bulanan/export/pdf')
  @RequirePermissions('report.view')
  async exportBulananPdf(
    @Res() res: Response,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('classId') classId?: string,
    @Query('unitId') unitId?: string,
  ) {
    const buffer = await this.pdfReportsService.generateBulanan(
      month,
      year,
      classId ? Number(classId) : undefined,
      unitId ? Number(unitId) : undefined,
    );
    this.setPdfHeaders(res, `laporan-bulanan-${year}-${month}.pdf`);
    res.end(buffer);
  }

  @Get('bulanan/export/excel')
  @RequirePermissions('report.view')
  async exportBulanan(
    @Res() res: Response,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('classId') classId?: string,
    @Query('unitId') unitId?: string,
  ) {
    const buffer = await this.excelService.exportBulanan(
      month,
      year,
      classId ? Number(classId) : undefined,
      unitId ? Number(unitId) : undefined,
    );
    this.setExcelHeaders(res, `laporan-bulanan-${year}-${month}.xlsx`);
    res.end(buffer);
  }

  @Get('bulanan')
  @RequirePermissions('report.view')
  getLaporanBulanan(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('classId') classId?: string,
    @Query('unitId') unitId?: string,
  ) {
    return this.service.getLaporanBulanan(
      month,
      year,
      classId ? Number(classId) : undefined,
      unitId ? Number(unitId) : undefined,
    );
  }

  @Get('tahunan')
  @RequirePermissions('report.view')
  getLaporanTahunan(@Query('schoolYearId', ParseIntPipe) schoolYearId: number) {
    return this.service.getLaporanTahunan(schoolYearId);
  }

  @Get('tunggakan/export/pdf')
  @RequirePermissions('report.view')
  async exportTunggakanPdf(
    @Res() res: Response,
    @Query('schoolYearId') schoolYearId?: string,
    @Query('classId') classId?: string,
    @Query('unitId') unitId?: string,
  ) {
    const buffer = await this.pdfReportsService.generateTunggakan({
      schoolYearId: schoolYearId ? Number(schoolYearId) : undefined,
      classId: classId ? Number(classId) : undefined,
      unitId: unitId ? Number(unitId) : undefined,
    });
    this.setPdfHeaders(res, 'laporan-tunggakan.pdf');
    res.end(buffer);
  }

  @Get('tunggakan/export/excel')
  @RequirePermissions('report.view')
  async exportTunggakan(
    @Res() res: Response,
    @Query('schoolYearId') schoolYearId?: string,
    @Query('classId') classId?: string,
    @Query('unitId') unitId?: string,
  ) {
    const buffer = await this.excelService.exportTunggakan({
      schoolYearId: schoolYearId ? Number(schoolYearId) : undefined,
      classId: classId ? Number(classId) : undefined,
      unitId: unitId ? Number(unitId) : undefined,
    });
    this.setExcelHeaders(res, 'laporan-tunggakan.xlsx');
    res.end(buffer);
  }

  @Get('tunggakan')
  @RequirePermissions('report.view')
  getLaporanTunggakan(
    @Query('schoolYearId') schoolYearId?: string,
    @Query('classId') classId?: string,
    @Query('unitId') unitId?: string,
  ) {
    return this.service.getLaporanTunggakan({
      schoolYearId: schoolYearId ? Number(schoolYearId) : undefined,
      classId: classId ? Number(classId) : undefined,
      unitId: unitId ? Number(unitId) : undefined,
    });
  }

  @Get('rekap-pos/export/pdf')
  @RequirePermissions('report.view')
  async exportRekapPosPdf(
    @Res() res: Response,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('schoolYearId') schoolYearId?: string,
  ) {
    const buffer = await this.pdfReportsService.generateRekapPos({
      dateFrom,
      dateTo,
      schoolYearId: schoolYearId ? Number(schoolYearId) : undefined,
    });
    this.setPdfHeaders(res, 'rekap-pos.pdf');
    res.end(buffer);
  }

  @Get('rekap-pos/export/excel')
  @RequirePermissions('report.view')
  async exportRekapPos(
    @Res() res: Response,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('schoolYearId') schoolYearId?: string,
  ) {
    const buffer = await this.excelService.exportRekapPos({
      dateFrom,
      dateTo,
      schoolYearId: schoolYearId ? Number(schoolYearId) : undefined,
    });
    this.setExcelHeaders(res, 'rekap-pos.xlsx');
    res.end(buffer);
  }

  @Get('rekap-pos')
  @RequirePermissions('report.view')
  getRekapPos(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('schoolYearId') schoolYearId?: string,
  ) {
    return this.service.getRekapPos({
      dateFrom,
      dateTo,
      schoolYearId: schoolYearId ? Number(schoolYearId) : undefined,
    });
  }
}
