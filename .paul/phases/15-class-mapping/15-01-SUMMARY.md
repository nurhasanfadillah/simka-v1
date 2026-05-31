---
phase: 15-class-mapping
plan: 01
subsystem: api
tags: [nestjs, drizzle, student-classes, master-data]

requires:
  - phase: 01-core-system
    provides: student_classes schema, students schema, RBAC guards

provides:
  - GET /master/student-classes?classId&schoolYearId — daftar siswa di kelas
  - GET /master/students/mapping?schoolYearId&excludeClassId — siswa tersedia untuk mapping
  - DELETE /master/student-classes/:id — lepas siswa dari kelas

affects: [15-02-class-mapping-frontend]

tech-stack:
  added: []
  patterns: [literal-route-before-param (Decision #48), hard-delete-for-constraint-release (Decision #47)]

key-files:
  created: []
  modified:
    - apps/backend/src/master/student-classes/student-classes.service.ts
    - apps/backend/src/master/student-classes/student-classes.controller.ts
    - apps/backend/src/master/students/students.service.ts
    - apps/backend/src/master/students/students.controller.ts

key-decisions:
  - "Hard delete enrollment (bukan soft) agar unique constraint (studentId, schoolYearId) bisa dipakai ulang"
  - "GET /mapping sebelum GET /:id di StudentsController — NestJS literal route ordering"

patterns-established:
  - "findByClass: INNER JOIN students ON studentClasses — returns enrollmentId untuk dipakai frontend"
  - "findAvailableForMapping: LEFT JOIN studentClasses ON schoolYearId — enrollmentId null = belum enrolled"

duration: ~15min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 15 Plan 01: Backend Mapping Endpoints Summary

**3 endpoint backend baru untuk class mapping: GET class members, GET available students dengan enrollment info, DELETE unenroll.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15 min |
| Tasks | 3/3 completed |
| Files modified | 4 |
| Build errors | 0 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: GET siswa di kelas | Pass | `findByClass()` mengembalikan `{ enrollmentId, studentId, nis, name, gender }[]` |
| AC-2: GET siswa tersedia untuk mapping | Pass | `findAvailableForMapping()` mengembalikan siswa aktif di luar kelas target, dengan `enrollmentId` nullable |
| AC-3: DELETE lepas siswa dari kelas | Pass | Hard delete, 404 jika tidak ditemukan |
| AC-4: Validasi query params wajib | Pass | 400 BadRequestException jika classId/schoolYearId atau schoolYearId/excludeClassId hilang |

## Accomplishments

- `GET /master/student-classes?classId=X&schoolYearId=Y` — class roster endpoint dengan INNER JOIN students
- `GET /master/students/mapping?schoolYearId=X&excludeClassId=Y` — available students dengan LEFT JOIN enrollment (enrollmentId null jika belum enrolled — frontend butuh ini untuk decide enroll vs transfer)
- `DELETE /master/student-classes/:id` — hard delete agar unique constraint terlepas untuk re-enrollment

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `student-classes.service.ts` | Modified | +`findByClass()`, +`remove()` |
| `student-classes.controller.ts` | Modified | +`GET /` dengan 400 validation, +`DELETE /:id` |
| `students.service.ts` | Modified | +`findAvailableForMapping()` dengan LEFT JOIN schoolYearId-scoped |
| `students.controller.ts` | Modified | +`GET /mapping` (sebelum `/:id`), +BadRequestException import |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Hard delete di `remove()` | Unique constraint `(studentId, schoolYearId)` harus bebas agar siswa bisa dienroll ulang ke kelas berbeda | Tidak ada soft-delete trail untuk lepas kelas |
| `GET /mapping` sebelum `GET /:id` | NestJS routing: literal path harus mendahului param wildcard (pattern Decision #20/#27) | `GET /mapping` tidak pernah di-intercept sebagai `/:id` |

## Deviations from Plan

None — semua task selesai persis sesuai spec. Tidak ada breaking change pada endpoint/method yang sudah ada.

## Next Phase Readiness

**Ready:**
- Semua 3 endpoint siap dikonsumsi Plan 15-02 (frontend)
- Response shape sudah sesuai dengan tipe yang akan didefinisikan di `types/master.ts`
- `enrollmentId` nullable memungkinkan frontend membedakan enroll baru vs transfer

**Concerns:**
- None

**Blockers:**
- None — Plan 15-02 dapat langsung dimulai

---
*Phase: 15-class-mapping, Plan: 01*
*Completed: 2026-05-30*
