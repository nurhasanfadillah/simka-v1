# CONTEXT.md — Phase 15: Class Mapping UI

## Phase Info

**Phase:** 15 — Class Mapping UI
**Type:** Enhancement (Frontend + Backend)
**Status:** Ready for planning

---

## Goals

1. Halaman mapping kelas: admin bisa assign, pindah, dan lepas siswa dari kelas
2. Filter konteks: dropdown tahun pelajaran (default aktif), unit sekolah, kelas target
3. Tabel atas: siswa yang sudah ada di kelas yang dipilih + tombol "Lepas" per baris
4. Dual table bawah — interaktif:
   - **Kiri:** Semua siswa aktif yang tidak ada di kelas yang dipilih, dengan filter NIS/nama/kelas saat ini; klik baris = pindah ke tabel kanan
   - **Kanan:** Staging area — siswa yang akan di-assign; ada tombol "Batal" per baris
5. Tombol "Proses" → assign semua siswa di staging ke kelas yang dipilih

---

## Behavior Rules

- Satu siswa hanya boleh di satu kelas per tahun ajaran
- Jika siswa sudah enrolled di kelas lain → gunakan `PATCH /:id/transfer` (pindah kelas)
- Jika siswa belum enrolled sama sekali di tahun itu → gunakan `POST /` (enroll baru)
- "Lepas" di tabel atas → hapus enrollment siswa dari kelas (unenroll)
- Proses bersifat **tambah**, bukan replace — siswa yang sudah ada di kelas tidak terpengaruh

---

## Backend Gaps (Perlu Dibuat)

| Endpoint | Keterangan |
|----------|------------|
| `GET /master/student-classes?classId=X&schoolYearId=Y` | Daftar siswa yang ada di kelas tertentu |
| `GET /master/students?schoolYearId=Y&excludeClassId=X&isActive=true` | Siswa aktif yang belum di kelas ini (extend filter existing) |
| `DELETE /master/student-classes/:id` | Lepas siswa dari kelas (hapus enrollment) |

### Endpoint yang sudah ada (reuse):
- `POST /master/student-classes` — enroll siswa baru ke kelas
- `PATCH /master/student-classes/:id/transfer` — pindah siswa dari kelas lain

---

## Frontend Approach

- **Lokasi:** Route baru `/master/kelas/mapping` atau sub-page dari halaman Kelas
- **State management:** Local React state untuk staging area (tabel kanan)
- **UI components:** shadcn/ui Select (dropdowns), Table (dual table), Button
- **Pattern:** Ikuti pola halaman Master Data yang sudah ada (Phase 06)

---

## Approach Notes

- Backend: tambah 1 endpoint GET (filter student-classes), extend GET students dengan filter, tambah DELETE student-classes
- Frontend: page baru dengan 3 section (filter bar, tabel kelas saat ini, dual table mapping)
- Tidak butuh BullMQ — operasi per-siswa, tidak massal seperti generate tagihan
- Dual table menggunakan local state (array staging), bukan server state — submit sekali saat "Proses"

---

## Open Questions

- Apakah "Lepas" langsung delete record atau set `isActive = false`? → Perlu konfirmasi saat plan (default: delete record karena unique constraint per tahun ajaran)
- Apakah perlu konfirmasi dialog sebelum "Proses"? → Opsional, bisa ditambah saat implementasi

---

## Prior Phase

**Phase 14 — Unit Class Count (Complete)**
Menambahkan kolom `classCount` di tabel Unit Sekolah. Tidak ada dependency langsung ke Phase 15.
