---
phase: 18-kelas-enhancements
plan: 01
subsystem: ui
tags: [react, nestjs, drizzle, sql, dialog, kelas, mapping]

requires:
  - phase: 17-mapping-kelas
    provides: ClassMember type, student-classes endpoint, mapping.tsx base implementation

provides:
  - studentCount field di GET /master/classes (filter per tahun pelajaran)
  - Modal daftar siswa saat baris kelas diklik dengan filter tahun
  - Dialog konfirmasi sebelum aksi Lepas siswa di mapping

affects: [laporan, dashboard jika menampilkan ringkasan kelas]

tech-stack:
  added: []
  patterns:
    - SQL correlated subquery via drizzle sql`` template untuk aggregate field
    - Promise.all untuk parallel fetch (school-years + school-units) on mount
    - e.stopPropagation() untuk isolasi click event di tabel dengan row-click

key-files:
  created: []
  modified:
    - apps/backend/src/master/classes/classes.service.ts
    - apps/frontend/src/types/master.ts
    - apps/frontend/src/pages/master/kelas/index.tsx
    - apps/frontend/src/pages/master/kelas/mapping.tsx

key-decisions:
  - "DialogDescription asChild wrapping div — menghindari hydration warning dari Select nested di p"

patterns-established:
  - "Correlated subquery di Drizzle: sql`(SELECT COUNT(*)::int FROM tbl WHERE col = ${ref})`"

duration: ~20min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 18 Plan 01: Kelas Enhancements Summary

**Tambah kolom jumlah siswa (filter tahun aktif) + modal daftar siswa di tab Kelas, dan dialog konfirmasi Lepas siswa di Mapping Kelas.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 menit |
| Started | 2026-05-30 |
| Completed | 2026-05-30 |
| Tasks | 3 completed |
| Files modified | 4 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Kolom Jumlah Siswa tampil di tab Kelas | Pass | studentCount dari backend, filter schoolYearId aktif |
| AC-2: Klik baris kelas membuka daftar siswa | Pass | Dialog dengan Select filter tahun pelajaran |
| AC-3: Konfirmasi sebelum Lepas siswa di mapping | Pass | Dialog dengan nama siswa + nama kelas, Batal/Lepas |

## Accomplishments

- Backend `GET /master/classes` kini mengembalikan `studentCount` via correlated subquery — dapat difilter per `schoolYearId`
- Tab Kelas: kolom Jumlah Siswa, baris clickable buka modal daftar siswa NIS/Nama/JK, filter tahun pelajaran di modal
- Mapping Kelas: tombol Lepas tidak langsung delete — konfirmasi Dialog terlebih dahulu

## Task Commits

Tidak ada atomic commits (langsung dieksekusi tanpa commit per task).

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/master/classes/classes.service.ts` | Modified | Import `sql`, findAll terima `schoolYearId`, tambah correlated subquery studentCount |
| `apps/frontend/src/types/master.ts` | Modified | Tambah `studentCount?: number` ke interface Class |
| `apps/frontend/src/pages/master/kelas/index.tsx` | Modified | Fetch school years, state siswa, header + row clickable, Dialog daftar siswa |
| `apps/frontend/src/pages/master/kelas/mapping.tsx` | Modified | lepasTarget state, executeLepas, Dialog konfirmasi Lepas |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `DialogDescription asChild` wrapping `<div>` | Select component tidak valid di dalam `<p>` (default DialogDescription) — asChild render sebagai div | Menghindari React DOM warning |
| Controller tidak diubah | `classes.controller.ts` sudah memiliki `schoolYearId` query param dari sesi sebelumnya | Tidak ada perubahan controller |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Tidak berdampak pada scope |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Minor fix DOM warning, no scope creep.

### Auto-fixed Issues

**1. Unused import `DialogFooter` di kelas/index.tsx**
- **Found during:** Qualify Task 2 (TypeScript check)
- **Issue:** `DialogFooter` diimport tapi tidak digunakan — TS6133 error
- **Fix:** Hapus `DialogFooter` dari import list
- **Files:** `apps/frontend/src/pages/master/kelas/index.tsx`
- **Verification:** `npx tsc --noEmit` clean

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| TypeScript error TS6133: DialogFooter declared but never read | Dihapus dari import — tidak dibutuhkan di index.tsx |

## Next Phase Readiness

**Ready:**
- Backend studentCount tersedia untuk digunakan di fitur lain (dashboard, laporan)
- Pattern correlated subquery Drizzle sudah established, bisa direplikasi

**Concerns:**
- Tidak ada

**Blockers:**
- None

---
*Phase: 18-kelas-enhancements, Plan: 01*
*Completed: 2026-05-30*
