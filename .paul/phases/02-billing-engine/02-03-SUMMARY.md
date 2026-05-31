---
phase: 02-billing-engine
plan: 03
subsystem: api
tags: [nestjs, drizzle, billing, transaction, generate, invoice]

requires:
  - phase: 02-billing-engine
    plan: 01
    provides: bills, billMonths tables
  - phase: 02-billing-engine
    plan: 02
    provides: paymentTemplates CRUD + BillingModule

provides:
  - POST /billing/generate/preview — daftar siswa eligible tanpa mutasi DB
  - POST /billing/generate — buat bills + bill_months massal dalam DB transaction
  - BillingEngineService dengan buildBillMonths helper
  - Invoice number sequential: INV-{POSTCODE}-{ENDYEAR}-{NNNN}

affects: [02-04-bills-list, 02-05-tunggakan, frontend-billing-generate]

tech-stack:
  added: []
  patterns:
    - "DB transaction untuk generate massal (all-or-nothing)"
    - "buildBillMonths helper: 12 rows bulanan (Jul-Des startYear + Jan-Jun endYear), 1 row bebas"
    - "Invoice number: MAX parse dari existing pattern + seq increment dalam transaction"
    - "Set<number> untuk O(1) lookup sudah-generate check"

key-files:
  created:
    - apps/backend/src/billing/billing-engine/billing-engine.service.ts
    - apps/backend/src/billing/billing-engine/billing-engine.controller.ts
    - apps/backend/src/billing/billing-engine/billing-engine.module.ts
    - apps/backend/src/billing/billing-engine/dto/generate-bills.dto.ts
  modified:
    - apps/backend/src/billing/billing.module.ts

key-decisions:
  - "Synchronous generate — no BullMQ (OK untuk kelas < 100 siswa, VPS single server)"
  - "buildBillMonths bulanan: bulan 7-12 startYear + bulan 1-6 endYear (Indonesian school year)"
  - "Invoice seq: MAX parse dari LIKE query dalam transaction, bukan counter table"
  - "totalAmount bulanan = amount * 12, bebas = amount"

patterns-established:
  - "private loadTemplate() pattern — reused di preview() dan generate()"
  - "Set<number> untuk already-generated check — O(1) vs O(n) array includes"

duration: ~25min
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T00:00:00Z
---

# Phase 02 Plan 03: BillingEngine Generate Summary

**BillingEngineService dibuat dengan preview + transactional generate massal; invoice number INV-{POSTCODE}-{ENDYEAR}-{NNNN} sequential; bill_months: 12 rows untuk bulanan (Jul-Jun), 1 row untuk bebas.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~25 min |
| Tasks | 2 completed |
| Files created | 4 |
| Files modified | 1 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Preview tidak mutasi DB | Pass | preview() hanya SELECT, return eligibleStudents + counts |
| AC-2: Generate buat bills + bill_months | Pass | Transaction insert: 1 bill + 12/1 bill_months per siswa |
| AC-3: Invoice number format benar dan unik | Pass | INV-{POSTCODE}-{ENDYEAR}-{NNNN}, MAX parse + seq dalam tx |
| AC-4: Idempoten — re-generate aman | Pass | getAlreadyGeneratedStudentIds() filter sebelum insert |

## Accomplishments

- `BillingEngineService` dengan 3 private helpers + 2 public methods
- `buildBillMonths()` menghasilkan 12 rows (bulanan) atau 1 row (bebas) sesuai payment post type
- DB transaction memastikan semua bills + bill_months atomic per generate request
- `BillingEngineModule` terdaftar di `BillingModule`

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `billing-engine/billing-engine.service.ts` | Created | Core generate logic dengan transaction |
| `billing-engine/billing-engine.controller.ts` | Created | POST /billing/generate/preview + POST /billing/generate |
| `billing-engine/billing-engine.module.ts` | Created | NestJS module container |
| `billing-engine/dto/generate-bills.dto.ts` | Created | DTO: paymentTemplateId only |
| `billing/billing.module.ts` | Modified | Import BillingEngineModule |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Synchronous (no BullMQ) | Cukup untuk kelas < 100 siswa pada VPS single-server | BullMQ bisa ditambah later jika perlu async progress tracking |
| buildBillMonths: bulan 7-12 startYear + 1-6 endYear | Kalender akademik Indonesia Juli-Juni | Konsisten dengan tahun ajaran 2025/2026 |
| totalAmount = amount × 12 untuk bulanan | Sum semua bill_months = tagihan total yang harus dibayar | bill_months.amount masing-masing tetap = amount (per bulan) |
| Invoice seq via MAX parse dalam transaction | Tidak perlu table counter terpisah, aman dalam single transaction | Race condition minimal pada VPS single-server |

## Deviations from Plan

None — plan dieksekusi sesuai spesifikasi.

## Deferred Items

- **BullMQ queue**: untuk generate > 100 siswa dengan progress tracking realtime (plan terpisah jika diperlukan)
- **FK validation explicit**: create sekarang bergantung pada PostgreSQL FK constraint error untuk invalid classId/paymentPostId/schoolYearId; pesan error bisa lebih user-friendly

## Next Phase Readiness

**Ready:**
- `POST /billing/generate` tersedia — frontend bisa trigger generate
- `POST /billing/generate/preview` tersedia — frontend bisa tampilkan konfirmasi sebelum generate
- bills + bill_months terisi setelah generate → ready untuk Data Tagihan list (02-04)

**Concerns:** None blocking.

**Blockers:** None

---
*Phase: 02-billing-engine, Plan: 03*
*Completed: 2026-05-29*
