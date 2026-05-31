# 31-01-SUMMARY.md — Tahun Pelajaran Aktivasi

## What was built

| # | Change | File |
|---|--------|------|
| 1 | Pindahkan tombol aktivasi dari kolom Status ke kolom Aksi | `pages/master/tahun-pelajaran/index.tsx` |
| 2 | Status column jadi badge read-only (Aktif = hijau, Nonaktif = abu) | Same |

## AC Results

| AC | Status | Note |
|----|--------|------|
| AC-1 Tombol di Aksi | ✅ | Tombol "Aktifkan" muncul di kolom Aksi untuk tahun nonaktif |
| AC-2 Status read-only | ✅ | Badge hijau/abu tanpa tombol |
| AC-3 Hanya satu aktif | ✅ | Backend `activate()` nonaktifkan semua lalu aktifkan satu (transactional) |

## Deviations

None. Plan executed exactly as specified.
