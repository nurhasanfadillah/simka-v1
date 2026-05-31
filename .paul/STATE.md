# STATE.md — SIMKA

## Current Position

Milestone: v2.3 — Transaksi Dialog
Phase: 33 — Transaksi Dialog — COMPLETE
Plan: 33-02 completed
Status: MILESTONE COMPLETE — all 2 phases finished

Last activity: 2026-05-31 — Completed 33-02 (dialog transaksi dengan bebas/bulanan tables)

Progress:
- v2.3 Transaksi Dialog: [██████████] 100% ✅

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [All loops closed — milestone complete]
```

## Session Continuity

Last session: 2026-05-31
Stopped at: Milestone v2.3 complete
Next action: Test flow transaksi baru, or start next milestone
Resume file: .paul/phases/33-transaksi-dialog/33-02-SUMMARY.md

## Decisions

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | Backend: NestJS (TypeScript) | AI-friendly, full TypeScript stack | 2026-05-29 |
| 2 | ORM: Drizzle | SQL-like control, no Rust binary | 2026-05-29 |
| 3 | Frontend: React 18 + Vite | SPA admin dashboard | 2026-05-29 |
| 4 | Auth: JWT + Refresh Token (Redis) | Stateless, VPS | 2026-05-29 |
| 5 | Queue: BullMQ + Redis | Generate tagihan massal | 2026-05-29 |
| 6 | PDF: Puppeteer | Kwitansi berkualitas tinggi | 2026-05-29 |
| 7 | Deployment: VPS + Nginx + pm2 | Redis butuh dedicated server | 2026-05-29 |
| 8 | Monorepo: pnpm workspaces + Turborepo | apps/backend + apps/frontend + packages/shared | 2026-05-29 |
| 9 | UI: Green theme #1A3829/#00A651 | Referensi desain + identitas Al-Hasaniyyah | 2026-05-29 |
| 10 | Chart: Recharts | Sparkline ringan, React-first | 2026-05-29 |
| 11 | DB driver: node-postgres (pg) | Stable di VPS, bukan serverless | 2026-05-29 |
| 12 | Seed: idempotent (cek existing) | Aman dijalankan berkali-kali | 2026-05-29 |
| 42 | allPermissions dari GET /roles dedup | Tidak ada GET /permissions endpoint | 2026-05-30 |
| 43 | Dual useForm di ProfilPage | Menghindari konflik form profil + form password | 2026-05-30 |
| 51 | Correlated subquery di Drizzle sql`` | Aggregate studentCount tanpa GROUP BY di query utama | 2026-05-30 |
| 52 | DialogDescription asChild wrapping div | Select tidak valid di `<p>` default — asChild hindari DOM warning | 2026-05-30 |
| 62 | `or(isNull(classId), ne(classId, excludeId))` | `ne(NULL, value)` di PostgreSQL = NULL → row di-skip | 2026-05-31 |
| 63 | `filterClassId === '__none__'` | currentClassName null perlu check eksplisit | 2026-05-31 |
