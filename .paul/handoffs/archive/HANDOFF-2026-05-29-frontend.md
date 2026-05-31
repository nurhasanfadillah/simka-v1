# PAUL Session Handoff

**Session:** 2026-05-29
**Phase:** 05 — Auth + Layout + Dashboard (not started)
**Context:** Milestone v1.0 backend selesai 100%, milestone Frontend SIMKA dibuat, siap plan Phase 05

---

## READ THIS FIRST

Kamu tidak punya konteks sebelumnya. Dokumen ini berisi semua yang perlu diketahui.

**Project:** SIMKA — Sistem Manajemen Keuangan Al-Hasaniyyah
**State saat ini:** Milestone v1.0 backend COMPLETE. Milestone Frontend SIMKA baru dibuat. Belum ada plan yang berjalan di milestone baru ini.

---

## Session Accomplishments

- **Plan 04-03** — ExcelService + 4 endpoint export Excel (harian, bulanan, tunggakan, rekap-pos) — live ✓
- **Plan 04-04** — PdfReportsService + 4 endpoint export PDF A4 (Puppeteer) — live ✓
- **Milestone v1.0 backend** — 100% complete, Phase 01-04 semua selesai
- **Milestone Frontend SIMKA** — dibuat dengan 4 phase (05, 06, 07, 08)
- **DESIGN-SPEC.md** — dibuat di `.paul/DESIGN-SPEC.md` (color palette, layout, components)
- **Logo** — disalin ke `apps/frontend/public/logo.png`
- **Phase directories** — `.paul/phases/05-08` semua dibuat

---

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| 4 phase untuk frontend (05-08) | Sesuai domain: Auth/Layout, Master, Keuangan, Laporan | Urutan eksekusi mengikuti dependency data |
| Design mengikuti referensi dashboard-simka.png | User minta persis seperti gambar | Sidebar #1A3829, accent #00A651, white cards |
| Logo segi lima Al-Hasaniyyah di sidebar | User provide file logo langsung | Simpan di apps/frontend/public/logo.png |
| Phase 05 plan pertama = foundation setup | Frontend belum ada deps sama sekali | Plan 05-01 harus install semua deps dulu |

---

## Critical Context untuk Phase 05

### Frontend saat ini = KOSONG
```json
dependencies: {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "shared": "workspace:*"
}
```
**Belum ada:** react-router-dom, zustand, axios, shadcn/ui, tailwindcss, react-hook-form, lucide-react, recharts, @tanstack/react-table

### Design Spec (wajib baca sebelum plan)
File: `.paul/DESIGN-SPEC.md`

Key values:
- Sidebar bg: `#1A3829` (gradient ke `#2D5A3D`)
- Active nav: `#00A651`
- Accent light: `#E8F5EE`
- Logo: `apps/frontend/public/logo.png`
- Font: Inter / system sans-serif

### Backend API sudah live
- Base URL: `http://localhost:3000/api`
- Login: `POST /auth/login` → `{ access_token, refresh_token, user }`
- Dashboard stats: `GET /reports/dashboard`
- Transaksi riwayat: `GET /transactions`

---

## Phase 05 — Scope & Breakdown

**Goal:** Login page + sidebar layout + routing + dashboard

Rekomendasi split 3 plan:

**Plan 05-01: Foundation** (deps + tailwind + auth store + API client)
- Install: tailwindcss, shadcn/ui, react-router-dom v6/v7, zustand, axios, react-hook-form, lucide-react
- Tailwind config dengan custom colors (#1A3829, #00A651)
- shadcn/ui init
- Zustand auth store (access_token, user, login/logout actions)
- Axios instance dengan interceptor (Bearer token + refresh)
- Login page (`/login`) — form centered, logo besar, green gradient

**Plan 05-02: Layout + Routing**
- AppLayout component: sidebar (260px, #1A3829) + main area
- Sidebar: logo, nav items dengan icons (lucide-react), active state, user info bottom, logout
- React Router setup: ProtectedRoute, `/login` → redirect if auth, `/` → redirect to `/dashboard`
- Nav structure sesuai DESIGN-SPEC.md

**Plan 05-03: Dashboard Page**
- 3 stat cards: Jumlah Siswa Aktif, Pembayar Bulan Ini, Penerimaan Bulan Ini
- Info card Yayasan (logo + nama + alamat + kontak)
- Quick Action (Transaksi + Laporan)
- Tabel riwayat transaksi terbaru (5 baris + pagination)
- Date picker header (bulan/tahun)
- Hit API: GET /reports/dashboard + GET /transactions

---

## Reference Files untuk Next Session

```
@.paul/DESIGN-SPEC.md
@.paul/ROADMAP.md
@.paul/STATE.md
@apps/frontend/package.json
@apps/frontend/src/App.tsx
@apps/frontend/vite.config.ts
```

---

## Prioritized Next Actions

| Priority | Action | Effort |
|----------|--------|--------|
| 1 | `/paul:plan` untuk Plan 05-01 (Foundation: deps + auth store + login) | ~20 menit |
| 2 | `/paul:apply` Plan 05-01 | ~15 menit |
| 3 | `/paul:plan` Plan 05-02 (Layout + Routing) | ~20 menit |
| 4 | `/paul:plan` Plan 05-03 (Dashboard page) | ~20 menit |

---

## State Summary

**Current:** Milestone Frontend SIMKA, Phase 05 not started, loop ○○○
**Next:** `/paul:plan` → buat Plan 05-01 (Foundation setup)
**Resume:** `/paul:resume` lalu baca handoff ini

---

## Catatan Penting

- `pnpm dev` untuk frontend dijalankan dari root atau `apps/frontend` (Vite, port 5173)
- Backend tetap di `apps/backend && pnpm dev` (port 3000)
- Docker: `docker start simka-postgres simka-redis` sebelum backend
- Semua gambar referensi ada di session context tapi tidak disimpan — gunakan DESIGN-SPEC.md sebagai sumber desain

---

*Handoff created: 2026-05-29*
