# HANDOFF — Deployment VPS In Progress

**Date:** 2026-05-30
**Phase:** 11 — Deployment
**Plan:** 11-01 (APPLY in progress, mid-checkpoint:human-action)

---

## Status VPS

**IP:** 129.226.213.135
**User:** ubuntu
**Creds:** lihat `C:\Users\USER\Documents\Proyek\PROJECT-APP\my-vps.txt`
**Host key:** `SHA256:TScB7MXb/526fCUe+mTywINeW2gqlO6H9+7Cm/yNsQg`
**plink connect:** `plink -ssh -pw "storm-26#-mountain" -hostkey "SHA256:TScB7MXb/526fCUe+mTywINeW2gqlO6H9+7Cm/yNsQg" ubuntu@129.226.213.135`

---

## Progress Deployment

### ✅ Selesai
- Node.js 20.20.2 terinstall
- pnpm 10.34.1 terinstall
- pm2 7.0.1 terinstall
- Nginx terinstall + running
- PostgreSQL 16 terinstall + running
- Redis terinstall + running
- PostgreSQL user: `simka` / password: `Simka@VPS2026!`
- PostgreSQL database: `simka_db`
- Kode diupload ke `/var/www/simka/`
- `.env` dikonfigurasi di `/var/www/simka/apps/backend/.env`
- `pnpm install --frozen-lockfile` selesai
- Backend build selesai (`apps/backend/dist/main.js` ada)

### ⬜ Belum Selesai (sisa 5 langkah)
1. **Frontend build:** `cd /var/www/simka && pnpm --filter frontend build`
2. **DB migrate:** `cd /var/www/simka && pnpm db:migrate`
3. **DB seed:** `cd /var/www/simka && pnpm db:seed`
4. **pm2 start:** `cd /var/www/simka && pm2 start ecosystem.config.js --env production && pm2 save && pm2 startup`
5. **Nginx config:**
   ```bash
   sudo cp /var/www/simka/nginx/simka.conf /etc/nginx/sites-available/simka
   sudo ln -s /etc/nginx/sites-available/simka /etc/nginx/sites-enabled/simka
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl reload nginx
   ```
6. **Firewall:**
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

---

## Catatan Penting

- `turbo build` gagal (missing `packageManager` field di package.json) → gunakan `pnpm --filter backend build` dan `pnpm --filter frontend build`
- DB password PostgreSQL: `Simka@VPS2026!`
- .env sudah ada JWT secrets yang di-generate random

---

## Cara Resume

Di sesi baru, ketik `/paul:resume` dan lanjutkan dari langkah frontend build.
Atau langsung jalankan 5 perintah di atas via plink.
