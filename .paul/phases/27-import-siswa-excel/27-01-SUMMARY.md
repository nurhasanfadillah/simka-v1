# 27-01-SUMMARY.md

**Plan:** 27-01 — Backend Import Siswa Endpoints
**Scope:** standard
**Status:** ✅ Complete
**Completed:** 2026-05-30

## Changes Made

| File | Action | Description |
|------|--------|-------------|
| `apps/backend/package.json` | Modify | Tambah `multer` + `@types/multer` |
| `apps/backend/src/master/students/students.controller.ts` | Modify | 3 endpoint baru: GET template, POST import/preview, POST import/commit |
| `apps/backend/src/master/students/students.service.ts` | Modify | generateTemplate(), previewImport(), commitImport(), parseExcelDate() |

## AC Results

| AC | Status | Notes |
|----|--------|-------|
| AC-1 Template Download | ✅ | Header hijau bold, contoh data row 2, keterangan row 3, 10 kolom |
| AC-2 Preview Parse + Validasi | ✅ | ExcelJS parse, validasi field per baris, return valid/error |
| AC-3 Dedup DB (nama + ortu) | ✅ | LOWER comparison via SQL, cross-check DB existing |
| AC-4 Dedup antar baris | ✅ | Set tracking nama|parentName dalam file |
| AC-5 NISN dedup | ✅ | Check DB via eq(nisn) per NISN yang diisi |
| AC-6 Field validation | ✅ | Nama, JK (L/P), tgl lahir (DD/MM/YYYY), ortu |
| AC-7 Commit import | ✅ | Transactional, NIS auto-generate, insert per row |
| AC-8 NIS auto-generate | ✅ | Pakai existing generateNis(), retry NIS collision 3x |
| AC-9 Atomic commit | ✅ | db.transaction — jika gagal tengah, semua rollback |

## Decisions

| Decision | Rationale |
|----------|-----------|
| birthPlace default '-' | Schema NOT NULL — empty string bisa menyebabkan warning |
| parseExcelDate() helper | Convert DD/MM/YYYY dari Excel ke YYYY-MM-DD untuk DB |
| Max 500 baris per import | Hindari timeout pada VPS single-core |
| Case-insensitive dedup via LOWER() | Nama "ahmad" dan "Ahmad" dianggap sama |
| 403 entryYear | throw 400 jika di luar range |

## Verification

- `pnpm --filter backend build` — TypeScript COMPILE PASS
- Template endpoint: route `template` sebelum `:id` — no routing conflict
- Preview endpoint: route `import/preview` sebelum `:id` — no routing conflict
- Commit endpoint: route `import/commit` sebelum `:id` — no routing conflict
