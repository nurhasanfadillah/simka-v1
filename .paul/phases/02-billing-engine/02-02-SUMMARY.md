---
phase: 02-billing-engine
plan: 02
subsystem: api
tags: [nestjs, drizzle, crud, billing, permissions]

requires:
  - phase: 02-billing-engine
    plan: 01
    provides: paymentTemplates table dengan unique constraint (classId, paymentPostId, schoolYearId)

provides:
  - GET/POST/PATCH /billing/payment-templates endpoints
  - PaymentTemplatesService dengan JOIN query (class, paymentPost, schoolYear names)
  - BillingModule terdaftar di AppModule
  - permissions: payment_template.view/create/update terseed

affects: [02-03-billing-engine, 02-04-bills-list, frontend-master-template]

tech-stack:
  added: []
  patterns:
    - "billing/ domain module — setara dengan master/ untuk entitas keuangan"
    - "Drizzle select() dengan leftJoin untuk enriched response"
    - "Optional query params dengan manual parseInt (bukan ParseIntPipe) untuk nullable filter"

key-files:
  created:
    - apps/backend/src/billing/billing.module.ts
    - apps/backend/src/billing/payment-templates/payment-templates.module.ts
    - apps/backend/src/billing/payment-templates/payment-templates.service.ts
    - apps/backend/src/billing/payment-templates/payment-templates.controller.ts
    - apps/backend/src/billing/payment-templates/dto/create-payment-template.dto.ts
    - apps/backend/src/billing/payment-templates/dto/update-payment-template.dto.ts
  modified:
    - apps/backend/src/app.module.ts
    - apps/backend/src/db/seed.ts

key-decisions:
  - "Hanya amount yang bisa diupdate — classId/paymentPostId/schoolYearId immutable setelah create"
  - "findAll + findOne mengembalikan joined names (className, paymentPostName, schoolYearName)"
  - "Filter opsional via query param classId + schoolYearId"

patterns-established:
  - "billing/ module mengikuti pola master/ (module → service + controller, inject DRIZZLE)"
  - "SQL[] conditions array + and(...conditions) untuk dynamic WHERE clause di Drizzle"

duration: ~20min
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T00:00:00Z
---

# Phase 02 Plan 02: PaymentTemplates API Summary

**NestJS billing module dibuat dengan 4 CRUD endpoints, joined response (nama relasi), unique constraint enforcement, dan 3 permissions terseed ke database.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 min |
| Tasks | 2 completed |
| Files created | 6 |
| Files modified | 2 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: GET list mengembalikan template dengan relasi | Pass | findAll() dengan leftJoin returns className, paymentPostName, schoolYearName |
| AC-2: POST membuat template, unique constraint ditegakkan | Pass | ConflictException dengan pesan Indonesia jika 23505 |
| AC-3: PATCH mengupdate amount, 404 jika tidak ada | Pass | findOne() dijalankan dulu, throw NotFoundException |
| AC-4: Build bersih dan permissions terseed | Pass | `nest build` sukses; 3 permissions + 6 role-permissions created di DB |

## Accomplishments

- `billing/` domain module baru dibuat sebagai peer dari `master/`
- 4 endpoints tersedia: GET list (dengan join + optional filter), GET one, POST (201), PATCH
- Seed idempoten menambah 3 permissions baru; Super Admin + Admin mendapat ketiganya otomatis

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `billing/billing.module.ts` | Created | Domain module container untuk entitas billing |
| `billing/payment-templates/payment-templates.module.ts` | Created | NestJS module untuk PaymentTemplates feature |
| `billing/payment-templates/payment-templates.service.ts` | Created | CRUD service dengan Drizzle leftJoin query |
| `billing/payment-templates/payment-templates.controller.ts` | Created | REST controller, route prefix `billing/payment-templates` |
| `billing/payment-templates/dto/create-payment-template.dto.ts` | Created | DTO: classId, paymentPostId, schoolYearId, amount (min 1000) |
| `billing/payment-templates/dto/update-payment-template.dto.ts` | Created | DTO: amount only (immutable identity fields) |
| `apps/backend/src/app.module.ts` | Modified | BillingModule ditambah ke imports array |
| `apps/backend/src/db/seed.ts` | Modified | payment_template.view/create/update ditambah ke perms array |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| classId/paymentPostId/schoolYearId immutable setelah create | Mengubah identity tuple = membuat template baru, bukan update | UpdateDto hanya expose `amount` |
| leftJoin di findAll & findOne | Frontend butuh nama relasi, bukan hanya ID | Response lebih besar tapi tidak perlu extra round-trip dari FE |
| `SQL[]` + `and(...conditions)` untuk dynamic WHERE | Pattern Drizzle yang type-safe untuk optional filters | Dipakai ulang di service billing berikutnya |

## Deviations from Plan

None — plan dieksekusi sesuai spesifikasi.

## Next Phase Readiness

**Ready:**
- `GET /billing/payment-templates?classId=N&schoolYearId=N` tersedia untuk Plan 02-03 (generate tagihan butuh list template per kelas)
- `paymentTemplates` table + service bisa di-import ke BillingEngineService nanti

**Concerns:**
- Tidak ada validasi bahwa `classId`, `paymentPostId`, `schoolYearId` benar-benar exist di DB sebelum insert — FK constraint di PostgreSQL akan throw generic error jika tidak ada; bisa ditambah explicit check di Plan berikutnya jika error message perlu lebih user-friendly

**Blockers:** None

---
*Phase: 02-billing-engine, Plan: 02*
*Completed: 2026-05-29*
