---
phase: 00-ui-design
topic: UI Design Style untuk SIMKA Admin Dashboard
depth: standard
confidence: HIGH
created: 2026-05-29
updated: 2026-05-29
source: Referensi gambar dashboard-simka.png (provided by user)
---

# Discovery: UI Design Style — SIMKA

**Rekomendasi:** Green theme — dark forest green sidebar, bright green primary, white content area. Flat sidebar navigation dengan section grouping.

**Confidence:** HIGH — diekstrak langsung dari referensi visual yang diberikan user.

---

## Objective

- Skema warna yang sesuai identitas Al-Hasaniyyah?
- Layout dan navigation pattern?
- Pola komponen dashboard (stat cards, tabel, quick action)?

---

## Scope

**Include:**
- Color palette lengkap dari referensi gambar
- Sidebar layout + navigation pattern
- Komponen pattern: stat card, quick action, data table, pagination
- shadcn/ui theme configuration

**Exclude:**
- Logo/icon Al-Hasaniyyah (aset terpisah)
- Mobile responsiveness (admin desktop-first)

---

## Color Palette (Diekstrak dari Referensi)

### Primary Colors

| Token | Hex (approx) | Penggunaan |
|-------|-------------|-----------|
| `sidebar-bg` | `#1A3829` | Background sidebar |
| `sidebar-text` | `#FFFFFF` | Teks navigasi sidebar |
| `sidebar-muted` | `#A3B8A8` | Section header ("MASTER DATA"), ikon non-aktif |
| `primary` | `#00A651` | Active menu item background, tombol primary (dari logo) |
| `primary-dark` | `#006633` | Border logo, hover state, elemen dark green |
| `accent-green` | `#16A34A` | Ikon stat card, nominal uang di tabel, badge |
| `accent-bg` | `#E8F5EE` | Background ikon di stat card (light green circle) |

### Neutral Colors

| Token | Hex (approx) | Penggunaan |
|-------|-------------|-----------|
| `background` | `#F4F6F5` | Page background |
| `card` | `#FFFFFF` | Card, tabel background |
| `border` | `#E5EAE7` | Garis pembatas tabel, card border |
| `text-primary` | `#1A1A1A` | Teks utama konten |
| `text-muted` | `#6B7280` | Subtitle, label kecil |
| `text-amount` | `#16A34A` | Nominal Rupiah (hijau) |

---

## Layout Pattern

### Sidebar (Fixed, ~260px)

```
┌──────────────────────┐
│ [Logo] SIMKA         │  ← Dark green (#1A3829), logo + nama sistem
│ Sistem Manajemen...  │
├──────────────────────┤
│ 🏠 Dashboard         │  ← Active: bright green pill, teks putih
├──────────────────────┤
│ MASTER DATA          │  ← Section header: muted text, huruf kecil
│ 📅 Tahun Pelajaran   │
│ 👥 Manajemen Kelas   │
│ 💰 POS Keuangan      │
│ 👤 Data Siswa        │
├──────────────────────┤
│ 🔄 Transaksi         │  ← Flat, tanpa section header
│ 📋 Tagihan           │
│ 📊 Laporan           │
│ ⚙️ Pengaturan        │
├──────────────────────┤
│ [AD] Admin Dashboard │  ← User card: avatar inisial + nama + role
│      Administrator   │
│ 🚪 Logout            │
└──────────────────────┘
```

**Pola navigasi:** Flat dengan section grouping via label teks (bukan collapsible). Setiap item adalah satu baris dengan ikon + label.

**Active state:** Background pill/rounded rectangle bright green, teks putih.

**Hover state:** Slight green tint on item background.

---

## Dashboard Page Pattern

### Header Area
```
Dashboard                           [📅 Mei 2025 ▼]
Selamat datang kembali, Admin Dashboard 👋
```

### School Info Card
- Card putih dengan logo sekolah (hexagon)
- Nama yayasan, alamat, telepon, email, website
- Layout: logo kiri, info kanan

### Stat Cards (3 kolom)
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ [👥] Jumlah     │  │ [💳] Pembayar   │  │ [💰] Penerimaan │
│      siswa aktif│  │      bulan ini  │  │      bulan ini  │
│                 │  │                 │  │                 │
│   562           │  │   278           │  │ Rp 125.750.000  │
│ Siswa aktif...  │  │ Jumlah siswa... │  │ Total penerimaan│
│         ~~~~    │  │         ~~~~    │  │         ~~~~    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```
- Ikon: circle background `#E8F5EE` dengan ikon hijau `#16A34A`
- Angka besar bold, teks kecil muted di bawah
- Mini sparkline chart di kanan bawah (green line)
- Info tooltip icon (ⓘ) di samping label

### Quick Action (2 kolom)
```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ [📋] Transaksi              >│  │ [📊] Laporan                >│
│       Catat pembayaran siswa │  │       Lihat laporan keuangan │
└──────────────────────────────┘  └──────────────────────────────┘
```
- Card dengan ikon hijau, teks deskripsi, arrow chevron kanan
- Background putih, border light green

### Data Table (Recent Transactions)
```
Data riwayat transaksi                    [Lihat semua →]
─────────────────────────────────────────────────────────
Nama Siswa    | No. Transaksi      | Nominal      | Tanggal            | Keterangan
─────────────────────────────────────────────────────────
Ahmad Raihan  | TRX-2025-05-00123  | Rp 500.000   | 21 Mei 2025 09:15  | Pembayaran SPP
...
```
- Header: teks muted gray
- Nominal: **green bold** (`#16A34A`)
- Pagination: dots, angka, active = green circle

---

## shadcn/ui Theme Configuration

### globals.css (CSS Variables)

```css
:root {
  /* Primary — Green */
  --primary: 142 76% 36%;        /* #16A34A area */
  --primary-foreground: 0 0% 100%;

  /* Background */
  --background: 120 5% 96%;      /* #F4F6F5 */
  --foreground: 0 0% 10%;

  /* Card */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 10%;

  /* Muted */
  --muted: 120 5% 92%;
  --muted-foreground: 120 5% 45%;

  /* Accent */
  --accent: 142 50% 95%;         /* #E8F5EE */
  --accent-foreground: 142 76% 26%;

  /* Border */
  --border: 120 10% 88%;
}

/* Sidebar custom (tidak ada di shadcn default) */
.sidebar {
  background-color: #1A3829;
  color: #FFFFFF;
}
.sidebar-nav-active {
  background-color: #3D9B5C;
  color: #FFFFFF;
  border-radius: 8px;
}
```

### Tailwind Config Tambahan

```js
// tailwind.config.js
extend: {
  colors: {
    'simka': {
      'sidebar': '#1A3829',
      'primary': '#3D9B5C',
      'accent': '#16A34A',
      'accent-bg': '#E8F5EE',
    }
  }
}
```

---

## Component Decisions

| Komponen | Pattern |
|----------|---------|
| Sidebar | Custom (tidak pakai shadcn Sidebar — lebih sederhana dengan div fixed) |
| Stat Card | shadcn Card + custom icon circle |
| Data Table | shadcn Table + TanStack Table integration |
| Pagination | shadcn Pagination dengan active = green |
| Nominal amount | Selalu green bold (`text-simka-accent font-bold`) |
| Status badge | `unpaid` = red, `partial` = amber, `paid` = green |
| Button primary | shadcn Button dengan green primary |
| Quick Action Card | shadcn Card dengan hover effect |

---

## Recommendation

**Implementasi persis mengikuti referensi gambar:**

1. Dark forest green sidebar (`#1A3829`) — identitas kuat Al-Hasaniyyah
2. Flat navigation — sederhana, tidak perlu collapsible (menu tidak terlalu banyak per section)
3. Bright green active state pill
4. White card content area dengan shadow tipis
5. Semua nominal uang → green bold
6. Ikon di stat card → green circle background

**Catatan penting untuk developer:**
- Sidebar dibuat custom CSS (fixed div), bukan pakai shadcn Sidebar component
- Green theme di shadcn/ui menggunakan `--primary` HSL yang override di globals.css
- Font: Inter atau Geist (keduanya clean dan cocok dengan style ini)

---

## Open Questions

Semua open questions sudah dijawab (2026-05-29):

- **Logo:** PNG pentagon Al-Hasaniyyah sudah tersedia (`logo-al-hasaniyyah.png`). Warna logo `#00A651` (fill) + `#006633` (border) — match dengan color palette sidebar.
- **Sparkline chart:** Gunakan **Recharts** — React-first, TypeScript native, ringan, AI-friendly. Implementasi dengan `LineChart` + `ResponsiveContainer` minimal (no axis, no tooltip, hanya garis).
- **Dark mode:** Tidak diperlukan. Light mode only.

---

## Quality Report

**Source:** Referensi gambar dashboard-simka.png — provided directly by user (2026-05-29)

**Verification:**
- Semua color values diekstrak visual dari gambar referensi
- Layout pattern dipetakan dari struktur gambar yang terlihat
- shadcn/ui HSL values dikalibrasi dari hex yang diekstrak

**Assumptions:**
- Hex values adalah approx — perlu fine-tuning saat implementasi
- Font yang digunakan di referensi tampak Inter-like (sans-serif clean)

---

*Discovery updated: 2026-05-29*
*Confidence: HIGH*
*Ready for: /paul:plan Phase 1 — Core System*
