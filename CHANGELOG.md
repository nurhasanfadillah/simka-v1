# CHANGELOG.md — SIMKA

> Dibuat: 2026-05-31 | Updated: 2026-05-31

## 2026-05-31

- **fix:** Bill-print PDF — remove status column, add subtotals, add DATA KEUANGAN SISWA title
- **feat:** Cetak Tagihan PDF — student billing summary (bebas + bulanan + summary cards)
- **fix:** Cetak kwitansi via Axios blob with JWT (not window.open → 401)
- **fix:** Receipt template redesign — A4 landscape, Yayasan branding, terbilang
- **fix:** Tahunan PDF + Excel export endpoints (were missing)
- **feat:** Transaksi Baru — void + delete on Riwayat tab, printer icon
- **feat:** Transaksi Baru — dominant student name, 3 stat cards, back-to-payment
- **fix:** Transaksi Baru — whitespace-nowrap on nama pembayaran + status
- **feat:** Transaksi Baru — Riwayat tab with student transaction history
- **fix:** BillMonth status checks cumulative paid vs amount (partial payment)
- **fix:** Per-month cell logic (paidAmount>0 → purple), close confirm modal
- **fix:** Bulanan rules (lunas=0, cicilan=purple, belum=kuning), confirmation dialog
- **fix:** Sticky cart max-height + cicilan bulanan display (remaining, purple)
- **feat:** UI polish audit — 24 pages, skeleton, tabular-nums, table wrappers
- **feat:** AlertDialog component for delete/void confirmations
- **feat:** 16 native selects → shadcn Select
- **feat:** Export button color coding (Excel green, PDF red)
- **feat:** Profile permission badges color-coded
