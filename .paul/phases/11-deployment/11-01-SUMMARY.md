---
phase: 11-deployment
plan: 01
subsystem: infra
tags: [nginx, pm2, nestjs, postgresql, redis, vps, ubuntu]

requires:
  - phase: 10-admin-ui
    provides: Aplikasi SIMKA lengkap (backend + frontend) siap deploy

provides:
  - SIMKA live di http://129.226.213.135
  - nginx/simka.conf — konfigurasi reverse proxy + static file serving
  - ecosystem.config.js — pm2 process manager config
  - apps/backend/.env.production.example — template env production
  - DEPLOY.md — runbook deployment lengkap (11 section)

affects: []

tech-stack:
  added: [pm2, nginx, ufw]
  patterns: [NestJS behind Nginx reverse proxy, React SPA static serving, pm2 cluster mode]

key-files:
  created:
    - nginx/simka.conf
    - ecosystem.config.js
    - apps/backend/.env.production.example
    - DEPLOY.md
  modified: []

key-decisions:
  - "ecosystem.config.js script path: dist/src/main.js bukan dist/main.js (tsconfig tanpa rootDir)"
  - "pnpm --filter backend/frontend build bukan turbo build (turbo gagal karena packageManager field)"

patterns-established:
  - "Build individual via pnpm --filter, bukan turbo build"

duration: ~2 sessions
started: 2026-05-30T00:00:00Z
completed: 2026-05-30T00:00:00Z
---

# Phase 11 Plan 01: VPS Deployment Summary

**SIMKA di-deploy ke VPS Ubuntu 129.226.213.135 — NestJS via pm2, React static via Nginx, PostgreSQL + Redis aktif, smoke test approved.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~2 sesi |
| Started | 2026-05-30 |
| Completed | 2026-05-30 |
| Tasks | 4 completed (2 auto + 2 checkpoint) |
| Files modified | 4 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Config Files Valid | Pass | nginx.conf, ecosystem.config.js, .env.production.example semua valid |
| AC-2: Backend Running di VPS | Pass | pm2 list: simka-backend online, port 3000 merespons |
| AC-3: Frontend Accessible | Pass | Nginx serving React SPA, /api ter-proxy ke backend |
| AC-4: Smoke Test Passed | Pass | User approved — login → dashboard → laporan → pengaturan berjalan normal |

## Accomplishments

- SIMKA production live di http://129.226.213.135
- Database seed berhasil: 4 roles, 32 permissions, 40 siswa, 4 unit sekolah, Super Admin dibuat
- pm2 startup dikonfigurasi — backend auto-restart setelah VPS reboot
- UFW firewall aktif: SSH + HTTP/HTTPS terbuka, port lain tertutup
- DEPLOY.md lengkap sebagai runbook untuk update deployment di masa mendatang

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `nginx/simka.conf` | Created | Reverse proxy /api ke port 3000, serving React SPA |
| `ecosystem.config.js` | Created | pm2 config: simka-backend, cwd /var/www/simka/apps/backend |
| `apps/backend/.env.production.example` | Created | Template env production (10 variabel) |
| `DEPLOY.md` | Created | Runbook deployment 11 section lengkap |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Script path `dist/src/main.js` | tsconfig.json tanpa `rootDir` → TS output ke dist/src/ bukan dist/ | ecosystem.config.js dikoreksi dari dist/main.js |
| `pnpm --filter backend/frontend build` | `turbo build` gagal karena `packageManager` field tidak ada di package.json root | Build berhasil, DEPLOY.md diupdate |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Minimal — path koreksi saja |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Satu koreksi path minor, tidak ada scope creep.

### Auto-fixed Issues

**1. Script path ecosystem.config.js salah**
- **Found during:** Task 3 (pm2 start)
- **Issue:** `pm2 start` error "Script not found: /var/www/simka/apps/backend/dist/main.js" — file ada di `dist/src/main.js`
- **Fix:** Update `script` di ecosystem.config.js dari `dist/main.js` → `dist/src/main.js`, upload ulang ke VPS
- **Files:** `ecosystem.config.js`
- **Verification:** pm2 list menampilkan simka-backend status: online

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `turbo build` gagal di VPS | Ganti ke `pnpm --filter backend build` dan `pnpm --filter frontend build` |
| `pm2 startup` PATH Windows bocor via plink | Jalankan dengan PATH VPS eksplisit: `/usr/local/sbin:/usr/local/bin:...` |

## Next Phase Readiness

**Ready:**
- SIMKA production live dan diverifikasi — milestone v1.1 Admin & Go Live selesai
- DEPLOY.md tersedia sebagai panduan update deployment
- pm2 + nginx + ufw dikonfigurasi untuk production

**Concerns:**
- SSL/HTTPS belum ada (pakai IP, bukan domain) — butuh domain + Let's Encrypt untuk production penuh
- Tidak ada monitoring/alerting — pm2 logs satu-satunya cara cek error

**Blockers:**
- None — milestone v1.1 complete

---
*Phase: 11-deployment, Plan: 01*
*Completed: 2026-05-30*
