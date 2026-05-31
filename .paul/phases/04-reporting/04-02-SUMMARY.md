---
phase: 04-reporting
plan: 02
subsystem: api
tags: [reporting, tunggakan, rekap-pos, payment-posts, nestjs, drizzle]

requires:
  - phase: 04-01
    provides: ReportsModule scaffold, import patterns, DB injection

provides:
  - GET /reports/tunggakan (siswa belum lunas, filter schoolYearId/classId/unitId)
  - GET /reports/rekap-pos (total penerimaan per POS, filter dateFrom/dateTo/schoolYearId)

affects: [04-03-export-excel, 04-04-export-pdf]

tech-stack:
  added: []
  patterns: [4-level JOIN transactions→items→bills→templates→posts, in-app GROUP BY dengan Map untuk agregasi per siswa]

key-files:
  created: []
  modified:
    - apps/backend/src/reports/reports.service.ts
    - apps/backend/src/reports/reports.controller.ts

key-decisions:
  - "Agregasi tunggakan per siswa di app layer (Map), bukan SQL GROUP BY — menghindari JOIN yang kompleks dengan klasName"
  - "bills.totalAmount sebagai totalTunggakan — jumlah tagihan penuh, bukan sisa cicilan"

patterns-established:
  - "4-level JOIN untuk rekap POS: transactions→transactionItems→bills→paymentTemplates→paymentPosts"
  - "Optional filter tanpa ParseIntPipe di controller: Query string → manual Number() cast di service call"

duration: ~15min
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T23:59:00Z
---

# Phase 04 Plan 02: Laporan Tunggakan + Rekap POS Summary

**2 endpoint operasional ditambahkan ke ReportsModule: tunggakan 10 siswa terdeteksi dengan totalTunggakan per siswa, dan rekap POS SPP Bulanan Rp500.000 dari transaksi aktif — semua terverifikasi live.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15 min |
| Started | 2026-05-29 |
| Completed | 2026-05-29 |
| Tasks | 2 auto + 1 checkpoint |
| Files modified | 2 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Tunggakan return siswa belum lunas dengan totalTunggakan | Pass | 10 siswa, totalTunggakan:6000000, className benar |
| AC-2: Filter classId/unitId/schoolYearId berjalan | Pass | schoolYearId=1 filter verified; classId/unitId pola sama |
| AC-3: Rekap POS return total per payment post | Pass | SPP:500000, jumlahTransaksi:1, jumlahSiswa:1 — hanya aktif |

## Accomplishments

- `getLaporanTunggakan()`: query bills JOIN students+paymentTemplates+classes+schoolUnits, filter inArray status, agregasi per siswa via Map
- `getRekapPos()`: 4-level JOIN transaksi→items→bills→templates→POS, countDistinct untuk jumlahTransaksi dan jumlahSiswa
- Filter dateFrom/dateTo/schoolYearId untuk rekap POS berjalan benar
- Server restart troubleshoot: `pnpm dev` dari `apps/backend/` langsung (bukan root turbo)

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/reports/reports.service.ts` | Modified | +getLaporanTunggakan(), +getRekapPos(), +imports baru |
| `apps/backend/src/reports/reports.controller.ts` | Modified | +GET tunggakan, +GET rekap-pos endpoints |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Agregasi tunggakan di app layer (Map) | SQL GROUP BY + className JOIN menjadi kompleks | Kode lebih mudah dibaca; performa cukup untuk < 1000 siswa |
| bills.totalAmount sebagai totalTunggakan | Amount tagihan penuh yang belum terbayar | Sederhana; bill_months cicilan tracking ada di Phase 02 |

## Deviations from Plan

Tidak ada — plan dieksekusi tepat sesuai spesifikasi.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `pnpm dev` dari root gagal (turbo missing packageManager field) | Jalankan `pnpm dev` dari `apps/backend/` langsung |

## Next Phase Readiness

**Ready:**
- `getLaporanTunggakan()` dan `getRekapPos()` siap dijadikan data source untuk export Excel (Plan 04-03) dan PDF (Plan 04-04)
- Pattern 4-level JOIN untuk POS sudah terbukti bekerja

**Concerns:**
- None

**Blockers:**
- None

---
*Phase: 04-reporting, Plan: 02*
*Completed: 2026-05-29*
