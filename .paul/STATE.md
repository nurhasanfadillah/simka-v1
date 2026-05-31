# STATE.md — SIMKA

## Current Position

Milestone: v2.6 — UI Polish Audit — COMPLETE ✅
Phase: 36 — UI Audit
Plans: 12 plans in 8 waves — ALL APPLIED
Status: APPLY COMPLETE — Ready for unify/smoke test

Last activity: 2026-05-31 — Applied 12 plans (8 waves) across 24 pages

Progress:
- v2.6 UI Polish Audit: [██████████] 100% ✅ (build clean, TypeScript 0 errors)

## Loop Position

```
DISCUSS ──▶ PLAN ──▶ APPLY ──▶ UNIFY
   ✓          ✓        ✓        ◻     [Apply complete — 12 plans, build passes]
```
DISCUSS ──▶ PLAN ──▶ APPLY ──▶ UNIFY
   ✓          ✓        ◻        ◻     [Plan complete — 12 plans in 8 waves]
```

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [34-01 loop closed]
```

## Session Continuity

Last session: 2026-05-31
Stopped at: 34-01 complete — Design System Foundation ready
Next action: paul:plan for 34-02 (Sidebar Collapsible + Enhanced Gradient)
Resume file: .paul/phases/34-ui-modernization/34-01-SUMMARY.md

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
