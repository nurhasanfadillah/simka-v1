interface ReceiptItem {
  billId: number;
  billMonthId: number | null;
  amount: number;
}

interface ReceiptData {
  transactionNumber: string;
  studentName: string;
  nis: string;
  totalAmount: number;
  status: string;
  notes: string | null;
  createdAt: Date | string;
  items: ReceiptItem[];
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function buildReceiptHtml(data: ReceiptData): string {
  const itemRows = data.items
    .map(
      (item, i) =>
        `<tr>
          <td style="padding:6px 8px;border:1px solid #ddd;">${i + 1}</td>
          <td style="padding:6px 8px;border:1px solid #ddd;">Tagihan #${item.billId}${item.billMonthId ? ` (Bln ${item.billMonthId})` : ''}</td>
          <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;">${formatRupiah(item.amount)}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; margin: 0; padding: 0; }
    .header { background: #1A3829; color: white; padding: 16px; text-align: center; }
    .header h1 { margin: 0; font-size: 16px; }
    .header p { margin: 4px 0 0; font-size: 11px; opacity: 0.85; }
    .body { padding: 16px; }
    .title { font-size: 14px; font-weight: bold; text-align: center; margin: 12px 0; letter-spacing: 1px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin-bottom: 12px; }
    .info-row { display: flex; gap: 4px; }
    .info-label { color: #555; min-width: 100px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th { background: #1A3829; color: white; padding: 8px; text-align: left; font-size: 11px; }
    th:last-child { text-align: right; }
    .total-row td { font-weight: bold; background: #f5f5f5; padding: 8px; border: 1px solid #ddd; }
    .total-row td:last-child { text-align: right; color: #1A3829; }
    .footer { margin-top: 24px; display: flex; justify-content: flex-end; }
    .sign-box { text-align: center; }
    .sign-box p { margin: 0 0 48px; }
    .sign-line { border-top: 1px solid #333; padding-top: 4px; min-width: 120px; }
    .void-badge { background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Yayasan Al-Hasaniyyah</h1>
    <p>Sistem Informasi Keuangan Sekolah</p>
  </div>
  <div class="body">
    <div class="title">KWITANSI PEMBAYARAN ${data.status === 'void' ? '<span class="void-badge">VOID</span>' : ''}</div>
    <div class="info-grid">
      <div class="info-row"><span class="info-label">No. Transaksi</span><span>: ${data.transactionNumber}</span></div>
      <div class="info-row"><span class="info-label">Tanggal</span><span>: ${formatDate(data.createdAt)}</span></div>
      <div class="info-row"><span class="info-label">Nama Siswa</span><span>: ${data.studentName}</span></div>
      <div class="info-row"><span class="info-label">NIS</span><span>: ${data.nis}</span></div>
      ${data.notes ? `<div class="info-row" style="grid-column:1/-1"><span class="info-label">Keterangan</span><span>: ${data.notes}</span></div>` : ''}
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:30px">No</th>
          <th>Keterangan</th>
          <th style="width:120px">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr class="total-row">
          <td colspan="2">Total Pembayaran</td>
          <td>${formatRupiah(data.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      <div class="sign-box">
        <p>Petugas Keuangan</p>
        <div class="sign-line">(__________________)</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
