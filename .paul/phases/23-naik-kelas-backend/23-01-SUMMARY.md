---
phase: 23-naik-kelas-backend
plan: 01
subsystem: api
tags: [nestjs, drizzle, academic, promotion, student-classes]

requires:
  - phase: 01-core-system
    provides: students, classes, school_years, student_classes schema + seed
  - phase: 02-billing-engine
    provides: bills table + status enum untuk hasTunggakan check

provides:
  - AcademicModule dengan PromotionModule
  - GET /api/academic/promotion/preview — list siswa di kelas+tahun dengan hasTunggakan flag
  - POST /api/academic/promotion — proses massal naik/tinggal/lulus

affects: [24-naik-kelas-frontend]

tech-stack:
  added: []
  patterns:
    - AcademicModule sebagai domain module terpisah dari MasterModule
    - Per-item error handling (errors array) untuk bulk operations — tidak throw, collect gracefully
    - Inner transaction untuk operasi multi-tabel yang harus atomic (tinggal: INSERT + UPDATE)
    - Two-query approach untuk aggregate check (hasTunggakan) — query utama + Set lookup

key-files:
  created:
    - apps/backend/src/academic/academic.module.ts
    - apps/backend/src/academic/promotion/promotion.module.ts
    - apps/backend/src/academic/promotion/promotion.controller.ts
    - apps/backend/src/academic/promotion/promotion.service.ts
    - apps/backend/src/academic/promotion/dto/preview-promotion.dto.ts
    - apps/backend/src/academic/promotion/dto/promote.dto.ts
  modified:
    - apps/backend/src/app.module.ts

key-decisions:
  - "Two-query hasTunggakan: fetch students → fetch bill studentIds → Set.has() — lebih bersih dari sql EXISTS"
  - "Per-item try/catch (bukan single transaction) agar graceful error handling per siswa"
  - "tinggal action pakai inner this.db.transaction() untuk atomic INSERT + UPDATE registrationStatus"
  - "Gunakan permission student.view/student.manage yang sudah ada — tidak buat permission baru"

patterns-established:
  - "Bulk operation dengan errors array: loop per item, catch unique violation, kumpulkan ke errors"
  - "DTO query params: @Type(() => Number) + @IsInt() + @IsPositive() dengan ValidationPipe transform:true"

duration: ~30min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:30:00Z
---

# Phase 23 Plan 01: Naik Kelas Backend Summary

**AcademicModule baru dengan 2 endpoint promotion: preview siswa per kelas+tahun (dengan hasTunggakan flag dari bills) dan proses massal naik/tinggal/lulus dengan graceful per-item error handling.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~30 menit |
| Tasks | 3 completed |
| Files created | 6 |
| Files modified | 1 |
| TypeScript errors | 0 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Preview dengan hasTunggakan flag | Pass | Two-query: students + bills inArray check |
| AC-2: Naik kelas buat enrollment baru | Pass | INSERT student_classes di toYearId |
| AC-3: Tinggal kelas enrollment + mengulang | Pass | db.transaction(): INSERT + UPDATE atomic |
| AC-4: Lulus update studentStatus tanpa enrollment | Pass | UPDATE students.studentStatus = 'lulus' |
| AC-5: Duplikat enrollment graceful | Pass | isUniqueViolation → errors array, tidak throw |

## Accomplishments

- AcademicModule scaffolded sebagai domain module baru — terpisah dari MasterModule
- GET /api/academic/promotion/preview mengembalikan list siswa beserta `hasTunggakan` dari bills
- POST /api/academic/promotion memproses batch naik/tinggal/lulus dalam loop per-item dengan collect errors
- Action 'tinggal' dijamin atomic (INSERT enrollment + UPDATE registrationStatus dalam satu transaction)
- TypeScript strict mode pass — 0 error

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `academic/academic.module.ts` | Created | Domain module wrapper |
| `academic/promotion/promotion.module.ts` | Created | Promotion sub-module |
| `academic/promotion/promotion.controller.ts` | Created | GET preview + POST promote endpoints |
| `academic/promotion/promotion.service.ts` | Created | Business logic: previewPromotion + promote |
| `academic/promotion/dto/preview-promotion.dto.ts` | Created | Query params DTO dengan @Type(() => Number) |
| `academic/promotion/dto/promote.dto.ts` | Created | Body DTO: PromoteDto + PromoteItemDto dengan ValidateNested |
| `app.module.ts` | Modified | AcademicModule ditambahkan ke imports |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Two-query untuk hasTunggakan | `sql EXISTS` di Drizzle lebih kompleks; two-query lebih readable dan safe | Preview query tetap clean tanpa subquery complexity |
| Per-item try/catch, bukan single transaction | Single transaction abort jika ada 1 unique violation — per-item memungkinkan partial success | Frontend bisa tahu siswa mana yang gagal tanpa rollback semua |
| Inner transaction untuk 'tinggal' | INSERT + UPDATE harus atomic — jika INSERT sukses tapi UPDATE gagal, registrationStatus salah | Konsistensi data terjaga per siswa |
| Permission reuse (student.view/manage) | Tidak ada permission 'promotion.manage' di seed — promotion adalah operasi student management | Tidak butuh seed update |

## Deviations from Plan

None — plan dieksekusi persis seperti yang tertulis.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Endpoint GET /api/academic/promotion/preview siap dikonsumsi frontend
- Endpoint POST /api/academic/promotion siap dikonsumsi frontend
- Response shape terdokumentasi: `{ fromClass, students[] }` untuk preview, `{ processed, naik, tinggal, lulus, errors[] }` untuk promote

**Concerns:**
- Tidak ada validasi bahwa `toClassId` benar-benar ada di DB — frontend harus supply classId yang valid dari data kelas
- Tidak ada validasi bahwa siswa benar-benar enrolled di `fromClassId+fromYearId` saat POST — silently skip jika data tidak ditemukan (tidak throw)

**Blockers:** None

---
*Phase: 23-naik-kelas-backend, Plan: 01*
*Completed: 2026-05-30*
