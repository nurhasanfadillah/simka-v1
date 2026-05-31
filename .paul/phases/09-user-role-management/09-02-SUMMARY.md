---
phase: 09-user-role-management
plan: 02
subsystem: auth
tags: [nestjs, roles, permissions, rbac, drizzle, atomic]

requires:
  - phase: 09-01
    provides: UsersService pattern, AuthModule structure, dto conventions
  - phase: 01-core-system
    provides: roles/permissions/rolePermissions schema, DRIZZLE injection token

provides:
  - Roles CRUD endpoints (list/create/update) dengan RBAC
  - assignPermissions endpoint — atomic replace rolePermissions
  - RolesService injectable untuk fase berikutnya (10-admin-ui)

affects: [10-admin-ui]

tech-stack:
  added: []
  patterns:
    - JS-side groupBy untuk flat LEFT JOIN → nested array (roles + permissions)
    - db.transaction() untuk atomic delete + insert di rolePermissions

key-files:
  created:
    - apps/backend/src/auth/dto/role.dto.ts
    - apps/backend/src/auth/roles.service.ts
    - apps/backend/src/auth/roles.controller.ts
  modified:
    - apps/backend/src/auth/auth.module.ts

key-decisions:
  - "JS groupBy (Map) untuk nested permissions — Drizzle tidak support array_agg"
  - "Route :id/permissions sebelum :id — NestJS literal route harus mendahului param route"
  - "assignPermissions: delete-all + insert-new dalam satu tx — bukan diff/patch"

patterns-established:
  - "Service baru di AuthModule: inject DRIZZLE saja, tidak perlu Redis"
  - "findAll() dengan LEFT JOIN + JS groupBy — pola reusable untuk relasi 1-to-many"

duration: ~10min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 09 Plan 02: Roles CRUD + Assign Permissions Summary

**Roles CRUD backend (GET/POST/PATCH /roles) + PATCH /roles/:id/permissions dengan atomic replace, dilindungi JWT + RBAC, dibangun dalam AuthModule.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 min |
| Tasks | 2 completed |
| Files modified | 4 (3 created, 1 modified) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: List Roles | Pass | GET /roles → array { id, name, createdAt, permissions: [{id, code, name}] } |
| AC-2: Create Role | Pass | POST /roles → ConflictException jika duplikat, return dengan permissions: [] |
| AC-3: Update Role | Pass | PATCH /roles/:id → NotFoundException jika tidak ada |
| AC-4: Assign Permissions | Pass | PATCH /roles/:id/permissions → atomic delete+insert dalam db.transaction() |

## Accomplishments

- 4 endpoint baru terdaftar dan dilindungi RBAC (role.view / role.manage)
- assignPermissions atomik — tidak ada race condition antara delete dan insert
- Route order benar: `:id/permissions` sebelum `:id` di controller
- TypeScript 0 errors, build clean

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/auth/dto/role.dto.ts` | Created | CreateRoleDto, UpdateRoleDto, AssignPermissionsDto |
| `apps/backend/src/auth/roles.service.ts` | Created | findAll (JS groupBy), create, update, assignPermissions, findRoleWithPermissions |
| `apps/backend/src/auth/roles.controller.ts` | Created | GET/POST/PATCH /roles, PATCH /roles/:id/permissions |
| `apps/backend/src/auth/auth.module.ts` | Modified | Register RolesService + RolesController |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| JS Map groupBy untuk nested permissions | Drizzle node-postgres tidak support array_agg SQL — flat JOIN + group di TypeScript lebih maintainable | findAll() return format bersih, no raw SQL |
| Atomic replace (delete-all + insert) | Paling sederhana dan aman untuk permission assignment — tidak perlu diff | Idempoten: PATCH dua kali dengan input sama = hasil sama |
| Route `:id/permissions` sebelum `:id` | NestJS routing: literal segment `permissions` harus mendahului wildcard param | Mencegah `/roles/1/permissions` match ke PATCH `:id` |

## Deviations from Plan

Tidak ada — plan dieksekusi persis sesuai spec.

## Issues Encountered

Tidak ada.

## Next Phase Readiness

**Ready:**
- Backend Phase 09 complete: Users + Roles + Permissions management API tersedia
- RolesService + UsersService siap di-consume oleh Phase 10 (Admin UI)
- Semua permission codes (user.view, user.manage, role.view, role.manage) sudah ada di seed

**Concerns:**
- GET /roles response menyertakan seluruh permissions setiap call — untuk jumlah role/permission skala sekolah (< 10 roles, < 30 permissions) ini tidak masalah

**Blockers:**
- None

---
*Phase: 09-user-role-management, Plan: 02*
*Completed: 2026-05-30*
