---
phase: 32-filter-tanpa-kelas
plan: 01
completed: 2026-05-31T03:50:00+07:00
duration: ~5min
---

# Phase 32 Plan 01: Filter Tanpa Kelas — Summary

**Menambahkan filter "Tanpa Kelas" di halaman Mapping Kelas + fix backend WHERE clause agar siswa tanpa kelas muncul di tabel tersedia.**

## What Was Built

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/master/students/students.service.ts:151-158` | WHERE clause: `or(isNull(classId), ne(classId, excludeId))` | Siswa tanpa enrollment di tahun tersebut muncul di hasil API |
| `apps/frontend/src/pages/master/kelas/mapping.tsx:376` | `<SelectItem value="__none__">Tanpa Kelas</SelectItem>` | Opsi filter baru di dropdown "Kelas Saat Ini" |
| `apps/frontend/src/pages/master/kelas/mapping.tsx:192-193` | `if (filterClassId === '__none__')` null check | Logic filter hanya tampilkan siswa tanpa kelas |

## Acceptance Criteria Results

| AC | Description | Status |
|----|-------------|--------|
| AC-1 | Siswa tanpa kelas muncul di tabel tersedia | PASS |
| AC-2 | Filter "Tanpa Kelas" berfungsi | PASS |
| AC-3 | Filter "Semua Kelas" tetap inklusif | PASS |

## Verification Results

| Check | Result |
|-------|--------|
| Backend TypeScript build (`nest build`) | PASS |
| Frontend TypeScript build (`vite build`) | PASS |

## Key Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 62 | `or(isNull(classId), ne(classId, excludeId))` | `ne(NULL, value)` di PostgreSQL = NULL (bukan boolean) → row di-skip. `isNull` + `or` memastikan siswa tanpa kelas tetap muncul |
| 63 | `filterClassId === '__none__'` untuk filter "Tanpa Kelas" | `currentClassName` bisa null — perlu check eksplisit bukan sekedar string match |
| 64 | `__none__` value dibiarkan sebagai string di state (tidak di-reset ke `''`) | `onValueChange` hanya reset `__all__` → `''`; `__none__` tetap string untuk dibaca di filter logic |

## Deviations

None — plan executed exactly as specified.

---

*Completed: 2026-05-31*
