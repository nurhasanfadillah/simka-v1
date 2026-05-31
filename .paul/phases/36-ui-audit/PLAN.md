# PLAN.md — Phase 36: UI Polish Audit

> Audit: 24 halaman, 200+ temuan | Prioritas: CRITICAL → HIGH → MEDIUM → LOW

---

## Wave 0: Global Infrastructure

### Plan 36-01 — Base CSS + Shared Components

**Task 36-01-A: Fix index.css global tokens**
- [ ] Add z-index scale: `--z-sidebar: 30`, `--z-overlay: 40`, `--z-mobile: 50`
- [ ] Add `text-balance` default to `h1, h2, h3`
- [ ] Verify all CSS variables are used (no hardcoded hex)

**Task 36-01-B: Fix AppLayout**
- [ ] `min-h-screen` → `min-h-dvh` (line 16)
- [ ] Remove `transition-[margin]` → snap margin instantly (line 40)
- [ ] Add `safe-area-inset-top` to mobile hamburger button
- [ ] `w-5 h-5` → `size-5` (line 22)

**Task 36-01-C: Fix Sidebar**
- [ ] Remove gradient → solid `bg-primary` (line 77)
- [ ] `transition-all` → `transition-[transform,opacity]` (line 79)
- [ ] Add `aria-label` to 4 icon-only buttons (lines 68, 89, 106, 163)
- [ ] `w-* h-*` → `size-*` for square elements (5 locations)

**Task 36-01-D: Fix NavItem**
- [ ] Active state contrast: `text-accent` → `text-white` on dark bg (fails WCAG AA at 3.1:1)
- [ ] `w-* h-*` → `size-*` (2 locations)
- [ ] `transition-all` → `transition-colors`
- [ ] `border-l-[3px]` → `border-l-2` or custom token

**Verification:** Sidebar renders correctly, mobile menu works, no layout shift on collapse

---

## Wave 1: Global Patterns — All Pages

### Plan 36-02 — Skeleton Loading Fix (CRITICAL)

**All 24 pages** have `<div />` empty skeletons. Replace with:

```tsx
// Before (broken):
<div />  // or <div></div>

// After (working):
<div className="space-y-3 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
  <div className="h-4 bg-gray-200 rounded w-5/6" />
</div>
```

Pages to fix: dashboard, tahun-pelajaran, kelas (×2 tabs), mapping, migrasi-status, pos, siswa, siswa/[id], manajemen-pembayaran, generate (×2), tagihan, transaksi/baru, riwayat, tunggakan, harian, bulanan, tahunan, laporan-tunggakan, rekap-pos, profil, users, roles

**Verification:** Setiap halaman tampil skeleton bars saat loading, bukan blank white

### Plan 36-03 — tabular-nums + text-balance (HIGH)

**Apply to ALL pages:**
- [ ] `tabular-nums` on all numeric data: amounts, NIS, counts, dates, stats
- [ ] `text-balance` on all `<h1>`, `<h2>`, `<p>` descriptions

**Verification:** Angka di tabel tidak loncat lebar saat nilai berubah

---

## Wave 2: Table Polish

### Plan 36-04 — Table Wrapper Standardization (CRITICAL)

**4 halaman** table wrapper tanpa styling:

```tsx
// Fix pattern:
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-md transition-shadow duration-200">
  <table className="w-full">
    ...
  </table>
</div>
```

Pages: kelas (×2 tabs), pos, manajemen-pembayaran, users, roles

- [ ] Add `w-full` to ALL `<table>` elements
- [ ] Standardize table header: `px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider`
- [ ] Right-align amount columns

**Verification:** Tabel tampil dalam card putih di semua halaman

---

## Wave 3: Form Controls

### Plan 36-05 — Native `<select>` → shadcn Select (HIGH)

**8 halaman** pakai native `<select>`, ganti ke shadcn `<Select>`:

Pages: kelas (unit filter), siswa (unit filter), import (tahun filter), manajemen-pembayaran (tahun filter), tagihan (4 filter), riwayat (status + date), tunggakan (year filter), bulanan/tahunan/laporan-tunggakan/rekap-pos (year filter), users (status toggle in edit modal)

**Verification:** Select tampil konsisten dengan accent focus ring

---

## Wave 4: Action Safety

### Plan 36-06 — Dialog → AlertDialog for Destructive (HIGH)

**6 halaman** pakai Dialog biasa untuk aksi destruktif:

Pages: generate (delete tagihan), riwayat (void), users (delete), roles (delete), mapping (lepaskan siswa)

```tsx
// Replace with:
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="text-red-700">Hapus ... ?</AlertDialogTitle>
      <AlertDialogDescription>Aksi ini tidak dapat dibatalkan.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Batal</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
        Hapus
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Verification:** Delete/void confirmation shows red warning treatment

---

## Wave 5: Spacing & Alignment

### Plan 36-07 — Header Spacing Standardization (MEDIUM)

**12 halaman** dengan `mb-2` header, ubah ke `mb-6`:

Pages: kelas, pos, siswa, manajemen-pembayaran, generate, tagihan, harian

Pattern fix: `mb-2` → `mb-6` pada `<div>` pembungkus heading + description

**Verification:** Semua header punya jarak yang sama ke konten bawah

### Plan 36-08 — Border Radius Consistency (MEDIUM)

**9 halaman** dengan `rounded-lg` → `rounded-xl`:

Pages: mapping (4 lokasi), migrasi-status (3 lokasi)

- [ ] Replace `rounded-lg` → `rounded-xl` (cards/panels)
- [ ] Replace `rounded-md` → `rounded-lg` (inputs/badges keep md)

**Verification:** Semua card punya corner radius yang sama

---

## Wave 6: Color & Visibility

### Plan 36-09 — Export Buttons + Color Fixes (HIGH)

**5 laporan pages** — color-code export buttons:
- [ ] Excel: `border-green-300 text-green-700 hover:bg-green-50`
- [ ] PDF: `border-red-300 text-red-700 hover:bg-red-50`

**Generate Tagihan** — fix status badge:
- [ ] `belum_bayar`: `bg-yellow-100 text-yellow-700` (currently gray)

**Mapping Kelas** — fix primary button color:
- [ ] `bg-primary` → `bg-accent` (2 buttons)

**Profil** — permission badges by category:
- [ ] Master: `bg-blue-50 text-blue-700`
- [ ] Keuangan: `bg-green-50 text-green-700`
- [ ] Laporan: `bg-purple-50 text-purple-700`
- [ ] Settings: `bg-orange-50 text-orange-700`

**Verification:** Export buttons visually distinct, status badges correct, permissions color-coded

### Plan 36-10 — Error Banner + Empty State Standardization (MEDIUM)

- [ ] Login error: bare text → `bg-red-50 border border-red-200 text-red-700 rounded-xl p-4`
- [ ] Empty states: add icons (Inbox, FileText, Users) to guide action
- [ ] Filter overflow: add `flex-wrap` to rekap-pos filter bar
- [ ] Profile read-only fields: add `bg-gray-50` background

---

## Wave 7: Transaksi Baru — Special Fixes

### Plan 36-11 — Cart Sticky Fix + Month Grid (CRITICAL)

- [ ] Fix sticky cart: wrap page in flex column with scroll container
- [ ] Month grid `text-[10px]` → `text-xs` minimum
- [ ] Month headers `w-14` → `w-10` for mobile fit
- [ ] Hardcoded `ring-[#00A651]` → `ring-accent`
- [ ] Cart remove button: native `<button>` → `<Button variant="ghost" size="icon">`
- [ ] Add confirmation AlertDialog before payment submit
- [ ] `w-* h-*` → `size-*` on all icons

**Verification:** Cart sticks to bottom, month grid readable, confirmation before payment

---

## Wave 8: Remaining LOW Issues

### Plan 36-12 — Code Cleanup (LOW)

- [ ] Fix all trailing spaces in className strings (6+ files)
- [ ] Fix double spaces in className strings (3+ files)
- [ ] `w-* h-*` → `size-*` for all square elements across all pages
- [ ] Add `aria-label` to all icon-only buttons (8 locations)
- [ ] Hardcoded `[#00A651]` → `accent` token (3 files)
- [ ] `font-mono` → `font-mono tabular-nums` for transaction numbers

**Verification:** Lint clean, no visual regressions

---

## Execution Order

```
Wave 0 ─► 36-01 (Base CSS + Shared Components)
Wave 1 ─► 36-02 (Skeleton) + 36-03 (tabular-nums + text-balance)
Wave 2 ─► 36-04 (Table Polish)
Wave 3 ─► 36-05 (Select standardization)
Wave 4 ─► 36-06 (AlertDialog)
Wave 5 ─► 36-07 (Header spacing) + 36-08 (Border radius)
Wave 6 ─► 36-09 (Colors) + 36-10 (Error/Empty states)
Wave 7 ─► 36-11 (Transaksi Baru special)
Wave 8 ─► 36-12 (Code cleanup)
```

## Verification Gate

After all waves: `pnpm --filter frontend build` passes, no visual regressions on VPS smoke test.
