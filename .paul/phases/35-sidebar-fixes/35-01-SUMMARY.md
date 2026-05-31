# 35-01-SUMMARY.md — Sidebar Fixes

## Status: DONE ✅

## What Was Built

| File | Lines | Change |
|------|-------|--------|
| `sidebar/index.tsx` | 164 | Full rewrite — hamburger collapsed, toggle inline, logout inline, header sticky |

## Changes Detail

| Issue | Before | After |
|-------|--------|-------|
| Collapsed state logo | `<img src="/logo.png">` kecil | `<button><Menu /></button>` hamburger |
| Toggle chevron | `absolute right-2 top-5` floating | `inline` di header expanded (kanan logo) |
| Logout button | Di bawah profil, baris terpisah | Icon saja, sejajar kanan avatar + nama |
| Footer layout | Fixed `border-t` di bawah nav | Di dalam nav, ikut scroll |
| Header | Ikut scroll | `sticky top-0` — tetap di atas |
| Gradasi header (tambahan) | Gradasi hanya di aside | Re-applied di sticky header div untuk menjaga kontinuitas visual |

## AC Results

| AC | Criteria | Result |
|----|----------|--------|
| AC-1 | Hamburger ganti logo saat collapsed | PASS ✓ |
| AC-2 | Toggle clean inline (tidak floating) | PASS ✓ |
| AC-3 | Logout icon sejajar info profil | PASS ✓ |
| AC-4 | Header sticky, footer ikut scroll | PASS ✓ |
| AC-5 | Build pass | PASS ✓ |

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 77 | Gradasi di-reapply ke sticky header div | Tanpa ini, sticky header kehilangan background saat konten di-scroll di bawahnya |
| 78 | Footer masuk `<nav>` bukan di luar | Agar scroll bersama nav content — satu scroll container |

## Built
- `pnpm --filter frontend build` → PASS (2010 modules, 4.92s)
