# FINAL ANALISIS ARSITEKTUR SISTEM

## SIMKA — Sistem Manajemen Keuangan Al-Hasaniyyah

---

# 1. ARSITEKTUR DOMAIN

Sistem dibagi menjadi 6 domain utama:

```
AUTH
MASTER
AKADEMIK
KEUANGAN
TRANSAKSI
LAPORAN
```

---

# 2. ENTITY RELATIONSHIP STRUCTURE (ERD)

# AUTH

## users

| Field      | Type      |
| ---------- | --------- |
| id         | bigint    |
| name       | varchar   |
| email      | varchar   |
| password   | varchar   |
| role_id    | fk        |
| is_active  | boolean   |
| last_login | timestamp |

---

## roles

| Field | Type    |
| ----- | ------- |
| id    | bigint  |
| name  | varchar |

Contoh:

* Super Admin
* Admin
* Bendahara
* Operator

---

## permissions

| Field | Type    |
| ----- | ------- |
| id    | bigint  |
| code  | varchar |
| name  | varchar |

---

## role_permissions

| role_id | permission_id |
| ------- | ------------- |

---

# MASTER AKADEMIK

## school_units

Digunakan untuk:

* SD
* SMP
* SMA
* Pondok

| Field | Type    |
| ----- | ------- |
| id    | bigint  |
| name  | varchar |
| code  | varchar |

---

## school_years

| Field      | Type    |
| ---------- | ------- |
| id         | bigint  |
| name       | varchar |
| start_year | year    |
| end_year   | year    |
| is_active  | boolean |

Contoh:

* 2025/2026

---

## classes

| Field          | Type    |
| -------------- | ------- |
| id             | bigint  |
| school_unit_id | fk      |
| name           | varchar |
| level          | int     |

Contoh:

* 1A
* 2B
* VII A

---

# MASTER SISWA

## students

| Field               | Type             |
| ------------------- | ---------------- |
| id                  | bigint           |
| nis                 | varchar unique   |
| nisn                | varchar nullable |
| name                | varchar          |
| gender              | enum             |
| birth_place         | varchar          |
| birth_date          | date             |
| parent_name         | varchar          |
| phone               | varchar          |
| address             | text             |
| registration_status | enum             |
| student_status      | enum             |
| entry_year          | int              |
| created_at          | timestamp        |

---

## student_classes

Histori penempatan siswa.

| Field          | Type    |
| -------------- | ------- |
| id             | bigint  |
| student_id     | fk      |
| class_id       | fk      |
| school_year_id | fk      |
| is_active      | boolean |

PENTING:
Jangan simpan class_id di students.

---

# MASTER KEUANGAN

## payment_posts

POS pembayaran.

| Field       | Type                |
| ----------- | ------------------- |
| id          | bigint              |
| code        | varchar             |
| name        | varchar             |
| type        | enum(bulanan,bebas) |
| description | text                |

Contoh:

* SPP
* Uang Gedung
* Seragam
* Buku

---

## payment_templates

Template nominal tagihan.

| Field           | Type    |
| --------------- | ------- |
| id              | bigint  |
| school_year_id  | fk      |
| class_id        | fk      |
| payment_post_id | fk      |
| amount          | decimal |
| type            | enum    |

Contoh:
Kelas 1A:

* SPP = 150rb
* Buku = 500rb

---

# BILLING SYSTEM

INI CORE SYSTEM.

---

## bills

Header tagihan siswa.

| Field            | Type                      |
| ---------------- | ------------------------- |
| id               | bigint                    |
| invoice_no       | varchar                   |
| student_id       | fk                        |
| school_year_id   | fk                        |
| payment_post_id  | fk                        |
| type             | enum                      |
| total_amount     | decimal                   |
| total_paid       | decimal                   |
| remaining_amount | decimal                   |
| status           | enum(unpaid,partial,paid) |
| generated_at     | timestamp                 |

---

# KHUSUS PEMBAYARAN BULANAN

## bill_months

| Field            | Type    |
| ---------------- | ------- |
| id               | bigint  |
| bill_id          | fk      |
| month            | tinyint |
| year             | year    |
| amount           | decimal |
| paid_amount      | decimal |
| remaining_amount | decimal |
| status           | enum    |

Contoh:

* Juli
* Agustus
* September

Disimpan sebagai row, bukan kolom.

---

# TRANSACTION SYSTEM

## transactions

Header transaksi.

| Field            | Type                     |
| ---------------- | ------------------------ |
| id               | bigint                   |
| transaction_no   | varchar                  |
| transaction_date | datetime                 |
| student_id       | fk                       |
| total_payment    | decimal                  |
| total_change     | decimal                  |
| payment_method   | enum(cash,transfer,qris) |
| status           | enum(success,void)       |
| note             | text                     |
| created_by       | fk users                 |
| created_at       | timestamp                |

---

## transaction_items

| Field          | Type        |
| -------------- | ----------- |
| id             | bigint      |
| transaction_id | fk          |
| bill_id        | fk          |
| bill_month_id  | nullable fk |
| payment_amount | decimal     |

KENAPA PENTING:
1 transaksi bisa:

* bayar SPP Juli
* bayar SPP Agustus
* bayar Buku

bersamaan.

---

# SYSTEM LOG

## audit_logs

| Field      | Type      |
| ---------- | --------- |
| id         | bigint    |
| user_id    | fk        |
| action     | varchar   |
| table_name | varchar   |
| record_id  | bigint    |
| old_data   | json      |
| new_data   | json      |
| created_at | timestamp |

WAJIB ADA.
Karena sistem keuangan.

---

# 3. RELASI UTAMA

```
school_units
    ↓
classes
    ↓
student_classes
    ↓
students

payment_posts
    ↓
payment_templates
    ↓
bills
    ↓
bill_months
    ↓
transaction_items
    ↓
transactions
```

---

# 4. FLOW BISNIS SISTEM

# A. FLOW AWAL TAHUN AJARAN

```
Buat Tahun Ajaran
    ↓
Buat Kelas
    ↓
Input Siswa
    ↓
Mapping Siswa ke Kelas
    ↓
Buat Template Pembayaran
    ↓
Generate Tagihan Massal
```

---

# B. FLOW PEMBAYARAN

```
Cari Siswa
    ↓
Tampilkan Tagihan
    ↓
Pilih Tagihan
    ↓
Input Nominal
    ↓
Simpan Transaksi
    ↓
Update Bill
    ↓
Cetak Kwitansi
```

---

# 5. FLOW UPDATE STATUS

## Saat transaksi berhasil

Sistem otomatis:

```
transactions
    ↓
transaction_items
    ↓
update bill_months
    ↓
update bills
```

---

# 6. STATUS LOGIC

## BILL STATUS

| Kondisi        | Status  |
| -------------- | ------- |
| belum bayar    | unpaid  |
| bayar sebagian | partial |
| lunas          | paid    |

---

## TRANSACTION STATUS

| Status  | Fungsi     |
| ------- | ---------- |
| success | valid      |
| void    | dibatalkan |

PENTING:
Void tidak menghapus data.

---

# 7. NOMOR DOKUMEN

## NIS

```
ABC30129226
```

Format:

```
3 huruf random + ddmmyy(tanggal lahir siswa) + 2 digit tahun masuk
```

---

## TRANSACTION NO

```
TRX-20260528-00001
```

---

## INVOICE BILL

```
INV-SPP-2026-0001
```

---

# 8. DASHBOARD LOGIC

## Jumlah siswa aktif

```
SELECT COUNT(*)
FROM students
WHERE student_status = 'aktif'
```

---

## Pembayar bulan ini

```
SELECT COUNT(DISTINCT student_id)
FROM transactions
WHERE status='success'
AND MONTH(transaction_date)=MONTH(NOW())
```

---

## Penerimaan bulan ini

```
SELECT SUM(total_payment)
FROM transactions
WHERE status='success'
```

---

# 9. FITUR KRITIS

# WAJIB ADA

## A. Generate tagihan otomatis

Karena manual akan sangat berat.

---

## B. Void transaksi

Tidak boleh delete transaksi.

---

## C. Audit log

Semua perubahan tercatat.

---

## D. Export laporan

* Excel
* PDF

---

## E. Filter laporan

* tanggal
* kelas
* unit
* tahun ajaran

---

# 10. FRONTEND STRUCTURE

```
Dashboard

Master
├── Tahun Ajaran
├── Unit Sekolah
├── Kelas
├── Siswa
├── POS Pembayaran
└── Template Pembayaran

Keuangan
├── Generate Tagihan
├── Data Tagihan
├── Transaksi
├── Riwayat Pembayaran
└── Tunggakan

Laporan
├── Harian
├── Bulanan
├── Tahunan
├── Tunggakan
└── Rekap POS

Pengaturan
├── User
├── Role
├── Hak Akses
└── Sistem
```

---

# 11. REKOMENDASI STACK

## Backend

| Layer     | Teknologi     |
| --------- | ------------- |
| Framework |               |
| Auth      |               |
| Queue     |               |
| Export    |               |
| PDF       |               |

---

## Database

| Item  | Teknologi  |
| ----- | ---------- |
| DBMS  | PostgreSQL |
| Cache | Redis      |

Kenapa PostgreSQL:

* kuat relational
* transaksi aman
* reporting bagus
* JSON support
* indexing kuat

---

## Frontend

| Layer     | Teknologi       |
| --------- | --------------- |
| Framework |                 |
| UI        | shadcn/ui       |
| State     | Zustand         |
| Table     | Tanstack Table  |
| Form      | React Hook Form |

---

# 12. ROADMAP DEVELOPMENT

# PHASE 1

Core System

Auth
Master Data
Siswa
Kelas
Tahun Ajaran
POS
```

---

# PHASE 2

Billing Engine

```
Template Tagihan
Generate Tagihan
Bill Management
```

---

# PHASE 3

Transaction System

```
Pembayaran
Kwitansi
Void
Riwayat
```

---

# PHASE 4

Reporting

```
Laporan
Export Excel
Dashboard Statistik
```

---

# 13. KESALAHAN YANG HARUS DIHINDARI

## Jangan:

❌ simpan bulan sebagai kolom

❌ delete transaksi

❌ simpan total tanpa detail

❌ gabungkan bill dan transaksi

❌ simpan kelas langsung di siswa

❌ hardcode nominal pembayaran

❌ tidak punya audit log

---

# 14. KESIMPULAN FINAL

Arsitektur ini sudah siap untuk:

* ribuan siswa
* multi unit sekolah
* pembayaran cicilan
* audit keuangan
* laporan kompleks
* integrasi QRIS
* notifikasi WA
* aplikasi wali murid
* mobile apps
* multi user operator
* histori akademik
* scaling jangka panjang

Ini sudah mendekati pola ERP akademik-keuangan skala production.

Login: admin@alhasaniyyah.sch.id / Admin123!

MY VPS
IP: 129.226.213.135
USERNAME: ubuntu
PASSWORD: storm-26#-mountain