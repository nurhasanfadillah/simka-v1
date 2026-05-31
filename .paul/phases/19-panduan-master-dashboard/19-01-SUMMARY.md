---
phase: 19-panduan-master-dashboard
plan: 01
subsystem: ui
tags: [react, panduan, guidance, ux, kelas, dashboard]

provides:
  - Teks panduan di Dashboard, Tahun Pelajaran, Manajemen Kelas, Mapping Kelas
  - Pola panduan: gray italic (biasa), red italic (krusial)

affects: [phase 19-02 — panduan Siswa, POS, Template]

key-files:
  modified:
    - apps/frontend/src/pages/dashboard/index.tsx
    - apps/frontend/src/pages/master/tahun-pelajaran/index.tsx
    - apps/frontend/src/pages/master/kelas/index.tsx
    - apps/frontend/src/pages/master/kelas/mapping.tsx

patterns-established:
  - "Gray italic guidance: <p className=\"text-xs italic text-gray-400 mb-4\"> — untuk halaman biasa"
  - "Red italic guidance: <p className=\"text-xs italic text-red-500 -mt-4\"> — untuk modul krusial (space-y-6 wrapper)"
  - "Header div: ganti mb-6 → mb-2 jika langsung diikuti teks panduan"

duration: ~10min
completed: 2026-05-30T00:00:00Z
---

# Phase 19 Plan 01: Panduan Master & Dashboard (Batch 1)

**Tambah teks panduan bahasa awam di 4 halaman — Dashboard, Tahun Pelajaran, Manajemen Kelas (gray italic), dan Mapping Kelas (merah italic sebagai penanda krusial).**

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Panduan Dashboard | Pass | Gray italic, setelah header flex |
| AC-2: Panduan Tahun Pelajaran | Pass | Gray italic, mb-6→mb-2 di header div |
| AC-3: Panduan Manajemen Kelas | Pass | Gray italic, di atas tab bar |
| AC-4: Panduan Mapping Kelas merah | Pass | text-red-500 italic, -mt-4 untuk space-y-6 |

## Files Modified

| File | Change |
|------|--------|
| `apps/frontend/src/pages/dashboard/index.tsx` | Tambah `<p>` panduan gray setelah header |
| `apps/frontend/src/pages/master/tahun-pelajaran/index.tsx` | mb-6→mb-2 di header, tambah `<p>` panduan gray |
| `apps/frontend/src/pages/master/kelas/index.tsx` | mb-6→mb-2 di header, tambah `<p>` panduan gray di atas tab bar |
| `apps/frontend/src/pages/master/kelas/mapping.tsx` | Tambah `<p>` panduan merah setelah header |

## Deviations

Tidak ada — plan dieksekusi sesuai spec.

## Next Phase Readiness

**Ready:** Pola panduan established — Plan 19-02 tinggal replikasi ke Siswa, POS, Template (semua gray italic, tidak ada krusial).

---
*Phase: 19-panduan-master-dashboard, Plan: 01 — Completed: 2026-05-30*
