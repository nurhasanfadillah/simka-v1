---
phase: 06-master-data-ui
plan: 02-FIX
completed: 2026-05-30
---

# 06-02-FIX SUMMARY — Enrollment Pindah Kelas

**Fix frontend handleEnroll: deteksi transfer vs enroll baru berdasarkan schoolYearId, call PATCH /:id/transfer jika enrollment di tahun yang sama sudah ada.**

## AC Results

| Criterion | Status |
|-----------|--------|
| AC-1: Pindah kelas berhasil (PATCH transfer) | Pass |
| AC-2: Enroll baru tahun berbeda tetap berfungsi | Pass |
| AC-3: UI label dinamis Pindah Kelas / Tambah ke Kelas | Pass |

## Files Modified

| File | Change |
|------|--------|
| `apps/frontend/src/pages/master/siswa/index.tsx` | `handleEnroll` + UI label |

## Root Cause & Fix

- **Root cause:** `handleEnroll` selalu POST, tidak cek enrollment existing per `schoolYearId`
- **Fix:** `existingEnrollment = enrollments.find(e => e.schoolYearId === Number(enrollYearId))` → jika ada, call `PATCH /master/student-classes/:id/transfer`
- **UI:** Heading section dan label tombol reaktif — "Pindah Kelas" saat tahun sudah ada enrollment

## Verified

- TypeScript: PASS (tsc --noEmit)
- Production: approved di http://129.226.213.135/master/siswa

---
*Completed: 2026-05-30*
