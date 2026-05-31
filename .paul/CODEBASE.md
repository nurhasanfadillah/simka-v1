# CODEBASE.md — SIMKA v1

> Generated: 2026-05-31 | Updated: 2026-05-31

## Overview

SIMKA (Sistem Informasi Manajemen Keuangan) — school financial management for Al-Hasaniyyah institutions.

**Stack:** NestJS + Drizzle ORM + PostgreSQL + React 18/Vite + shadcn/ui + Zustand + Redis
**Deploy:** VPS Ubuntu 129.226.213.135 (pm2 + nginx)

---

## Directory Structure

```
simka-v1/
├── apps/
│   ├── backend/          ← NestJS API (port 3000)
│   └── frontend/         ← React SPA (Vite + Tailwind + shadcn/ui)
├── packages/shared/      ← Zod validation schemas
├── nginx/simka.conf      ← Nginx reverse proxy config
├── ecosystem.config.js   ← pm2 config
├── .paul/                ← Task management (phases, STATE.md)
```

---

## API Surface — 62 endpoints across 8 modules

### Auth (5 endpoints)
`POST /api/auth/login` · `POST /api/auth/refresh` · `POST /api/auth/logout` · `GET /api/auth/me` · `PATCH /api/auth/change-password`

### Users + Roles (7)
`GET/POST /api/users` · `PATCH/DELETE /api/users/:id` · `GET/POST /api/roles` · `PATCH /api/roles/:id` · `PATCH /api/roles/:id/permissions` · `DELETE /api/roles/:id`

### Master Data (25)
`GET/POST/PATCH/DELETE /api/master/school-years` · `PATCH /:id/activate` ·
`GET/POST/PATCH/DELETE /api/master/school-units` ·
`GET/POST/PATCH/DELETE /api/master/classes` ·
`GET/POST/PATCH/DELETE /api/master/students` · `GET /search` · `GET /mapping` · `GET /template` · `POST /import/preview` · `POST /import/commit` · `GET /:id/classes` ·
`GET /api/master/student-classes` · `POST enroll` · `PATCH /:id/transfer` · `DELETE /:id` ·
`GET/POST/PATCH/DELETE /api/master/payment-posts`

### Billing (12)
`GET /api/billing/bills` · `GET /tunggakan` · `GET /tunggakan/summary` · `GET /student-transaction/:id` · `GET /student-print/:id` · `GET /:id` ·
`GET/POST/PATCH/DELETE /api/billing/payment-templates` ·
`GET/POST/PATCH/DELETE /api/billing/payment-management` (3 specialized GETs + POST bills + PATCH/DELETE :id)

### Transactions (6)
`POST /api/transactions` · `GET list` · `GET /:id` · `GET /:id/receipt` · `POST /:id/void` · `DELETE /:id`

### Reports (15)
`GET /api/reports/dashboard` ·
`GET /harian` · `/harian/export/{pdf,excel}` ·
`GET /bulanan` · `/bulanan/export/{pdf,excel}` ·
`GET /tahunan` · `/tahunan/export/{pdf,excel}` ·
`GET /tunggakan` · `/tunggakan/export/{pdf,excel}` ·
`GET /rekap-pos` · `/rekap-pos/export/{pdf,excel}`

### Academic (2)
`GET /api/academic/promotion/preview` · `POST /promote`

---

## Database — 16 tables in 4 schemas

| Domain | Tables |
|--------|--------|
| **Auth** | roles, permissions, role_permissions, users |
| **Academic** | school_units, school_years, classes, students, student_classes |
| **Financial** | payment_posts, payment_templates, bills, bill_months, transactions, transaction_items |
| **Audit** | audit_logs |

---

## Frontend — 24 pages, 13 UI components

| Section | Pages |
|---------|-------|
| Auth | Login |
| Dashboard | Dashboard |
| Master Data | Tahun Pelajaran, Kelas (×2 tab), Mapping Kelas, Migrasi Status, Siswa, Siswa Detail, Import Siswa, POS, Pembayaran |
| Keuangan | Generate, Tagihan, Transaksi Baru, Riwayat, Tunggakan |
| Laporan | Harian, Bulanan, Tahunan, Tunggakan, Rekap POS |
| Pengaturan | Profil, Pengguna, Roles |

---

## Key Architectural Decisions

1. **NestJS + Drizzle ORM** — full TypeScript stack, SQL-like query control
2. **JWT + Redis refresh tokens** — stateless auth with refresh persistence
3. **RBAC via decorators** — global JWT guard + global RBAC guard with `@RequirePermissions()`
4. **No delete for financial data** — transactions use void, POS has no delete endpoint
5. **Bill status auto-calculated** — from bill_months aggregate (never stored directly)
6. **Month amounts cumulative check** — billMonth status = 'lunas' only when totalPaid >= amount
7. **Puppeteer PDF generation** — HTML templates for receipts, reports, bill prints
8. **Excel via ExcelJS** — all 5 report types have Excel export
9. **shadcn/ui + Tailwind CSS** — component-driven design system with CSS variables

## Permission System

34 permissions across 4 default roles (Super Admin, Admin, Bendahara, Operator). Every protected endpoint requires a specific permission code via `@RequirePermissions()`.

## Deployment

VPS Ubuntu @ 129.226.213.135. Backend via pm2 cluster mode, frontend via nginx static serve + reverse proxy `/api` → `localhost:3000`.
