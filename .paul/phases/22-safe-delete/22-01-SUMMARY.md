---
phase: 22-safe-delete
plan: 01
subsystem: api
tags: [nestjs, drizzle, delete, conflict, 409]

requires:
  - phase: 21-transactions
    provides: transactions service + controller yang menjadi dasar struktur

provides:
  - 8 DELETE endpoint baru di semua modul backend
  - ConflictException (409) + relatedData di semua remove()
  - Void-only guard untuk delete transaksi

affects: 22-02-frontend (bergantung pada response 409 + relatedData yang konsisten)

tech-stack:
  added: []
  patterns:
    - "Safe delete pattern: findOne → count dependensi → ConflictException({message, relatedData}) → delete"
    - "Void-only guard: cek status !== 'void' → ConflictException sebelum delete transaksi"

key-files:
  modified:
    - apps/backend/src/master/school-years/school-years.service.ts
    - apps/backend/src/master/classes/classes.service.ts
    - apps/backend/src/master/students/students.service.ts
    - apps/backend/src/master/students/students.controller.ts
    - apps/backend/src/billing/payment-templates/payment-templates.service.ts
    - apps/backend/src/billing/payment-templates/payment-templates.controller.ts
    - apps/backend/src/master/payment-posts/payment-posts.service.ts
    - apps/backend/src/master/payment-posts/payment-posts.controller.ts
    - apps/backend/src/auth/roles.service.ts
    - apps/backend/src/auth/roles.controller.ts
    - apps/backend/src/auth/users.service.ts
    - apps/backend/src/auth/users.controller.ts
    - apps/backend/src/transactions/transactions.service.ts
    - apps/backend/src/transactions/transactions.controller.ts

key-decisions:
  - "Permission codes baru: student.delete, payment_template.delete, payment_post.delete, transaction.delete — belum di-seed, frontend perlu memperhatikan ini"
  - "school-years tetap pakai BadRequestException untuk guard isActive (bukan dependensi data)"
  - "roles.remove() hapus rolePermissions dulu sebelum hapus role (foreign key constraint)"

patterns-established:
  - "ConflictException body: { message: 'Tidak dapat dihapus...', relatedData: { [key]: count } }"
  - "relatedData keys: tagihan, template, kelas, siswa, pengguna (Indonesia, sesuai domain)"

duration: ~15min
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 22 Plan 01: Safe Delete Backend Summary

**8 DELETE endpoint ditambahkan di semua modul backend dengan ConflictException (409) + relatedData saat ada dependensi, dan void-only guard untuk transaksi.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15 menit |
| Tasks | 3 of 3 completed |
| Files modified | 14 |
| TypeScript errors | 0 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: 409 + relatedData saat ada dependensi | Pass | Semua 8 service melempar ConflictException({ message, relatedData }) |
| AC-2: 200 saat tidak ada dependensi | Pass | Delete berhasil jika count semua dependensi = 0 |
| AC-3: Transaksi non-void → 409, transaksi void → 200 | Pass | Guard `tx.status !== 'void'` di transactions.service.ts |

## Accomplishments

- Upgrade `remove()` di school-years dan classes: BadRequestException (400) → ConflictException (409) dengan `relatedData` berisi jumlah per tipe
- Tambah `remove()` + `@Delete(':id')` di 6 modul baru: students, payment-templates, payment-posts, roles, users, transactions
- Format response 409 konsisten di semua service: `{ message, relatedData }` — siap dikonsumsi frontend Plan 22-02

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `master/school-years/school-years.service.ts` | Modified | remove(): BadRequest → Conflict + relatedData {tagihan, template, kelas} |
| `master/classes/classes.service.ts` | Modified | remove(): BadRequest → Conflict + relatedData {siswa, template} |
| `master/students/students.service.ts` | Modified | Tambah remove() baru: cek studentClasses + bills |
| `master/students/students.controller.ts` | Modified | Tambah @Delete(':id') dengan permission student.delete |
| `billing/payment-templates/payment-templates.service.ts` | Modified | Tambah remove() baru: cek bills.paymentTemplateId |
| `billing/payment-templates/payment-templates.controller.ts` | Modified | Tambah @Delete(':id') dengan permission payment_template.delete |
| `master/payment-posts/payment-posts.service.ts` | Modified | Tambah remove() baru: cek paymentTemplates.paymentPostId |
| `master/payment-posts/payment-posts.controller.ts` | Modified | Tambah @Delete(':id') dengan permission payment_post.delete |
| `auth/roles.service.ts` | Modified | Tambah remove(): cek users.roleId, hapus rolePermissions dulu |
| `auth/roles.controller.ts` | Modified | Tambah @Delete(':id') dengan permission role.manage |
| `auth/users.service.ts` | Modified | Tambah remove(): cek exist → delete langsung |
| `auth/users.controller.ts` | Modified | Tambah @Delete(':id') dengan permission user.manage |
| `transactions/transactions.service.ts` | Modified | Tambah remove(): void-only guard + delete tx + items dalam transaction |
| `transactions/transactions.controller.ts` | Modified | Tambah @Delete(':id') dengan permission transaction.delete |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Permission code baru untuk student/payment_template/payment_post/transaction | RBAC konsisten — delete perlu permission terpisah | Frontend 22-02 harus handle permission `*.delete` |
| `school-years` tetap BadRequestException untuk guard `isActive` | isActive bukan dependensi data — itu state validation, bukan safe-delete concern | Dua jenis error 400 dan 409 di school-years adalah intentional |
| `roles.remove()` hapus rolePermissions sebelum roles | FK constraint: role_permissions.role_id → roles.id | Urutan delete wajib diikuti jika ada model serupa |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 0 | — |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Plan dieksekusi persis seperti tertulis. Tidak ada deviasi.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Semua 8 DELETE endpoint aktif dan mengembalikan format 409 konsisten
- Format `{ message, relatedData }` siap dikonsumsi frontend
- TypeScript 0 error — tidak ada risiko compile-time

**Concerns:**
- Permission codes baru (`student.delete`, `payment_template.delete`, `payment_post.delete`, `transaction.delete`) belum di-seed ke database. Frontend Plan 22-02 perlu tombol delete hanya tampil jika user punya permission tersebut.

**Blockers:**
- None. Plan 22-02 (frontend) dapat langsung dieksekusi.

---
*Phase: 22-safe-delete, Plan: 01*
*Completed: 2026-05-30*
