const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface BillPrintData {
  student: { name: string; nis: string; activeClassName: string | null; activeUnitName: string | null };
  totalTunggakan: number;
  bebas: Array<{ paymentPostName: string; totalAmount: number; paidAmount: number; remaining: number; status: string }>;
  bulanan: Array<{
    paymentPostName: string;
    totalAmount: number;
    paidAmount: number;
    remaining: number;
    status: string;
    months: Array<{ month: number; year: number; amount: number; paidAmount: number; remaining: number; status: string }>;
  }>;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

export function buildBillPrintHtml(data: BillPrintData): string {
  const rowspan = data.bebas.length > 0 ? data.bebas.length + 1 : 0;
  const hasBebas = data.bebas.length > 0;
  const hasBulanan = data.bulanan.length > 0;

  const bebasRows = data.bebas.map((b) => `
    <tr>
      <td>${b.paymentPostName}</td>
      <td style="text-align:right">${formatRupiah(b.totalAmount)}</td>
      <td style="text-align:right">${formatRupiah(b.paidAmount)}</td>
      <td style="text-align:right;color:${b.status === 'lunas' ? '#059669' : '#dc2626'}">${formatRupiah(b.remaining)}</td>
      <td style="text-align:center"><span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:9px;font-weight:600;${b.status === 'lunas' ? 'background:#d1fae5;color:#065f46' : b.status === 'cicilan' ? 'background:#e0e7ff;color:#3730a3' : 'background:#fef3c7;color:#92400e'}">${b.status === 'lunas' ? 'Lunas' : b.status === 'cicilan' ? 'Cicilan' : 'Belum Bayar'}</span></td>
    </tr>`).join('');

  const bulananRows = data.bulanan.map((b) => {
    const monthCells = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((monthNum) => {
      const m = b.months.find((bm) => bm.month === monthNum);
      if (!m) return '<td style="text-align:center;font-size:8px;color:#ccc">-</td>';
      const bg = m.status === 'lunas' ? '#d1fae5' : m.paidAmount > 0 ? '#ede9fe' : '#fef3c7';
      const color = m.status === 'lunas' ? '#065f46' : m.paidAmount > 0 ? '#5b21b6' : '#92400e';
      const val = m.status === 'lunas' ? 0 : m.paidAmount > 0 ? m.remaining : m.amount;
      return `<td style="text-align:center;font-size:8px;background:${bg};color:${color};font-weight:500">${formatRupiah(val)}</td>`;
    }).join('');
    return `<tr>
      <td style="font-size:10px">${b.paymentPostName}</td>
      ${monthCells}
      <td style="text-align:right;font-size:10px">${formatRupiah(b.totalAmount)}</td>
      <td style="text-align:right;font-size:10px">${formatRupiah(b.paidAmount)}</td>
      <td style="text-align:right;font-size:10px;color:#dc2626">${formatRupiah(b.remaining)}</td>
      <td style="text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:600;${b.status === 'lunas' ? 'background:#d1fae5;color:#065f46' : b.status === 'cicilan' ? 'background:#e0e7ff;color:#3730a3' : 'background:#fef3c7;color:#92400e'}">${b.status === 'lunas' ? 'Lunas' : b.status === 'cicilan' ? 'Cicilan' : 'Belum Bayar'}</span></td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Tagihan Siswa</title>
  <style>
    @page { margin: 0; }
    body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10px; color: #1a1a1a; margin: 0; }
    .top-bar { background: #1A3829; height: 6px; }
    .header { text-align: center; padding: 12px 24px 6px; }
    .header h1 { margin: 0; font-size: 17px; color: #1A3829; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
    .header p { margin: 3px 0 0; font-size: 9px; color: #555; line-height: 1.4; }
    .divider { border: none; border-top: 2px solid #1A3829; margin: 0 24px; }
    .student-info { padding: 8px 24px 4px; display: flex; gap: 20px; font-size: 10px; }
    .student-info .label { color: #666; min-width: 80px; }
    .section { padding: 8px 24px; }
    .section h2 { font-size: 12px; color: #1A3829; margin: 0 0 6px; border-bottom: 1.5px solid #1A3829; padding-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { background: #1A3829; color: #fff; padding: 5px 6px; font-size: 9px; font-weight: 600; }
    td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #fafafa; }
    .summary { padding: 6px 24px; display: flex; gap: 16px; }
    .summary-card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 8px 12px; flex: 1; text-align: center; }
    .summary-card .val { font-size: 14px; font-weight: 700; margin: 0; }
    .summary-card .lbl { font-size: 9px; color: #666; margin: 2px 0 0; }
    .footer { padding: 10px 24px; font-size: 8px; color: #999; text-align: right; }
    .legend { padding: 4px 24px 8px; display: flex; gap: 12px; font-size: 8px; color: #666; }
    .legend span { display: inline-flex; align-items: center; gap: 3px; }
    .legend .dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <div class="top-bar"></div>
  <div class="header">
    <h1>YAYASAN PENDIDIKAN ISLAM AL-HASANIYYAH</h1>
    <p>Jl. Raya Cileungsi-Jonggol, Km. 10 Desa Cipeuncag Kec. Cileungsi Kab. Bogor, Jawa Barat 16820</p>
  </div>
  <hr class="divider" />
  <div class="student-info">
    <div><span class="label">Nama</span>: <strong>${data.student.name}</strong></div>
    <div><span class="label">NIS</span>: <strong>${data.student.nis}</strong></div>
    <div><span class="label">Kelas</span>: ${data.student.activeClassName ?? '-'} — ${data.student.activeUnitName ?? '-'}</div>
  </div>
  <hr class="divider" style="margin-top:4px" />

  ${hasBebas ? `
  <div class="section">
    <h2>Tagihan Bebas</h2>
    <table>
      <thead><tr><th>Nama Pembayaran</th><th style="width:100px;text-align:right">Total</th><th style="width:100px;text-align:right">Dibayar</th><th style="width:100px;text-align:right">Sisa</th><th style="width:80px;text-align:center">Status</th></tr></thead>
      <tbody>${bebasRows}</tbody>
    </table>
  </div>` : ''}

  ${hasBulanan ? `
  <div class="section">
    <h2>Tagihan Bulanan</h2>
    <table>
      <thead>
        <tr>
          <th style="width:100px">Pembayaran</th>
          ${[7,8,9,10,11,12,1,2,3,4,5,6].map(m => `<th style="width:40px;text-align:center;font-size:8px">${MONTH_NAMES[m]}</th>`).join('')}
          <th style="width:60px;text-align:right">Total</th>
          <th style="width:60px;text-align:right">Bayar</th>
          <th style="width:60px;text-align:right">Sisa</th>
          <th style="width:60px;text-align:center">Status</th>
        </tr>
      </thead>
      <tbody>${bulananRows}</tbody>
    </table>
    <div class="legend">
      <span><span class="dot" style="background:#fef3c7;border-color:#f59e0b"></span> Belum Bayar</span>
      <span><span class="dot" style="background:#ede9fe;border-color:#7c3aed"></span> Cicilan</span>
      <span><span class="dot" style="background:#d1fae5;border-color:#059669"></span> Lunas</span>
    </div>
  </div>` : ''}

  <div class="summary">
    <div class="summary-card">
      <p class="val" style="color:#1a1a1a">${formatRupiah((data.bebas.reduce((s,b) => s + b.totalAmount, 0) + data.bulanan.reduce((s,b) => s + b.totalAmount, 0)))}</p>
      <p class="lbl">Total Tagihan</p>
    </div>
    <div class="summary-card">
      <p class="val" style="color:#2563eb">${formatRupiah((data.bebas.reduce((s,b) => s + b.paidAmount, 0) + data.bulanan.reduce((s,b) => s + b.paidAmount, 0)))}</p>
      <p class="lbl">Total Pembayaran</p>
    </div>
    <div class="summary-card">
      <p class="val" style="color:#d97706">${formatRupiah(data.totalTunggakan)}</p>
      <p class="lbl">Total Tunggakan</p>
    </div>
  </div>

  <div class="footer">Dicetak: ${new Date().toLocaleString('id-ID')}</div>
</body>
</html>`;
}
