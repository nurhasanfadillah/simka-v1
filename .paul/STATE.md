# STATE.md — SIMKA

## Current Position

Milestone: v2.7 — Transaksi Baru + PDF Enhancements
Status: ACTIVE — codebase mapped
Last activity: 2026-05-31 — CODEBASE.md generated, context files created

Progress:
- UI Audit (v2.6): [██████████] 100% ✅
- Transaksi + PDF (v2.7): [████████░░] 80%
- Codebase mapped: ✅ (62 endpoints, 24 pages, 16 tables)

## Loop Position

```
DISCUSS ──▶ PLAN ──▶ APPLY ──▶ UNIFY
   ✓          ✓        ✓        ✓     [All loops closed]
```

## v2.7 Features Deployed
- [x] Transaksi Baru: tab Pembayaran + Riwayat, void/delete, printer icon
- [x] Dominant student name + 3 stat cards
- [x] BillMonth cumulative payment check (partial → belum_bayar)
- [x] Bulanan rules: lunas=0, cicilan=purple, belum=kuning
- [x] Confirmation dialog before transaction submit
- [x] Kwitansi A4 landscape: Yayasan branding, terbilang, watermark void
- [x] Cetak kwitansi via Axios (JWT), not window.open
- [x] Cetak Tagihan PDF: bebas + bulanan + summary
- [x] Tahunan PDF + Excel export
- [x] Dashboard slicer di laporan (coming next)
