# CONTEXT.md — Phase 25: Siswa Enhancements

**Phase:** 25 — Siswa Enhancements
**Milestone:** v1.6 (baru)
**Created:** 2026-05-30
**Status:** Ready for planning

---

## Goals

1. **Action icon menu di tabel Data Siswa**
   - Ganti tombol teks Ubah/Hapus dengan icon `⋮` (DropdownMenu shadcn)
   - Opsi di dropdown: Lihat Detail / Edit / Nonaktifkan (atau Aktifkan) / Hapus
   - Tujuan: baris tabel tidak overflow di layar kecil

2. **Kelola aktif/non-aktif siswa**
   - Tambah field `isActive` boolean di tabel `students` (backend)
   - PATCH endpoint untuk toggle isActive
   - Action menu menampilkan "Nonaktifkan" atau "Aktifkan" sesuai status current
   - Tabel menampilkan badge status (Aktif / Non-aktif)

3. **Halaman detail siswa**
   - Route `/master/siswa/:id` — page view read-only
   - Tampilkan semua info siswa: identitas, kontak, status, riwayat kelas
   - Tombol "Edit" di halaman → buka form edit (modal atau navigate)
   - Dapat diakses dari action menu "Lihat Detail"

4. **Form tambah/edit siswa yang dinamis**
   - Layout 2 kolom dengan 3 section bernama:
     - **Identitas**: NIS, Nama, JK, Tempat Lahir, Tanggal Lahir
     - **Kontak**: Nama Orang Tua, Telepon, Alamat
     - **Status Pendaftaran**: Jenis Pendaftaran, Status Siswa, Tahun Masuk
   - Berlaku untuk form Create dan form Edit

---

## Approach

- **Backend first**: tambah `isActive` ke schema students + migration + PATCH /master/students/:id/toggle-active
- **Frontend**: update halaman siswa.tsx — action menu, badge, detail page, form baru
- **Pola**: ikuti pola yang ada (apiClient, useState lokal, shadcn DropdownMenu)
- **DropdownMenu**: gunakan shadcn `DropdownMenu` yang sudah ada di komponen library
- **Route detail**: `/master/siswa/:id` — tambah di router.tsx

## Decisions

| Decision | Rationale |
|----------|-----------|
| `isActive` boolean, bukan ubah `studentStatus` | studentStatus punya semantik permanen (lulus/keluar/pindah); isActive untuk suspend sementara, konsisten dengan pola users |
| Halaman detail read-only + tombol Edit | UX bersih untuk operator yang hanya perlu lihat info; edit via button agar tidak confusing |
| Layout 2 kolom 3 section | Form siswa ~10 field — flat 1 kolom terlalu panjang; 2 kolom + sections lebih scannable |
| Action menu ⋮ bukan tombol teks | Tabel tidak overflow di viewport kecil; pattern umum untuk multi-action per row |

## Constraints

- Tidak mengubah field `studentStatus` yang sudah ada
- Safe delete tetap berlaku — hapus siswa dengan data terkait tetap 409
- Tidak ada perubahan di backend selain tambah `isActive` + endpoint toggle
- Halaman detail tidak menampilkan data keuangan (bills/transaksi) — scope terlalu lebar

## Open Questions

- Apakah form edit siswa juga dari halaman detail, atau tetap modal seperti sekarang? → Tentukan saat planning (rekomendasi: navigate ke /master/siswa/:id/edit)
- Apakah badge "Non-aktif" perlu filter di tabel? → Bisa ditambah sebagai enhancement kecil

---
*Context created: 2026-05-30*
*Next: /paul:plan untuk Phase 25*
