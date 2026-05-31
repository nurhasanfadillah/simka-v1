---
phase: 02-billing-engine
plan: 05
subsystem: api
tags: [nestjs, drizzle, tunggakan, billing]

requires:
  - phase: 02-billing-engine
    plan: 04
    provides: BillsService + BillsController

provides:
  - GET /billing/tunggakan (filter: classId, schoolYearId)

affects: [frontend-tunggakan, phase-03-transaction]

key-files:
  modified:
    - apps/backend/src/billing/bills/bills.service.ts
    - apps/backend/src/billing/bills/bills.controller.ts

key-decisions:
  - "Extend BillsService/Controller — no new module (1 method + 1 endpoint)"
  - "@Get('tunggakan') ditempatkan sebelum @Get(':id') agar NestJS routing benar"

duration: ~10min
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T00:00:00Z
---

# Phase 02 Plan 05: Tunggakan API Summary

**GET /billing/tunggakan ditambah ke BillsController; inArray(['belum_bayar','cicilan']) filter dengan optional classId + schoolYearId.**

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Hanya belum_bayar + cicilan | Pass | inArray(bills.status, ['belum_bayar','cicilan']) |
| AC-2: Filter classId + schoolYearId | Pass | SQL[] conditions sama dengan pola findAll() |

## Files Modified

| File | Change |
|------|--------|
| `bills/bills.service.ts` | +`inArray` import, +`findTunggakan()` method |
| `bills/bills.controller.ts` | +`@Get('tunggakan')` endpoint (sebelum `:id`) |

## Deviations from Plan

None.

## Next Phase Readiness

**Phase 02 COMPLETE** — semua 5 deliverable selesai.
Ready untuk Phase 03: Transaction System.

---
*Phase: 02-billing-engine, Plan: 05*
*Completed: 2026-05-29*
