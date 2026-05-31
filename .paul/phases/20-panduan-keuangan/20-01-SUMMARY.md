---
phase: 20-panduan-keuangan
plan: 01
subsystem: ui
tags: [react, panduan, guidance, ux, keuangan, transaksi, tagihan]

provides:
  - Teks panduan di Generate Tagihan, Form Bayar, Riwayat Pembayaran (merah)
  - Teks panduan di Data Tagihan, Tunggakan (gray)
  - Phase 20 complete — seluruh halaman Keuangan memiliki panduan

affects: [phase 21 — panduan Laporan & Pengaturan]

key-files:
  modified:
    - apps/frontend/src/pages/keuangan/generate/index.tsx
    - apps/frontend/src/pages/keuangan/transaksi/baru/index.tsx
    - apps/frontend/src/pages/keuangan/riwayat/index.tsx
    - apps/frontend/src/pages/keuangan/tagihan/index.tsx
    - apps/frontend/src/pages/keuangan/tunggakan/index.tsx

patterns-established:
  - "generate/transaksi-baru: panduan merah langsung setelah div header (tanpa mb-6 change karena tidak ada flex justify-between)"
  - "riwayat/tagihan/tunggakan: mb-6 → mb-2 di flex justify-between header, lalu <p> panduan setelah </div>"

duration: ~10min
completed: 2026-05-30T00:00:00Z
---

# Phase 20 Plan 01: Panduan Keuangan Summary

**Tambah teks panduan di 5 halaman Keuangan — 3 merah italic (Generate Tagihan, Form Bayar, Riwayat Pembayaran) dan 2 gray italic (Data Tagihan, Tunggakan) — melengkapi Phase 20 sehingga seluruh modul Keuangan memiliki panduan.**

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Panduan Generate Tagihan — merah | Pass | `text-red-500`, mt-2, max-w-2xl |
| AC-2: Panduan Form Bayar — merah | Pass | `text-red-500`, mt-1, setelah subtitle |
| AC-3: Panduan Riwayat Pembayaran — merah | Pass | `text-red-500`, mb-4, mb-6→mb-2 |
| AC-4: Panduan Data Tagihan — gray | Pass | `text-gray-400`, mb-4, mb-6→mb-2 |
| AC-5: Panduan Tunggakan — gray | Pass | `text-gray-400`, mb-4, mb-6→mb-2 |

## Files Modified

| File | Change |
|------|--------|
| `apps/frontend/src/pages/keuangan/generate/index.tsx` | Tambah `<p>` panduan merah setelah div max-w-2xl |
| `apps/frontend/src/pages/keuangan/transaksi/baru/index.tsx` | Tambah `<p>` panduan merah setelah subtitle |
| `apps/frontend/src/pages/keuangan/riwayat/index.tsx` | mb-6→mb-2, tambah `<p>` panduan merah |
| `apps/frontend/src/pages/keuangan/tagihan/index.tsx` | mb-6→mb-2, tambah `<p>` panduan gray |
| `apps/frontend/src/pages/keuangan/tunggakan/index.tsx` | mb-6→mb-2, tambah `<p>` panduan gray |

## Deviations

Tidak ada — plan dieksekusi sesuai spec.

## Next Phase Readiness

**Ready:** Phase 20 complete. Phase 21 tinggal replikasi pola yang sama ke halaman Laporan (5 halaman, semua gray) dan Pengaturan (3 halaman, semua gray).

---
*Phase: 20-panduan-keuangan, Plan: 01 — Completed: 2026-05-30*
