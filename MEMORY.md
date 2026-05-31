# MEMORY.md — SIMKA

> Dibuat: 2026-05-31 | Updated: 2026-05-31

## Identitas Project

- **Nama:** SIMKA — Sistem Manajemen Keuangan Al-Hasaniyyah
- **Deskripsi:** Sistem keuangan sekolah terpadu multi-unit (SD, SMP, SMA, Pesantren)
- **Tech Stack:** NestJS + Drizzle ORM + PostgreSQL + React 18/Vite + shadcn/ui + Zustand
- **Deploy:** VPS Ubuntu + Nginx + pm2 (129.226.213.135)

## Status Aktif

- **Fase:** Development — Milestone v2.7
- **Prioritas:** Transaksi Baru UI + PDF + Kwitansi
- **Progress:** 24 halaman UI audited, transaksi baru enhanced

## Struktur Frontend

```
Dashboard → Master (7) → Keuangan (5 + Transaksi Baru) → Laporan (5) → Pengaturan (3)
```

## Key URLs

- Production: http://129.226.213.135
- Backend API: /api (port 3000 via nginx proxy)
- Frontend: React SPA served by nginx

## Recent Changes (v2.7)

- Transaksi Baru: tab Pembayaran + Riwayat, student billing summary, void/delete on riwayat
- Bill months: cumulative paid vs amount check (not always 'lunas')
- PDF: A4 landscape kwitansi with branding, Cetak Tagihan PDF
- Tahunan export: PDF + Excel endpoints added
- UI audit: skeleton, tabular-nums, table wrappers, alert-dialog, select standardization
