---
phase: 01-core-system
plan: 04
subsystem: api
tags: [nestjs, drizzle, rbac, jwt, students, enrollment, master-data, crud]

requires:
  - phase: 01-core-system plan 03
    provides: MasterModule, pola DTO→Service→Controller→Module, JwtGuard+RBAC global

provides:
  - CRUD API students (/api/master/students) dengan NIS auto-generate
  - Enrollment API student_classes (/api/master/student-classes)
  - Riwayat kelas siswa (GET /api/master/students/:id/classes)
  - Transfer kelas (PATCH /api/master/student-classes/:id/transfer)
  - StudentsModule + StudentClassesModule terdaftar di MasterModule

affects: [02-billing, 03-payments]

tech-stack:
  added: []
  patterns:
    - "NIS auto-generate: 3randomUppercase + ddmmyy(birthDate) + 2-digit entryYear"
    - "Retry 1x jika NIS collision (sangat jarang, 26^3 kombinasi)"
    - "UpdateStudentDto = PartialType(OmitType(CreateStudentDto, ['entryYear'])) — entryYear immutable"
    - "Cross-module inject: StudentsModule imports StudentClassesModule untuk GET /:id/classes"
    - "Transfer = UPDATE classId (bukan insert+deactivate) karena schema constraint"

key-files:
  created:
    - apps/backend/src/master/students/students.module.ts
    - apps/backend/src/master/students/students.service.ts
    - apps/backend/src/master/students/students.controller.ts
    - apps/backend/src/master/students/dto/create-student.dto.ts
    - apps/backend/src/master/students/dto/update-student.dto.ts
    - apps/backend/src/master/student-classes/student-classes.module.ts
    - apps/backend/src/master/student-classes/student-classes.service.ts
    - apps/backend/src/master/student-classes/student-classes.controller.ts
    - apps/backend/src/master/student-classes/dto/enroll-student.dto.ts
    - apps/backend/src/master/student-classes/dto/transfer-student.dto.ts
  modified:
    - apps/backend/src/master/master.module.ts

key-decisions:
  - "Transfer siswa = UPDATE classId pada enrollment yang ada — bukan insert+deactivate"
  - "StudentClassesModule exports StudentClassesService agar bisa di-inject di StudentsController"
  - "entryYear di-omit dari UpdateStudentDto — NIS bergantung pada entryYear, keduanya immutable"
  - "studentStatus tidak di-expose via PATCH — perlu use case tersendiri"

patterns-established:
  - "Cross-module service inject: ModuleA imports ModuleB, ModuleB exports ServiceB"
  - "NIS uniqueness: isUniqueViolation() + getUniqueField() dari pg error detail untuk distinguish nis vs nisn"
  - "Enrollment constraint: uq_student_school_year(studentId, schoolYearId) — satu row per siswa per tahun ajaran"

duration: ~1.5h
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T03:30:00Z
---

# Phase 01 Plan 04: Students & StudentClasses API Summary

**CRUD API siswa dengan NIS auto-generate dan enrollment management — semua terproteksi JWT + RBAC, 10 file baru konsisten dengan pola plan 01-03.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~1.5 jam |
| Started | 2026-05-29 |
| Completed | 2026-05-29 |
| Tasks | 2 completed |
| Files created | 10 |
| Files modified | 1 (master.module.ts) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Students CRUD | Pass | GET/POST/PATCH berfungsi, NIS 11 char auto-generated |
| AC-2: Enrollment berfungsi | Pass | POST /student-classes → 201, 409 saat duplikat |
| AC-3: Transfer kelas | Pass | UPDATE classId atomic, schoolYearId dipertahankan |
| AC-4: RBAC proteksi | Pass | 401 tanpa token, 404 saat FK invalid |

## Accomplishments

- 10 file baru: StudentsModule + StudentClassesModule lengkap
- NIS auto-generate sesuai format seed: `3randomChars + ddmmyy + 2-digit entryYear` (11 karakter)
- `GET /api/master/students` menyertakan `activeClassName`, `activeUnitName` dari LEFT JOIN
- `GET /api/master/students?school_unit_id=1` filter siswa per unit berjalan
- `GET /api/master/students/:id/classes` riwayat lengkap semua tahun ajaran
- Build TypeScript clean, semua verification checks pass

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/master/students/dto/create-student.dto.ts` | Created | Validasi create: name, gender, birthDate, parentName, registrationStatus, entryYear |
| `src/master/students/dto/update-student.dto.ts` | Created | PartialType(OmitType(..., ['entryYear'])) |
| `src/master/students/students.service.ts` | Created | NIS generate, CRUD dengan LEFT JOIN ke kelas aktif |
| `src/master/students/students.controller.ts` | Created | GET/POST/PATCH + GET /:id/classes |
| `src/master/students/students.module.ts` | Created | imports [StudentClassesModule] untuk cross-inject |
| `src/master/student-classes/dto/enroll-student.dto.ts` | Created | Validasi: studentId, classId, schoolYearId |
| `src/master/student-classes/dto/transfer-student.dto.ts` | Created | Validasi: classId tujuan |
| `src/master/student-classes/student-classes.service.ts` | Created | enroll, transfer (UPDATE), findByStudent |
| `src/master/student-classes/student-classes.controller.ts` | Created | POST enroll, PATCH /:id/transfer |
| `src/master/student-classes/student-classes.module.ts` | Created | exports [StudentClassesService] |
| `src/master/master.module.ts` | Modified | +StudentsModule, +StudentClassesModule |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Transfer = UPDATE classId (bukan insert+deactivate) | Schema constraint `uq_student_school_year(studentId, schoolYearId)` tanpa isActive melarang dua baris untuk kombinasi yang sama | Histori perpindahan kelas tidak tersimpan per-row — hanya state saat ini |
| StudentClassesModule di-export dan di-import oleh StudentsModule | GET /:id/classes perlu StudentClassesService di StudentsController | Pattern referensi untuk cross-module inject di masa depan |
| entryYear di-omit dari UpdateStudentDto | NIS mengandung entryYear — mengubah entryYear tanpa regenerate NIS akan inkonsisten | entryYear bersifat immutable setelah pendaftaran |
| studentStatus tidak di-update via PATCH | Perubahan status (aktif→lulus, dll) adalah event bisnis tersendiri yang akan melibatkan audit | Akan diimplementasi saat flow graduation/dropout tersedia |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Spec-to-schema mismatch pada transfer, fix lebih simpel |
| Scope additions | 0 | — |
| Deferred | 1 | Histori transfer tidak tersimpan |

### Auto-fixed Issues

**1. Transfer: insert+deactivate → UPDATE classId**
- **Found during:** Task 2 (StudentClassesAPI) — verify step
- **Issue:** Plan mendeskripsikan transfer sebagai "deactivate lama + insert baru". Namun schema constraint `uq_student_school_year(studentId, schoolYearId)` tanpa `isActive` membuat insert record baru untuk tahun ajaran yang sama menjadi impossible (unique violation).
- **Fix:** Transfer diimplementasi sebagai `UPDATE student_classes SET class_id = :classId WHERE id = :id` — atomically update classId tanpa transaksi yang diperlukan.
- **Files:** `student-classes.service.ts`
- **Verification:** PATCH /api/master/student-classes/41/transfer → 200, classId = 6 ✓

### Deferred Items

- Histori perpindahan kelas (audit trail transfer) tidak tersimpan di level baris — karena unique constraint, hanya state kelas aktif yang ada. Jika dibutuhkan, solusi: tambah kolom `previous_class_id` atau gunakan `audit_logs` yang akan diimplementasi di fase berikutnya.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Transfer gagal 500 karena unique constraint schema | Dianalisis, fix sebagai UPDATE classId — lebih simpel dan benar secara domain |

## Next Phase Readiness

**Ready:**
- Students dan student_classes tersedia sebagai FK untuk billing module (bills, bill_months)
- Pola cross-module inject (export+import) established untuk direplikasi
- NIS dan enrollment data dari seed sudah terverifikasi berfungsi dengan endpoint baru

**Concerns:**
- Transfer tidak menyimpan histori perpindahan kelas — jika dibutuhkan audit trail, perlu ditambahkan di `audit_logs` nanti
- `studentStatus` belum bisa diubah via API — perlu flow tersendiri untuk graduation/dropout

**Blockers:** None

---
*Phase: 01-core-system, Plan: 04*
*Completed: 2026-05-29*
