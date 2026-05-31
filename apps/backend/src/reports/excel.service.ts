import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ReportsService } from './reports.service';

@Injectable()
export class ExcelService {
  constructor(private readonly reportsService: ReportsService) {}

  private styleHeaderRow(row: ExcelJS.Row) {
    row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3829' } };
    row.alignment = { horizontal: 'center', vertical: 'middle' };
    row.height = 20;
  }

  async exportHarian(date: string): Promise<Buffer> {
    const result = await this.reportsService.getLaporanHarian(date);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Harian');

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'No Transaksi', key: 'transactionNumber', width: 25 },
      { header: 'Nama Siswa', key: 'studentName', width: 30 },
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'Total', key: 'totalAmount', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Waktu', key: 'createdAt', width: 20 },
    ];

    this.styleHeaderRow(sheet.getRow(1));

    result.transactions.forEach((trx, idx) => {
      sheet.addRow({
        no: idx + 1,
        transactionNumber: trx.transactionNumber,
        studentName: trx.studentName,
        nis: trx.nis,
        totalAmount: trx.totalAmount,
        status: trx.status,
        createdAt: trx.createdAt ? new Date(trx.createdAt).toLocaleString('id-ID') : '',
      });
    });

    const totalRow = sheet.addRow({
      no: '',
      transactionNumber: 'TOTAL PENERIMAAN',
      studentName: '',
      nis: '',
      totalAmount: result.totalPenerimaan,
      status: '',
      createdAt: '',
    });
    totalRow.font = { bold: true };
    totalRow.getCell('totalAmount').numFmt = '#,##0';

    sheet.getColumn('totalAmount').numFmt = '#,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportBulanan(
    month: number,
    year: number,
    classId?: number,
    unitId?: number,
  ): Promise<Buffer> {
    const result = await this.reportsService.getLaporanBulanan(month, year, classId, unitId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Bulanan');

    sheet.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Total Penerimaan', key: 'totalPenerimaan', width: 20 },
      { header: 'Jumlah Transaksi', key: 'jumlahTransaksi', width: 18 },
    ];

    this.styleHeaderRow(sheet.getRow(1));

    result.perHari.forEach((row) => {
      sheet.addRow({
        date: row.date,
        totalPenerimaan: row.totalPenerimaan,
        jumlahTransaksi: row.jumlahTransaksi,
      });
    });

    const totalRow = sheet.addRow({
      date: 'TOTAL',
      totalPenerimaan: result.totalPenerimaan,
      jumlahTransaksi: result.jumlahTransaksi,
    });
    totalRow.font = { bold: true };

    sheet.getColumn('totalPenerimaan').numFmt = '#,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportTunggakan(filters: {
    schoolYearId?: number;
    classId?: number;
    unitId?: number;
  } = {}): Promise<Buffer> {
    const result = await this.reportsService.getLaporanTunggakan(filters);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Tunggakan');

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Nama Siswa', key: 'studentName', width: 30 },
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'Kelas', key: 'className', width: 20 },
      { header: 'Total Tunggakan', key: 'totalTunggakan', width: 20 },
      { header: 'Jumlah Tagihan', key: 'jumlahTagihan', width: 16 },
    ];

    this.styleHeaderRow(sheet.getRow(1));

    result.siswa.forEach((siswa, idx) => {
      sheet.addRow({
        no: idx + 1,
        studentName: siswa.studentName,
        nis: siswa.nis,
        className: siswa.className,
        totalTunggakan: siswa.totalTunggakan,
        jumlahTagihan: siswa.jumlahTagihan,
      });
    });

    sheet.getColumn('totalTunggakan').numFmt = '#,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportRekapPos(filters: {
    dateFrom?: string;
    dateTo?: string;
    schoolYearId?: number;
  } = {}): Promise<Buffer> {
    const result = await this.reportsService.getRekapPos(filters);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rekap POS');

    sheet.columns = [
      { header: 'Kode POS', key: 'posCode', width: 12 },
      { header: 'Nama POS', key: 'posName', width: 25 },
      { header: 'Total Penerimaan', key: 'totalPenerimaan', width: 20 },
      { header: 'Jumlah Transaksi', key: 'jumlahTransaksi', width: 18 },
      { header: 'Jumlah Siswa', key: 'jumlahSiswa', width: 14 },
    ];

    this.styleHeaderRow(sheet.getRow(1));

    result.perPos.forEach((pos) => {
      sheet.addRow({
        posCode: pos.posCode,
        posName: pos.posName,
        totalPenerimaan: pos.totalPenerimaan,
        jumlahTransaksi: pos.jumlahTransaksi,
        jumlahSiswa: pos.jumlahSiswa,
      });
    });

    sheet.getColumn('totalPenerimaan').numFmt = '#,##0';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
