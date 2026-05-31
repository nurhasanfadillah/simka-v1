# DECISIONS.md — Phase 36: UI Audit

## Scope
- **Target:** 24 halaman + 5 shared components
- **Aspek:** Spacing, alignment, color hierarchy, visibility
- **Metode:** File-by-file audit — baseline-ui + uxui-principles
- **Output:** 200+ temuan (16 CRITICAL, 55 HIGH, 70 MEDIUM, 60 LOW)

## Decisions
| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Audit semua 24 halaman sekaligus | Full coverage user request |
| 2 | Semua 4 aspek diaudit | User request |
| 3 | Framework: baseline-ui + UX/UI principles | Skill available & relevan |
| 4 | Severity: CRITICAL/HIGH/MEDIUM/LOW | Mudah diprioritaskan |

## Top CRITICAL Issues
1. Skeleton loading kosong — seluruh 24 halaman
2. Tidak ada `tabular-nums` — seluruh halaman
3. `sticky bottom-0` broken di Transaksi Baru
4. Status badge warna salah di Generate Tagihan
5. Table wrapper tanpa styling di 4 halaman
6. Sidebar gradient + animasi width melanggar baseline
7. Import Siswa hilang `p-6`

## Global Patterns yang Perlu Fix
- Native `<select>` → shadcn Select (8 halaman)
- Dialog → AlertDialog untuk destructive actions (6 halaman)
- Spacing header: `mb-2/mb-4/mb-6` → seragamkan
- Border radius: `rounded-lg/rounded-xl` → seragamkan
- Export buttons: tambah warna Excel/hijau PDF/merah (5 halaman)
- `w-* h-*` → `size-*` untuk square elements
- `text-balance` pada semua heading
- `aria-label` pada icon-only buttons
