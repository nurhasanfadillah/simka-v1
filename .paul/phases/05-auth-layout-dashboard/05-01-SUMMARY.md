---
phase: 05-auth-layout-dashboard
plan: 01
subsystem: ui
tags: [react, tailwindcss, shadcn, zustand, axios, react-hook-form, zod]

requires: []
provides:
  - Tailwind v3 + shadcn/ui configured dengan custom color tokens SIMKA
  - Zustand auth store (accessToken, refreshToken, user, isAuthenticated) + localStorage persist
  - Axios instance dengan Bearer token interceptor + refresh token flow
  - Login page (/login) sesuai design spec — gradient hijau, logo, form validasi
  - shadcn/ui base components: Button, Input, Label, Card
affects:
  - 05-02 (routing + layout — imports auth store, reuses components)
  - 05-03 (dashboard — imports apiClient, useAuthStore)
  - 06, 07, 08 (semua phase frontend — pakai fondasi ini)

tech-stack:
  added:
    - react-router-dom@^7
    - zustand@5.0.14
    - axios
    - react-hook-form
    - "@hookform/resolvers"
    - zod
    - lucide-react
    - recharts
    - "@tanstack/react-table"
    - clsx
    - tailwind-merge
    - class-variance-authority
    - "@radix-ui/react-slot"
    - "@radix-ui/react-label"
    - tailwindcss@^3
    - postcss
    - autoprefixer
    - shadcn/ui (button, input, label, card)
  patterns:
    - Zustand store dengan persist middleware untuk auth state
    - Axios interceptor pattern untuk token management
    - CSS variable-based theming (shadcn/ui convention)
    - react-hook-form + zod untuk form validation

key-files:
  created:
    - apps/frontend/src/stores/auth.store.ts
    - apps/frontend/src/lib/api.ts
    - apps/frontend/src/lib/utils.ts
    - apps/frontend/src/pages/login/index.tsx
    - apps/frontend/tailwind.config.ts
    - apps/frontend/components.json
  modified:
    - apps/frontend/src/App.tsx
    - apps/frontend/src/main.tsx
    - apps/frontend/src/index.css

key-decisions:
  - "border-border @apply diganti CSS variable langsung — Tailwind v3 + shadcn/ui compatibility"
  - "tailwind.config.ts extend full CSS variable color tokens — required agar shadcn components berjalan"
  - "Zustand v5 menggunakan `partialize` bukan `partialObject` untuk persist filter"

patterns-established:
  - "apiClient (Axios) — gunakan dari @/lib/api, bukan import axios langsung"
  - "useAuthStore.getState() di luar React component (interceptors, utils)"
  - "useAuthStore((s) => s.field) di dalam React component"

duration: ~45min
started: 2026-05-29T16:00:00Z
completed: 2026-05-29T16:15:00Z
---

# Phase 05 Plan 01: Foundation Summary

**Tailwind v3 + shadcn/ui + Zustand auth store + axios interceptor + login page berhasil dibangun — fondasi frontend SIMKA siap.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~45 menit |
| Started | 2026-05-29 |
| Completed | 2026-05-29 |
| Tasks | 3/3 completed + 1 checkpoint approved |
| Files created | 13 |
| Files modified | 2 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Tailwind + shadcn/ui aktif | Pass | 0 TypeScript error, button.tsx exists |
| AC-2: Auth store berfungsi | Pass | isAuthenticated false by default, setAuth + logout tersedia |
| AC-3: Axios instance dengan interceptor | Pass | Bearer token attach otomatis, refresh flow + queue implemented |
| AC-4: Login page sesuai design spec | Pass | Screenshot confirmed — gradient hijau, logo, form, validasi |

## Accomplishments

- Seluruh runtime dependencies frontend terinstall (router, state, form, table, chart, icons)
- Tailwind v3 dikonfigurasi dengan custom color tokens SIMKA (`primary: #1A3829`, `accent: #00A651`)
- shadcn/ui setup manual (components.json) tanpa CLI interactive — 4 base components ready
- Auth store dengan persistence ke localStorage — user tetap login setelah page refresh
- Axios interceptor dengan concurrent request queuing saat refresh sedang berjalan
- Login page visual sesuai DESIGN-SPEC.md — background gradient, logo segi lima, validasi realtime

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/frontend/tailwind.config.ts` | Created | Tailwind config dengan custom colors + CSS variable tokens |
| `apps/frontend/postcss.config.js` | Created | PostCSS config untuk Tailwind |
| `apps/frontend/src/index.css` | Created | Tailwind directives + shadcn/ui CSS variables |
| `apps/frontend/components.json` | Created | shadcn/ui config (tanpa CLI init) |
| `apps/frontend/src/lib/utils.ts` | Created | `cn()` helper (clsx + tailwind-merge) |
| `apps/frontend/src/components/ui/button.tsx` | Created | shadcn Button component |
| `apps/frontend/src/components/ui/input.tsx` | Created | shadcn Input component |
| `apps/frontend/src/components/ui/label.tsx` | Created | shadcn Label component |
| `apps/frontend/src/components/ui/card.tsx` | Created | shadcn Card component |
| `apps/frontend/src/stores/auth.store.ts` | Created | Zustand auth store dengan persist |
| `apps/frontend/src/lib/api.ts` | Created | Axios instance + interceptors |
| `apps/frontend/src/pages/login/index.tsx` | Created | Login page sesuai design spec |
| `apps/frontend/src/App.tsx` | Modified | Render LoginPage (sementara, routing di 05-02) |
| `apps/frontend/src/main.tsx` | Modified | Tambah `import './index.css'` |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `@apply border-border` → CSS variable langsung | Tailwind v3 tidak bisa `@apply` class yang belum ada saat compile time | Lebih stable, sama secara visual |
| Extend tailwind.config dengan full CSS variable colors | shadcn/ui components butuh `border`, `input`, `ring`, dll sebagai Tailwind colors | Semua shadcn components berjalan tanpa modifikasi |
| Zustand `partialize` (bukan `partialObject`) | Zustand v5 API — field `partialObject` tidak ada, correct field adalah `partialize` | Persist hanya state, bukan actions |
| Tambah `import './index.css'` ke main.tsx | File ini tidak ada di plan — diperlukan agar Tailwind styles loaded | Tanpa ini halaman tidak dapat styling |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 3 | Essential, no scope creep |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Semua fix essential, tidak ada scope creep.

### Auto-fixed Issues

**1. CSS — `@apply border-border` tidak valid di Tailwind v3**
- **Found during:** Task 1 (verify — browser menunjukkan error)
- **Issue:** Tailwind v3 tidak bisa `@apply` utility class yang belum terdefinisi saat PostCSS compile
- **Fix:** Ganti dengan `border-color: hsl(var(--border))` langsung di CSS
- **Files:** `src/index.css`
- **Verification:** Browser reload tanpa error

**2. Config — tailwind.config.ts perlu full CSS variable color tokens**
- **Found during:** Task 1 (setelah fix CSS, shadcn components butuh color tokens)
- **Issue:** shadcn/ui components menggunakan class `bg-border`, `text-muted-foreground`, dll — ini butuh Tailwind color tokens yang map ke CSS variables
- **Fix:** Extend config dengan `border`, `input`, `ring`, `background`, `foreground`, `secondary`, `destructive`, `muted`, `popover`, `card` color tokens
- **Files:** `tailwind.config.ts`
- **Verification:** pnpm lint 0 error, browser render benar

**3. main.tsx — missing `import './index.css'`**
- **Found during:** Task 3 (visual verification)
- **Issue:** Plan tidak mencantumkan modifikasi main.tsx, tapi file ini tidak import index.css — tanpa ini Tailwind styles tidak loaded
- **Fix:** Tambah `import './index.css'` ke main.tsx
- **Files:** `src/main.tsx`
- **Verification:** Login page tampil dengan styling benar

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Vite HMR tidak langsung pick up perubahan tailwind.config.ts | Reload browser manual setelah config change |

## Next Phase Readiness

**Ready:**
- Semua dependencies terinstall — 05-02 bisa langsung import react-router-dom, zustand, lucide-react
- `useAuthStore` tersedia — 05-02 bisa implement ProtectedRoute dengan `isAuthenticated`
- `apiClient` tersedia — 05-03 bisa langsung hit GET /reports/dashboard
- shadcn/ui base components tersedia — 05-02 bisa pakai untuk sidebar elements
- Login page sudah render — 05-02 hanya perlu wrap dalam BrowserRouter + ProtectedRoute

**Concerns:**
- App.tsx saat ini hardcode `<LoginPage />` — harus diganti routing di 05-02
- Belum ada redirect setelah login sukses — 05-02 yang handle via `useEffect` + `navigate`

**Blockers:** Tidak ada

---
*Phase: 05-auth-layout-dashboard, Plan: 01*
*Completed: 2026-05-29*
