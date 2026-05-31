---
phase: 28-migrasi-status
plan: 28-01
status: DONE
type: execute
---

# 28-01-SUMMARY.md — Backend Migrasi Status

## What was built

| File | Change |
|------|--------|
| `apps/backend/src/db/schema/academic.schema.ts` | Hapus `isActive` column dari `students` table |
| `drizzle/0004_damp_mysterio.sql` | Auto-generated migration (drop column) |
| `apps/backend/src/academic/promotion/dto/promote.dto.ts` | Enum action: `naik/tinggal/lulus/keluar/pindah` |
| `apps/backend/src/academic/promotion/promotion.service.ts` | Handle `keluar` → set studentStatus='keluar', `pindah` → 'pindah' |
| `apps/backend/src/master/students/dto/update-student.dto.ts` | Hapus field `isActive` |
| `apps/backend/src/master/students/students.service.ts` | Hapus `isActive` dari SELECT, hapus `toggleActive()`, restore `findAvailableForMapping` |
| `apps/backend/src/master/students/students.controller.ts` | Hapus endpoint `PATCH :id/toggle-active` |

## AC Results

| AC | Result |
|----|--------|
| AC-1: isActive column removed | PASS — migration applied, `\d students` no is_active |
| AC-2: keluar action | PASS — POST /academic/promotion with keluar → studentStatus='keluar' |
| AC-3: pindah action | PASS — POST /academic/promotion with pindah → studentStatus='pindah' |
| AC-4: toggle-active removed | PASS — route tidak terdaftar lagi |
| AC-5: isActive not in response | PASS — SELECT di service dihapus |

## Decisions made

- `toClassId` tidak diwajibkan untuk `keluar`/`pindah` (sama seperti `lulus`)
- `findAvailableForMapping` direkonstruksi karena terpotong edit (select siswa aktif di schoolYear tertentu, exclude classId)
- `seed.ts` tidak diubah — tidak ada `students.isActive` di seed insert
