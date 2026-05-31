# CONTEXT.md — Phase 13: Unit Sekolah + Kelas Enhancements

## Overview

Enhancement dua entitas master data: tambah halaman UI Unit Sekolah (dengan CRUD + delete guard) dan tambah fitur hapus di halaman Kelas (dengan guard).

**Type:** Enhancement
**Scope:** Backend + Frontend
**Migration:** Tidak diperlukan

---

## Goals

1. **Unit Sekolah — halaman baru (tab di halaman Kelas)**
   - Buat UI tab "Unit Sekolah" di halaman Kelas yang sudah ada
   - Fitur: Create, Edit, Delete
   - Delete guard: tolak jika masih ada kelas terkait

2. **Kelas — tambah fitur Hapus**
   - Tombol Hapus + dialog konfirmasi di tabel kelas
   - Delete guard: tolak jika ada `student_classes` atau `bills` terkait

---

## Current State

### Backend — Unit Sekolah (`apps/backend/src/master/school-units/`)
- `GET /master/school-units` ✅
- `GET /master/school-units/:id` ✅
- `POST /master/school-units` ✅
- `PATCH /master/school-units/:id` ✅
- `DELETE /master/school-units/:id` ❌ belum ada

### Backend — Kelas (`apps/backend/src/master/classes/`)
- `GET /master/classes` ✅
- `GET /master/classes/:id` ✅
- `POST /master/classes` ✅
- `PATCH /master/classes/:id` ✅
- `DELETE /master/classes/:id` ❌ belum ada

### Frontend
- `/master/kelas` — halaman ada, List/Create/Edit kelas ✅
- Tidak ada tab Unit Sekolah ❌
- Tidak ada tombol Hapus di kelas ❌
- Tidak ada halaman/UI Unit Sekolah sama sekali ❌

### Schema
- `schoolUnits`: id, name, code — tidak ada isActive
- `classes`: id, schoolUnitId, name, level — tidak ada isActive
- Tidak ada perubahan schema diperlukan

---

## Approach

### Backend — DELETE /master/school-units/:id

Guard di service sebelum hapus:
- Cek count `classes` where `schoolUnitId = id`
- Jika > 0 → throw `BadRequestException('Unit sekolah tidak dapat dihapus karena masih memiliki kelas terkait')`
- Jika 0 → hapus

### Backend — DELETE /master/classes/:id

Guard di service sebelum hapus:
- Cek count `studentClasses` where `classId = id`
- Cek count `bills` where `classId = id` (jika ada kolom ini)
- Jika total > 0 → throw `BadRequestException('Kelas tidak dapat dihapus karena sudah memiliki data terkait')`
- Jika 0 → hapus

### Frontend — Tab di halaman Kelas

Ubah halaman `/master/kelas/index.tsx` menjadi dua tab:
- **Tab "Kelas"** — konten existing + tambah tombol Hapus
- **Tab "Unit Sekolah"** — UI baru: tabel list, tombol Tambah, modal Create/Edit, tombol Hapus + dialog konfirmasi

---

## Files to Change

| File | Perubahan |
|------|-----------|
| `apps/backend/src/master/school-units/school-units.controller.ts` | Tambah `@Delete(':id')` |
| `apps/backend/src/master/school-units/school-units.service.ts` | Tambah method `remove()` dengan guard |
| `apps/backend/src/master/classes/classes.controller.ts` | Tambah `@Delete(':id')` |
| `apps/backend/src/master/classes/classes.service.ts` | Tambah method `remove()` dengan guard |
| `apps/frontend/src/pages/master/kelas/index.tsx` | Refactor jadi tab layout + tambah UI Unit Sekolah + tombol Hapus kelas |

---

## Constraints

- Tidak ada migration schema
- Unit sekolah yang masih punya kelas tidak boleh dihapus
- Kelas yang masih punya student_classes atau bills tidak boleh dihapus
- Tidak ada toggle isActive untuk kelas (dibatalkan)
- Permission: reuse yang sudah ada (`school_unit.update` untuk delete, `class.update` untuk delete kelas)
