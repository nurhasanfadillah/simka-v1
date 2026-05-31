import { Injectable } from '@nestjs/common';
import { PdfService } from '../transactions/pdf/pdf.service';
import { ReportsService } from './reports.service';

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

@Injectable()
export class PdfReportsService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly reportsService: ReportsService,
  ) {}

  private formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private baseStyles(): string {
    return `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 0; }
        .header { text-align: center; border-bottom: 2px solid #1A3829; padding-bottom: 10px; margin-bottom: 16px; }
        .header h1 { color: #1A3829; font-size: 16px; margin-bottom: 4px; }
        .header h2 { font-size: 12px; font-weight: normal; color: #555; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1A3829; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
        td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
        tr:nth-child(even) td { background: #f8f8f8; }
        .total-row td { font-weight: bold; border-top: 2px solid #1A3829; background: #eef5f0 !important; }
        .amount { text-align: right; }
        .footer { margin-top: 14px; font-size: 10px; color: #666; text-align: right; }
        .summary { margin-top: 12px; font-size: 11px; }
      </style>
    `;
  }

  private wrapHtml(title: string, subtitle: string, body: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${this.baseStyles()}
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <h2>Yayasan Al-Hasaniyyah | ${subtitle}</h2>
  </div>
  ${body}
  <div class="footer">Dicetak: ${new Date().toLocaleString('id-ID')}</div>
</body>
</html>`;
  }

  async generateHarian(date: string): Promise<Buffer> {
    const result = await this.reportsService.getLaporanHarian(date);

    const rows = result.transactions.map((trx, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${trx.transactionNumber}</td>
        <td>${trx.studentName}</td>
        <td>${trx.nis}</td>
        <td class="amount">${this.formatRupiah(trx.totalAmount)}</td>
        <td>${trx.status}</td>
        <td>${trx.createdAt ? new Date(trx.createdAt).toLocaleTimeString('id-ID') : '-'}</td>
      </tr>`).join('');

    const body = `
      <table>
        <tr>
          <th style="width:30px">No</th>
          <th style="width:130px">No Transaksi</th>
          <th>Nama Siswa</th>
          <th style="width:90px">NIS</th>
          <th style="width:110px" class="amount">Total</th>
          <th style="width:60px">Status</th>
          <th style="width:70px">Waktu</th>
        </tr>
        ${rows}
        <tr class="total-row">
          <td colspan="4">TOTAL PENERIMAAN</td>
          <td class="amount">${this.formatRupiah(result.totalPenerimaan)}</td>
          <td colspan="2">${result.jumlahTransaksi} transaksi aktif</td>
        </tr>
      </table>`;

    const html = this.wrapHtml('Laporan Harian', `Tanggal: ${date}`, body);
    return this.pdfService.generateFromHtml(html, { format: 'A4' });
  }

  async generateBulanan(
    month: number,
    year: number,
    classId?: number,
    unitId?: number,
  ): Promise<Buffer> {
    const result = await this.reportsService.getLaporanBulanan(month, year, classId, unitId);

    const rows = result.perHari.map((row) => `
      <tr>
        <td>${row.date}</td>
        <td class="amount">${this.formatRupiah(row.totalPenerimaan)}</td>
        <td class="amount">${row.jumlahTransaksi}</td>
      </tr>`).join('');

    const body = `
      <table>
        <tr>
          <th>Tanggal</th>
          <th class="amount" style="width:160px">Total Penerimaan</th>
          <th class="amount" style="width:130px">Jumlah Transaksi</th>
        </tr>
        ${rows}
        <tr class="total-row">
          <td>TOTAL</td>
          <td class="amount">${this.formatRupiah(result.totalPenerimaan)}</td>
          <td class="amount">${result.jumlahTransaksi}</td>
        </tr>
      </table>`;

    const subtitle = `${BULAN[month - 1]} ${year}`;
    const html = this.wrapHtml('Laporan Bulanan', subtitle, body);
    return this.pdfService.generateFromHtml(html, { format: 'A4' });
  }

  async generateTunggakan(filters: {
    schoolYearId?: number;
    classId?: number;
    unitId?: number;
  } = {}): Promise<Buffer> {
    const result = await this.reportsService.getLaporanTunggakan(filters);

    const rows = result.siswa.map((siswa, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${siswa.studentName}</td>
        <td>${siswa.nis}</td>
        <td>${siswa.className}</td>
        <td class="amount">${this.formatRupiah(siswa.totalTunggakan)}</td>
        <td class="amount">${siswa.jumlahTagihan}</td>
      </tr>`).join('');

    const body = `
      <table>
        <tr>
          <th style="width:30px">No</th>
          <th>Nama Siswa</th>
          <th style="width:100px">NIS</th>
          <th style="width:130px">Kelas</th>
          <th style="width:140px" class="amount">Total Tunggakan</th>
          <th style="width:100px" class="amount">Jml Tagihan</th>
        </tr>
        ${rows}
        <tr class="total-row">
          <td colspan="5">TOTAL SISWA TUNGGAKAN</td>
          <td class="amount">${result.total} siswa</td>
        </tr>
      </table>`;

    const html = this.wrapHtml('Laporan Tunggakan', 'Siswa Belum Lunas', body);
    return this.pdfService.generateFromHtml(html, { format: 'A4' });
  }

  async generateRekapPos(filters: {
    dateFrom?: string;
    dateTo?: string;
    schoolYearId?: number;
  } = {}): Promise<Buffer> {
    const result = await this.reportsService.getRekapPos(filters);

    const rows = result.perPos.map((pos) => `
      <tr>
        <td>${pos.posCode}</td>
        <td>${pos.posName}</td>
        <td class="amount">${this.formatRupiah(pos.totalPenerimaan)}</td>
        <td class="amount">${pos.jumlahTransaksi}</td>
        <td class="amount">${pos.jumlahSiswa}</td>
      </tr>`).join('');

    const totalPenerimaan = result.perPos.reduce((s, p) => s + p.totalPenerimaan, 0);

    const body = `
      <table>
        <tr>
          <th style="width:80px">Kode POS</th>
          <th>Nama POS</th>
          <th style="width:150px" class="amount">Total Penerimaan</th>
          <th style="width:120px" class="amount">Jml Transaksi</th>
          <th style="width:100px" class="amount">Jml Siswa</th>
        </tr>
        ${rows}
        <tr class="total-row">
          <td colspan="2">TOTAL</td>
          <td class="amount">${this.formatRupiah(totalPenerimaan)}</td>
          <td colspan="2"></td>
        </tr>
      </table>`;

    const html = this.wrapHtml('Rekap POS Pembayaran', 'Semua POS', body);
    return this.pdfService.generateFromHtml(html, { format: 'A4' });
  }
}
