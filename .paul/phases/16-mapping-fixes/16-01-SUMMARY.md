---
phase: 16-mapping-fixes
plan: 01
completed: 2026-05-30
duration: ~5min
---

# Phase 16 Plan 01: Mapping Fixes Summary

**Perbaikan sidebar selector aktif dan filter siswa tersedia di halaman Mapping Kelas.**

## AC Result

| Criterion | Status |
|-----------|--------|
| AC-1: Sidebar hanya highlight satu item aktif di /master/kelas/mapping | Pass |
| AC-2: Filter siswa tersedia menggunakan 1 input teks (NIS atau Nama) | Pass |
| AC-3: Filter kelas saat ini berupa dropdown dari data unik | Pass |

## Files Changed

| File | Change |
|------|--------|
| `apps/frontend/src/components/sidebar/NavItem.tsx` | Modified — tambah prop `end?: boolean`, teruskan ke NavLink |
| `apps/frontend/src/components/sidebar/index.tsx` | Modified — pasang `end` pada NavItem `/master/kelas` |
| `apps/frontend/src/pages/master/kelas/mapping.tsx` | Modified — gabung filterNis+filterName→filterSearch, filterClass→filterClassId+Select dropdown |

---
*Completed: 2026-05-30*
