---
phase: 05-auth-layout-dashboard
plan: 02
subsystem: ui
tags: [react-router, layout, sidebar, navigation, auth-guard]

requires:
  - phase: 05-01
    provides: auth store (useAuthStore), axios (apiClient), Tailwind + shadcn/ui setup
provides:
  - React Router v7 routing (BrowserRouter + Routes)
  - ProtectedRoute — redirect ke /login jika tidak authenticated
  - AppLayout — sidebar 260px + main content area
  - Sidebar — gradient #1A3829, 4 sections, 18 nav items, user info, logout
  - Dashboard placeholder page
  - Full login→dashboard→logout flow
affects:
  - 05-03 (dashboard page — langsung pakai AppLayout)
  - 06, 07, 08 (semua pakai router + AppLayout + sidebar yang sama)

tech-stack:
  added: []
  patterns:
    - NavLink dengan isActive untuk active state detection
    - ProtectedRoute wrapper pattern untuk semua protected pages
    - AppLayout sebagai shell — children di-inject per halaman
    - SectionLabel component untuk group nav items

key-files:
  created:
    - apps/frontend/src/router.tsx
    - apps/frontend/src/components/ProtectedRoute.tsx
    - apps/frontend/src/layouts/AppLayout.tsx
    - apps/frontend/src/components/sidebar/index.tsx
    - apps/frontend/src/components/sidebar/NavItem.tsx
    - apps/frontend/src/pages/dashboard/index.tsx
  modified:
    - apps/frontend/src/App.tsx (render Router)
    - apps/frontend/src/pages/login/index.tsx (tambah redirect + hooks order fix)

key-decisions:
  - "Semua hooks dipanggil sebelum conditional return di LoginPage (Rules of Hooks)"
  - "Sidebar nav disesuaikan flow data: Master→Keuangan→Laporan→Pengaturan"
  - "Catch-all route redirect ke /dashboard untuk routes Phase 06-08 yang belum ada"

patterns-established:
  - "ProtectedRoute: bungkus semua halaman terproteksi di router.tsx"
  - "AppLayout: import Sidebar sekali, children berubah per route"
  - "useAuthStore.getState() di luar React (interceptors); useAuthStore((s)=>s.x) di dalam React"

duration: ~30min
started: 2026-05-29T16:20:00Z
completed: 2026-05-29T16:30:00Z
---

# Phase 05 Plan 02: Layout + Routing Summary

**React Router v7 + ProtectedRoute + sidebar hijau 4-section (18 nav items) berhasil dibangun — full login→dashboard→logout flow live.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~30 menit |
| Tasks | 3/3 completed + 1 checkpoint approved |
| Files created | 6 |
| Files modified | 2 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Routing + auth guard | Pass | /dashboard → redirect /login ✓, login → /dashboard ✓ |
| AC-2: AppLayout + sidebar design | Pass | Gradient #1A3829, logo, nav sesuai spec ✓ |
| AC-3: User info + logout | Pass | SA initials, nama, role, logout → /login ✓ |
| AC-4: Section labels + nav structure | Pass | 4 sections, 18 items, active state via NavLink ✓ |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/router.tsx` | Created | BrowserRouter + semua route definitions |
| `src/components/ProtectedRoute.tsx` | Created | Auth guard wrapper |
| `src/layouts/AppLayout.tsx` | Created | Shell: Sidebar + main content |
| `src/components/sidebar/index.tsx` | Created | Sidebar lengkap 4 sections |
| `src/components/sidebar/NavItem.tsx` | Created | NavLink dengan active state |
| `src/pages/dashboard/index.tsx` | Created | Placeholder untuk Plan 05-03 |
| `src/App.tsx` | Modified | Render `<Router />` |
| `src/pages/login/index.tsx` | Modified | + redirect jika auth, + navigate setelah login |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Semua hooks sebelum conditional return | Rules of Hooks — useForm tidak boleh setelah if-return | Login page tidak crash di production |
| Sidebar 4 sections, 18 items | User minta disesuaikan flow data — Master→Keuangan→Laporan→Pengaturan | Nav items sudah cocok untuk Phase 06-08 |
| Catch-all → /dashboard | Routes Phase 06-08 belum ada, perlu fallback | Akan diganti proper routes saat Phase 06-08 dibangun |

## Deviations from Plan

| Type | Detail |
|------|--------|
| Scope addition | Sidebar nav direction direvisi sesuai permintaan user — 18 nav items vs 9 di plan awal |
| Auto-fixed | Rules of Hooks — hooks dipindah sebelum conditional return di login page |

## Next Phase Readiness

**Ready:**
- AppLayout siap — Plan 05-03 tinggal buat konten, bungkus di AppLayout sudah di router.tsx
- Semua routes didefinisikan di router.tsx — tinggal tambah komponen per route
- Sidebar sudah complete — tidak perlu dimodifikasi lagi di Plan 05-03

**Concerns:**
- Dashboard placeholder masih "Memuat data..." — Plan 05-03 akan replace ini
- Catch-all route masih redirect ke /dashboard — perlu diganti saat Phase 06-08 dibangun

**Blockers:** Tidak ada

---
*Phase: 05-auth-layout-dashboard, Plan: 02*
*Completed: 2026-05-29*
