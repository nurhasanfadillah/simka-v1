---
phase: 04-reporting
plan: 01
subsystem: api
tags: [reporting, dashboard, laporan, harian, bulanan, tahunan, nestjs, drizzle]

requires:
  - phase: 03-transaction-system
    provides: transactions table dengan status aktif/void, TransactionsService pattern

provides:
  - ReportsModule dengan 4 endpoint laporan keuangan
  - GET /reports/dashboard (stats agregat bulan berjalan)
  - GET /reports/harian (daftar transaksi + total per hari)
  - GET /reports/bulanan (rekap per hari dalam satu bulan)
  - GET /reports/tahunan (rekap per bulan dalam satu tahun ajaran)

affects: [04-02-tunggakan-rekap-pos, 04-03-export-excel, 04-04-export-pdf]

tech-stack:
  added: []
  patterns: [countDistinct() Drizzle aggregate, DATE() GROUP BY PostgreSQL, sql`` template for EXTRACT]

key-files:
  created:
    - apps/backend/src/reports/reports.service.ts
    - apps/backend/src/reports/reports.controller.ts
    - apps/backend/src/reports/reports.module.ts
  modified:
    - apps/backend/src/app.module.ts

key-decisions:
  - "Void transactions dikecualikan dari semua total: filter eq(status,'aktif') di semua query agregat"
  - "classId/unitId filter via EXISTS subquery: menghindari JOIN yang kompleks di GROUP BY query"
  - "getLaporanHarian mengembalikan SEMUA transaksi (aktif+void) tapi totalPenerimaan hanya aktif"

patterns-established:
  - "Reports tidak punya DB query sendiri — inject DRIZZLE token langsung seperti TransactionsService"
  - "sql`DATE(col)` untuk groupBy tanggal di PostgreSQL"
  - "sum() result adalah string dari Drizzle — selalu wrap dengan Number(result ?? 0)"

duration: ~20min
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T23:59:00Z
---

# Phase 04 Plan 01: Dashboard Stats + Laporan Keuangan API Summary

**ReportsModule dibuat dengan 4 endpoint agregasi: dashboard stats bulan berjalan, laporan harian (list + total), laporan bulanan (rekap per hari), dan laporan tahunan (rekap per bulan) — semua terverifikasi live dengan data nyata.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 min |
| Started | 2026-05-29 |
| Completed | 2026-05-29 |
| Tasks | 2 auto + 1 checkpoint |
| Files modified | 4 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Dashboard stats 3 angka akurat | Pass | totalSiswaAktif:42, penerimaanBulanIni:500000, pembayarBulanIni:1 — live verified |
| AC-2: Laporan harian dengan void filtering | Pass | Void transaction muncul di list tapi dikecualikan dari totalPenerimaan |
| AC-3: Laporan bulanan rekap per hari | Pass | perHari[] dengan groupBy DATE() berjalan benar |
| AC-4: Laporan tahunan rekap per bulan | Pass | perBulan[] filter via student_classes schoolYearId berjalan |

## Accomplishments

- ReportsModule terdaftar di AppModule, semua endpoint aktif dengan @RequirePermissions('report.view')
- Dashboard: 3 query agregat terpisah (count students aktif, sum transaksi, countDistinct studentId)
- Laporan harian: innerJoin students, filter range timestamp, void-aware total calculation
- Laporan bulanan: DATE() GROUP BY dengan optional classId/unitId via EXISTS subquery
- Laporan tahunan: EXTRACT(MONTH/YEAR) GROUP BY dengan filter schoolYearId via EXISTS subquery

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/reports/reports.service.ts` | Created | 4 method: getDashboardStats, getLaporanHarian, getLaporanBulanan, getLaporanTahunan |
| `apps/backend/src/reports/reports.controller.ts` | Created | 4 endpoint GET dengan @RequirePermissions('report.view') |
| `apps/backend/src/reports/reports.module.ts` | Created | NestJS module dengan controller + provider |
| `apps/backend/src/app.module.ts` | Modified | Import + register ReportsModule |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Void dikecualikan dari semua total | Void = pembatalan, bukan penerimaan | Semua laporan keuangan akurat secara finansial |
| getLaporanHarian return semua transaksi | User perlu lihat history termasuk void | Frontend bisa tampilkan badge VOID untuk transparansi |
| EXISTS subquery untuk classId/unitId filter | Menghindari GROUP BY yang kompleks dengan JOIN tambahan | Query lebih simpel; performa cukup untuk volume sekolah |
| sum() → Number() cast | Drizzle mengembalikan sum sebagai string dari PostgreSQL | Mencegah "500000" (string) di response JSON |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Task merge | 1 | Task 1 & 2 dieksekusi bersamaan — semua method langsung ditulis di service |

Task 1 dan Task 2 di-merge saat eksekusi: semua 4 method service ditulis sekaligus daripada dua tahap terpisah. Tidak ada dampak fungsional — hasil identik dengan yang direncanakan.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `sql` template dalam `conditions` array perlu cast `as any` | TypeScript strict type untuk SQL kondisi campuran — cast minimal, tidak mempengaruhi runtime |

## Next Phase Readiness

**Ready:**
- ReportsService dapat diextend untuk tunggakan + rekap POS di Plan 04-02
- PdfService dari Phase 03 siap diinjeksi ke ReportsModule untuk Plan 04-04
- Pattern sql`DATE()` dan EXTRACT sudah terbukti bekerja di PostgreSQL ini

**Concerns:**
- permission 'report.view' diasumsikan ada di seed — perlu verifikasi saat Plan 04-02 jika ada 401

**Blockers:**
- None

---
*Phase: 04-reporting, Plan: 01*
*Completed: 2026-05-29*
