# DESIGN-SPEC.md — SIMKA Frontend

## Referensi Visual
Screenshot: `dashboard-simka.png` (provided by user)
Logo: `apps/frontend/public/logo.png` (logo segi lima Al-Hasaniyyah)

---

## Color Palette

| Token | Hex | Digunakan untuk |
|-------|-----|-----------------|
| `primary` | `#1A3829` | Sidebar background, header gradient |
| `primary-light` | `#2D5A3D` | Sidebar hover state |
| `accent` | `#00A651` | Active nav item, tombol utama, angka highlight |
| `accent-light` | `#E8F5EE` | Icon background di stat card |
| `white` | `#FFFFFF` | Content area, cards |
| `gray-50` | `#F9FAFB` | Page background |
| `gray-text` | `#6B7280` | Subtitle, secondary text |
| `green-bold` | `#00A651` | Nominal rupiah di tabel |

---

## Layout

### Sidebar (fixed, width 260px)
- Background: gradient `#1A3829` → `#2D5A3D`
- **Logo area** (top): logo PNG + "SIMKA" bold white + "Sistem Manajemen Keuangan Al-Hasaniyyah" small
- **Nav items**: icon + label, white text, rounded-lg hover
- **Active state**: background `#00A651`, white text, rounded-lg
- **Section label**: uppercase small gray (e.g. "MASTER DATA")
- **Bottom**: avatar circle (initials) + nama user + role + chevron, lalu Logout button

### Nav Structure (sesuai desain)
```
🏠 Dashboard
--- MASTER DATA ---
📅 Tahun Pelajaran
👥 Manajemen Kelas
💳 POS Keuangan
👤 Data Siswa
---
↔️ Transaksi
📋 Tagihan
📊 Laporan
⚙️ Pengaturan
```

### Content Area
- Background: `#F9FAFB`
- Header: page title (bold 24px) + subtitle + date picker (top-right)
- Cards: `bg-white rounded-xl shadow-sm border border-gray-100`

---

## Components

### Stat Card (3 kolom)
```
[icon circle #E8F5EE + icon #00A651]  Label (i)
[number bold 2xl]                      sparkline mini
[description text gray]
```

### School Info Card (dashboard top)
```
[logo segi lima]  Nama Yayasan (bold green)
                  📍 Alamat
                  📞 Telp  ✉️ Email  🌐 Website
```

### Quick Action Card
```
[icon]  Label bold          >
        Subtitle gray
```

### Table
- Header: `text-gray-500 text-sm font-medium`
- Row: hover `bg-gray-50`
- Nominal: `text-green-600 font-semibold`
- Pagination: numbered + prev/next, active = green filled circle

---

## Typography
- Font: system sans-serif (atau Inter jika tersedia)
- Page title: `text-2xl font-bold text-gray-900`
- Section label: `text-xs font-semibold text-gray-400 uppercase tracking-wider`
- Stat number: `text-3xl font-bold text-gray-900` (nominal = `text-green-600`)

---

## Tailwind Config tambahan
```js
colors: {
  primary: { DEFAULT: '#1A3829', light: '#2D5A3D' },
  accent:  { DEFAULT: '#00A651', light: '#E8F5EE' },
}
```

---

## Logo Usage
- Sidebar: `<img src="/logo.png" className="w-10 h-10" />`
- Login page: `<img src="/logo.png" className="w-20 h-20" />`
- Dashboard info card: `<img src="/logo.png" className="w-24 h-24" />`

---

## Halaman per Phase

### Phase 05 — Auth + Layout + Dashboard
- `/login` — form login centered, logo besar, green gradient bg
- `/dashboard` — layout sidebar + stat cards + info card + quick action + tabel riwayat

### Phase 06 — Master Data
- `/master/tahun-pelajaran` — CRUD table
- `/master/kelas` — CRUD table (filter by unit)
- `/master/siswa` — CRUD table + form lengkap + mapping kelas
- `/master/pos` — CRUD table
- `/master/template` — CRUD table (filter tahun + kelas)

### Phase 07 — Keuangan
- `/keuangan/generate` — form generate tagihan massal
- `/keuangan/tagihan` — list tagihan + filter + detail
- `/keuangan/transaksi/baru` — **FLOW UTAMA**: cari siswa → pilih tagihan → input nominal → simpan
- `/keuangan/riwayat` — list transaksi + filter + void
- `/keuangan/tunggakan` — list siswa tunggakan

### Phase 08 — Laporan + Pengaturan
- `/laporan/harian` — filter tanggal + tabel + tombol export Excel/PDF
- `/laporan/bulanan` — filter bulan/tahun + tabel
- `/laporan/tahunan` — filter tahun ajaran
- `/laporan/tunggakan` — filter kelas/unit
- `/laporan/rekap-pos` — filter tanggal
- `/pengaturan/users` — CRUD user
- `/pengaturan/roles` — role + permission matrix
