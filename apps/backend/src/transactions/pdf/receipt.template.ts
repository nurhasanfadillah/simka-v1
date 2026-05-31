const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface ReceiptItem {
  id: number;
  billId: number;
  billMonthId: number | null;
  amount: number;
  paymentPostName: string;
  paymentPostCode: string;
  month: number | null;
  year: number | null;
}

interface ReceiptData {
  transactionNumber: string;
  studentName: string;
  nis: string;
  totalAmount: number;
  status: string;
  notes: string | null;
  voidReason: string | null;
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
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function terbilang(n: number): string {
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  if (n < 0 || n >= 1e12) return '';
  if (n < 12) return satuan[n];
  if (n < 20) return terbilang(n - 10) + ' Belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
  if (n < 200) return 'Seratus ' + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
  if (n < 2000) return 'Seribu ' + terbilang(n - 1000);
  if (n < 1e6) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
  if (n < 1e9) return terbilang(Math.floor(n / 1e6)) + ' Juta ' + terbilang(n % 1e6);
  return terbilang(Math.floor(n / 1e9)) + ' Milyar ' + terbilang(n % 1e9);
}

export function buildReceiptHtml(data: ReceiptData): string {
  const itemRows = data.items
    .map((item, i) => {
      const desc = item.billMonthId && item.month
        ? `${item.paymentPostName} — ${MONTH_NAMES[item.month]} ${item.year}`
        : item.paymentPostName;
      return `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${desc}</td>
          <td style="text-align:right">${formatRupiah(item.amount)}</td>
        </tr>`;
    })
    .join('');

  const isVoid = data.status === 'void';
  const terbilangText = terbilang(Math.round(data.totalAmount)).replace(/\s+/g, ' ').trim();

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kwitansi ${data.transactionNumber}</title>
  <style>
    @page { margin: 0; }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    ${isVoid ? '.watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; color: rgba(220,38,38,0.12); font-weight: 900; pointer-events: none; z-index: 999; letter-spacing: 12px; }' : ''}
    .page { width: 100%; max-width: 100%; }
    .top-bar { background: #1A3829; height: 8px; }
    .header { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px 10px; }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .header-logo { width: 52px; height: 52px; border: 2px solid #1A3829; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #1A3829; }
    .header-brand h1 { margin: 0; font-size: 16px; color: #1A3829; font-weight: 800; letter-spacing: 0.5px; }
    .header-brand p { margin: 2px 0 0; font-size: 10px; color: #666; }
    .header-title { text-align: right; }
    .header-title .kwitansi { font-size: 18px; font-weight: 900; color: #1A3829; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
    .header-title .no { font-size: 11px; color: #555; margin: 2px 0 0; font-family: 'Courier New', monospace; }
    .divider { border: none; border-top: 2px solid #1A3829; margin: 0 28px; }
    .info-section { display: flex; gap: 0; padding: 12px 28px; }
    .info-col { flex: 1; }
    .info-row { display: flex; padding: 4px 0; font-size: 11px; }
    .info-label { color: #666; min-width: 110px; font-weight: 500; }
    .info-value { color: #1a1a1a; font-weight: 600; }
    .receipt-no { background: #f0f7f2; border: 1px solid #c8e0cc; border-radius: 6px; padding: 8px 12px; margin: 0 28px 4px; font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700; color: #1A3829; text-align: center; letter-spacing: 1px; }
    .table-section { padding: 8px 28px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1A3829; color: #fff; padding: 7px 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    th:first-child { border-radius: 6px 0 0 0; }
    th:last-child { border-radius: 0 6px 0 0; }
    td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) td { background: #fafafa; }
    .total-row td { font-weight: 700; background: #eef5f0 !important; border-top: 2px solid #1A3829; border-bottom: 2px solid #1A3829; font-size: 12px; }
    .terbilang { padding: 4px 28px 0; font-size: 10px; color: #666; font-style: italic; }
    .notes-section { padding: 4px 28px 0; font-size: 10px; color: #666; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 20px 28px 16px; }
    .footer-date { font-size: 10px; color: #888; }
    .signature { text-align: center; }
    .signature .sign-label { font-size: 11px; color: #1a1a1a; margin: 0 0 40px; }
    .signature .sign-line { border-top: 1px solid #333; padding-top: 6px; font-size: 11px; font-weight: 600; min-width: 160px; }
    .signature .sign-sub { font-size: 9px; color: #888; margin-top: 2px; }
    .void-stamp { color: #dc2626; border: 2px solid #dc2626; display: inline-block; padding: 2px 10px; border-radius: 4px; font-weight: 700; font-size: 10px; letter-spacing: 1px; }
    .bottom-bar { background: #1A3829; height: 4px; }
  </style>
</head>
<body>
  ${isVoid ? '<div class="watermark">VOID</div>' : ''}
  <div class="page">
    <div class="top-bar"></div>
    <div class="header">
      <div class="header-left">
        <div class="header-logo">AH</div>
        <div class="header-brand">
          <h1>Yayasan Al-Hasaniyyah</h1>
          <p>Sistem Informasi Keuangan Sekolah</p>
        </div>
      </div>
      <div class="header-title">
        <p class="kwitansi">${isVoid ? '<span class="void-stamp">VOID</span>&nbsp;' : ''}Kwitansi</p>
        <p class="no">${data.transactionNumber}</p>
      </div>
    </div>
    <hr class="divider" />
    <div class="info-section">
      <div class="info-col">
        <div class="info-row"><span class="info-label">Nama Siswa</span><span class="info-value">: ${data.studentName}</span></div>
        <div class="info-row"><span class="info-label">NIS</span><span class="info-value">: ${data.nis}</span></div>
      </div>
      <div class="info-col">
        <div class="info-row"><span class="info-label">Tanggal</span><span class="info-value">: ${formatDate(data.createdAt)}</span></div>
        <div class="info-row"><span class="info-label">Status</span><span class="info-value">: ${isVoid ? '<span style="color:#dc2626;font-weight:700">DIBATALKAN</span>' : '<span style="color:#059669;font-weight:700">LUNAS</span>'}</span></div>
      </div>
    </div>
    ${data.notes ? `<div class="notes-section"><strong>Catatan:</strong> ${data.notes}</div>` : ''}
    ${data.voidReason ? `<div class="notes-section"><strong>Alasan Void:</strong> ${data.voidReason}</div>` : ''}
    <div class="table-section">
      <table>
        <thead>
          <tr>
            <th style="width:36px;text-align:center">No</th>
            <th>Rincian Pembayaran</th>
            <th style="width:140px;text-align:right">Jumlah (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr class="total-row">
            <td colspan="2" style="text-align:left">TOTAL</td>
            <td style="text-align:right">${formatRupiah(data.totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="terbilang">Terbilang: <strong>${terbilangText} Rupiah</strong></div>
    <div class="footer">
      <div class="footer-date">
        Dicetak: ${new Date().toLocaleString('id-ID')}
      </div>
      <div class="signature">
        <p class="sign-label">Petugas Keuangan</p>
        <div class="sign-line">${data.studentName}</div>
        <p class="sign-sub">Tanda Tangan / Stempel</p>
      </div>
    </div>
    <div class="bottom-bar"></div>
  </div>
</body>
</html>`;
}
