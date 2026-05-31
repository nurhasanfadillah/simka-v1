# DEPLOY.md — SIMKA Deployment Guide

Target VPS: ubuntu@129.226.213.135
Stack: NestJS (pm2) + React (Nginx static) + PostgreSQL + Redis

---

## 1. Koneksi ke VPS

```bash
ssh ubuntu@129.226.213.135
# masukkan password saat diminta
```

---

## 2. Install Dependencies (sekali saja)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi
node -v   # harus v20.x
npm -v

# Install pnpm
npm install -g pnpm

# Install pm2
npm install -g pm2

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Puppeteer dependencies (untuk generate PDF)
sudo apt install -y \
  chromium-browser \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  xdg-utils
```

---

## 3. Setup PostgreSQL

```bash
sudo -u postgres psql
```

Di dalam psql:

```sql
CREATE USER simka WITH PASSWORD 'GANTI_PASSWORD_KUAT';
CREATE DATABASE simka_db OWNER simka;
GRANT ALL PRIVILEGES ON DATABASE simka_db TO simka;
\q
```

Catat password yang digunakan — dibutuhkan di `.env`.

---

## 4. Upload Kode ke VPS

**Jalankan dari komputer lokal (bukan dari VPS), di root proyek `simka-v1/`:**

```bash
# Buat direktori di VPS dan set ownership
ssh ubuntu@129.226.213.135 "sudo mkdir -p /var/www/simka && sudo chown ubuntu:ubuntu /var/www/simka"

# Upload kode (exclude files besar / secrets)
rsync -avz \
  --exclude=node_modules \
  --exclude=.env \
  --exclude='apps/backend/dist' \
  --exclude='apps/frontend/dist' \
  --exclude='.paul' \
  . ubuntu@129.226.213.135:/var/www/simka/
```

---

## 5. Setup Environment Backend

```bash
# Di VPS:
cp /var/www/simka/apps/backend/.env.production.example /var/www/simka/apps/backend/.env
nano /var/www/simka/apps/backend/.env
```

Isi nilai nyata:
- `DATABASE_URL` → gunakan user + password dari Step 3
  - Contoh: `postgresql://simka:PASSWORD_DARI_STEP3@localhost:5432/simka_db`
- `JWT_ACCESS_SECRET` → generate string acak:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `JWT_REFRESH_SECRET` → generate ulang (nilai berbeda dari ACCESS)
- `FRONTEND_URL=http://129.226.213.135`
- `NODE_ENV=production`

Simpan file (Ctrl+O, Enter, Ctrl+X).

---

## 6. Install Dependencies & Build

```bash
cd /var/www/simka

# Install semua dependencies (backend + frontend + shared)
pnpm install --frozen-lockfile

# Build backend + frontend via Turborepo
pnpm build
```

Hasil yang diharapkan:
- `apps/backend/dist/main.js` — backend compiled
- `apps/frontend/dist/index.html` — frontend built

---

## 7. Jalankan Database Migration + Seed

```bash
cd /var/www/simka/apps/backend

# Jalankan migration Drizzle
pnpm db:migrate

# Seed data awal: roles, permissions, Super Admin
pnpm db:seed
```

> **Catat kredensial Super Admin** dari output seed — digunakan untuk login pertama kali.

---

## 8. Start Backend dengan pm2

```bash
cd /var/www/simka

# Start backend dengan env production
pm2 start ecosystem.config.js --env production

# Simpan config pm2 agar auto-start setelah reboot
pm2 save

# Setup pm2 startup (jalankan perintah yang muncul dari output)
pm2 startup

# Cek status
pm2 list
pm2 logs simka-backend --lines 30
```

Backend harus berstatus **online**. Test koneksi:

```bash
curl http://localhost:3000/api
# Harus return response JSON (bukan "connection refused")
```

---

## 9. Setup Nginx

```bash
# Copy config SIMKA ke sites-available
sudo cp /var/www/simka/nginx/simka.conf /etc/nginx/sites-available/simka

# Enable site dengan symlink
sudo ln -s /etc/nginx/sites-available/simka /etc/nginx/sites-enabled/simka

# Hapus site default Nginx (opsional, hindari konflik)
sudo rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi Nginx
sudo nginx -t
# Harus: "syntax is ok" dan "test is successful"

# Reload Nginx tanpa downtime
sudo systemctl reload nginx
```

---

## 10. Buka Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Output yang diharapkan:
```
Status: active
To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

---

## 11. Smoke Test

Buka browser → **http://129.226.213.135**

Alur verifikasi:
1. Halaman login SIMKA muncul
2. Login dengan akun Super Admin (dari seed data Step 7)
3. Dashboard → stat cards muncul (atau 0 jika data kosong — normal)
4. Master → Tahun Pelajaran → halaman load tanpa error
5. Keuangan → Data Tagihan → halaman load
6. Laporan → Laporan Harian → halaman load
7. Pengaturan → Profil → nama dan email user tampil
8. Pengaturan → Pengguna → tabel pengguna tampil
9. DevTools (F12) → Network tab → tidak ada error merah 401/500

---

## Update Deployment (setelah ada perubahan kode)

**Dari komputer lokal:**

```bash
# Upload perubahan
rsync -avz \
  --exclude=node_modules \
  --exclude=.env \
  --exclude='apps/backend/dist' \
  --exclude='apps/frontend/dist' \
  --exclude='.paul' \
  . ubuntu@129.226.213.135:/var/www/simka/
```

**Di VPS:**

```bash
cd /var/www/simka
pnpm install --frozen-lockfile
pnpm build
pm2 restart simka-backend
# Nginx tidak perlu restart kecuali config berubah
```

---

## Troubleshooting

| Problem | Langkah Diagnosa |
|---------|-----------------|
| 502 Bad Gateway | `pm2 logs simka-backend --lines 50` — lihat error backend |
| Frontend blank / 404 | Cek `apps/frontend/dist/` ada? Build berhasil? |
| DB connection error | `.env` DATABASE_URL benar? `sudo systemctl status postgresql` |
| Redis error | `sudo systemctl status redis-server` |
| PDF gagal generate | `chromium-browser --version` — Puppeteer deps terpasang? |
| pm2 offline setelah reboot | `pm2 startup` sudah dijalankan? `pm2 save` sudah? |
| Port 80 tidak bisa diakses | `sudo ufw status` — firewall allow Nginx Full? |
