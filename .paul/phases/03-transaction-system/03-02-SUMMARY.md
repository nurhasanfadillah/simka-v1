---
phase: 03-transaction-system
plan: 02
subsystem: api
tags: [nestjs, drizzle, transactions, bill-status, typescript]

requires:
  - phase: 03-transaction-system/03-01
    provides: transactions + transaction_items tables + transactionStatusEnum

provides:
  - TransactionsModule (NestJS module lengkap)
  - POST /api/transactions — create transaksi + auto-update bill status
  - GET /api/transactions — list dengan filter
  - GET /api/transactions/:id — detail dengan items

affects: [03-03-void-transaction, 03-04-pdf-receipt]

tech-stack:
  added: []
  patterns: [drizzle tx() untuk atomic multi-table update, req.user.id dari JwtStrategy]

key-files:
  created:
    - apps/backend/src/transactions/transactions.module.ts
    - apps/backend/src/transactions/transactions.service.ts
    - apps/backend/src/transactions/transactions.controller.ts
    - apps/backend/src/transactions/dto/create-transaction.dto.ts
  modified:
    - apps/backend/src/app.module.ts

key-decisions:
  - "req.user.id bukan req.user.sub — JwtStrategy.validate() return { id } bukan { sub }"
  - "generateTrxNumber() query dalam tx handle, bukan this.db"

patterns-established:
  - "TRX-YYYYMMDD-NNNNN: MAX parse dari prefix match, +1, padStart(5)"
  - "Bill status recalculate: query all bill_months per billId, count lunas"

duration: ~20min
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T00:00:00Z
---

# Phase 03 Plan 02: Transaction Service & API Summary

**TransactionsModule NestJS lengkap: POST create (auto-update bill status), GET list/detail — verified end-to-end dengan data nyata di simka_db.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 min |
| Tasks | 3 completed |
| Files created | 4 |
| Files modified | 1 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: POST create transaksi + auto-update status | Pass | TRX-20260529-00001, bill_month → lunas, bill → cicilan |
| AC-2: GET list dengan filter | Pass | GET /transactions?studentId=31 → [1 result] |
| AC-3: GET /:id detail dengan items | Pass | Response berisi items array |

## Accomplishments

- TransactionsModule terdaftar di AppModule, 3 routes aktif
- `generateTrxNumber()`: sequential TRX-YYYYMMDD-NNNNN per hari dalam satu DB transaction
- Auto-update: bill_months.status='lunas' + paidAt, bills.status recalculate (belum_bayar/cicilan/lunas)
- `findAll()` dengan 4 filter: studentId, status, dateFrom, dateTo

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/transactions/dto/create-transaction.dto.ts` | Created | DTO dengan class-validator + `!` assertion (TS strict) |
| `src/transactions/transactions.module.ts` | Created | NestJS module, import DatabaseModule |
| `src/transactions/transactions.controller.ts` | Created | 3 routes: POST, GET, GET/:id |
| `src/transactions/transactions.service.ts` | Created | create + findAll + findOne + generateTrxNumber |
| `src/app.module.ts` | Modified | Tambah TransactionsModule ke imports |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `req.user.id` bukan `req.user.sub` | JwtStrategy.validate() return `{ id }` bukan `{ sub }` | Semua controller baru harus pakai `req.user.id` |
| Bills dengan 0 bill_months → status 'lunas' | Tagihan bebas tanpa bill_months dianggap lunas setelah dibayar | Plan 03-03 perlu handle kasus yang sama |

## Deviations from Plan

### Auto-fixed Issues

**1. DTO definite assignment**
- **Found during:** Task 1 build
- **Issue:** TypeScript strict mode: property has no initializer (`billId: number` → error TS2564)
- **Fix:** Tambah `!` assertion (`billId!: number`) — pola dari existing DTO (generate-bills.dto.ts)
- **Verification:** Build sukses setelah fix

**2. req.user.sub → req.user.id**
- **Found during:** Task 3 integration test
- **Issue:** `createdBy: null` di DB meski token valid — controller pakai `req.user.sub` tapi JwtStrategy return `{ id }`
- **Fix:** Ganti `req.user.sub` → `req.user.id` di controller
- **Verification:** Transaction ke-2 menunjukkan `created_by=1`

## Issues Encountered

None beyond auto-fixed deviations above.

## Next Phase Readiness

**Ready:**
- Transaction create/read API berfungsi end-to-end
- Auto bill status update teruji dengan data nyata
- Pattern `req.user.id` terdokumentasi untuk Plans berikutnya

**Concerns:**
- Transaction #1 di DB punya `created_by=NULL` (dibuat sebelum fix) — tidak masalah untuk development, tapi perlu diperhatikan jika ada data prod

**Blockers:** None

---
*Phase: 03-transaction-system, Plan: 02*
*Completed: 2026-05-29*
