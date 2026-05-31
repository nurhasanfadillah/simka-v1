---
phase: 01-core-system
created: 2026-05-29
status: ready-for-planning
---

# Phase 1 Context — Core System

## Goals

1. **Aplikasi bisa dijalankan end-to-end** — buka browser, login, masuk dashboard SIMKA
2. **CRUD master data lengkap** — tahun ajaran, unit sekolah, kelas, siswa, POS pembayaran
3. **Auth & RBAC berjalan** — role Super Admin, Admin, Bendahara, Operator dengan akses berbeda
4. **Dummy data tersedia** — bisa langsung ditest tanpa input manual dari nol

## Success di Akhir Phase

Operator membuka browser → login → melihat dashboard → bisa input dan kelola semua data master. Sistem siap menerima data nyata untuk Phase 2 (billing).

## Approach

### Struktur Repo

Monorepo satu repo dengan struktur:
```
simka-v1/
├── apps/
│   ├── backend/     ← NestJS API
│   └── frontend/    ← React + Vite
├── packages/
│   └── shared/      ← Zod schemas (shared FE + BE)
├── package.json     ← root workspace
└── turbo.json       ← Turborepo (atau pnpm workspaces)
```

### Tech Stack
- Backend: NestJS + Drizzle ORM + PostgreSQL + Redis
- Frontend: React 18 + Vite + shadcn/ui + Zustand + Tanstack Table
- Auth: JWT access token (15m) + refresh token (7d) di Redis
- Validation: Zod (shared antara backend dan frontend)
- Chart: Recharts (sparkline di stat card)

### Design System
- Green theme: sidebar `#1A3829`, primary `#00A651`, accent `#16A34A`
- Logo: `logo-al-hasaniyyah.png` (pentagon, sudah tersedia)
- Flat sidebar navigation dengan section grouping
- Referensi: `dashboard-simka.png` (gambar yang diberikan user)
- Dark mode: tidak diperlukan

### Database Schema
Semua tabel sesuai ERD dari `plan-simka-v1.md`:
- AUTH: users, roles, permissions, role_permissions
- AKADEMIK: school_units, school_years, classes, students, student_classes
- KEUANGAN: payment_posts
- LOG: audit_logs

### Seed Data
- Roles: Super Admin, Admin, Bendahara, Operator
- Permissions: lengkap per resource
- User: 1 Super Admin (email: admin@alhasaniyyah.sch.id, password: Admin123!)
- school_units: SD, SMP, SMA, Pondok
- school_years: 2025/2026 (active)
- classes: contoh kelas per unit (1A, 1B, VII A, X IPA, dll)
- students: 10 siswa dummy per unit
- payment_posts: SPP, Uang Gedung, Seragam, Buku

## Constraints (dari PROJECT.md)

- Tidak boleh simpan class_id langsung di students
- Audit log wajib untuk semua perubahan data
- TypeScript strict di semua layer
- Tidak ada delete data — hanya soft status

## Out of Scope Phase 1

- Billing engine (payment_templates, bills, bill_months)
- Transaksi dan kwitansi
- Laporan dan export
- Queue/BullMQ (belum dibutuhkan di phase ini)
- Puppeteer/PDF

## Referensi Discovery

- Stack: `.paul/phases/00-stack-selection/DISCOVERY.md`
- UI Design: `.paul/phases/00-ui-design/DISCOVERY.md`
