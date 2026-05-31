---
phase: 25-siswa-enhancements
plan: 01
subsystem: ui, database, api
tags: [drizzle, react, radix-ui, dropdown-menu, isActive, toggle]

requires:
  - phase: 24-naik-kelas
    provides: students table dengan studentStatus enum, student-classes relation

provides:
  - isActive boolean field di tabel students (migration applied)
  - PATCH /master/students/:id/toggle-active endpoint
  - DropdownMenu ⋮ action per baris di tabel siswa
  - Badge Aktif/Non-aktif di kolom Status
  - dropdown-menu.tsx komponen baru

affects: [25-02-siswa-detail, billing, any page consuming Student type]

tech-stack:
  added: ["@radix-ui/react-dropdown-menu ^2.1.16"]
  patterns: ["DropdownMenu ⋮ pattern untuk multi-action per row tabel", "isActive toggle pattern (sama dengan users.isActive)"]

key-files:
  created:
    - apps/frontend/src/components/ui/dropdown-menu.tsx
    - apps/backend/drizzle/0003_bumpy_mac_gargan.sql
  modified:
    - apps/backend/src/db/schema/academic.schema.ts
    - apps/backend/src/master/students/students.service.ts
    - apps/backend/src/master/students/students.controller.ts
    - apps/backend/src/master/students/dto/update-student.dto.ts
    - apps/frontend/src/types/master.ts
    - apps/frontend/src/pages/master/siswa/index.tsx

key-decisions:
  - "UpdateStudentDto di-refactor ke class hierarchy (UpdateStudentBase + UpdateStudentDto) agar bisa tambah isActive yang tidak ada di CreateStudentDto"
  - "Badge status di-stack vertikal (flex-col) bukan inline — hindari 'aktif Non-aktif' tampak berlawanan di satu baris"
  - "Power icon untuk toggle action — konsisten dengan ikon lain di DropdownMenu"

patterns-established:
  - "DropdownMenu ⋮ (MoreVertical trigger, align=end content) sebagai standar multi-action per baris tabel"
  - "isActive toggle: PATCH /:id/toggle-active, literal route sebelum param route di controller"

duration: ~45min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 25 Plan 01: Siswa isActive + DropdownMenu Action Menu

**Field `isActive` boolean ditambahkan ke tabel students dengan migration, endpoint PATCH toggle-active, dan tabel siswa beralih dari tombol teks Ubah/Hapus ke DropdownMenu ⋮ dengan badge Aktif/Non-aktif stacked vertikal.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~45 menit |
| Started | 2026-05-30 |
| Completed | 2026-05-30 |
| Tasks | 2 auto + 1 checkpoint |
| Files modified | 8 (6 existing + 2 baru) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: isActive tersimpan dan dikembalikan API | Pass | Field ada di schema, migration applied, included di findAll & findOne select |
| AC-2: Toggle endpoint berfungsi | Pass | PATCH :id/toggle-active terdaftar sebelum PATCH :id (literal route first) |
| AC-3: Action menu menggantikan tombol teks | Pass | DropdownMenu ⋮ dengan 4 opsi: Edit / Nonaktifkan\|Aktifkan / Kelas / Hapus |
| AC-4: Badge status aktif tampil | Pass | Badge stacked vertikal di kolom Status — hijau "Aktif" / abu "Non-aktif" |

## Accomplishments

- Migration `0003_bumpy_mac_gargan.sql` applied: `ALTER TABLE students ADD COLUMN is_active boolean DEFAULT true NOT NULL` — semua existing records default aktif
- Endpoint `PATCH /master/students/:id/toggle-active` dengan permission `student.manage` tersedia
- Tabel siswa bebas overflow — tombol teks diganti DropdownMenu ⋮ yang compact
- Komponen `dropdown-menu.tsx` dibuat pertama kali untuk project, siap dipakai phase lain

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `apps/backend/src/db/schema/academic.schema.ts` | Modified | Tambah `isActive boolean NOT NULL DEFAULT true` ke studentsTable |
| `apps/backend/drizzle/0003_bumpy_mac_gargan.sql` | Created | Migration file — ALTER TABLE students ADD COLUMN is_active |
| `apps/backend/src/master/students/students.service.ts` | Modified | `isActive` di select findAll & findOne; method `toggleActive` |
| `apps/backend/src/master/students/students.controller.ts` | Modified | Endpoint `PATCH :id/toggle-active` sebelum `PATCH :id` |
| `apps/backend/src/master/students/dto/update-student.dto.ts` | Modified | Refactor ke UpdateStudentBase + UpdateStudentDto, tambah `isActive?: boolean` |
| `apps/frontend/src/types/master.ts` | Modified | `isActive: boolean` ditambah ke Student interface |
| `apps/frontend/src/pages/master/siswa/index.tsx` | Modified | Import DropdownMenu+Power, state togglingId, handler handleToggleActive, badge stacked, DropdownMenu ⋮ |
| `apps/frontend/src/components/ui/dropdown-menu.tsx` | Created | Komponen Radix DropdownMenu baru untuk project |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| UpdateStudentDto refactor ke class hierarchy | `isActive` tidak ada di `CreateStudentDto` sehingga tidak bisa masuk via `PartialType(OmitType(...))` saja | DTO lebih extensible, tidak ada breaking change |
| Badge status stacked vertikal (flex-col) | Inline badge "aktif Non-aktif" terlihat berlawanan dan membingungkan user | Status column lebih tinggi sedikit tapi lebih jelas |
| Power icon untuk toggle action | Konsistensi visual — semua 4 action di dropdown punya icon | UX lebih polished |
| Install `@radix-ui/react-dropdown-menu` | Package belum ada di project | Dependency baru ditambahkan ke frontend package.json |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Scope additions | 2 | Esensial, bukan scope creep |
| Post-checkpoint fix | 2 | Code issue (bukan intent/spec) — diselesaikan dalam loop yang sama |

**Total impact:** Fix esensial, tidak ada scope creep.

### Scope Additions

**1. Buat `dropdown-menu.tsx` komponen baru**
- **Found during:** Task 2 (TypeScript check frontend)
- **Issue:** `@/components/ui/dropdown-menu` tidak ada, import gagal
- **Fix:** Install `@radix-ui/react-dropdown-menu`, buat `src/components/ui/dropdown-menu.tsx` mengikuti pola `select.tsx`
- **Files:** `apps/frontend/src/components/ui/dropdown-menu.tsx`, `package.json`
- **Verification:** `npx tsc --noEmit` PASS

**2. Post-checkpoint UX fix — badge inline → stacked vertikal + icon Power**
- **Found during:** Checkpoint human-verify
- **Issue:** Badge "aktif Non-aktif" inline terlihat berlawanan; toggle action tanpa icon tidak konsisten
- **Fix:** Bungkus dua badge dalam `div.flex-col.gap-1`, tambah `<Power>` icon ke toggle action
- **Files:** `apps/frontend/src/pages/master/siswa/index.tsx`
- **Verification:** `npx tsc --noEmit` PASS, human verify approved

## Next Phase Readiness

**Ready:**
- `isActive` tersedia di Student interface — Plan 25-02 (halaman detail) bisa langsung consume
- `dropdown-menu.tsx` tersedia global — Plan 25-02 bisa pakai tanpa setup tambahan
- `toggleActive` endpoint live — dapat dipanggil dari halaman detail jika diperlukan

**Concerns:**
- Badge stacked vertikal membuat kolom Status sedikit lebih tinggi per baris — perlu dicek di viewport kecil
- Filter "tampilkan non-aktif" belum ada (di-defer di SCOPE LIMITS plan) — user mungkin minta ini setelah 25-02

**Blockers:**
- None

---
*Phase: 25-siswa-enhancements, Plan: 01*
*Completed: 2026-05-30*
