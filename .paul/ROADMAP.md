# ROADMAP.md — SIMKA

## Milestone: v1.0 — Production Ready

Target: Sistem keuangan sekolah siap digunakan operator.

---

## Phase 01 — Core System

**Status:** ✅ Complete
**Completed:** 2026-05-29
**Plans:** 5/5
**Scope:** Project setup, database schema, auth, dan master data

**Goal:** Fondasi teknis berjalan — developer bisa login, CRUD data master, dan struktur DB sesuai ERD.

**Deliverables:**
- ✅ Project NestJS + React+Vite tersetup dengan TypeScript strict
- ✅ Drizzle schema lengkap untuk semua tabel
- ✅ Auth: login, logout, refresh token, JWT guard, RBAC guard
- ✅ Master API: school_units, school_years, classes
- ✅ Master API: students, student_classes
- ✅ Master API: payment_posts
- ✅ Seed data: roles, permissions, user Super Admin

**Out of scope:** Billing, transaksi, laporan

---

## Phase 02 — Billing Engine

**Status:** ✅ Complete
**Completed:** 2026-05-29
**Plans:** 5/5
**Scope:** Template pembayaran dan generate tagihan massal

**Goal:** Operator bisa setup template tagihan per kelas dan generate tagihan otomatis untuk seluruh siswa.

**Deliverables:**
- payment_templates CRUD (nominal per kelas per pos per tahun ajaran)
- Generate tagihan massal (bills + bill_months) untuk semua siswa di kelas
- Preview sebelum generate
- Data Tagihan: list, filter, status
- Tunggakan: siswa yang belum bayar

**Out of scope:** Proses pembayaran (transaksi)

---

## Phase 03 — Transaction System

**Status:** ✅ Complete
**Completed:** 2026-05-29
**Plans:** 4/4
**Scope:** Proses pembayaran, kwitansi, void

**Goal:** Operator bisa menerima pembayaran, generate kwitansi PDF, dan melakukan void jika perlu.

**Deliverables:**
- ✅ Flow pembayaran: cari siswa → tampil tagihan → pilih → bayar → simpan
- ✅ 1 transaksi bisa bayar multiple tagihan (SPP + buku + dll)
- ✅ Auto-update status bill dan bill_months setelah transaksi
- ✅ Cetak kwitansi PDF (Puppeteer)
- ✅ Void transaksi (bukan delete — reverse status)
- ✅ Riwayat pembayaran per siswa

**Out of scope:** Laporan rekap, export Excel

---

## Phase 04 — Reporting

**Status:** ✅ Complete
**Completed:** 2026-05-29
**Plans:** 4/4
**Scope:** Laporan keuangan, export, dashboard statistik

**Goal:** Bendahara bisa melihat rekap keuangan, export ke Excel/PDF, dengan filter lengkap.

**Deliverables:**
- ✅ Dashboard: jumlah siswa aktif, penerimaan bulan ini, pembayar bulan ini
- ✅ Laporan harian, bulanan, tahunan
- ✅ Laporan tunggakan (per kelas, per unit)
- ✅ Rekap per POS pembayaran
- ✅ Export Excel (ExcelJS) — harian, bulanan, tunggakan, rekap-pos
- ✅ Export PDF (Puppeteer A4) — harian, bulanan, tunggakan, rekap-pos
- ✅ Filter: tanggal, kelas, unit sekolah, tahun ajaran

---

## Progress Summary — Milestone v1.0

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 01 | Core System | ✅ Complete | 5/5 | 2026-05-29 |
| 02 | Billing Engine | ✅ Complete | 5/5 | 2026-05-29 |
| 03 | Transaction System | ✅ Complete | 4/4 | 2026-05-29 |
| 04 | Reporting | ✅ Complete | 4/4 | 2026-05-29 |

**Milestone v1.0 progress:** 4 of 4 phases complete (100%) ✅

---

## Milestone: Frontend SIMKA

**Status:** 🔵 In Progress
**Theme:** Bangun seluruh tampilan web admin SIMKA — dari login sampai laporan — menggunakan React + shadcn/ui.
**Design:** Sidebar hijau #1A3829, accent #00A651, referensi `dashboard-simka.png`, logo `public/logo.png`
**Design Spec:** `.paul/DESIGN-SPEC.md`

### Phase 05 — Auth + Layout + Dashboard

**Status:** ✅ Complete
**Completed:** 2026-05-29
**Plans:** 3/3
**Scope:** Login page, sidebar layout, routing, dashboard (stat cards + info yayasan + quick action + tabel riwayat)
**Flow:** Fondasi semua halaman — auth guard, layout wrapper, React Router setup

### Phase 06 — Master Data UI

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 3/3
**Scope:** CRUD pages for all 5 master data entities (Tahun Pelajaran, Kelas, POS, Siswa, Template)
**Flow:** Urut sesuai dependency data: Tahun → POS → Kelas → Siswa → Template

### Phase 07 — Keuangan UI

**Status:** Not started
**Scope:** Generate Tagihan, Data Tagihan, Form Bayar (flow 7 langkah), Riwayat, Tunggakan, Void
**Flow:** Core value — operator cari siswa → pilih tagihan → input nominal → simpan → cetak kwitansi

### Phase 08 — Laporan + Pengaturan UI

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 3/3
**Scope:** Laporan (harian/bulanan/tahunan/tunggakan/rekap) + export Excel/PDF, Profil + placeholder Pengaturan
**Flow:** Bendahara reporting + admin settings

## Progress Summary — Milestone Frontend SIMKA

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 05 | Auth + Layout + Dashboard | ✅ Complete | 3/3 | 2026-05-29 |
| 06 | Master Data UI | ✅ Complete | 3/3 | 2026-05-30 |
| 07 | Keuangan UI | ✅ Complete | 3/3 | 2026-05-30 |
| 08 | Laporan + Pengaturan UI | ✅ Complete | 3/3 | 2026-05-30 |

**Milestone Frontend SIMKA: 4 of 4 phases complete (100%) ✅**

---

## Milestone: v1.1 — Admin & Go Live

**Status:** ✅ Complete
**Theme:** Lengkapi fitur admin management yang deferred + deploy ke VPS sehingga SIMKA siap digunakan nyata.

### Phase 09 — User & Role Management (Backend)

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 2/2
**Scope:** NestJS CRUD untuk users, roles, assign permissions, ganti password
**Deliverables:**
- ✅ GET/POST/PATCH /users (list, create, update, deactivate via isActive)
- ✅ GET/POST/PATCH /roles (list, create, update)
- ✅ PATCH /roles/:id/permissions (atomic replace permission ke role)
- ✅ PATCH /auth/change-password (user ganti password sendiri)

### Phase 10 — Admin UI (Frontend)

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 2/2
**Scope:** Halaman penuh Pengguna + Role & Akses + Ganti Password (menggantikan placeholder 08-03)
**Deliverables:**
- ✅ /pengaturan/users — tabel users + create/edit/deactivate modal
- ✅ /pengaturan/roles — tabel roles + assign permissions (checkbox list)
- ✅ /pengaturan/profil — form ganti password (PATCH /auth/change-password)

### Phase 11 — Deployment

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 1/1
**Scope:** VPS production setup: Nginx, pm2, env, smoke test
**Deliverables:**
- ✅ nginx/simka.conf — reverse proxy /api + static frontend serving
- ✅ ecosystem.config.js — pm2 config (simka-backend, auto-restart)
- ✅ apps/backend/.env.production.example — template env production (10 variabel)
- ✅ DEPLOY.md — runbook deployment 11 section
- ✅ SIMKA live di http://129.226.213.135 — smoke test approved

## Progress Summary — Milestone v1.1

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 09 | User & Role Management | ✅ Complete | 2/2 | 2026-05-30 |
| 10 | Admin UI | ✅ Complete | 2/2 | 2026-05-30 |
| 11 | Deployment | ✅ Complete | 1/1 | 2026-05-30 |

**Milestone v1.1 — Admin & Go Live: 3 of 3 phases complete (100%) ✅**

---

## Milestone: v1.2 — Enhancements

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Theme:** Peningkatan fitur manajemen data dan UX operator.

### Phase 15 — Class Mapping

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 2/2
**Scope:** Halaman interaktif untuk assign/transfer/lepas siswa ke kelas dengan dual-table UI
**Flow:**
- 15-01: Backend — 3 endpoint baru (GET class members, GET available students, DELETE enrollment)
- 15-02: Frontend — halaman /master/kelas/mapping dengan filter bar + tabel siswa + dual table

**Deliverables:**
- GET /master/student-classes?classId=X&schoolYearId=Y
- GET /master/students/mapping?schoolYearId=X&excludeClassId=Y
- DELETE /master/student-classes/:id
- Halaman mapping.tsx dengan dual-table interaktif, aksi Lepas dan Proses

### Phase 16 — Mapping Fixes

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 1/1
**Scope:** Perbaikan UI halaman Mapping Kelas — sidebar selector dan filter siswa tersedia

**Deliverables:**
- ✅ NavItem `end` prop — sidebar tidak double-highlight di /master/kelas/mapping
- ✅ Filter gabungan NIS+Nama (1 input teks)
- ✅ Filter Kelas Saat Ini jadi dropdown dari data unique currentClassName

### Phase 17 — Mapping Confirm

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 1/1
**Scope:** Modal konfirmasi sebelum aksi Proses batch assign di halaman Mapping Kelas

**Deliverables:**
- ✅ Dialog konfirmasi muncul saat klik tombol Proses
- ✅ Modal tampilkan jumlah siswa + nama kelas tujuan
- ✅ Batal menutup modal tanpa mengubah staging, Konfirmasi menjalankan proses

### Phase 18 — Kelas Enhancements

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 1/1
**Scope:** Kolom jumlah siswa di tab Kelas, modal daftar siswa, konfirmasi Lepas di Mapping

**Deliverables:**
- ✅ GET /master/classes?schoolYearId=X — mengembalikan studentCount via correlated subquery
- ✅ Tab Kelas: kolom Jumlah Siswa tampil per tahun pelajaran aktif
- ✅ Klik baris kelas → Dialog daftar siswa (NIS/Nama/JK) + filter tahun pelajaran
- ✅ Mapping Kelas: Dialog konfirmasi sebelum aksi Lepas siswa

## Progress Summary — Milestone v1.2

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 15 | Class Mapping | ✅ Complete | 2/2 | 2026-05-30 |
| 16 | Mapping Fixes | ✅ Complete | 1/1 | 2026-05-30 |
| 17 | Mapping Confirm | ✅ Complete | 1/1 | 2026-05-30 |
| 18 | Kelas Enhancements | ✅ Complete | 1/1 | 2026-05-30 |

**Milestone v1.2 — Enhancements: 4 of 4 phases complete (100%) ✅**

---

## Milestone: v1.3 — Panduan Penggunaan

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Theme:** Tambah teks panduan di setiap modul dan halaman — font small italic, bahasa awam (non-teknis), mudah dipahami operator. Modul krusial (finansial) menggunakan teks merah sebagai penanda perhatian.

**Panduan krusial (merah):** Form Bayar, Generate Tagihan, Void Transaksi, Mapping Kelas
**Panduan biasa (gray italic):** Dashboard, Master Data, Laporan, Pengaturan

### Phase 19 — Panduan Master & Dashboard

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 2/2
**Scope:** Teks panduan di Dashboard dan semua halaman Master Data (Tahun Pelajaran, Unit Sekolah, Kelas, Mapping Kelas, Siswa, POS, Template Pembayaran)
**Style:** Small italic, gray — kecuali Mapping Kelas yang merah

**Deliverables:**
- ✅ Dashboard: panduan gray italic
- ✅ Tahun Pelajaran: panduan gray italic
- ✅ Manajemen Kelas (Kelas + Unit Sekolah): panduan gray italic
- ✅ Mapping Kelas: panduan merah italic (krusial)
- ✅ Data Siswa: panduan gray italic
- ✅ POS Keuangan: panduan gray italic
- ✅ Template Pembayaran: panduan gray italic

### Phase 20 — Panduan Keuangan (Krusial)

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 1/1
**Scope:** Teks panduan di semua halaman Keuangan — Form Bayar, Generate Tagihan, Data Tagihan, Riwayat Transaksi, Tunggakan, Void
**Style:** Small italic merah untuk Form Bayar, Generate Tagihan, Void — gray untuk sisanya

**Deliverables:**
- ✅ Generate Tagihan: panduan merah italic
- ✅ Form Bayar (Transaksi Baru): panduan merah italic
- ✅ Riwayat Pembayaran (termasuk Void): panduan merah italic
- ✅ Data Tagihan: panduan gray italic
- ✅ Tunggakan: panduan gray italic

### Phase 21 — Panduan Laporan & Pengaturan

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 1/1
**Scope:** Teks panduan di semua halaman Laporan (Harian, Bulanan, Tahunan, Tunggakan, Rekap POS) dan Pengaturan (Users, Roles, Profil)
**Style:** Small italic gray

**Deliverables:**
- ✅ Laporan Harian: panduan gray italic
- ✅ Laporan Bulanan: panduan gray italic
- ✅ Laporan Tahunan: panduan gray italic
- ✅ Laporan Tunggakan: panduan gray italic
- ✅ Rekap POS: panduan gray italic
- ✅ Profil: panduan gray italic
- ✅ Role & Akses: panduan gray italic
- ✅ Pengguna: panduan gray italic

## Progress Summary — Milestone v1.3

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 19 | Panduan Master & Dashboard | ✅ Complete | 2/2 | 2026-05-30 |
| 20 | Panduan Keuangan (Krusial) | ✅ Complete | 1/1 | 2026-05-30 |
| 21 | Panduan Laporan & Pengaturan | ✅ Complete | 1/1 | 2026-05-30 |

**Milestone v1.3 — Panduan Penggunaan: 3 of 3 phases complete (100%) ✅**

---

## Milestone: v1.4 — Safe Delete

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Theme:** Semua modul yang memiliki tombol hapus dilengkapi validasi dependensi — jika record masih punya data terkait, API menolak dengan 409 + relatedData, frontend menampilkan modal informatif.

### Phase 22 — Safe Delete

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 2/2
**Scope:** Backend 409 dependency checks (8 modul) + Frontend DeleteErrorModal (8 halaman)

**Deliverables:**
- ✅ 8 DELETE endpoint backend dengan ConflictException 409 + relatedData
- ✅ Komponen DeleteErrorModal (reusable, menampilkan relatedData)
- ✅ Integrasi safe delete di 8 halaman frontend
- ✅ Tombol Hapus di Riwayat hanya untuk transaksi void
- ✅ Fix: 5 delete permissions ditambah ke seed
- ✅ Fix: Error message relay dari backend untuk error non-409

## Progress Summary — Milestone v1.4

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 22 | Safe Delete | ✅ Complete | 2/2 | 2026-05-30 |

**Milestone v1.4 — Safe Delete: 1 of 1 phases complete (100%) ✅**

---

## Milestone: v1.5 — Naik Kelas

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Theme:** Proses kenaikan kelas siswa antar tahun ajaran secara massal.

### Phase 23 — Naik Kelas Backend

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 1/1
**Scope:** API promotion: preview daftar siswa, proses massal (naik/tinggal/lulus), validasi tunggakan
**Deliverables:**
- ✅ GET /api/academic/promotion/preview — list siswa di kelas+tahun dengan hasTunggakan flag
- ✅ POST /api/academic/promotion — proses massal naik/tinggal/lulus, graceful per-item errors
- ✅ AcademicModule terdaftar di AppModule, TypeScript pass

### Phase 24 — Naik Kelas Frontend

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 1/1
**Scope:** Halaman `/master/naik-kelas` dengan workflow multi-step
**Deliverables:**
- ✅ Route /master/naik-kelas + NavItem "Naik Kelas" di sidebar
- ✅ Filter: Tahun Asal, Kelas, Tahun Tujuan + tombol Tampilkan Siswa
- ✅ Preview table: NIS, Nama, JK, badge Tunggakan, selector Aksi, selector Kelas Tujuan
- ✅ Kelas Tujuan Default apply-to-all
- ✅ Dialog konfirmasi dengan stat cards Naik/Tinggal/Lulus
- ✅ Section Hasil setelah submit

## Progress Summary — Milestone v1.5

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 23 | Naik Kelas Backend | ✅ Complete | 1/1 | 2026-05-30 |
| 24 | Naik Kelas Frontend | ✅ Complete | 1/1 | 2026-05-30 |

**Milestone v1.5 — Naik Kelas: 2 of 2 phases complete (100%) ✅**

---
---

## Milestone: v1.8 — Import Data Siswa

**Status:** 🔵 In Progress
**Theme:** Import data siswa massal via file Excel dengan validasi, dedup, dan auto-generate NIS.

### Phase 27 — Import Siswa via Excel

**Status:** 🔵 Discussed — ready for planning
**Plans:** 0/2
**Scope:** Backend preview+commit endpoints, template download, frontend import page

**Deliverables:**
- Download template .xlsx dengan keterangan kolom wajib
- Upload + preview workflow (validasi per baris, tampilkan sukses vs gagal)
- Commit data valid + ringkasan hasil
- NIS auto-generate: XXX + DDMMYY + 2digitTahunMasuk
- Dedup: nama + nama ortu sama → tolak; NISN duplikat → tolak
- Button "Import Data" di halaman Data Siswa

## Progress Summary — Milestone v1.8

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 27 | Import Siswa via Excel | 🔵 Discussed | 0/2 | — |

**Milestone v1.8 — Import Data Siswa: 0 of 1 phases started**

---

## Milestone: v1.9 — Migrasi Status

**Status:** 🔵 Discussed — phase planned
**Theme:** Sederhanakan status siswa — hapus `isActive`, `studentStatus` jadi single source of truth (aktif, lulus, keluar, pindah). Modul "Naik Kelas" diperluas jadi "Migrasi Status" dengan 5 aksi (Naik, Tinggal, Lulus, Keluar, Pindah) — batch per kelas + individual per siswa.

### Phase 28 — Migrasi Status

**Status:** ✅ Complete
**Completed:** 2026-05-30
**Plans:** 2/2
**Scope:** Backend (schema migration, promotion DTO/service/controller, students service/controller) + Frontend (rename page, remove isActive UI)

**Deliverables:**
- ✅ 28-01 Backend: drop `is_active` column, add `keluar`/`pindah` to promotion, remove toggle-active
- ✅ 28-02 Frontend: halaman Migrasi Status (5 aksi), hapus isActive badge, sidebar rename

## Progress Summary — Milestone v1.9

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 28 | Migrasi Status | ✅ Complete | 2/2 | 2026-05-30 |

**Milestone v1.9 — Migrasi Status: 1 of 1 phases complete (100%) ✅**

---
## Milestone: v2.0 — Manajemen Pembayaran

**Status:** ✅ Complete
**Completed:** 2026-05-31
**Theme:** Refactor modul Template Pembayaran menjadi Manajemen Pembayaran — template tidak terikat kelas, halaman baru dengan dual-table (siswa sudah/belum punya tagihan), hapus sistem no. invoice.

### Phase 30 — Manajemen Pembayaran

**Status:** ✅ Complete
**Completed:** 2026-05-31
**Plans:** 4/4
**Scope:** Rename modul, hapus classId dari template, desain ulang halaman Generate Tagihan + Template jadi dua halaman: Manajemen Pembayaran (CRUD buku) + Generate Pembayaran (dual-table), hapus invoice_number dari bills.

**Deliverables:**
- ✅ 30-01 Backend: DB migration (drop classId + invoice_number), hapus billing-engine, update services
- ✅ 30-02 Backend: 6 endpoint baru payment-management (template, with-bills, without-bills, create bills, edit, delete)
- ✅ 30-03 Frontend: rename sidebar + route, halaman dual-table baru, hapus generate, bersihkan invoice UI
- ✅ 30-04 Frontend: perbaikan — Manajemen Pembayaran = CRUD buku, Generate Pembayaran = pilih buku + dual-table

## Progress Summary — Milestone v2.0

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 30 | Manajemen Pembayaran | ✅ Complete | 4/4 | 2026-05-31 |

**Milestone v2.0 — Manajemen Pembayaran: 1 of 1 phases complete (100%) ✅**

---

## Milestone: v2.1 — Tahun Pelajaran Aktivasi

**Status:** ✅ Complete
**Completed:** 2026-05-31
**Theme:** Pindahkan tombol aktivasi tahun pelajaran dari kolom Status ke kolom Aksi. Kolom Status jadi badge read-only.

### Phase 31 — Tahun Pelajaran Aktivasi

**Status:** ✅ Complete
**Completed:** 2026-05-31
**Plans:** 1/1
**Scope:** Tombol "Aktifkan" di kolom Aksi (selain Edit/Hapus). Status column hanya badge hijau "Aktif" / abu "Nonaktif".

## Progress Summary — Milestone v2.1

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 31 | Tahun Pelajaran Aktivasi | ✅ Complete | 1/1 | 2026-05-31 |

**Milestone v2.1 — Tahun Pelajaran Aktivasi: 1 of 1 phases complete (100%) ✅**

---

## Milestone: v2.2 — Filter Mapping

**Status:** ✅ Complete
**Completed:** 2026-05-31
**Theme:** Tambah filter "Tanpa Kelas" di halaman Mapping Kelas + fix backend WHERE clause agar siswa tanpa kelas tetap muncul.

### Phase 32 — Filter Tanpa Kelas

**Status:** ✅ Complete
**Completed:** 2026-05-31
**Plans:** 1/1
**Scope:** Backend (fix WHERE clause di findAvailableForMapping) + Frontend (opsi "Tanpa Kelas" di dropdown filter)

**Deliverables:**
- ✅ Backend: `or(isNull(classId), ne(classId, excludeId))` — siswa tanpa enrollment muncul di hasil
- ✅ Frontend: opsi "Tanpa Kelas" di dropdown "Kelas Saat Ini" + logic filter `__none__`

## Progress Summary — Milestone v2.2

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 32 | Filter Tanpa Kelas | ✅ Complete | 1/1 | 2026-05-31 |

**Milestone v2.2 — Filter Mapping: 1 of 1 phases complete (100%) ✅**

---

## Milestone: v2.3 — Transaksi Dialog

**Status:** 🔵 In Progress
**Theme:** Redesain flow Transaksi Baru — pencarian siswa via dialog dengan filter (tahun pelajaran, unit, kelas), dialog transaksi dengan pemisahan tagihan bebas vs bulanan, warna kolom bulan, dan keranjang pembayaran.

### Phase 33 — Transaksi Dialog

**Status:** ✅ Complete
**Completed:** 2026-05-31
**Plans:** 2/2
**Scope:** Backend (student search + transaction data endpoint) + Frontend (search dialog + transaction dialog with bebas/bulanan tables, month colors, cart)
**Scope:** Backend (student search endpoint + bill detail endpoint) + Frontend (search dialog, transaction dialog with bebas/bulanan tables, month colors, cart)
**Flow:**
- 33-01: Dialog Pencarian Siswa — filter tahun pelajaran, unit, kelas → tabel NIS/Nama/Kelas/Unit → klik pilih siswa
- 33-02: Dialog Transaksi — identitas siswa, card tunggakan, tabel bebas (Nama Pembayaran, Total Tagihan, Total Bayar, Sisa, Status), tabel bulanan (kolom Jul-Jun dengan warna kuning/abu/hijau, subtotal), keranjang transaksi, konfirmasi → sukses

**Deliverables:**
- Dialog pencarian siswa dengan filter dropdown (tahun pelajaran, unit, kelas)
- Dialog transaksi menampilkan: identitas siswa, total tunggakan, tabel tagihan bebas + bulanan
- Kolom bulan (Jul-Jun) dengan warna: kuning (masuk tagihan), abu (belum masuk), hijau (lunas)
- Klik baris bebas atau kolom bulan → masuk ke keranjang transaksi dengan nilai sisa default
- Keranjang transaksi: nominal bisa disesuaikan, catatan opsional, tombol konfirmasi
- Halaman/dialog transaksi berhasil + tombol cetak kwitansi

## Progress Summary — Milestone v2.3

| Phase | Name | Status | Plans | Completed |
|-------|------|--------|-------|-----------|
| 33 | Transaksi Dialog | ✅ Complete | 2/2 | 2026-05-31 |

**Milestone v2.3 — Transaksi Dialog: 1 of 1 phases complete (100%) ✅**

---
*Last updated: 2026-05-31*
