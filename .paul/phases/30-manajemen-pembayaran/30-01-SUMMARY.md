# 30-01-SUMMARY.md — Database Migration + Remove Old Code

## What was built

| # | Change | Files |
|---|--------|-------|
| 1 | DB Migration — drop `class_id` + `invoice_number`, update unique constraint | `drizzle/0005_brave_leper_queen.sql` |
| 2 | Schema — hapus classId dari paymentTemplates, invoiceNumber dari bills | `financial.schema.ts` |
| 3 | DTO — hapus classId dari CreatePaymentTemplateDto | `create-payment-template.dto.ts` |
| 4 | Service — hapus classId dari findAll/findOne/create, update error message | `payment-templates.service.ts` |
| 5 | Controller — hapus classId query param dari findAll | `payment-templates.controller.ts` |
| 6 | Delete billing-engine module entirely | `billing-engine/**` (deleted) |
| 7 | BillsService — hapus invoiceNumber, fix class join via student_classes | `bills.service.ts` |
| 8 | ReportsService — fix classId references via student_classes join | `reports.service.ts` |
| 9 | ClassesService — hapus paymentTemplates.classId safe delete check | `classes.service.ts` |
| 10 | BillingModule — hapus BillingEngineModule import | `billing.module.ts` |

## AC Results

| AC | Status | Note |
|----|--------|------|
| AC-1 Schema Migration | ✅ | class_id + invoice_number dropped, unique on (payment_post_id, school_year_id) |
| AC-2 No Invoice Column | ✅ | bills table no longer has invoice_number |
| AC-3 Payment Templates API Clean | ✅ | CRUD berfungsi tanpa classId |
| AC-4 Billing Engine Removed | ✅ | Module deleted entirely |
| AC-5 Build & TypeScript Pass | ✅ | `pnpm --filter backend build` success |

## Deviations

None. Plan executed exactly as specified.
