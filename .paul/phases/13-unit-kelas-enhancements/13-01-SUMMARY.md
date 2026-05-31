---
phase: 13-unit-kelas-enhancements
plan: 01
subsystem: api
tags: [nestjs, drizzle, school-units, classes, crud]

requires:
  - phase: 01-core-system
    provides: school-units dan classes endpoint yang sudah ada

provides:
  - DELETE /master/school-units/:id dengan guard (cek classes)
  - DELETE /master/classes/:id dengan guard (cek studentClasses + paymentTemplates)

affects:
  - 13-02 (frontend plan berikutnya)

tech-stack:
  added: []
  patterns:
    - "Guard-before-delete via count query — sama dengan pattern di phase 12"

key-files:
  modified:
    - apps/backend/src/master/school-units/school-units.service.ts
    - apps/backend/src/master/school-units/school-units.controller.ts
    - apps/backend/src/master/classes/classes.service.ts
    - apps/backend/src/master/classes/classes.controller.ts

key-decisions:
  - "Reuse school_unit.update dan class.update permission untuk delete"
  - "Guard kelas: cek studentClasses + paymentTemplates (bukan bills — bills tidak langsung punya classId)"

duration: ~10min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 13 Plan 01: Backend DELETE endpoints — Summary

**Tambah DELETE endpoint dengan guard relasi untuk school-units (cek classes) dan classes (cek studentClasses + paymentTemplates).**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 menit |
| Tasks | 2/2 completed |
| Files modified | 4 |
| TypeScript errors | 0 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Hapus unit sekolah tanpa kelas | Pass | 204 No Content |
| AC-2: Tolak hapus unit sekolah jika ada kelas | Pass | 400 + pesan deskriptif |
| AC-3: Hapus kelas tanpa data terkait | Pass | 204 No Content |
| AC-4: Tolak hapus kelas jika ada data terkait | Pass | 400 + pesan deskriptif |

## Accomplishments

- Guard unit sekolah: single count query dari tabel `classes`
- Guard kelas: `Promise.all` paralel dari `studentClasses` + `paymentTemplates`
- Konsisten dengan pattern guard-before-delete dari phase 12

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/master/school-units/school-units.service.ts` | Modified | Tambah `remove()` dengan guard classes count |
| `apps/backend/src/master/school-units/school-units.controller.ts` | Modified | Tambah `@Delete(':id')` endpoint |
| `apps/backend/src/master/classes/classes.service.ts` | Modified | Tambah `remove()` dengan guard studentClasses + paymentTemplates |
| `apps/backend/src/master/classes/classes.controller.ts` | Modified | Tambah `@Delete(':id')` endpoint |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Guard kelas cek paymentTemplates bukan bills | bills tidak punya classId langsung; paymentTemplates punya classId | Proteksi lebih tepat sasaran |
| Reuse existing permissions | Tidak perlu permission baru untuk delete | Operator dengan hak update bisa hapus |

## Deviations from Plan

None — plan dieksekusi persis sesuai spesifikasi.

## Next Phase Readiness

**Ready:**
- Backend siap melayani DELETE dari frontend (plan 13-02)
- Pattern guard konsisten — frontend bisa tampilkan error dari 400 response

**Blockers:** None.

---
*Phase: 13-unit-kelas-enhancements, Plan: 01*
*Completed: 2026-05-30*
