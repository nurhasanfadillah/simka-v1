---
phase: 28-migrasi-status
plan: 28-02
status: DONE
type: execute
depends_on: [28-01]
---

# 28-02-SUMMARY.md — Frontend Migrasi Status

## What was built

| File | Change |
|------|--------|
| `apps/frontend/src/types/master.ts` | Hapus `isActive` dari `Student`, tambah `keluar`/`pindah` ke `PromoteItemDto` + `PromoteResult` |
| `apps/frontend/src/router.tsx` | Route `/master/naik-kelas` → `/master/migrasi-status` |
| `apps/frontend/src/components/sidebar/index.tsx` | Label "Naik Kelas" → "Migrasi Status" |
| `apps/frontend/src/pages/master/migrasi-status.tsx` | File baru (copy dari naik-kelas.tsx + update): 5 aksi, rename semua teks, stat cards baru |
| `apps/frontend/src/pages/master/naik-kelas.tsx` | DIHAPUS |
| `apps/frontend/src/pages/master/siswa/index.tsx` | Hapus badge `isActive`, hapus tombol toggle, hapus `handleToggleActive`, restore `useForm` + `fetchData` |
| `apps/frontend/src/pages/master/siswa/[id].tsx` | Hapus "Status Sistem" (isActive), hanya tampil "Status Akademik" |

## AC Results

| AC | Result |
|----|--------|
| AC-6: Mode Batch dengan 5 aksi | PASS — tabel preview: Naik, Tinggal, Lulus, Keluar, Pindah |
| AC-7: Mode Individual | DEFERRED — fitur tidak di-implementasikan di plan ini (scope limit) |
| AC-8: Keluar/Pindah tanpa Kelas Tujuan | PASS — `sa.action !== 'lulus' && !== 'keluar' && !== 'pindah'` |
| AC-9: isActive dihapus dari UI | PASS — badge + tombol toggle hilang dari list + detail |
| AC-10: Sidebar & routing rename | PASS — label "Migrasi Status", route `/master/migrasi-status` |

## Deviations

- **AC-7 deferred**: Mode Individual (search per siswa) tidak diimplementasikan — perlu backend endpoint yang lebih fleksibel (POST `/academic/promotion` saat ini paired dengan `fromYearId` + `toYearId`). Ini butuh plan terpisah.

## Decisions made

- `studentClasses.isActive` tetap dipertahankan — ini adalah enrollment status, bukan student status
- `HandleApplyDefault` skip `keluar` dan `pindah` (sama seperti `lulus` — tidak butuh kelas tujuan)
- `useForm` dan `fetchData` di `siswa/index.tsx` sempat hilang saat edit — direkonstruksi dan direstore
