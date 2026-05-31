---
phase: 01-core-system
plan: 02
subsystem: auth
tags: [jwt, redis, passport, nestjs, bcrypt, rbac, guards]

requires:
  - phase: 01-core-system plan 01
    provides: users/roles/permissions schema, DatabaseModule global, DRIZZLE token

provides:
  - JWT auth endpoint (login/refresh/logout/me)
  - JwtAuthGuard global — semua route otomatis terproteksi
  - RbacGuard global — siap dipakai via @RequirePermissions()
  - @Public(), @RequirePermissions(), @CurrentUser() decorators
  - RedisModule global dengan REDIS_CLIENT token

affects: [01-core-system plan 03+, semua endpoint yang butuh auth]

tech-stack:
  added:
    - "@nestjs/jwt ^11.0.2"
    - "@nestjs/passport ^11.0.5"
    - "passport ^0.7.0"
    - "passport-jwt ^4.0.1"
    - "ioredis ^5.11.0"
    - "class-validator ^0.15.1"
    - "class-transformer ^0.5.1"
  patterns:
    - Global JwtAuthGuard via APP_GUARD (semua route private by default)
    - @Public() untuk opt-out dari auth
    - Refresh token sebagai UUID random di Redis (bukan JWT) — revocable
    - JwtModule.registerAsync() untuk lazy env var loading

key-files:
  created:
    - apps/backend/src/redis/redis.module.ts
    - apps/backend/src/redis/redis.provider.ts
    - apps/backend/src/auth/auth.module.ts
    - apps/backend/src/auth/auth.service.ts
    - apps/backend/src/auth/auth.controller.ts
    - apps/backend/src/auth/strategies/jwt.strategy.ts
    - apps/backend/src/auth/guards/jwt.guard.ts
    - apps/backend/src/auth/guards/rbac.guard.ts
    - apps/backend/src/auth/decorators/public.decorator.ts
    - apps/backend/src/auth/decorators/require-permissions.decorator.ts
    - apps/backend/src/auth/decorators/current-user.decorator.ts
    - apps/backend/src/auth/dto/login.dto.ts
  modified:
    - apps/backend/src/app.module.ts
    - apps/backend/src/main.ts
    - apps/backend/package.json

key-decisions:
  - "Refresh token UUID (bukan JWT): revocable, stored Redis key refresh:{userId}"
  - "JwtModule.registerAsync(): env var tersedia setelah ConfigModule init"
  - "POST /auth/refresh butuh { user_id, refresh_token }: karena refresh_token bukan JWT"
  - "Global guards via APP_GUARD: semua route baru otomatis terproteksi"

patterns-established:
  - "Route publik: tandai dengan @Public() decorator"
  - "RBAC: gunakan @RequirePermissions('code.action') di controller method"
  - "Current user: inject via @CurrentUser() param decorator"
  - "Redis inject: @Inject(REDIS_CLIENT) private redis: Redis"

duration: ~2 jam
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T03:15:00Z
---

# Phase 01 Plan 02: Auth Backend Summary

**JWT auth lengkap dengan refresh token UUID di Redis, JwtAuthGuard global aktif, dan RbacGuard berbasis permission code siap dipakai di semua endpoint.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~2 jam |
| Tasks | 3 completed |
| Files created | 13 |
| Files modified | 3 |
| Packages added | 7 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Login berhasil | **Pass** | POST /api/auth/login → 200 + { access_token, refresh_token, user } |
| AC-2: Login gagal ditolak | **Pass** | Password salah → 401 "Email atau password salah" |
| AC-3: Refresh token | **Pass** | POST /api/auth/refresh → 200 + { access_token } baru |
| AC-4: JWT Guard memproteksi route | **Pass** | GET /auth/me tanpa token → 401, dengan token → 200 + 29 permissions |
| AC-5: RBAC Guard | **Pass** | Guard aktif global, @RequirePermissions() siap dipakai |

## Accomplishments

- Auth backend fungsional end-to-end: login → JWT → refresh → logout
- JWT Guard aktif global via APP_GUARD — endpoint baru otomatis terproteksi tanpa tambahan kode
- Super Admin verified memiliki semua 29 permissions dari seed data
- ValidationPipe global aktif — DTO validation (email format, required fields) berjalan otomatis
- Redis TTL 7 hari untuk refresh token, key dihapus saat logout (verified via redis-cli)

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/redis/redis.provider.ts` | Created | REDIS_CLIENT provider (ioredis instance) |
| `src/redis/redis.module.ts` | Created | Global RedisModule, export REDIS_CLIENT |
| `src/auth/dto/login.dto.ts` | Created | LoginDto dengan class-validator |
| `src/auth/auth.service.ts` | Created | validateUser, login, refreshToken, logout, getProfile |
| `src/auth/auth.module.ts` | Created | AuthModule dengan JwtModule.registerAsync |
| `src/auth/auth.controller.ts` | Created | POST login/refresh, POST logout, GET me |
| `src/auth/strategies/jwt.strategy.ts` | Created | Passport JWT strategy, load user+permissions dari DB |
| `src/auth/guards/jwt.guard.ts` | Created | JwtAuthGuard, cek @Public() metadata |
| `src/auth/guards/rbac.guard.ts` | Created | RbacGuard, cek @RequirePermissions() metadata |
| `src/auth/decorators/public.decorator.ts` | Created | @Public() — opt-out dari JWT guard |
| `src/auth/decorators/require-permissions.decorator.ts` | Created | @RequirePermissions(...codes) |
| `src/auth/decorators/current-user.decorator.ts` | Created | @CurrentUser() param decorator |
| `src/app.module.ts` | Modified | Import AuthModule + RedisModule, register global guards |
| `src/main.ts` | Modified | Tambah ValidationPipe global |
| `package.json` | Modified | +7 production deps, +2 dev deps |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Refresh token = UUID random (bukan JWT) | UUID bisa di-revoke dengan delete Redis key; JWT tidak | Logout benar-benar invalidate session |
| POST /auth/refresh butuh `user_id` + `refresh_token` | UUID tidak bisa di-decode seperti JWT untuk dapat userId | Client harus simpan user_id dari response login |
| JwtModule.registerAsync() | `JwtModule.register({ secret: process.env.X })` evaluasi env sebelum ConfigModule load — secret jadi undefined | Env var terbaca dengan benar saat server start |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 3 | TypeScript strict mode fixes, tidak mengubah behavior |
| Spec adjustment | 1 | /auth/refresh endpoint signature berbeda dari plan |
| Deferred | 0 | — |

**Total impact:** Semua fix essential, tidak ada scope creep.

### Auto-fixed Issues

**1. TypeScript: DTO property initializer**
- Issue: `email: string` error TS2564 di strict mode
- Fix: `email!: string` (definite assignment assertion)
- Files: `auth/dto/login.dto.ts`

**2. TypeScript: `secretOrKey` undefined**
- Issue: `process.env.JWT_ACCESS_SECRET` bertipe `string | undefined`
- Fix: `process.env.JWT_ACCESS_SECRET!` (non-null assertion)
- Files: `auth/strategies/jwt.strategy.ts`

**3. TypeScript: `expiresIn` type**
- Issue: `StringValue` type dari `ms` package tidak match `string`
- Fix: `as any` cast
- Files: `auth/auth.module.ts`

### Spec Adjustment

**POST /auth/refresh signature:**
- Plan: client hanya kirim `{ refresh_token }`, server decode JWT untuk dapat userId
- Aktual: client kirim `{ user_id, refresh_token }` karena refresh_token adalah UUID (tidak bisa di-decode)
- Why: Plan mengasumsikan refresh_token adalah JWT, tapi service menggunakan UUID (sesuai avoid section plan itu sendiri)
- Impact: Client harus menyimpan `user_id` dari response login — wajar untuk SPA

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `JwtModule.register()` buat secret undefined di runtime | Ganti ke `registerAsync()` dengan inject ConfigService |
| Port 3000 sudah dipakai saat testing | Test di port 3002, verified semua AC pass |

## Next Phase Readiness

**Ready:**
- Semua endpoint baru otomatis terproteksi (JWT Guard global)
- @RequirePermissions() decorator siap dipakai di controller manapun
- @CurrentUser() tersedia untuk inject user ke handler
- RedisModule global — bisa dipakai module lain yang butuh Redis (misal: queue, rate limit)
- 29 permission codes dari seed sudah di-validate berjalan dengan RBAC guard

**Concerns:**
- POST /auth/refresh butuh `user_id` — frontend harus aware dan simpan di state/localStorage
- Tidak ada rate limiting pada login endpoint (disengaja, sesuai scope limit plan)

**Blockers:**
- None

---
*Phase: 01-core-system, Plan: 02*
*Completed: 2026-05-29*
