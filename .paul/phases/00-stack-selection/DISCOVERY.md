---
phase: 00-stack-selection
topic: Tech Stack Selection untuk SIMKA
depth: standard
confidence: HIGH
created: 2026-05-29
updated: 2026-05-29
---

# Discovery: Tech Stack Selection — SIMKA

**Rekomendasi:** NestJS (backend TypeScript) + React + Vite (frontend TypeScript) — full TypeScript stack, AI-friendly, VPS-ready.

**Confidence:** HIGH

**Konteks keputusan:**
- Deployment: VPS (Redis + Queue tersedia penuh)
- Prioritas: AI-friendly — TypeScript end-to-end agar AI assistant efektif di semua layer

---

## Objective

- Backend framework mana yang AI-friendly dan cocok untuk sistem keuangan sekolah?
- Frontend: framework mana untuk admin dashboard?
- Auth, Queue, ORM, Excel, PDF yang konsisten dengan TypeScript?

---

## Scope

**Include:**
- Backend: Laravel vs NestJS (TypeScript)
- Frontend: Next.js vs React + Vite
- ORM, Auth, Queue, Excel, PDF layer

**Exclude:**
- Payment gateway QRIS (fase berikutnya)
- WhatsApp notification
- Mobile app

---

## Kenapa AI-Friendly Itu Penting

AI coding assistant (Claude, Cursor, Copilot) bekerja jauh lebih baik dengan TypeScript karena:

1. **Type inference** — AI tahu persis tipe data yang masuk/keluar dari setiap fungsi
2. **Predictable pattern** — NestJS module/controller/service/DTO selalu konsisten, AI bisa scaffold seluruh fitur dari satu contoh
3. **Drizzle schema** — TypeScript biasa, AI generate schema + query dengan akurasi tinggi, tidak ada DSL baru yang perlu dipelajari
4. **One language** — Backend dan frontend sama-sama TypeScript, tidak ada context switch
5. **Strict mode** — Error terdeteksi saat coding, bukan saat runtime — AI-generated code lebih aman

Dengan Laravel (PHP), AI tetap bisa membantu tapi ada friction: PHP syntax berbeda, type system lebih lemah, dan AI perlu switch context antara PHP dan TypeScript.

---

## Findings

### Backend: NestJS vs Laravel

#### Option A: NestJS (TypeScript)

**Summary:** Framework Node.js enterprise-grade dengan arsitektur modular berbasis decorator. 60k+ GitHub stars, actively maintained 2025-2026.

**Pros:**
- TypeScript native — AI sangat efektif generate module, DTO, guard, service
- Pola sangat konsisten: setiap fitur = Module + Controller + Service + DTO
- Drizzle ORM: schema TypeScript, SQL-like query, full control untuk query keuangan kompleks
- BullMQ + Redis: queue production-grade, TypeScript-first
- Satu bahasa dengan frontend — developer dan AI tidak perlu context switch
- VPS deployment: pm2 + nginx, straightforward

**Cons:**
- Developer pool Indonesia lebih kecil dari Laravel
- Setup awal lebih verbose dibanding Laravel

**Untuk SIMKA dengan AI-assisted development:** Sangat cocok. AI bisa generate seluruh billing module dari satu contoh module yang ada.

---

#### Option B: Laravel 12 (PHP)

**Summary:** Framework PHP paling mature, ekosistem keuangan sangat kaya.

**Pros:**
- Developer pool Indonesia besar
- Ekosistem school management mature
- Package keuangan sudah banyak (Maatwebsite Excel, DomPDF)

**Cons:**
- PHP — AI kurang optimal, type system lebih lemah
- Context switch PHP ↔ TypeScript (frontend) tiap hari
- Prisma tidak tersedia, Eloquent kurang explicit untuk AI
- Untuk proyek AI-assisted, friction lebih tinggi

**Untuk SIMKA dengan AI-assisted development:** Kurang optimal. AI harus bekerja di dua bahasa berbeda.

---

### Frontend: Next.js vs React + Vite

#### Option A: React 18 + Vite (TypeScript)

**Pros:**
- Pure SPA — mental model sederhana
- Dev HMR sub-100ms
- Bundle lebih kecil, deploy di Nginx VPS mudah
- Tidak ada overhead Server Components / hydration
- AI sangat familiar, generate komponen React dengan akurat

**Cons:**
- Tidak ada SSR (tidak dibutuhkan untuk admin dashboard)

**Untuk SIMKA:** Ideal untuk admin dashboard internal.

---

#### Option B: Next.js 15 (App Router)

**Pros:**
- AI sangat terlatih dengan Next.js — training data sangat banyak
- Server Components bisa digunakan untuk halaman berat

**Cons:**
- Admin dashboard internal tidak butuh SSR/SEO
- App Router complexity (Server vs Client Components, caching rules) menambah overhead
- Dengan backend NestJS terpisah, fitur Server Actions tidak relevan
- Over-engineered untuk use case ini

**Untuk SIMKA:** React + Vite lebih tepat. Next.js cocok jika butuh SSR atau full-stack tanpa API terpisah.

---

### ORM: Prisma vs TypeORM vs Drizzle

| Kriteria | Prisma | TypeORM | Drizzle |
|----------|--------|---------|---------|
| AI-friendliness | Sangat tinggi | Tinggi | Tinggi |
| Schema explicitness | Schema file terpisah | Decorator di class | Schema file |
| PostgreSQL support | Excellent | Good | Excellent |
| Migration | Auto-generate | Auto-generate | Manual-ish |
| NestJS integration | Official guide | Native | Good |
| Maturity | High | High | Sedang |

**Pilih: Drizzle** — TypeScript-first, SQL-like syntax, full control untuk query keuangan kompleks, tidak ada Rust binary, lebih ringan di VPS. NestJS integration solid via drizzle-orm + drizzle-kit.

---

## Stack Final Rekomendasi

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Backend Framework** | NestJS | TypeScript, pola konsisten, AI-friendly |
| **ORM** | Drizzle | SQL-like TypeScript, full control, no binary |
| **Auth** | JWT + NestJS Guards | Stateless, cocok SPA + VPS |
| **Queue** | BullMQ + Redis | TypeScript-first, production-grade |
| **Export Excel** | ExcelJS | TypeScript native, feature-rich |
| **PDF** | Puppeteer | HTML-to-PDF berkualitas tinggi, kwitansi rapi |
| **Database** | PostgreSQL | Sudah diputuskan |
| **Cache/Queue Broker** | Redis | Sudah diputuskan, VPS tersedia |
| **Frontend Framework** | React 18 + Vite | SPA sederhana, admin dashboard |
| **UI Components** | shadcn/ui | Sudah dipilih |
| **State** | Zustand | Sudah dipilih |
| **Table** | Tanstack Table | Sudah dipilih |
| **Form** | React Hook Form | Sudah dipilih |
| **Routing** | React Router v7 | SPA routing |
| **Validation** | Zod | TypeScript schema, shared backend+frontend |
| **HTTP Client** | Axios atau TanStack Query | Data fetching di frontend |

---

## Arsitektur Deployment VPS

```
VPS
├── Nginx (reverse proxy)
│   ├── /api  → NestJS :3000
│   └── /     → React+Vite build (static files)
├── NestJS (pm2)
├── PostgreSQL
├── Redis
└── BullMQ Worker (pm2, proses terpisah)
```

---

## Comparison Ringkas

| Aspek | NestJS + React/Vite | Laravel + React/Vite |
|-------|--------------------|--------------------|
| AI coding efficiency | Sangat tinggi | Sedang |
| Type safety | End-to-end TypeScript | Mixed (PHP + TS) |
| Context switch | Tidak ada | PHP ↔ TypeScript |
| VPS deployment | pm2 + nginx | php-fpm + nginx |
| Queue setup | BullMQ + Redis | Laravel Queue + Redis |
| Excel export | ExcelJS | Maatwebsite Excel |
| PDF | Puppeteer | DomPDF |
| Developer pool Indonesia | Terbatas | Besar |
| Cocok AI-assisted dev | Ya | Kurang optimal |

---

## Recommendation

**Pilih: NestJS + Drizzle + BullMQ (backend) + React + Vite (frontend)**

Dengan VPS dan AI-assisted development, full TypeScript stack memberikan:
- AI bisa generate modul lengkap dari pattern yang ada — scaffolding cepat
- Type error terdeteksi sebelum runtime — AI-generated code lebih aman
- Satu bahasa, satu mental model untuk developer dan AI
- Drizzle schema TypeScript menjadi single source of truth, query SQL-like transparan dan mudah diverifikasi untuk sistem keuangan

**Caveats:**
- Puppeteer membutuhkan ~170MB RAM di VPS untuk headless Chrome — pastikan VPS minimal 2GB RAM
- BullMQ worker perlu dijalankan sebagai proses terpisah (pm2 ecosystem file)
- JWT stateless: implementasikan refresh token + blacklist di Redis untuk void session

---

## Open Questions

- Ukuran VPS yang tersedia? (Puppeteer butuh minimal 2GB RAM) — Impact: high
- Apakah ada developer lain di tim atau solo development dengan AI? — Impact: medium
- Monorepo (satu repo backend + frontend) atau dua repo terpisah? — Impact: low

---

## Quality Report

**Sources consulted:**
- nestjs.com/docs — NestJS official documentation
- orm.drizzle.team/docs — Drizzle + NestJS integration guide
- bullmq.io — BullMQ production guide
- designrevision.com — Vite vs Next.js 2026
- id.indeed.com — job market data Indonesia

**Verification:**
- NestJS aktif di-maintain 2025-2026: Verified (60k+ stars, regular releases)
- Drizzle + PostgreSQL: Official support verified (drizzle-orm/pg-core)
- Puppeteer RAM usage: ~150-200MB per instance (documented)
- BullMQ TypeScript-first: Verified via package docs

**Assumptions:**
- Developer utama akan menggunakan AI assistant (Claude/Cursor) secara intensif
- VPS tersedia minimal 2GB RAM

---

*Discovery updated: 2026-05-29*
*Confidence: HIGH*
*Ready for: /paul:plan Phase 1 — Core System (Auth + Master Data)*
