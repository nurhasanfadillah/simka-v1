# 34-03-SUMMARY.md — Core Components

## Status: DONE ✅

## What Was Built

| File | Lines | Change |
|------|-------|--------|
| `apps/frontend/src/components/ui/skeleton.tsx` | 13 | New — Skeleton component dengan animate-pulse + rounded-sm |
| `apps/frontend/src/components/ui/badge.tsx` | 33 | New — Badge CVA 6 variants (default, secondary, success, warning, danger, outline) |
| `apps/frontend/src/components/ui/table.tsx` | 108 | New — shadcn Table/Header/Body/Footer/Row/Head/Cell/Caption |
| `apps/frontend/src/components/ui/separator.tsx` | 29 | New — Separator horizontal/vertical via @radix-ui/react-separator |
| `apps/frontend/src/App.tsx` | +3 | Added `<Toaster>` from sonner (bottom-right, richColors) |
| `apps/frontend/package.json` | +2 deps | `@radix-ui/react-separator`, `sonner` |

## AC Results

| AC | Criteria | Result |
|----|----------|--------|
| AC-1 | Skeleton dengan animasi pulse | PASS ✓ |
| AC-2 | Badge 6 variants (default/secondary/success/warning/danger/outline) | PASS ✓ |
| AC-3 | Table shadcn standard (Header/Body/Row/Head/Cell) | PASS ✓ |
| AC-4 | Separator horizontal/vertical | PASS ✓ |
| AC-5 | Sonner Toaster terpasang di App.tsx | PASS ✓ |
| AC-6 | Build pass | PASS ✓ |

## Decisions
| # | Decision | Rationale |
|---|----------|-----------|
| 71 | Badge pakai rounded-full (pill) | Exception dari "no round" karena status pill adalah UI pattern universal |
| 72 | Table wrapper div `overflow-auto` | Responsive: tabel panjang bisa horizontal scroll di mobile |
| 73 | Sonner `richColors` + `closeButton` | Toast lebih informatif dengan warna sukses/error dan user bisa dismiss manual |

## Built
- `pnpm --filter frontend build` → PASS (2006 modules, 3.94s)
