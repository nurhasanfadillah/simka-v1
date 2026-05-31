---
phase: 01-core-system
plan: 01
completed: 2026-05-29
---

# Summary: Monorepo Setup + Drizzle Schema + Seed

## Yang Dibangun

### Struktur Monorepo
```
simka-v1/
├── apps/
│   ├── backend/          NestJS API (port 3000)
│   └── frontend/         React + Vite (port 5173)
├── packages/
│   └── shared/           Zod (schemas ditambah di plan berikutnya)
├── package.json          pnpm workspaces root
├── pnpm-workspace.yaml
└── turbo.json            Turborepo config
```

### Database Schema (11 tabel)
- **AUTH:** users, roles, permissions, role_permissions
- **AKADEMIK:** school_units, school_years, classes, students, student_classes
- **KEUANGAN:** payment_posts
- **LOG:** audit_logs

### Seed Data
- 4 roles + 29 permissions + role-permission mapping
- 1 Super Admin: admin@alhasaniyyah.sch.id / Admin123!
- 4 school_units: SD, SMP, SMA, PP
- 1 school_year aktif: 2025/2026
- 8 classes (2 per unit)
- 40 students dummy (10 per unit) dengan NIS unik
- 4 payment_posts: SPP, Uang Gedung, Seragam, Buku

## Perintah Development

```bash
# Install semua dependencies
pnpm install

# Buat file .env dari example
cp apps/backend/.env.example apps/backend/.env
# Edit DATABASE_URL sesuai PostgreSQL lokal

# Setup database
pnpm db:generate    # generate migration files
pnpm db:migrate     # jalankan migration
pnpm db:seed        # isi dummy data

# Jalankan development
pnpm dev            # backend + frontend sekaligus
```

## Keputusan Teknis

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| Package manager | pnpm workspaces | Native monorepo support |
| Build orchestration | Turborepo | Parallel task execution |
| DB driver | node-postgres (pg) | Stable, well-supported di VPS |
| Drizzle mode | node-postgres | Bukan serverless, VPS deployment |
| Enum approach | pgEnum (Postgres native) | Type-safe, tidak perlu check table |
| student_classes constraint | unique(student_id, school_year_id) | 1 siswa 1 kelas per tahun ajaran |
| Seed idempotent | cek existing sebelum insert | Aman dijalankan berkali-kali |

## Next Plans

- **01-02** Auth Backend (JWT, refresh token, RBAC guard) — bisa dikerjakan sekarang
- **01-03** Master Data API (CRUD endpoints) — paralel dengan 01-02
