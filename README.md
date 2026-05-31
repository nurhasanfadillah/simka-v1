# SIMKA — Sistem Manajemen Keuangan Al-Hasaniyyah

Sistem keuangan sekolah terpadu multi-unit (SD, SMP, SMA, Pondok Pesantren). Operator mencari siswa, memilih tagihan, input pembayaran, cetak kwitansi — semua tercatat, audit aman, tidak ada yang bisa dihapus.

## Tech Stack

| Layer      | Teknologi                        |
| ---------- | -------------------------------- |
| Backend    | NestJS (TypeScript)              |
| ORM        | Drizzle ORM + drizzle-kit        |
| Auth       | JWT + Refresh Token (Redis)      |
| Queue      | BullMQ + Redis                   |
| Validation | Zod (shared FE+BE)               |
| Database   | PostgreSQL                       |
| Cache      | Redis                            |
| Frontend   | React 18 + Vite (TypeScript)     |
| UI         | shadcn/ui + Tailwind CSS         |
| State      | Zustand                          |
| Table      | Tanstack Table                   |
| Form       | React Hook Form                  |
| Routing    | React Router v7                  |
| Excel      | ExcelJS                          |
| PDF        | Puppeteer                        |
| Monorepo   | pnpm workspaces + Turborepo      |
| Deploy     | VPS + Nginx + pm2                |

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** 15+
- **Redis** 7+

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/nurhasanfadillah/simka-v1.git
cd simka-v1
pnpm install
```

### 2. Environment Setup

```bash
cp apps/backend/.env.example apps/backend/.env
```

| Variable               | Description             | Default                                      |
| ---------------------- | ----------------------- | -------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection   | `postgresql://postgres:password@localhost:5432/simka_db` |
| `REDIS_HOST`           | Redis host              | `localhost`                                  |
| `REDIS_PORT`           | Redis port              | `6379`                                       |
| `JWT_ACCESS_SECRET`    | JWT access token secret | (ganti di production)                        |
| `JWT_REFRESH_SECRET`   | JWT refresh token secret| (ganti di production)                        |
| `PORT`                 | Backend port            | `3000`                                       |
| `FRONTEND_URL`         | Frontend URL for CORS   | `http://localhost:5173`                      |

### 3. Database Setup

```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data (roles, permissions, Super Admin)
pnpm db:seed
```

Seed creates:
- 4 default roles: Super Admin, Admin, Bendahara, Operator
- 30+ permissions
- 4 default payment posts: SPP (bulanan), Uang Gedung, Seragam, Buku
- 1 Super Admin user: `admin@simka.local` / `admin123`

### 4. Start Development

```bash
# Run both backend + frontend
pnpm dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## Project Structure

```
simka-v1/
├── apps/
│   ├── backend/                    # NestJS API
│   │   ├── src/
│   │   │   ├── auth/              # Auth (JWT, RBAC, guards)
│   │   │   ├── billing/           # Billing (bills, payment management)
│   │   │   ├── master/            # Master data (siswa, kelas, POS, dll)
│   │   │   ├── academic/          # Akademik (promotion/naik kelas)
│   │   │   ├── transactions/      # Transaksi pembayaran + PDF kwitansi
│   │   │   ├── reports/           # Laporan + Excel/PDF export
│   │   │   ├── db/                # Database (schema, seed, module)
│   │   │   └── redis/             # Redis module
│   │   └── drizzle/               # Migration files
│   └── frontend/                   # React SPA
│       └── src/
│           ├── pages/             # Halaman (dashboard, master, keuangan, laporan)
│           ├── components/        # Shared components (sidebar, ui)
│           ├── layouts/           # App layout wrapper
│           ├── stores/            # Zustand stores (auth)
│           ├── types/             # TypeScript interfaces
│           └── lib/               # API client, utilities
├── packages/shared/               # Shared validation schemas
├── nginx/                         # Nginx config for production
├── .paul/                         # PAUL framework (plans, state, roadmap)
└── DEPLOY.md                      # Production deployment guide
```

## Architecture

### Domain Flow

```
AUTH → MASTER → AKADEMIK → KEUANGAN → TRANSAKSI → LAPORAN
```

### Key Entities

| Entity             | Table              | Description                        |
| ------------------ | ------------------ | ---------------------------------- |
| Users + Roles      | users, roles, permissions, role_permissions | RBAC multi-role     |
| School Units       | school_units       | SD, SMP, SMA, Pondok               |
| School Years       | school_years       | Tahun ajaran (2025/2026)           |
| Classes            | classes            | Kelas per unit                     |
| Students           | students           | Data siswa + NIS auto-generate     |
| Student Classes    | student_classes    | Enrollment siswa per tahun         |
| Payment Posts      | payment_posts      | Jenis pembayaran (SPP, UGD, dll)   |
| Payment Templates  | payment_templates  | Template nominal per pos/tahun     |
| Bills              | bills              | Tagihan per siswa                  |
| Bill Months        | bill_months        | Detail bulanan (Juli-Juni)         |
| Transactions       | transactions       | Transaksi pembayaran               |
| Transaction Items  | transaction_items  | Item yang dibayar per transaksi    |
| Audit Logs         | audit_logs         | Audit trail semua perubahan        |

### Payment Types

- **Bulanan** — Tagihan per bulan (Juli-Juni), contoh: SPP
- **Bebas** — Tagihan satu kali, contoh: Uang Gedung, Seragam, Buku

## Features

### Master Data
- Tahun Pelajaran (CRUD + aktivasi)
- Unit Sekolah (CRUD)
- Kelas (CRUD + jumlah siswa)
- Mapping Kelas (assign/transfer/lepas siswa)
- Migrasi Status (naik/tinggal/lulus/keluar/pindah)
- Siswa (CRUD + import Excel + NIS auto-generate)
- POS Keuangan (jenis pembayaran)

### Keuangan
- Manajemen Pembayaran (template tagihan)
- Generate Pembayaran (dual-table assign siswa)
- **Transaksi Baru** — dialog pencarian siswa dengan filter + dialog transaksi (tabel bebas & bulanan dengan warna kolom)
- Riwayat Transaksi + Void
- Data Tagihan
- Tunggakan

### Laporan
- Harian, Bulanan, Tahunan
- Tunggakan per siswa
- Rekap per POS
- Export Excel & PDF

### Pengaturan
- Manajemen Pengguna
- Role & Hak Akses (RBAC)
- Profil + Ganti Password

## Key Design Decisions

- **Void, bukan delete** — Transaksi yang salah dibatalkan via void, data tetap ada
- **1 transaksi = multiple tagihan** — Bisa bayar SPP + buku + seragam sekaligus
- **NIS auto-generate** — Format: 3huruf + DDMMYY + 2digitTahunMasuk
- **Invoice sequential** — INV-{POSTCODE}-{YEAR}-{NNNN} via MAX parse dalam transaction
- **Safe delete** — Semua DELETE endpoint cek dependency, tolak dengan 409 + relatedData
- **Bulan disimpan sebagai row** — bill_months, bukan kolom di tabel bills
- **Audit trail** — Semua perubahan data keuangan tercatat di audit_logs

## Available Scripts

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | Run backend + frontend dev servers    |
| `pnpm build`        | Build all packages                    |
| `pnpm lint`         | Lint all packages                     |
| `pnpm db:generate`  | Generate Drizzle migrations           |
| `pnpm db:migrate`   | Run pending migrations                |
| `pnpm db:seed`      | Seed database (idempotent)            |
| `pnpm db:studio`    | Open Drizzle Studio                   |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for full VPS deployment guide (Ubuntu + Nginx + pm2 + PostgreSQL + Redis).

Quick summary:

```bash
# Build
pnpm build

# Backend with pm2
pm2 start ecosystem.config.js

# Nginx reverse proxy + static frontend
sudo cp nginx/simka.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/simka.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## License

Proprietary — Yayasan Al-Hasaniyyah.
