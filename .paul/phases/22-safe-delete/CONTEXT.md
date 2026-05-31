---
phase: 22-safe-delete
created: 2026-05-30
source: /paul:discuss
---

# Phase 22 — Safe Delete: Context

## Goal

Semua modul yang memiliki tombol hapus harus aman — jika record masih punya data terkait di bawahnya, sistem menolak penghapusan dan menampilkan modal informatif yang menjelaskan data apa saja yang masih terkait beserta jumlahnya.

## Success Criteria

- Tombol hapus tetap tampil di semua modul (tidak disabled)
- Jika record punya dependensi → API return `409 Conflict` dengan `relatedData`
- Frontend menangkap 409 dan menampilkan modal error yang menyebutkan modul terkait + jumlah record
- Jika tidak ada dependensi → hapus berjalan normal (modal konfirmasi biasa atau langsung hapus)
- Transaksi void dapat dihapus; transaksi aktif/lunas tetap tidak bisa dihapus

## Scope — 8 Modul

| Modul | Endpoint | Dependensi yang dicek |
|-------|----------|----------------------|
| **Tahun Pelajaran** | `DELETE /master/school-years/:id` | classes, payment_templates, bills |
| **Kelas** | `DELETE /master/classes/:id` | student_classes (enrollment), payment_templates, bills |
| **Siswa** | `DELETE /master/students/:id` | student_classes (enrollment), bills |
| **Template Pembayaran** | `DELETE /billing/payment-templates/:id` | bills |
| **Role** | `DELETE /roles/:id` | users yang memiliki role ini |
| **User** | `DELETE /users/:id` | hard delete — tidak ada dependensi downstream |
| **POS** | `DELETE /master/payment-posts/:id` *(baru)* | payment_templates, bills via template |
| **Transaksi** | `DELETE /transactions/:id` *(baru, kondisional)* | hanya status `void` yang bisa dihapus |

## Pendekatan Teknis

### Backend-first validation

Setiap `DELETE` endpoint:
1. Cek apakah record exist (404 jika tidak ada)
2. Cek dependensi di database
3. Jika ada dependensi → return `409 Conflict`:
   ```json
   {
     "statusCode": 409,
     "message": "Tidak dapat dihapus karena masih memiliki data terkait",
     "relatedData": {
       "tagihan": 12,
       "template": 3
     }
   }
   ```
4. Jika tidak ada dependensi → lanjutkan delete

### Frontend modal

- Tangkap Axios error status `409`
- Baca `error.response.data.relatedData`
- Tampilkan modal dengan judul "Tidak Dapat Dihapus" dan daftar data terkait
- Tidak ada aksi selain "Tutup" (bukan pilihan force delete)

### Aturan khusus Transaksi

- `DELETE /transactions/:id` hanya diizinkan jika `status === 'void'`
- Jika status bukan void → return `409` dengan pesan "Transaksi aktif tidak dapat dihapus. Gunakan fitur Void terlebih dahulu."
- Jika status void → hard delete (transaction + transaction_items)
- Tombol hapus di halaman Riwayat hanya tampil pada baris yang statusnya `void`

### Aturan khusus POS

- Tambah `DELETE /master/payment-posts/:id` (saat ini endpoint ini tidak ada)
- Cek: apakah POS dipakai di payment_templates atau bills aktif?
- Jika ya → 409 dengan info jumlah template + tagihan terkait

## Constraints

- TIDAK ada "force delete" / override — jika ada dependensi, hapus ditolak tanpa pengecualian
- Transaksi aktif dan lunas tetap tidak bisa dihapus (constraint audit trail dijaga)
- Semua delete harus atomic — jika gagal di tengah, rollback

## Pembagian Kerja (Estimasi)

Plan 22-01: Backend — dependency check di semua 8 endpoint
Plan 22-02: Frontend — modal error 409 di semua 8 halaman + tombol hapus Transaksi void

## Open Questions untuk Planning

- Apakah delete User perlu soft delete (isActive = false) atau hard delete? → **Hard delete** (konfirmasi user)
- Apakah modal konfirmasi "biasa" (sebelum hapus jika tidak ada dependensi) juga perlu ditambah, atau cukup langsung hapus? → Belum ditanyakan, bisa dikonfirmasi saat planning
