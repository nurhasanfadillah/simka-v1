import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ── Helpers ────────────────────────────────────────────────────────────────

function randomChars(n: number): string {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: n }, () => alpha[Math.floor(Math.random() * alpha.length)]).join('');
}

function generateNis(birthDate: string, entryYear: number): string {
  // Format: 3 huruf + ddmmyy(birthdate) + 2 digit tahun masuk
  const d = new Date(birthDate);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const ey = String(entryYear).slice(-2);
  return `${randomChars(3)}${dd}${mm}${yy}${ey}`;
}

function log(msg: string) {
  process.stdout.write(`  ${msg}\n`);
}

// ── Seed Functions ─────────────────────────────────────────────────────────

async function seedRoles() {
  const roleNames = ['Super Admin', 'Admin', 'Bendahara', 'Operator'];
  let created = 0;
  const result: Record<string, number> = {};

  for (const name of roleNames) {
    const existing = await db.query.roles.findFirst({ where: eq(schema.roles.name, name) });
    if (!existing) {
      const [row] = await db.insert(schema.roles).values({ name }).returning();
      result[name] = row.id;
      created++;
    } else {
      result[name] = existing.id;
    }
  }

  log(`Roles: ${created} created, ${roleNames.length - created} skipped`);
  return result;
}

async function seedPermissions() {
  const perms = [
    { code: 'dashboard.view', name: 'Lihat Dashboard' },
    { code: 'school_unit.view', name: 'Lihat Unit Sekolah' },
    { code: 'school_unit.create', name: 'Tambah Unit Sekolah' },
    { code: 'school_unit.update', name: 'Edit Unit Sekolah' },
    { code: 'school_year.view', name: 'Lihat Tahun Ajaran' },
    { code: 'school_year.create', name: 'Tambah Tahun Ajaran' },
    { code: 'school_year.update', name: 'Edit Tahun Ajaran' },
    { code: 'class.view', name: 'Lihat Kelas' },
    { code: 'class.create', name: 'Tambah Kelas' },
    { code: 'class.update', name: 'Edit Kelas' },
    { code: 'student.view', name: 'Lihat Siswa' },
    { code: 'student.create', name: 'Tambah Siswa' },
    { code: 'student.update', name: 'Edit Siswa' },
    { code: 'payment_post.view', name: 'Lihat POS Pembayaran' },
    { code: 'payment_post.create', name: 'Tambah POS Pembayaran' },
    { code: 'payment_post.update', name: 'Edit POS Pembayaran' },
    { code: 'payment_post.delete', name: 'Hapus POS Pembayaran' },
    { code: 'payment_template.view', name: 'Lihat Template Tagihan' },
    { code: 'payment_template.create', name: 'Tambah Template Tagihan' },
    { code: 'payment_template.update', name: 'Edit Template Tagihan' },
    { code: 'payment_template.delete', name: 'Hapus Template Tagihan' },
    { code: 'bill.view', name: 'Lihat Tagihan' },
    { code: 'bill.create', name: 'Buat Tagihan' },
    { code: 'transaction.view', name: 'Lihat Transaksi' },
    { code: 'transaction.create', name: 'Buat Transaksi' },
    { code: 'transaction.void', name: 'Void Transaksi' },
    { code: 'transaction.delete', name: 'Hapus Transaksi Void' },
    { code: 'student.delete', name: 'Hapus Siswa' },
    { code: 'report.view', name: 'Lihat Laporan' },
    { code: 'report.export', name: 'Export Laporan' },
    { code: 'user.view', name: 'Lihat User' },
    { code: 'user.manage', name: 'Kelola User' },
    { code: 'role.view', name: 'Lihat Role' },
    { code: 'role.manage', name: 'Kelola Role & Permission' },
  ];

  let created = 0;
  const result: Record<string, number> = {};

  for (const perm of perms) {
    const existing = await db.query.permissions.findFirst({
      where: eq(schema.permissions.code, perm.code),
    });
    if (!existing) {
      const [row] = await db.insert(schema.permissions).values(perm).returning();
      result[perm.code] = row.id;
      created++;
    } else {
      result[perm.code] = existing.id;
    }
  }

  log(`Permissions: ${created} created, ${perms.length - created} skipped`);
  return result;
}

async function seedRolePermissions(
  roleIds: Record<string, number>,
  permIds: Record<string, number>,
) {
  const allPerms = Object.keys(permIds);

  const superAdminPerms = allPerms;
  const adminPerms = allPerms.filter((p) => !['role.manage', 'user.create'].includes(p));
  const bendaharaPerms = allPerms.filter((p) =>
    ['dashboard.view', 'bill.view', 'bill.create', 'transaction.view', 'transaction.create', 'transaction.void', 'report.view', 'report.export'].includes(p),
  );
  const operatorPerms = allPerms.filter((p) =>
    ['dashboard.view', 'student.view', 'bill.view', 'transaction.create', 'transaction.view'].includes(p),
  );

  const mapping: Record<string, string[]> = {
    'Super Admin': superAdminPerms,
    Admin: adminPerms,
    Bendahara: bendaharaPerms,
    Operator: operatorPerms,
  };

  let created = 0;
  for (const [roleName, perms] of Object.entries(mapping)) {
    const roleId = roleIds[roleName];
    for (const permCode of perms) {
      const permId = permIds[permCode];
      if (!permId) continue;
      const existing = await db.query.rolePermissions.findFirst({
        where: and(
          eq(schema.rolePermissions.roleId, roleId),
          eq(schema.rolePermissions.permissionId, permId),
        ),
      });
      if (!existing) {
        await db.insert(schema.rolePermissions).values({ roleId, permissionId: permId });
        created++;
      }
    }
  }

  log(`Role-Permissions: ${created} created`);
}

async function seedUsers(roleIds: Record<string, number>) {
  const email = 'admin@alhasaniyyah.sch.id';
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });

  if (!existing) {
    const password = await bcrypt.hash('Admin123!', 10);
    await db.insert(schema.users).values({
      name: 'Super Admin',
      email,
      password,
      roleId: roleIds['Super Admin'],
      isActive: true,
    });
    log(`Users: 1 created (${email})`);
  } else {
    log(`Users: skipped (${email} already exists)`);
  }
}

async function seedSchoolUnits() {
  const units = [
    { name: 'SD Al-Hasaniyyah', code: 'SD' },
    { name: 'SMP Al-Hasaniyyah', code: 'SMP' },
    { name: 'SMA Al-Hasaniyyah', code: 'SMA' },
    { name: 'Pondok Pesantren', code: 'PP' },
  ];

  let created = 0;
  const result: Record<string, number> = {};

  for (const unit of units) {
    const existing = await db.query.schoolUnits.findFirst({
      where: eq(schema.schoolUnits.code, unit.code),
    });
    if (!existing) {
      const [row] = await db.insert(schema.schoolUnits).values(unit).returning();
      result[unit.code] = row.id;
      created++;
    } else {
      result[unit.code] = existing.id;
    }
  }

  log(`School Units: ${created} created, ${units.length - created} skipped`);
  return result;
}

async function seedSchoolYears() {
  const existing = await db.query.schoolYears.findFirst({
    where: eq(schema.schoolYears.name, '2025/2026'),
  });

  if (!existing) {
    const [row] = await db
      .insert(schema.schoolYears)
      .values({ name: '2025/2026', startYear: 2025, endYear: 2026, isActive: true })
      .returning();
    log(`School Years: 1 created (2025/2026)`);
    return row.id;
  }

  log(`School Years: skipped (2025/2026 already exists)`);
  return existing.id;
}

async function seedClasses(unitIds: Record<string, number>) {
  const classDefs = [
    { code: 'SD', name: 'Kelas 1A', level: 1 },
    { code: 'SD', name: 'Kelas 2A', level: 2 },
    { code: 'SMP', name: 'Kelas VII A', level: 7 },
    { code: 'SMP', name: 'Kelas VIII A', level: 8 },
    { code: 'SMA', name: 'Kelas X IPA', level: 10 },
    { code: 'SMA', name: 'Kelas XI IPA', level: 11 },
    { code: 'PP', name: 'Kelas Ula 1', level: 1 },
    { code: 'PP', name: 'Kelas Wustho 1', level: 4 },
  ];

  let created = 0;
  const result: { id: number; code: string }[] = [];

  for (const cls of classDefs) {
    const unitId = unitIds[cls.code];
    const existing = await db.query.classes.findFirst({
      where: and(eq(schema.classes.schoolUnitId, unitId), eq(schema.classes.name, cls.name)),
    });
    if (!existing) {
      const [row] = await db
        .insert(schema.classes)
        .values({ schoolUnitId: unitId, name: cls.name, level: cls.level })
        .returning();
      result.push({ id: row.id, code: cls.code });
      created++;
    } else {
      result.push({ id: existing.id, code: cls.code });
    }
  }

  log(`Classes: ${created} created, ${classDefs.length - created} skipped`);
  return result;
}

async function seedStudents(
  classes: { id: number; code: string }[],
  schoolYearId: number,
) {
  // 10 siswa per unit (SD, SMP, SMA, PP)
  const namesByUnit: Record<string, { name: string; parentName: string; birthDate: string; gender: 'L' | 'P' }[]> = {
    SD: [
      { name: 'Ahmad Raihan', parentName: 'Bapak Raihan', birthDate: '2015-03-12', gender: 'L' },
      { name: 'Nasywa Azzahra', parentName: 'Bapak Azzahra', birthDate: '2015-07-20', gender: 'P' },
      { name: 'Muhammad Farhan', parentName: 'Bapak Farhan', birthDate: '2015-01-05', gender: 'L' },
      { name: 'Khalisa Humaira', parentName: 'Bapak Humaira', birthDate: '2016-11-18', gender: 'P' },
      { name: 'Rafif Al-Farizi', parentName: 'Bapak Farizi', birthDate: '2015-09-25', gender: 'L' },
      { name: 'Zahra Salsabila', parentName: 'Bapak Salsabila', birthDate: '2016-04-14', gender: 'P' },
      { name: 'Ridho Pratama', parentName: 'Bapak Pratama', birthDate: '2015-12-02', gender: 'L' },
      { name: 'Azka Naila', parentName: 'Bapak Naila', birthDate: '2016-08-30', gender: 'P' },
      { name: 'Faisal Hakim', parentName: 'Bapak Hakim', birthDate: '2015-06-17', gender: 'L' },
      { name: 'Aisyah Putri', parentName: 'Bapak Putri', birthDate: '2016-02-09', gender: 'P' },
    ],
    SMP: [
      { name: 'Rizky Maulana', parentName: 'Bapak Maulana', birthDate: '2011-05-10', gender: 'L' },
      { name: 'Fatimah Nur', parentName: 'Bapak Nur', birthDate: '2011-09-22', gender: 'P' },
      { name: 'Daffa Ardiansyah', parentName: 'Bapak Ardiansyah', birthDate: '2012-01-15', gender: 'L' },
      { name: 'Syifa Aulia', parentName: 'Bapak Aulia', birthDate: '2011-07-08', gender: 'P' },
      { name: 'Haikal Akbar', parentName: 'Bapak Akbar', birthDate: '2012-03-27', gender: 'L' },
      { name: 'Nadhira Salma', parentName: 'Bapak Salma', birthDate: '2011-11-13', gender: 'P' },
      { name: 'Zidan Pratama', parentName: 'Bapak Pratama', birthDate: '2012-06-04', gender: 'L' },
      { name: 'Rania Kusuma', parentName: 'Bapak Kusuma', birthDate: '2011-04-19', gender: 'P' },
      { name: 'Alif Ramadhan', parentName: 'Bapak Ramadhan', birthDate: '2012-08-11', gender: 'L' },
      { name: 'Hasna Fadhila', parentName: 'Bapak Fadhila', birthDate: '2011-12-28', gender: 'P' },
    ],
    SMA: [
      { name: 'Fariz Abdullah', parentName: 'Bapak Abdullah', birthDate: '2008-02-14', gender: 'L' },
      { name: 'Amira Zahra', parentName: 'Bapak Zahra', birthDate: '2008-06-30', gender: 'P' },
      { name: 'Ilham Nugraha', parentName: 'Bapak Nugraha', birthDate: '2009-01-21', gender: 'L' },
      { name: 'Salma Nadira', parentName: 'Bapak Nadira', birthDate: '2008-10-07', gender: 'P' },
      { name: 'Reza Firmansyah', parentName: 'Bapak Firmansyah', birthDate: '2009-04-16', gender: 'L' },
      { name: 'Dina Aufarani', parentName: 'Bapak Aufarani', birthDate: '2008-08-23', gender: 'P' },
      { name: 'Nabil Hasan', parentName: 'Bapak Hasan', birthDate: '2009-03-05', gender: 'L' },
      { name: 'Laila Fitriani', parentName: 'Bapak Fitriani', birthDate: '2008-12-11', gender: 'P' },
      { name: 'Arkan Miftah', parentName: 'Bapak Miftah', birthDate: '2009-07-29', gender: 'L' },
      { name: 'Intan Permata', parentName: 'Bapak Permata', birthDate: '2008-05-17', gender: 'P' },
    ],
    PP: [
      { name: 'Luqman Hakim', parentName: 'Bapak Hakim', birthDate: '2010-03-08', gender: 'L' },
      { name: 'Mariam Ulfa', parentName: 'Bapak Ulfa', birthDate: '2010-07-24', gender: 'P' },
      { name: 'Umar Faruq', parentName: 'Bapak Faruq', birthDate: '2011-01-12', gender: 'L' },
      { name: 'Khadijah Sari', parentName: 'Bapak Sari', birthDate: '2010-09-19', gender: 'P' },
      { name: 'Bilal Rahman', parentName: 'Bapak Rahman', birthDate: '2011-05-03', gender: 'L' },
      { name: 'Ruqayyah Nisa', parentName: 'Bapak Nisa', birthDate: '2010-11-30', gender: 'P' },
      { name: 'Salman Ghifari', parentName: 'Bapak Ghifari', birthDate: '2011-08-15', gender: 'L' },
      { name: 'Asma Wulandari', parentName: 'Bapak Wulandari', birthDate: '2010-04-06', gender: 'P' },
      { name: 'Hasan Al-Banna', parentName: 'Bapak Al-Banna', birthDate: '2011-02-22', gender: 'L' },
      { name: 'Zainab Fitri', parentName: 'Bapak Fitri', birthDate: '2010-06-14', gender: 'P' },
    ],
  };

  // Map unit code to first class for that unit
  const unitFirstClass: Record<string, number> = {};
  for (const cls of classes) {
    if (!unitFirstClass[cls.code]) {
      unitFirstClass[cls.code] = cls.id;
    }
  }

  let created = 0;
  const entryYear = 2025;

  for (const [unitCode, students] of Object.entries(namesByUnit)) {
    const classId = unitFirstClass[unitCode];
    if (!classId) continue;

    for (const s of students) {
      const nis = generateNis(s.birthDate, entryYear);
      const existing = await db.query.students.findFirst({
        where: eq(schema.students.name, s.name),
      });

      if (!existing) {
        const [student] = await db
          .insert(schema.students)
          .values({
            nis,
            name: s.name,
            gender: s.gender,
            birthPlace: 'Depok',
            birthDate: s.birthDate,
            parentName: s.parentName,
            phone: `08${Math.floor(100000000 + Math.random() * 900000000)}`,
            address: 'Jl. Al-Hasaniyyah, Depok, Jawa Barat',
            registrationStatus: 'baru',
            studentStatus: 'aktif',
            entryYear,
          })
          .returning();

        await db.insert(schema.studentClasses).values({
          studentId: student.id,
          classId,
          schoolYearId,
          isActive: true,
        });

        created++;
      }
    }
  }

  log(`Students: ${created} created`);
}

async function seedPaymentPosts() {
  const posts = [
    { code: 'SPP', name: 'SPP Bulanan', type: 'bulanan' as const, description: 'Sumbangan Pembinaan Pendidikan bulanan' },
    { code: 'UGD', name: 'Uang Gedung', type: 'bebas' as const, description: 'Biaya pembangunan gedung sekolah' },
    { code: 'SRM', name: 'Seragam', type: 'bebas' as const, description: 'Seragam sekolah' },
    { code: 'BKU', name: 'Buku', type: 'bebas' as const, description: 'Buku pelajaran' },
  ];

  let created = 0;
  for (const post of posts) {
    const existing = await db.query.paymentPosts.findFirst({
      where: eq(schema.paymentPosts.code, post.code),
    });
    if (!existing) {
      await db.insert(schema.paymentPosts).values(post);
      created++;
    }
  }

  log(`Payment Posts: ${created} created, ${posts.length - created} skipped`);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 SIMKA — Seeding database...\n');

  try {
    const roleIds = await seedRoles();
    const permIds = await seedPermissions();
    await seedRolePermissions(roleIds, permIds);
    await seedUsers(roleIds);
    const unitIds = await seedSchoolUnits();
    const schoolYearId = await seedSchoolYears();
    const classes = await seedClasses(unitIds);
    await seedStudents(classes, schoolYearId);
    await seedPaymentPosts();

    console.log('\n✅ Seeding selesai!\n');
    console.log('  Login: admin@alhasaniyyah.sch.id');
    console.log('  Pass:  Admin123!\n');
  } catch (err) {
    console.error('\n❌ Seeding gagal:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
