# CONTEXT.md — Phase 12: Tahun Pelajaran Enhancements

## Overview

Enhancement fitur Master Data Tahun Pelajaran: tambah hapus dengan guard + toggle aktif/nonaktif.

**Type:** Enhancement (bukan phase baru di roadmap)
**Scope:** Backend + Frontend

---

## Goals

1. **Fitur Hapus** — operator bisa hapus tahun pelajaran yang salah input, dengan proteksi agar tidak hapus data yang sudah dipakai
2. **Fitur Set Aktif (Toggle)** — operator bisa mengaktifkan/menonaktifkan tahun pelajaran via toggle; hanya 1 tahun boleh aktif sekaligus

---

## Current State

### Backend (`apps/backend/src/master/school-years/`)
- `GET /master/school-years` ✅
- `GET /master/school-years/:id` ✅
- `POST /master/school-years` ✅
- `PATCH /master/school-years/:id` ✅
- `PATCH /master/school-years/:id/activate` ✅ (sudah ada, atomic — nonaktifkan semua lalu aktifkan target)
- `DELETE /master/school-years/:id` ❌ belum ada

### Frontend (`apps/frontend/src/pages/master/tahun-pelajaran/index.tsx`)
- List, Create, Edit ✅
- Tombol Hapus ❌ belum ada
- Toggle aktif/nonaktif ❌ belum ada (endpoint activate sudah ada tapi belum dihubungkan)

---

## Approach

### Backend — DELETE endpoint

Tambah `DELETE /master/school-years/:id` di controller dan service.

**Guard logic di service sebelum hapus:**
- Cek apakah ada `bills` dengan `schoolYearId = id`
- Cek apakah ada `paymentTemplates` dengan `schoolYearId = id`
- Cek apakah ada `studentClasses` dengan `schoolYearId = id`
- Jika ada salah satu → throw `BadRequestException('Tahun pelajaran tidak dapat dihapus karena sudah memiliki data terkait')`
- Jika tidak ada → hapus

**Tambahan:** Tahun yang sedang aktif (`isActive = true`) juga tidak boleh dihapus — throw error khusus.

Permission: `school_year.delete` (atau gunakan `school_year.update` jika permission baru terlalu berat)

### Frontend — Tombol Hapus

- Tambah tombol Hapus di kolom Aksi (sejajar tombol Edit)
- Klik tombol → tampil `Dialog` konfirmasi: *"Hapus tahun pelajaran [nama]? Tindakan ini tidak bisa dibatalkan."*
- Konfirmasi → call `DELETE /master/school-years/:id`
- Jika backend return error (ada data terkait) → tampilkan pesan error di UI
- Sukses → refresh list

### Frontend — Toggle Aktif

- Kolom Status: ubah badge statis menjadi tombol toggle (klik untuk aktifkan)
- Jika `isActive = true` → badge hijau "Aktif", tidak bisa diklik (atau disabled)
- Jika `isActive = false` → badge abu "Nonaktif", bisa diklik → call `PATCH /master/school-years/:id/activate`
- Sukses → refresh list (yang sebelumnya aktif otomatis berubah jadi nonaktif)

---

## Files to Change

| File | Perubahan |
|------|-----------|
| `apps/backend/src/master/school-years/school-years.controller.ts` | Tambah `@Delete(':id')` endpoint |
| `apps/backend/src/master/school-years/school-years.service.ts` | Tambah method `remove(id)` dengan guard |
| `apps/frontend/src/pages/master/tahun-pelajaran/index.tsx` | Tambah tombol Hapus + Dialog konfirmasi + toggle Status |

---

## Constraints

- Tahun yang sudah aktif tidak boleh dihapus
- Tahun yang sudah punya data (bills/templates/student_classes) tidak boleh dihapus
- Hanya 1 tahun boleh aktif — handled oleh backend activate yang sudah atomic
- Tidak perlu migration schema

---

## Open Questions

- Permission untuk delete: pakai `school_year.delete` baru atau reuse `school_year.update`? → Default: reuse `school_year.update` kecuali ada kebutuhan granular
