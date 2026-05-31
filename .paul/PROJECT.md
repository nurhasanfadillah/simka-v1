# PROJECT.md — SIMKA

## Identitas Proyek

**Nama:** SIMKA — Sistem Manajemen Keuangan Al-Hasaniyyah
**Tipe:** Web Application (Admin Dashboard + REST API)
**Target:** Multi-unit sekolah (SD, SMP, SMA, Pondok Pesantren)

---

## Value Proposition

Sistem keuangan sekolah terpadu yang menggantikan pencatatan manual. Operator cukup cari siswa → pilih tagihan → input bayar → cetak kwitansi. Semua tercatat, tidak ada yang bisa dihapus, audit aman.

---

## Tech Stack (Final)

| Layer | Teknologi |
|-------|-----------|
| Backend | NestJS (TypeScript) |
| ORM | Drizzle ORM + drizzle-kit |
| Auth | JWT + NestJS Guards + Refresh Token (Redis) |
| Queue | BullMQ + Redis |
| Excel | ExcelJS |
| PDF | Puppeteer |
| Validation | Zod (shared FE+BE) |
| Database | PostgreSQL |
| Cache/Queue | Redis |
| Frontend | React 18 + Vite (TypeScript) |
| UI | shadcn/ui |
| State | Zustand |
| Table | Tanstack Table |
| Form | React Hook Form |
| Routing | React Router v7 |
| Chart | Recharts (sparkline stat card) |
| Deployment | VPS + Nginx + pm2 |

---

## Core Requirements

### Wajib Ada
- Generate tagihan otomatis (massal per kelas/unit)
- Void transaksi — TIDAK BOLEH delete transaksi
- Audit log semua perubahan (tabel audit_logs)
- Export laporan: Excel + PDF
- Filter laporan: tanggal, kelas, unit, tahun ajaran
- Multi-role RBAC: Super Admin, Admin, Bendahara, Operator

### Domain

```
AUTH → MASTER → AKADEMIK → KEUANGAN → TRANSAKSI → LAPORAN
```

### Entitas Utama
- users, roles, permissions, role_permissions
- school_units, school_years, classes
- students, student_classes
- payment_posts, payment_templates
- bills, bill_months
- transactions, transaction_items
- audit_logs

---

## Constraints (JANGAN DILANGGAR)

- ❌ Jangan simpan bulan sebagai kolom (gunakan row di bill_months)
- ❌ Jangan delete transaksi (hanya void)
- ❌ Jangan simpan class_id langsung di students (pakai student_classes)
- ❌ Jangan hardcode nominal pembayaran
- ❌ Jangan tanpa audit log untuk perubahan data keuangan
- ✅ Semua perubahan finansial harus ada di audit_logs
- ✅ Status bill dihitung otomatis dari bill_months
- ✅ 1 transaksi bisa bayar multiple tagihan sekaligus

---

## Format Nomor Dokumen

| Dokumen | Format | Contoh |
|---------|--------|--------|
| NIS | 3huruf + ddmmyy + 2digitTahun | ABC30129226 |
| Transaction No | TRX-YYYYMMDD-NNNNN | TRX-20260528-00001 |
| Invoice Bill | INV-[KODE]-YYYY-NNNN | INV-SPP-2026-0001 |

---

## Frontend Structure

```
Dashboard
Master → Tahun Ajaran, Unit Sekolah, Kelas, Mapping Kelas, Naik Kelas, Siswa, POS, Template
Keuangan → Generate Tagihan, Data Tagihan, Transaksi, Riwayat, Tunggakan
Laporan → Harian, Bulanan, Tahunan, Tunggakan, Rekap POS
Pengaturan → User, Role, Hak Akses, Sistem
```

---

## Requirements Validated

### Phase 01 — Core System (2026-05-29)
- ✓ Project NestJS + React+Vite tersetup dengan TypeScript strict
- ✓ Drizzle schema lengkap untuk semua tabel (auth, master, financial)
- ✓ Auth: login, logout, refresh token, JWT guard, RBAC guard
- ✓ Master API: school_units, school_years, classes
- ✓ Master API: students, student_classes
- ✓ Master API: payment_posts (CRUD, no delete, uppercase code)
- ✓ Seed data: roles, permissions, user Super Admin, 4 POS default

### Key Decisions (Phase 01)
| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Backend: NestJS (TypeScript) | AI-friendly, full TypeScript stack |
| 2 | ORM: Drizzle | SQL-like control, no Rust binary |
| 3 | Frontend: React 18 + Vite | SPA admin dashboard |
| 4 | Auth: JWT + Refresh Token (Redis) | Stateless, VPS |
| 5 | Queue: BullMQ + Redis | Generate tagihan massal |
| 6 | PDF: Puppeteer | Kwitansi berkualitas tinggi |
| 7 | Deployment: VPS + Nginx + pm2 | Redis butuh dedicated server |
| 8 | Monorepo: pnpm workspaces + Turborepo | apps/backend + apps/frontend + packages/shared |
| 9 | UI: Green theme #1A3829/#00A651 | Identitas Al-Hasaniyyah |
| 10 | Chart: Recharts | Sparkline ringan, React-first |
| 11 | DB driver: node-postgres (pg) | Stable di VPS, bukan serverless |
| 12 | Seed: idempotent (cek existing) | Aman dijalankan berkali-kali |
| 13 | payment_posts: no DELETE endpoint | POS yang sudah dipakai billing tidak boleh dihapus |
| 14 | code uppercase via @Transform | Konsisten dengan seed data (SPP, UGD, SRM, BKU) |

### Phase 02 — Billing Engine (2026-05-29)
- ✓ Schema billing: payment_templates, bills, bill_months + 2 enum + migration applied
- ✓ Payment Templates CRUD: GET/POST/PATCH /billing/payment-templates dengan joined response
- ✓ Generate tagihan massal: POST /billing/generate (transactional, idempoten) + preview
- ✓ Invoice number sequential: INV-{POSTCODE}-{ENDYEAR}-{NNNN} via MAX parse dalam transaction
- ✓ Data Tagihan: GET /billing/bills (5 filter) + GET /billing/bills/:id (dengan billMonths)
- ✓ Tunggakan API: GET /billing/tunggakan (filter classId + schoolYearId, inArray status)

### Key Decisions (Phase 02)
| # | Decision | Rationale |
|---|----------|-----------|
| 15 | amount pakai integer bukan numeric | Nominal SPP selalu bilangan bulat (rupiah) |
| 16 | onDelete cascade hanya di billMonths.billId | Proteksi data bills dan paymentTemplates |
| 17 | Synchronous generate (no BullMQ) | Cukup untuk kelas < 100 siswa, VPS single server |
| 18 | buildBillMonths: bulan 7-12 + 1-6 | Kalender akademik Indonesia Juli-Juni |
| 19 | Invoice seq via MAX parse dalam tx | Tidak perlu counter table; aman single-server |
| 20 | @Get('tunggakan') sebelum @Get(':id') | NestJS routing: literal route must precede param route |
| 21 | buildBaseQuery() helper di BillsService | Hindari duplikasi JOIN di findAll vs findOne |

### Phase 04 — Reporting (2026-05-29)
- ✓ Dashboard statistik: jumlah siswa aktif, penerimaan bulan ini, pembayar bulan ini
- ✓ Laporan harian: transaksi per hari dengan total penerimaan
- ✓ Laporan bulanan: rekap per hari dalam bulan (filter kelas/unit)
- ✓ Laporan tahunan: rekap per bulan dalam tahun ajaran
- ✓ Laporan tunggakan: siswa belum lunas (filter kelas/unit/tahun ajaran)
- ✓ Rekap POS: breakdown penerimaan per pos pembayaran (filter tanggal/tahun ajaran)
- ✓ Export Excel (ExcelJS) — 4 laporan: harian, bulanan, tunggakan, rekap-pos
- ✓ Export PDF (Puppeteer A4) — 4 laporan: harian, bulanan, tunggakan, rekap-pos

### Key Decisions (Phase 04)
| # | Decision | Rationale |
|---|----------|-----------|
| 29 | ExcelService inject ReportsService, bukan DRIZZLE | Reuse query logic, service tipis hanya formatting |
| 30 | @Res() param pertama di export endpoints | TypeScript TS1016: required param tidak boleh setelah optional |
| 31 | PdfService di-register ulang di ReportsModule | PdfService tanpa NestJS dependency — aman di multiple modules |
| 32 | PdfOptions default A5, A4 via options param | Kwitansi tetap A5, laporan A4 — backward-compat |
| 33 | HTML template literal inline di PdfReportsService | Cukup untuk tabel tabular, 0 dependency tambahan |

### Phase 03 — Transaction System (2026-05-29)
- ✓ Schema: tabel transactions + transaction_items + enum transactionStatusEnum
- ✓ Flow pembayaran: POST /transactions — buat transaksi, bayar multiple bills sekaligus, auto-update bill_months status
- ✓ Transaction number sequential: TRX-YYYYMMDD-NNNNN per hari dalam satu DB transaction
- ✓ Riwayat: GET /transactions (4 filter: studentId, status, dateFrom, dateTo) + GET /transactions/:id (detail lengkap)
- ✓ Void transaksi: PATCH /transactions/:id/void — atomic reverse bill_months + recalculate bills, tidak delete
- ✓ Cetak kwitansi PDF: GET /transactions/:id/receipt — Puppeteer render HTML A5 → PDF binary

### Key Decisions (Phase 03)
| # | Decision | Rationale |
|---|----------|-----------|
| 22 | Void via status + voidedAt/voidedBy, bukan delete | Audit trail keuangan sekolah tidak boleh ada record hilang |
| 23 | billMonthId nullable di transaction_items | Mendukung tagihan bebas (non-bulanan) tanpa bill_months |
| 24 | `req.user.id` bukan `req.user.sub` | JwtStrategy.validate() return `{ id }` — konsisten di semua controller |
| 25 | 0 bill_months → 'belum_bayar' di void context | Bills bebas reversal ke unpaid; konsisten dengan intent void = reversal |
| 26 | `res.end(pdf)` bukan `res.send()` untuk PDF | Hindari double-encoding Buffer binary saat stream ke client |
| 27 | Route :id/receipt BEFORE :id di controller | NestJS literal path harus mendahului param wildcard |
| 28 | PdfService.generateFromHtml() reusable | Phase 04 (Reporting) bisa pakai PdfService yang sama |

---

### Milestone Frontend SIMKA — Phase 05–08 (2026-05-30)

#### Phase 05 — Auth + Layout + Dashboard
- ✓ Login page dengan JWT auth flow
- ✓ AppLayout: sidebar hijau #1A3829, React Router v7
- ✓ Dashboard: stat cards (siswa aktif, penerimaan, pembayar), tabel riwayat transaksi

#### Phase 06 — Master Data UI (3 plans)
- ✓ Tahun Pelajaran CRUD (list + modal create/edit/deactivate)
- ✓ Kelas CRUD dengan filter unit sekolah
- ✓ POS CRUD (no delete), Siswa (list + detail), Template pembayaran

#### Phase 07 — Keuangan UI (3 plans)
- ✓ Generate Tagihan: pilih kelas/tahun → preview → generate massal
- ✓ Data Tagihan: list + filter status/kelas/tahun, detail bill + months
- ✓ Form Bayar multi-tagihan: cari siswa → pilih bills → input nominal → simpan → print kwitansi
- ✓ Riwayat Transaksi: list + filter, void transaksi
- ✓ Tunggakan: filter kelas/tahun, tabel siswa belum lunas

#### Phase 08 — Laporan + Pengaturan UI (3 plans)
- ✓ Laporan Harian, Bulanan, Tahunan dengan export Excel/PDF
- ✓ Laporan Tunggakan siswa dengan filter kelas/tahun + export
- ✓ Rekap POS: breakdown per pos pembayaran + export
- ✓ Profil Pengguna: read-only dari GET /auth/me (nama, email, role, lastLogin, permissions)
- ✓ Placeholder halaman Users + Roles (user/role management dibacklog)

### Key Decisions (Frontend SIMKA)
| # | Decision | Rationale |
|---|----------|-----------|
| 34 | Sidebar statis (tanpa RBAC visibility) | Fase MVP — semua menu tampil, permission guard di backend |
| 35 | Export via window.open('/api/...') | Tidak perlu streaming state — browser handle download langsung |
| 36 | formatRupiah inline di setiap page | Konsisten tanpa shared util — menghindari hidden dependency |
| 37 | Pengaturan scope B (profil read-only + placeholder) | Backend user/role management belum ada di milestone ini |

### Phase 09 — User & Role Management (2026-05-30)

#### Plan 09-01 — Users CRUD + Change Password
- ✓ GET /users — list users dengan roleName (protected user.view)
- ✓ POST /users — create user dengan bcrypt hash + conflict check (protected user.manage)
- ✓ PATCH /users/:id — partial update isActive/name/email/roleId (protected user.manage)
- ✓ PATCH /auth/change-password — self-service ganti password dengan currentPassword validation

#### Plan 09-02 — Roles CRUD + Assign Permissions
- ✓ GET /roles — list roles dengan nested permissions array (protected role.view)
- ✓ POST /roles — create role baru (protected role.manage)
- ✓ PATCH /roles/:id — update nama role (protected role.manage)
- ✓ PATCH /roles/:id/permissions — atomic replace rolePermissions (protected role.manage)

### Key Decisions (Phase 09)
| # | Decision | Rationale |
|---|----------|-----------|
| 38 | @UseGuards dihapus dari controller | APP_GUARD global sudah menangani — tambahan di controller level redundant |
| 39 | JS Map groupBy untuk nested permissions | Drizzle node-postgres tidak support array_agg — flat JOIN + group di TypeScript |
| 40 | Route :id/permissions sebelum :id | NestJS: literal route segment harus mendahului param wildcard |
| 41 | assignPermissions: delete-all + insert atomic | Idempoten dan sederhana — tidak perlu diff antara lama dan baru |

### Phase 10 — Admin UI (2026-05-30)

#### Plan 10-01 — Users Management UI
- ✓ Halaman /pengaturan/users — tabel users + modal create + modal edit/deactivate
- ✓ UserItem, RoleItem, CreateUserDto, UpdateUserDto types di types/master.ts

#### Plan 10-02 — Roles UI + Change Password
- ✓ Halaman /pengaturan/roles — tabel roles + create modal + assign permissions modal (checkbox list)
- ✓ Form ganti password di /pengaturan/profil (PATCH /auth/change-password)
- ✓ PermissionItem, ChangePasswordDto types di types/master.ts

### Key Decisions (Phase 10)
| # | Decision | Rationale |
|---|----------|-----------|
| 42 | allPermissions dikumpulkan dari GET /roles (flatMap + dedup Map) | Tidak ada GET /permissions endpoint — scope limit by design |
| 43 | Dual useForm di ProfilPage (registerPw terpisah) | Menghindari konflik dengan form profil info yang existing |
| 44 | isActive toggle via native `<select>` di Users modal | Konsisten dengan filter dropdown pattern, tidak butuh shadcn Switch |

## Discovery

Stack selection: `.paul/phases/00-stack-selection/DISCOVERY.md` (HIGH confidence)

### Phase 15 — Class Mapping (2026-05-30)

#### Plan 15-01 — Backend Mapping Endpoints
- ✓ GET /master/student-classes?classId=X&schoolYearId=Y — daftar siswa di kelas
- ✓ GET /master/students/mapping?schoolYearId=X&excludeClassId=Y — siswa aktif tersedia untuk mapping (dengan enrollmentId nullable)
- ✓ DELETE /master/student-classes/:id — lepas siswa dari kelas (hard delete)

#### Plan 15-02 — Frontend Class Mapping Page
- ✓ Halaman /master/kelas/mapping — filter bar (tahun pelajaran/unit/kelas)
- ✓ Tabel atas: siswa di kelas terpilih + tombol "Lepas" per baris
- ✓ Dual table: kiri (siswa tersedia + filter NIS/nama/kelas) → klik masuk kanan (staging)
- ✓ Tombol "Batal" per baris di staging, tombol "Proses" untuk batch assign
- ✓ Sidebar NavItem "Mapping Kelas" + route /master/kelas/mapping

### Key Decisions (Phase 15)
| # | Decision | Rationale |
|---|----------|-----------|
| 47 | Hard delete enrollment di remove() | Unique constraint (studentId, schoolYearId) harus bebas agar siswa bisa dienroll ulang |
| 48 | GET /mapping sebelum GET /:id di StudentsController | NestJS: literal route harus mendahului param wildcard |
| 49 | Staging via local React state | Submit batch saat Proses — tidak perlu roundtrip per klik |
| 50 | enrollmentId null → enroll, ada → transfer | Backend returns enrollmentId nullable — frontend 1 check untuk 2 kasus |

### Phase 16 — Mapping Fixes (2026-05-30)

#### Plan 16-01 — Sidebar & Filter Fixes
- ✓ NavItem prop `end` — sidebar tidak double-highlight saat di /master/kelas/mapping
- ✓ Filter siswa tersedia: 1 input teks (cari NIS atau Nama), dropdown untuk Kelas Saat Ini
- ✓ Dropdown kelas diisi dari unique currentClassName data siswa tersedia (auto-reset saat ganti kelas)

### Phase 17 — Mapping Confirm (2026-05-30)

#### Plan 17-01 — Confirmation Modal
- ✓ Modal Dialog konfirmasi sebelum aksi Proses batch assign
- ✓ Tampilkan jumlah siswa + nama kelas tujuan di modal
- ✓ Batal menutup modal, Konfirmasi menjalankan handleProses + tutup modal di finally

### Phase 11 — Deployment (2026-05-30)

#### Plan 11-01 — VPS Deployment
- ✓ nginx/simka.conf: reverse proxy /api ke port 3000, serving React SPA di /var/www/simka/apps/frontend/dist
- ✓ ecosystem.config.js: pm2 config simka-backend (dist/src/main.js, cwd /var/www/simka/apps/backend)
- ✓ apps/backend/.env.production.example: template 10 variabel production
- ✓ DEPLOY.md: runbook 11 section (install, setup DB, upload code, build, migrate, seed, pm2, nginx, firewall)
- ✓ VPS live: http://129.226.213.135 — pm2 online, Nginx aktif, UFW enabled
- ✓ Smoke test passed: login → dashboard → keuangan → laporan → pengaturan semua normal

### Key Decisions (Phase 11)
| # | Decision | Rationale |
|---|----------|-----------|
| 45 | Script path dist/src/main.js bukan dist/main.js | tsconfig.json tanpa rootDir → TypeScript output ke dist/src/ (common ancestor calculation) |
| 46 | pnpm --filter backend/frontend build bukan turbo build | turbo build gagal karena packageManager field tidak ada di package.json root |

### Phase 18 — Kelas Enhancements (2026-05-30)

#### Plan 18-01 — Kelas Enhancements
- ✓ GET /master/classes mengembalikan `studentCount` via SQL correlated subquery, filter per `schoolYearId`
- ✓ Tab Kelas: kolom Jumlah Siswa tampil per tahun pelajaran aktif
- ✓ Klik baris kelas → Dialog modal daftar siswa (NIS/Nama/JK) dengan Select filter tahun pelajaran
- ✓ Halaman Mapping Kelas: Dialog konfirmasi sebelum aksi Lepas siswa

### Key Decisions (Phase 18)
| # | Decision | Rationale |
|---|----------|-----------|
| 51 | Correlated subquery di Drizzle via sql\`\`template | Aggregate field tanpa GROUP BY di query utama — lebih fleksibel saat ada WHERE clause per unit |
| 52 | DialogDescription asChild wrapping div | Select component tidak valid di dalam `<p>` default DialogDescription — asChild render sebagai div hindari DOM warning |
| 53 | Promise.all fetch school-years + school-units di mount | Parallel fetch → minimal latency; school-years dibutuhkan untuk filter tahun di modal daftar siswa |

### Phase 19 — Panduan Master & Dashboard (2026-05-30)

#### Plan 19-01 — Panduan Dashboard, Tahun Pelajaran, Kelas, Mapping Kelas
- ✓ Dashboard: teks panduan gray italic di bawah judul
- ✓ Tahun Pelajaran: teks panduan gray italic di bawah judul
- ✓ Manajemen Kelas: teks panduan gray italic di atas tab bar
- ✓ Mapping Kelas: teks panduan merah italic (krusial) di bawah judul

#### Plan 19-02 — Panduan Siswa, POS, Template
- ✓ Data Siswa: teks panduan gray italic di bawah judul
- ✓ POS Keuangan: teks panduan gray italic di bawah judul
- ✓ Template Pembayaran: teks panduan gray italic di bawah judul

### Key Decisions (Phase 19)
| # | Decision | Rationale |
|---|----------|-----------|
| 54 | Gray italic: `text-xs italic text-gray-400 mb-4` | Konsisten di semua halaman biasa — kecil, tidak mengganggu, tetap terbaca |
| 55 | Red italic: `text-xs italic text-red-500 -mt-4` di wrapper space-y-6 | Modul krusial (Mapping Kelas, Form Bayar, Void) butuh penanda visual berbeda |
| 56 | mb-6 → mb-2 di header div sebelum panduan | Jarak header ke konten utama tetap wajar meski ada elemen panduan di antara |

### Phase 20 — Panduan Keuangan (2026-05-30)

#### Plan 20-01 — Panduan 5 Halaman Keuangan
- ✓ Generate Tagihan: panduan merah italic (krusial)
- ✓ Form Bayar (Transaksi Baru): panduan merah italic (krusial)
- ✓ Riwayat Pembayaran: panduan merah italic (krusial — ada aksi Void)
- ✓ Data Tagihan: panduan gray italic
- ✓ Tunggakan: panduan gray italic

### Phase 21 — Panduan Laporan & Pengaturan (2026-05-30)

#### Plan 21-01 — Panduan 8 Halaman Laporan & Pengaturan
- ✓ Laporan Harian: panduan gray italic — rekap transaksi per tanggal, tombol Export
- ✓ Laporan Bulanan: panduan gray italic — rekap per hari dalam bulan, filter bulan/tahun
- ✓ Laporan Tahunan: panduan gray italic — rekap per bulan dalam tahun ajaran
- ✓ Laporan Tunggakan: panduan gray italic — daftar siswa belum lunas, filter kelas/tahun
- ✓ Rekap POS: panduan gray italic — breakdown penerimaan per pos pembayaran
- ✓ Profil: panduan gray italic — info akun login + form ganti password
- ✓ Role & Akses: panduan gray italic — kelola peran dan hak akses pengguna
- ✓ Pengguna: panduan gray italic — kelola akun, nonaktifkan jangan hapus

**Milestone v1.3 COMPLETE** — seluruh halaman SIMKA memiliki panduan penggunaan bahasa awam.

### Phase 22 — Safe Delete (2026-05-30)

#### Plan 22-01 — Backend Safe Delete
- ✓ 8 DELETE endpoint dengan ConflictException 409 + relatedData: school-years, classes, students, payment-posts, payment-templates, roles, users, transactions (void only)

#### Plan 22-02 — Frontend Safe Delete
- ✓ Komponen DeleteErrorModal — menampilkan relatedData dari 409 dengan LABEL_MAP
- ✓ Integrasi di 8 halaman: Tahun Pelajaran, Kelas, Siswa, POS, Template, Roles, Users, Riwayat
- ✓ Riwayat: tombol Hapus conditional hanya untuk status void
- ✓ Fix: tambah 5 delete permissions ke seed (payment_post.delete, payment_template.delete, transaction.delete, student.delete, user.manage)
- ✓ Fix: error message relay dari backend untuk non-409 errors

### Key Decisions (Phase 22)
| # | Decision | Rationale |
|---|----------|-----------|
| 57 | Delete permissions tidak ada di seed awal | Seed v1.0 tidak include delete permissions — ditambah saat v1.4 |
| 58 | Error message relay (non-409) | Backend 400 bisa punya pesan informatif — tampilkan ke user, bukan generic message |
| 59 | Seed idempotent untuk fix permissions | Cara tercepat fix tanpa schema migration baru — seed aman dijalankan ulang |

**Milestone v1.4 COMPLETE** — semua 8 modul dengan tombol hapus memiliki safe delete yang informatif.

### Phase 23 — Naik Kelas Backend (2026-05-30)

#### Plan 23-01 — Academic Promotion API
- ✓ GET /academic/promotion/preview — list siswa di kelas+tahun dengan hasTunggakan flag
- ✓ POST /academic/promotion — proses massal naik/tinggal/lulus, graceful per-item errors
- ✓ AcademicModule terdaftar di AppModule, TypeScript pass

### Phase 24 — Naik Kelas Frontend (2026-05-30)

#### Plan 24-01 — Halaman Naik Kelas
- ✓ Route /master/naik-kelas + NavItem "Naik Kelas" (GraduationCap) di sidebar
- ✓ 5 TypeScript interfaces: PromotionPreviewStudent, PromotionPreviewResponse, PromoteItemDto, PromoteDto, PromoteResult
- ✓ Filter: Tahun Asal, Kelas, Tahun Tujuan + tombol Tampilkan Siswa
- ✓ Preview table: NIS, Nama, JK, badge Tunggakan, selector Aksi (Naik/Tinggal/Lulus), selector Kelas Tujuan
- ✓ Kelas Tujuan Default apply-to-all di atas tabel
- ✓ Dialog konfirmasi dengan stat cards Naik/Tinggal/Lulus + warning tunggakan
- ✓ Section Hasil setelah submit dengan error list per siswa gagal
- ✓ Panduan merah italic (krusial) di header halaman

### Key Decisions (Phase 23–24)
| # | Decision | Rationale |
|---|----------|-----------|
| 60 | toYearId tidak direset saat ganti kelas preview | UX: user mungkin proses beberapa kelas ke tahun tujuan yang sama tanpa re-select |
| 61 | Summary dihitung di render-time bukan useMemo | Data kecil, code lebih sederhana |
| 62 | Tidak ada validasi level kelas tujuan di frontend | Backend tidak enforce, scope limit by design |

**Milestone v1.5 COMPLETE** — proses naik kelas massal tersedia end-to-end.

### Phase 32 — Filter Tanpa Kelas (2026-05-31)

#### Plan 32-01 — Filter Tanpa Kelas di Mapping
- ✓ Backend: fix WHERE clause `findAvailableForMapping` — `or(isNull(classId), ne(classId, excludeId))` agar siswa tanpa enrollment muncul
- ✓ Frontend: opsi "Tanpa Kelas" di dropdown filter "Kelas Saat Ini" di halaman Mapping Kelas
- ✓ Filter logic: `filterClassId === '__none__'` → hanya tampilkan siswa dengan `currentClassName === null`

### Key Decisions (Phase 32)
| # | Decision | Rationale |
|---|----------|-----------|
| 62 | `or(isNull(classId), ne(classId, excludeId))` | `ne(NULL, value)` di PostgreSQL = NULL (bukan boolean) → row di-skip oleh WHERE. `isNull` + `or` memastikan siswa tanpa kelas tetap muncul |
| 63 | `filterClassId === '__none__'` untuk filter "Tanpa Kelas" | `currentClassName` bisa null — perlu check eksplisit bukan sekedar string match |

**Milestone v2.2 COMPLETE** — filter Tanpa Kelas di Mapping Kelas berfungsi.

---
*Last updated: 2026-05-31 after Phase 32*
