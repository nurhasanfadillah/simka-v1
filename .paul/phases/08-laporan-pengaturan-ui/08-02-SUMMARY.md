---
phase: 08-laporan-pengaturan-ui
plan: 02
subsystem: ui
tags: [react, laporan, tunggakan, rekap-pos, export]

requires:
  - phase: 08-01
    provides: Laporan Harian/Bulanan/Tahunan + pola komponen laporan
  - phase: 04-reporting
    provides: Backend endpoints /reports/tunggakan + /reports/rekap-pos

provides:
  - Halaman /laporan/tunggakan (filter kelas/tahun, tabel siswa, export)
  - Halaman /laporan/rekap-pos (filter tanggal/tahun, tabel per-POS, export)
  - Types ReportTunggakan + ReportRekapPos di master.ts

affects: [08-03-pengaturan]

tech-stack:
  added: []
  patterns: [filter-driven fetch with useCallback, inline formatRupiah, export via window.open]

key-files:
  created:
    - apps/frontend/src/pages/laporan/tunggakan/index.tsx
    - apps/frontend/src/pages/laporan/rekap-pos/index.tsx
  modified:
    - apps/frontend/src/types/master.ts
    - apps/frontend/src/router.tsx

key-decisions:
  - "Filter unitId dihilangkan di tunggakan — cukup classId + schoolYearId (backend support ada tapi UI pakai 2 filter)"

patterns-established:
  - "Laporan page: filter bar kanan atas, summary card 1-kolom, tabel penuh lebar"
  - "Export: window.open('/api/...?params', '_blank') tanpa komponen tambahan"

duration: ~10min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 08 Plan 02: Laporan Tunggakan + Rekap POS Summary

**Dua halaman laporan live: /laporan/tunggakan (siswa belum lunas) dan /laporan/rekap-pos (breakdown penerimaan per POS) dengan filter, tabel, dan export Excel/PDF.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 min |
| Tasks | 2/2 completed |
| Files modified | 4 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Laporan Tunggakan | Pass | Filter tahun + kelas, tabel siswa, summary, export |
| AC-2: Rekap POS | Pass | Filter dateFrom/dateTo/tahun, tabel per-POS, summary, export |
| AC-3: Loading + empty state | Pass | Skeleton 5 baris + empty state message di kedua halaman |
| AC-4: Routes terdaftar | Pass | /laporan/tunggakan + /laporan/rekap-pos di router, tidak 404 |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/frontend/src/pages/laporan/tunggakan/index.tsx` | Created | Halaman Laporan Tunggakan (115 lines) |
| `apps/frontend/src/pages/laporan/rekap-pos/index.tsx` | Created | Halaman Rekap POS (110 lines) |
| `apps/frontend/src/types/master.ts` | Modified | Tambah ReportTunggakanSiswa, ReportTunggakan, ReportRekapPosItem, ReportRekapPos |
| `apps/frontend/src/router.tsx` | Modified | Import + 2 routes baru setelah /laporan/tahunan |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Hilangkan filter unitId di tunggakan | Backend mendukung tapi UI sudah punya filter kelas (implicit unit) — mengurangi kompleksitas | Filter rekap-pos tetap dateFrom/dateTo/schoolYearId sesuai backend |
| Import alias LaporanTunggakanPage | Hindari konflik dengan TunggakanPage (keuangan) yang sudah ada di router | Tidak ada perubahan pada keuangan/tunggakan |

## Deviations from Plan

None — plan dieksekusi persis sesuai spesifikasi.

## Verification

- `pnpm --filter frontend tsc --noEmit` → 0 errors ✓
- 5 halaman laporan total: harian, bulanan, tahunan, tunggakan, rekap-pos ✓

## Next Phase Readiness

**Ready:**
- 18 pages live total (semua laporan selesai)
- Pola export Excel/PDF konsisten di semua 5 laporan
- Router siap untuk penambahan /pengaturan/* routes

**Concerns:** None

**Blockers:** None — 08-03 (Pengaturan: User, Role, Hak Akses) bisa langsung diplan

---
*Phase: 08-laporan-pengaturan-ui, Plan: 02*
*Completed: 2026-05-30*
