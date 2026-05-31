# Milestones — SIMKA

Completed milestone log for this project.

| Milestone | Completed | Duration | Stats |
|-----------|-----------|----------|-------|
| v1.0 — Production Ready | 2026-05-29 | 1 hari | 4 phases, 18 plans |
| Frontend SIMKA | 2026-05-30 | 1 hari | 4 phases, 12 plans |
| v1.1 — Admin & Go Live | 2026-05-30 | 1 hari | 3 phases, 5 plans |

---

## ✅ v1.0 — Production Ready

**Completed:** 2026-05-29
**Duration:** 1 hari

### Stats

| Metric | Value |
|--------|-------|
| Phases | 4 |
| Plans | 18 |
| Scope | Backend API lengkap — auth, master data, billing, transaksi, laporan |

### Key Accomplishments

- NestJS + React+Vite monorepo dengan TypeScript strict tersetup penuh
- Drizzle schema lengkap: 13 tabel + enum + migration
- Auth JWT + Refresh Token (Redis) + RBAC guard
- Billing engine: generate tagihan massal per kelas, invoice sequential
- Transaction system: multi-bill payment, void (non-delete), kwitansi PDF
- Reporting: laporan harian/bulanan/tahunan/tunggakan/rekap-pos + export Excel + PDF

---

## ✅ Frontend SIMKA

**Completed:** 2026-05-30
**Duration:** 1 hari

### Stats

| Metric | Value |
|--------|-------|
| Phases | 4 (Phase 05–08) |
| Plans | 12 |
| Scope | Seluruh UI admin dashboard — login sampai laporan |

### Key Accomplishments

- AppLayout dengan sidebar hijau #1A3829 + React Router v7
- Dashboard: stat cards + tabel riwayat transaksi
- Master Data CRUD: Tahun Pelajaran, Kelas, POS, Siswa, Template (5 entities)
- Keuangan UI: Generate Tagihan, Form Bayar 7-langkah, Riwayat, Tunggakan, Void
- Laporan UI: Harian/Bulanan/Tahunan + export Excel/PDF dari browser
- Profil pengguna + placeholder Pengaturan Users & Roles

---

## ✅ v1.1 — Admin & Go Live

**Completed:** 2026-05-30
**Duration:** 1 hari

### Stats

| Metric | Value |
|--------|-------|
| Phases | 3 (Phase 09–11) |
| Plans | 5 |
| Files changed | 10+ |

### Key Accomplishments

- User management API: GET/POST/PATCH /users + deactivate (isActive flag)
- Role management API: GET/POST/PATCH /roles + atomic assign permissions
- Self-service ganti password: PATCH /auth/change-password
- Admin UI: halaman Pengguna, Role & Akses, Ganti Password (menggantikan placeholder)
- SIMKA live di http://129.226.213.135 — pm2, Nginx, UFW production-ready
- Smoke test passed: login → dashboard → keuangan → laporan → pengaturan

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| dist/src/main.js bukan dist/main.js | tsconfig tanpa rootDir → TypeScript ke common ancestor path |
| pnpm --filter build bukan turbo build | turbo gagal karena packageManager field tidak ada di root |
| allPermissions dari GET /roles (dedup) | Tidak ada GET /permissions endpoint — by design |

---
