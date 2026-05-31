---
phase: 02-billing-engine
plan: 01
subsystem: database
tags: [drizzle, postgresql, schema, migration, billing]

requires:
  - phase: 01-foundation
    provides: classes, schoolYears, students, paymentPosts tables (academic + financial base schema)

provides:
  - paymentTemplates table (template tagihan per kelas/pos/tahun ajaran)
  - bills table (tagihan per siswa)
  - billMonths table (rincian bulan per tagihan)
  - billStatusEnum dan billMonthStatusEnum
  - Drizzle migration 0001_faithful_wendell_rand.sql

affects: [02-02-payment-templates-api, 02-03-billing-engine, 02-04-payment-recording]

tech-stack:
  added: []
  patterns: [bigserial PK, integer amount (no decimal), cascade delete billMonths on bill delete]

key-files:
  created:
    - apps/backend/drizzle/0001_faithful_wendell_rand.sql
  modified:
    - apps/backend/src/db/schema/financial.schema.ts

key-decisions:
  - "amount pakai integer bukan numeric — nominal SPP selalu bilangan bulat (rupiah)"
  - "onDelete cascade hanya di billMonths.billId — protect data di bills dan paymentTemplates"
  - "unique constraint uq_bill = (studentId, paymentTemplateId) — satu siswa satu tagihan per template"

patterns-established:
  - "Unique constraints didefinisikan via array di argumen kedua pgTable"
  - "Cross-schema import: academic.schema → financial.schema untuk classes, schoolYears, students"

duration: ~30min
started: 2026-05-29T00:00:00Z
completed: 2026-05-29T00:00:00Z
---

# Phase 02 Plan 01: Schema Extension Summary

**Tiga tabel billing (payment_templates, bills, bill_months) + 2 enum + relations ditambah ke financial schema dan migration ter-apply ke PostgreSQL.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~30 min |
| Tasks | 2 completed |
| Files modified | 2 |
| Migration files | 1 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Tabel baru ada di schema TypeScript | Pass | paymentTemplates, bills, billMonths exported; `pnpm build` bersih |
| AC-2: Migration ter-generate | Pass | `0001_faithful_wendell_rand.sql` ada di apps/backend/drizzle/ |
| AC-3: Migration ter-apply | Pass | payment_templates, bills, bill_months muncul di simka_db |
| AC-4: Unique constraints benar | Pass | uq_bill, uq_payment_template, uq_bill_month ada di SQL migration |

## Accomplishments

- `financial.schema.ts` diperluas: 2 enum baru + 3 tabel baru + 3 relations
- Migration SQL `0001_faithful_wendell_rand.sql` di-generate Drizzle dan ter-apply ke `simka_db`
- TypeScript build bersih tanpa error

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/db/schema/financial.schema.ts` | Modified | Tambah billStatusEnum, billMonthStatusEnum, paymentTemplates, bills, billMonths, dan 3 relations |
| `apps/backend/drizzle/0001_faithful_wendell_rand.sql` | Created | Drizzle migration: CREATE TYPE + CREATE TABLE untuk ketiga tabel |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `amount` pakai `integer` bukan `numeric` | Nominal SPP selalu bilangan bulat (rupiah) | Performa query lebih baik, tidak ada floating point |
| `onDelete: cascade` hanya di `billMonths.billId` | Hapus bill → hapus rincian bulan; tapi lindungi data siswa & template | Data integrity terjaga di kedua arah |
| Database name `simka_db` (bukan `simka`) | Sesuai konfigurasi Docker yang sudah ada | Referensi untuk dokumentasi koneksi ke depan |

## Deviations from Plan

None — plan dieksekusi sesuai spesifikasi.

## Next Phase Readiness

**Ready:**
- `paymentTemplates`, `bills`, `billMonths` tersedia sebagai Drizzle table objects
- Relations terdefinisi untuk query dengan joins
- Migration sudah committed ke drizzle history

**Concerns:**
- Database name aktual adalah `simka_db`, bukan `simka` — perlu dikonfirmasi di `.env` backend agar konsisten

**Blockers:** None

---
*Phase: 02-billing-engine, Plan: 01*
*Completed: 2026-05-29*
