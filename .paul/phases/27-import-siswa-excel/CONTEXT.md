# CONTEXT.md — Phase 27: Import Data Siswa via Excel

**Phase:** 27 — Import Data Siswa via Excel
**Milestone:** v1.8 (baru)
**Created:** 2026-05-30
**Status:** Ready for planning

---

## Goals

1. **Halaman import siswa**
   - Tombol "Import Data" di halaman Data Siswa → navigasi ke `/master/siswa/import`
   - Download template Excel (.xlsx) dengan keterangan kolom wajib

2. **Upload + Preview workflow**
   - Upload file .xlsx → backend parse + validasi → tampilkan preview
   - Preview: tabel baris sukses vs gagal + alasan error
   - User klik "Import" → commit data valid

3. **NIS auto-generate**
   - Format: XXX + DDMMYY(tgl_lahir) + 2digit_tahun_masuk
   - Semua siswa mendapat NIS auto — tidak ada kolom NIS di template
   - Tahun Masuk dari dropdown di halaman import (satu nilai untuk seluruh batch)

4. **Dedup detection**
   - Tolak: Nama + Nama Orang Tua sama (case-insensitive, cross-check existing DB + antar baris)
   - Tolak: NISN sudah ada di database (jika diisi)

## Workflow

```
Halaman Data Siswa → Tombol "Import Data"
        ↓
/master/siswa/import
  ├── Dropdown Tahun Masuk
  ├── Tombol Download Template (.xlsx)
  └── Upload File (.xlsx only)
        ↓
POST /master/students/import/preview → parse + validasi → Preview tabel
        ↓
User klik "Import" → POST /master/students/import/commit → simpan
        ↓
Ringkasan: X sukses, Y gagal
```

## Template (.xlsx)

| Kolom | Status | Validasi |
|-------|--------|----------|
| Nama* | Wajib | Tidak boleh kosong |
| Jenis Kelamin* (L/P) | Wajib | Harus L atau P |
| Tanggal Lahir* (DD/MM/YYYY) | Wajib | Format valid |
| Nama Orang Tua* | Wajib | Tidak boleh kosong |
| NISN | Optional | Unique jika diisi |
| Tempat Lahir | Optional | - |
| Telepon | Optional | - |
| Alamat | Optional | - |
| Jenis Pendaftaran | Optional | - |
| Status Siswa | Optional | Default: aktif |

> Kolom bertanda `*` wajib diisi — keterangan di header template.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /master/students/template | Download template .xlsx |
| POST | /master/students/import/preview | Parse + validasi, return preview rows |
| POST | /master/students/import/commit | Simpan data valid ke database |

## Decisions

| Decision | Rationale |
|----------|-----------|
| NIS selalu auto-generate | Operator tidak perlu input NIS — sistem yang generate konsisten |
| Tahun Masuk dari dropdown | Satu batch import biasanya satu angkatan — tidak perlu isi per baris |
| Preview sebelum commit | UX aman — operator bisa lihat error sebelum data masuk |
| Dedup: nama + nama ortu | Duplikat yang paling mungkin terjadi saat input massal; NISN secondary check |
| Excel (.xlsx) only | Format universal yang dipahami operator sekolah; library ExcelJS sudah ada |
| Tidak assign ke kelas | Scope terpisah — penempatan tetap via Mapping Kelas yang sudah ada |
| Tidak update siswa existing | Import hanya untuk siswa baru — update data via halaman edit siswa |

## Constraints

- Gunakan ExcelJS (sudah ada di project untuk export laporan)
- Password hashing tidak relevan (siswa tidak login)
- Backend transaction: atomic per commit — jika 1 gagal di tengah, rollback semua
- Template rows: max 500 baris per import untuk menghindari timeout
- Response preview harus informatif: per baris tampilkan status + pesan error

## Out of Scope

- Tidak assign ke kelas (Mapping Kelas terpisah)
- Tidak generate tagihan (Generate Tagihan terpisah)
- Tidak update data siswa existing
- Tidak import foto siswa
- Tidak validasi relasi (kelas, unit, dll — tidak ada di scope ini)

---

*Context created: 2026-05-30*
*Next: /paul:plan untuk Phase 27*
