---
phase: 14-unit-class-count
plan: 01
subsystem: ui
tags: [nestjs, react, drizzle, school-units, count]

provides:
  - classCount field di GET /master/school-units
  - Kolom "Jumlah Kelas" di tabel Unit Sekolah

key-files:
  modified:
    - apps/backend/src/master/school-units/school-units.service.ts
    - apps/frontend/src/types/master.ts
    - apps/frontend/src/pages/master/kelas/index.tsx

key-decisions:
  - "LEFT JOIN + groupBy di findAll() — unit tanpa kelas tetap muncul dengan count 0"

duration: ~5min
completed: 2026-05-30T00:00:00Z
---

# Phase 14 Plan 01: Unit Class Count — Summary

**Tambah field `classCount` di response GET /master/school-units dan kolom "Jumlah Kelas" di tabel Unit Sekolah.**

## Acceptance Criteria Results

| Criterion | Status |
|-----------|--------|
| AC-1: Jumlah kelas tampil di tabel | Pass |

## Files Created/Modified

| File | Change |
|------|--------|
| `apps/backend/src/master/school-units/school-units.service.ts` | Modified `findAll()` — LEFT JOIN + count + groupBy |
| `apps/frontend/src/types/master.ts` | Tambah `classCount: number` ke SchoolUnit |
| `apps/frontend/src/pages/master/kelas/index.tsx` | Tambah kolom "Jumlah Kelas" + update colSpan skeleton |

## Deviations
None.

---
*Completed: 2026-05-30*
