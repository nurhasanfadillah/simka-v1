---
phase: 01-core-system
plan: 03
subsystem: api
tags: [nestjs, drizzle, rbac, jwt, master-data, crud]

requires:
  - phase: 01-02
    provides: Auth module (JwtGuard, RequirePermissions decorator, permission seeds)

provides:
  - CRUD API school_units (/api/master/school-units)
  - CRUD API school_years (/api/master/school-years) + activate endpoint
  - CRUD API classes (/api/master/classes) dengan join ke school_units
  - MasterModule sebagai container semua master data resource

affects: [02-billing, 03-payments, 04-reporting]

tech-stack:
  added: []
  patterns:
    - "DTO → Service → Controller → Module per resource"
    - "PostgreSQL error code 23505 → ConflictException"
    - "Drizzle transaction untuk atomicity (school year activate)"
    - "JOIN di service layer, bukan lazy load"

key-files:
  created:
    - apps/backend/src/master/master.module.ts
    - apps/backend/src/master/school-units/school-units.{module,service,controller}.ts
    - apps/backend/src/master/school-units/dto/{create,update}-school-unit.dto.ts
    - apps/backend/src/master/school-years/school-years.{module,service,controller}.ts
    - apps/backend/src/master/school-years/dto/{create,update}-school-year.dto.ts
    - apps/backend/src/master/classes/classes.{module,service,controller}.ts
    - apps/backend/src/master/classes/dto/{create,update}-class.dto.ts
  modified:
    - apps/backend/src/app.module.ts

key-decisions:
  - "Route /:id/activate dideklarasi SEBELUM /:id di controller agar tidak tershadow"
  - "activate() menggunakan db.transaction() Drizzle — atomically set semua false, lalu aktifkan target"
  - "classes.findAll() selalu JOIN ke school_units — tidak ada lazy load"
  - "Tidak ada DELETE endpoint — master data immutable by design"
  - "isActive tidak bisa di-set via PATCH school_years — hanya melalui activate endpoint"

patterns-established:
  - "Master data pattern: DTO validation → Service (DB logic) → Controller (HTTP) → Module (wiring)"
  - "Unique constraint: tangkap PG error code 23505 → ConflictException dengan pesan Bahasa Indonesia"
  - "FK validation: query existence sebelum INSERT, bukan hanya rely on DB error"

duration: ~2h
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T23:59:00Z
---

# Phase 01 Plan 03: Master Data API Summary

**CRUD API lengkap untuk school_units, school_years, dan classes — semua terproteksi JWT + RBAC dengan pola konsisten, siap dikonsumsi frontend.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~2 jam |
| Started | 2026-05-29 |
| Completed | 2026-05-29 |
| Tasks | 3 completed |
| Files created | 16 |
| Files modified | 1 (app.module.ts) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: School Units CRUD | Pass | GET/POST/PATCH berfungsi, 409 saat code duplikat |
| AC-2: School Years CRUD + aktivasi | Pass | Activate menggunakan Drizzle transaction, atomically 1 aktif |
| AC-3: Classes CRUD + filter | Pass | GET dengan ?school_unit_id, join ke school_units |
| AC-4: RBAC proteksi semua endpoint | Pass | 401 tanpa token, 403 tanpa permission |

## Accomplishments

- 16 file dibuat mengimplementasi MasterModule dengan 3 resource (school-units, school-years, classes)
- School year activate bersifat atomic via Drizzle transaction
- Classes endpoint menyertakan `unit_name` dari join ke school_units tanpa lazy load
- Build TypeScript clean tanpa error

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/master/master.module.ts` | Created | Container module untuk semua master data |
| `src/master/school-units/school-units.module.ts` | Created | Module wiring school units |
| `src/master/school-units/school-units.service.ts` | Created | DB logic CRUD school units |
| `src/master/school-units/school-units.controller.ts` | Created | HTTP endpoints school units |
| `src/master/school-units/dto/create-school-unit.dto.ts` | Created | Validasi create: name, code (uppercase) |
| `src/master/school-units/dto/update-school-unit.dto.ts` | Created | PartialType dari CreateSchoolUnitDto |
| `src/master/school-years/school-years.module.ts` | Created | Module wiring school years |
| `src/master/school-years/school-years.service.ts` | Created | DB logic CRUD + activate (transaction) |
| `src/master/school-years/school-years.controller.ts` | Created | HTTP endpoints school years |
| `src/master/school-years/dto/create-school-year.dto.ts` | Created | Validasi: name, startYear, endYear |
| `src/master/school-years/dto/update-school-year.dto.ts` | Created | PartialType dari CreateSchoolYearDto |
| `src/master/classes/classes.module.ts` | Created | Module wiring classes |
| `src/master/classes/classes.service.ts` | Created | DB logic CRUD + JOIN ke school_units |
| `src/master/classes/classes.controller.ts` | Created | HTTP endpoints classes |
| `src/master/classes/dto/create-class.dto.ts` | Created | Validasi: schoolUnitId, name, level (1-12) |
| `src/master/classes/dto/update-class.dto.ts` | Created | PartialType dari CreateClassDto |
| `src/app.module.ts` | Modified | MasterModule ditambahkan ke imports |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Route `/:id/activate` sebelum `/:id` | NestJS route matching order — jika `/:id` dulu, `/activate` akan ter-capture sebagai id | Semua controller school-years mengikuti pola ini |
| Drizzle transaction untuk activate | Atomicity wajib — tidak boleh ada state di mana 0 atau 2 tahun ajaran aktif | Pattern reference untuk operasi atomic lainnya |
| FK validation explicit | Query school unit sebelum insert class — pesan error lebih informatif dari DB constraint error | Semua FK referensi wajib divalidasi di service |
| Tidak ada DELETE endpoint | Master data immutable — hapus data finansial berbahaya | Semua master data resource mengikuti pola ini |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 0 | - |
| Scope additions | 0 | - |
| Deferred | 1 | Dicatat sebagai concern |

### Deferred Items

- Validasi pindah school unit di PATCH classes jika ada siswa aktif (`studentClasses`) — belum ada tabel students saat ini, akan ditambahkan di plan berikutnya ketika students module tersedia.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Tidak ada | Eksekusi sesuai plan |

## Next Phase Readiness

**Ready:**
- MasterModule siap sebagai dependency untuk billing dan payment modules
- Pola DTO → Service → Controller → Module sudah established dan bisa direplikasi
- Permission codes `school_unit.*`, `school_year.*`, `class.*` sudah dipakai dan terverifikasi

**Concerns:**
- Validasi pindah kelas siswa (update `schoolUnitId` pada classes) belum ada — perlu ditambahkan saat students module tersedia
- Tidak ada pagination — jika data master tumbuh besar, perlu dipertimbangkan

**Blockers:** None

---
*Phase: 01-core-system, Plan: 03*
*Completed: 2026-05-29*
