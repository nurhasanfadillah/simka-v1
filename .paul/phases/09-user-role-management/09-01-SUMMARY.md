---
phase: 09-user-role-management
plan: 01
subsystem: auth
tags: [nestjs, users, crud, rbac, bcrypt, drizzle]

requires:
  - phase: 05-auth-layout-dashboard
    provides: JWT auth module, guards, decorators (JwtAuthGuard, RbacGuard, RequirePermissions, CurrentUser)
  - phase: 01-core-system
    provides: Drizzle ORM setup, DB injection token, users/roles schema

provides:
  - Users CRUD endpoints (list/create/update) dengan RBAC
  - Self-service change-password endpoint
  - UsersService injectable untuk fase berikutnya

affects: [10-admin-ui, 09-02-roles]

tech-stack:
  added: []
  patterns: [UsersService pattern untuk controller injection across AuthModule]

key-files:
  created:
    - apps/backend/src/auth/dto/user.dto.ts
    - apps/backend/src/auth/users.service.ts
    - apps/backend/src/auth/users.controller.ts
  modified:
    - apps/backend/src/auth/auth.controller.ts
    - apps/backend/src/auth/auth.module.ts

key-decisions:
  - "@UseGuards dihapus dari UsersController — APP_GUARD global sudah menangani semua route"
  - "UsersService di-inject ke AuthController untuk change-password, bukan service baru"

patterns-established:
  - "Service baru ditambah ke AuthModule (bukan module baru) sesuai scope limits plan"
  - "DTO fields pakai ! (definite assignment) sesuai tsconfig strict mode project"

duration: ~15min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 09 Plan 01: Users CRUD + Change Password Summary

**Users CRUD backend (GET/POST/PATCH /users) + PATCH /auth/change-password dilindungi JWT + RBAC, dibangun dalam AuthModule yang ada.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15 min |
| Tasks | 2 completed |
| Files modified | 5 (2 created, 3 modified) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: List Users | Pass | GET /users → array dengan id, name, email, roleName, isActive, lastLogin, createdAt |
| AC-2: Create User | Pass | POST /users → bcrypt(10) hash, ConflictException jika email duplikat |
| AC-3: Update User | Pass | PATCH /users/:id → partial update, NotFoundException jika tidak ada |
| AC-4: Change Password | Pass | PATCH /auth/change-password → compare + hash, BadRequestException jika salah |

## Accomplishments

- 4 endpoint baru terdaftar dan dilindungi RBAC (user.view / user.manage)
- Password tidak pernah di-expose di response manapun
- TypeScript 0 errors, build clean

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/auth/dto/user.dto.ts` | Created | CreateUserDto, UpdateUserDto, ChangePasswordDto |
| `apps/backend/src/auth/users.service.ts` | Created | findAll, create, update, changePassword |
| `apps/backend/src/auth/users.controller.ts` | Created | GET/POST/PATCH /users dengan @RequirePermissions |
| `apps/backend/src/auth/auth.controller.ts` | Modified | Tambah PATCH /auth/change-password + inject UsersService |
| `apps/backend/src/auth/auth.module.ts` | Modified | Register UsersService + UsersController |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Hapus @UseGuards dari UsersController | JwtAuthGuard + RbacGuard sudah APP_GUARD global — menambah lagi redundant dan inconsistent | Konsisten dengan pattern seluruh codebase |
| Inject UsersService ke AuthController | change-password logis di auth controller, tapi butuh UsersService — inject langsung lebih sederhana dari service baru | UsersService reusable di 09-02 juga |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Minor — tidak ada impact fungsional |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Satu penyesuaian minor, zero scope creep.

### Auto-fixed Issues

**1. DTO definite assignment**
- **Found during:** Task 1 (DTOs)
- **Issue:** TypeScript strict mode menolak class properties tanpa `!` — `name: string` → error TS2564
- **Fix:** Tambah `!` ke semua required fields (`name!`, `email!`, dll.) sesuai pola `login.dto.ts`
- **Verification:** `tsc --noEmit` → 0 errors

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| TS2564 strict property initialization di DTO | Ganti ke `!` (definite assignment) sesuai pola existing login.dto.ts |

## Next Phase Readiness

**Ready:**
- UsersService tersedia untuk di-inject di plan 09-02 (Roles CRUD)
- Pattern AuthModule sudah terbukti — cukup tambah RolesService + RolesController
- Permissions 'user.view' dan 'user.manage' sudah ada di seed, tidak perlu migration

**Concerns:**
- Tidak ada

**Blockers:**
- None

---
*Phase: 09-user-role-management, Plan: 01*
*Completed: 2026-05-30*
