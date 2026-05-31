import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { and, asc, count, eq, isNull, ne, or, sql } from 'drizzle-orm';
import * as ExcelJS from 'exceljs';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import { bills, classes, schoolUnits, studentClasses, students } from '../../db/schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

function isUniqueViolation(err: any): boolean {
  return (err?.code ?? err?.cause?.code) === '23505';
}

function getUniqueField(err: any): string {
  const detail: string = err?.detail ?? err?.cause?.detail ?? '';
  if (detail.includes('(nisn)')) return 'nisn';
  if (detail.includes('(nis)')) return 'nis';
  return 'unknown';
}

@Injectable()
export class StudentsService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  private generateNis(birthDate: string, entryYear: number): string {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const rand3 = Array.from(
      { length: 3 },
      () => alpha[Math.floor(Math.random() * 26)],
    ).join('');
    const d = new Date(birthDate);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const ey = String(entryYear).slice(-2);
    return `${rand3}${dd}${mm}${yy}${ey}`;
  }

  async findAll(schoolUnitId?: number) {
    const baseQuery = this.db
      .select({
        id: students.id,
        nis: students.nis,
        nisn: students.nisn,
        name: students.name,
        gender: students.gender,
        birthPlace: students.birthPlace,
        birthDate: students.birthDate,
        parentName: students.parentName,
        phone: students.phone,
        address: students.address,
        registrationStatus: students.registrationStatus,
        studentStatus: students.studentStatus,
        entryYear: students.entryYear,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        activeClassId: studentClasses.classId,
        activeClassName: classes.name,
        activeClassLevel: classes.level,
        activeUnitId: classes.schoolUnitId,
        activeUnitName: schoolUnits.name,
      })
      .from(students)
      .leftJoin(
        studentClasses,
        and(
          eq(studentClasses.studentId, students.id),
          eq(studentClasses.isActive, true),
        ),
      )
      .leftJoin(classes, eq(classes.id, studentClasses.classId))
      .leftJoin(schoolUnits, eq(schoolUnits.id, classes.schoolUnitId))
      .orderBy(asc(students.name));

    if (schoolUnitId) {
      return baseQuery.where(eq(schoolUnits.id, schoolUnitId));
    }
    return baseQuery;
  }

  async findOne(id: number) {
    const result = await this.db
      .select({
        id: students.id,
        nis: students.nis,
        nisn: students.nisn,
        name: students.name,
        gender: students.gender,
        birthPlace: students.birthPlace,
        birthDate: students.birthDate,
        parentName: students.parentName,
        phone: students.phone,
        address: students.address,
        registrationStatus: students.registrationStatus,
        studentStatus: students.studentStatus,
        entryYear: students.entryYear,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        activeClassId: studentClasses.classId,
        activeClassName: classes.name,
        activeClassLevel: classes.level,
        activeUnitId: classes.schoolUnitId,
        activeUnitName: schoolUnits.name,
      })
      .from(students)
      .leftJoin(
        studentClasses,
        and(
          eq(studentClasses.studentId, students.id),
          eq(studentClasses.isActive, true),
        ),
      )
      .leftJoin(classes, eq(classes.id, studentClasses.classId))
      .leftJoin(schoolUnits, eq(schoolUnits.id, classes.schoolUnitId))
      .where(eq(students.id, id))
      .limit(1);

    const [student] = result;
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    return student;
  }

  async findAvailableForMapping(schoolYearId: number, excludeClassId: number) {
    const results = await this.db
      .select({
        id: students.id,
        nis: students.nis,
        name: students.name,
        gender: students.gender,
        enrollmentId: studentClasses.id,
        currentClassId: studentClasses.classId,
        currentClassName: classes.name,
      })
      .from(students)
      .leftJoin(
        studentClasses,
        and(
          eq(studentClasses.studentId, students.id),
          eq(studentClasses.schoolYearId, schoolYearId),
        ),
      )
      .leftJoin(classes, eq(classes.id, studentClasses.classId))
      .where(
        and(
          eq(students.studentStatus, 'aktif'),
          or(
            isNull(studentClasses.classId),
            ne(studentClasses.classId, excludeClassId),
          ),
        ),
      )
      .orderBy(asc(students.name));

    return results;
  }

  async searchStudents(params: {
    q?: string;
    schoolYearId?: number;
    unitId?: number;
    classId?: number;
  }) {
    const conditions = [eq(students.studentStatus, 'aktif')];

    if (params.q) {
      const pattern = `%${params.q}%`;
      conditions.push(
        sql`(${students.name} ILIKE ${pattern} OR ${students.nis} ILIKE ${pattern})`,
      );
    }

    if (params.schoolYearId) {
      conditions.push(eq(studentClasses.schoolYearId, params.schoolYearId));
    }
    if (params.unitId) {
      conditions.push(eq(schoolUnits.id, params.unitId));
    }
    if (params.classId) {
      conditions.push(eq(studentClasses.classId, params.classId));
    }

    return this.db
      .select({
        id: students.id,
        nis: students.nis,
        name: students.name,
        activeClassName: classes.name,
        activeUnitName: schoolUnits.name,
      })
      .from(students)
      .leftJoin(
        studentClasses,
        and(
          eq(studentClasses.studentId, students.id),
          eq(studentClasses.isActive, true),
        ),
      )
      .leftJoin(classes, eq(classes.id, studentClasses.classId))
      .leftJoin(schoolUnits, eq(schoolUnits.id, classes.schoolUnitId))
      .where(and(...conditions))
      .orderBy(asc(students.name))
      .limit(50);
  }

  async create(dto: CreateStudentDto) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const nis = this.generateNis(dto.birthDate, dto.entryYear);
      try {
        const [created] = await this.db
          .insert(students)
          .values({
            nis,
            nisn: dto.nisn ?? null,
            name: dto.name,
            gender: dto.gender,
            birthPlace: dto.birthPlace,
            birthDate: dto.birthDate,
            parentName: dto.parentName,
            phone: dto.phone ?? null,
            address: dto.address ?? null,
            registrationStatus: dto.registrationStatus,
            studentStatus: 'aktif',
            entryYear: dto.entryYear,
          })
          .returning();
        return created;
      } catch (err: any) {
        if (isUniqueViolation(err)) {
          const field = getUniqueField(err);
          if (field === 'nisn') throw new ConflictException('NISN sudah dipakai');
          if (attempt === 1) {
            throw new InternalServerErrorException('Gagal generate NIS unik, coba lagi');
          }
          continue;
        }
        throw err;
      }
    }
    throw new InternalServerErrorException('Gagal membuat data siswa');
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.findOne(id);
    try {
      const [updated] = await this.db
        .update(students)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(students.id, id))
        .returning();
      return updated;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        const field = getUniqueField(err);
        if (field === 'nisn') throw new ConflictException('NISN sudah dipakai');
        throw new ConflictException('Data siswa konflik dengan data yang sudah ada');
      }
      throw err;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    const [scCount, billsCount] = await Promise.all([
      this.db.select({ value: count() }).from(studentClasses).where(eq(studentClasses.studentId, id)),
      this.db.select({ value: count() }).from(bills).where(eq(bills.studentId, id)),
    ]);
    const relatedData: Record<string, number> = {};
    if (scCount[0].value > 0) relatedData['kelas'] = scCount[0].value;
    if (billsCount[0].value > 0) relatedData['tagihan'] = billsCount[0].value;
    if (Object.keys(relatedData).length > 0) {
      throw new ConflictException({
        message: 'Tidak dapat dihapus karena masih memiliki data terkait',
        relatedData,
      });
    }
    await this.db.delete(students).where(eq(students.id, id));
  }

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Import Siswa');

    sheet.columns = [
      { header: 'Nama*', key: 'name', width: 25 },
      { header: 'Jenis Kelamin*', key: 'gender', width: 15 },
      { header: 'Tanggal Lahir*', key: 'birthDate', width: 16 },
      { header: 'Nama Orang Tua*', key: 'parentName', width: 25 },
      { header: 'NISN', key: 'nisn', width: 18 },
      { header: 'Tempat Lahir', key: 'birthPlace', width: 20 },
      { header: 'Telepon', key: 'phone', width: 18 },
      { header: 'Alamat', key: 'address', width: 35 },
      { header: 'Jenis Pendaftaran', key: 'registrationStatus', width: 18 },
      { header: 'Status Siswa', key: 'studentStatus', width: 14 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A3829' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    headerRow.height = 22;

    sheet.mergeCells('A2:J2');
    const noteRow = sheet.getRow(2);
    noteRow.getCell(1).value = 'Kolom bertanda * wajib diisi | JK: L/P | Tgl Lahir: DD/MM/YYYY | Pendaftaran: baru/pindahan/mengulang | Status: aktif/keluar/lulus/pindah | Contoh: Ahmad Fauzi, L, 01/01/2010, Budi Santoso';
    noteRow.getCell(1).font = { italic: true, color: { argb: 'FF666666' }, size: 10 };
    noteRow.height = 20;

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  async previewImport(fileBuffer: Buffer, entryYear: number) {
    if (![2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].includes(entryYear)) {
      throw new BadRequestException('Tahun Masuk harus antara 2000-2030');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('File Excel kosong atau tidak valid');

    const rows: any[] = [];
    const seenInFile = new Set<string>();

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 2) return;

      const name = String(row.getCell(1).value ?? '').trim();
      const gender = String(row.getCell(2).value ?? '').trim().toUpperCase();
      const birthDate = String(row.getCell(3).value ?? '').trim();
      const parentName = String(row.getCell(4).value ?? '').trim();
      const nisn = String(row.getCell(5).value ?? '').trim();
      const birthPlace = String(row.getCell(6).value ?? '').trim();
      const phone = String(row.getCell(7).value ?? '').trim();
      const address = String(row.getCell(8).value ?? '').trim();
      const registrationStatus = String(row.getCell(9).value ?? '').trim();
      const studentStatus = String(row.getCell(10).value ?? '').trim();

      if (!name && !gender && !birthDate && !parentName) return;

      const errors: string[] = [];

      if (!name) errors.push('Nama wajib diisi');
      if (!gender || !['L', 'P'].includes(gender)) errors.push('Jenis Kelamin harus L atau P');
      if (!birthDate) {
        errors.push('Tanggal Lahir wajib diisi');
      } else {
        const parts = birthDate.split('/');
        if (parts.length !== 3) {
          errors.push('Tanggal Lahir harus format DD/MM/YYYY');
        } else {
          const [dd, mm, yyyy] = parts.map(Number);
          const dateObj = new Date(yyyy, mm - 1, dd);
          if (dateObj.getFullYear() !== yyyy || dateObj.getMonth() !== mm - 1 || dateObj.getDate() !== dd) {
            errors.push('Tanggal Lahir tidak valid');
          }
        }
      }
      if (!parentName) errors.push('Nama Orang Tua wajib diisi');

      if (nisn) {
        const dupeKeyNisn = `nisn:${nisn}`;
        if (seenInFile.has(dupeKeyNisn)) {
          errors.push('NISN duplikat dalam file');
        } else {
          seenInFile.add(dupeKeyNisn);
        }
      }

      const dedupKey = `${name.toLowerCase()}|${parentName.toLowerCase()}`;
      if (name && parentName) {
        if (seenInFile.has(dedupKey)) {
          errors.push('Nama dan Nama Orang Tua duplikat dalam file');
        } else {
          seenInFile.add(dedupKey);
        }
      }

      const data = {
        name,
        gender: gender || 'L',
        birthDate,
        parentName,
        nisn: nisn || null,
        birthPlace: birthPlace || null,
        phone: phone || null,
        address: address || null,
        registrationStatus: registrationStatus || 'baru',
        studentStatus: studentStatus || 'aktif',
      };

      rows.push({ row: rowNumber, status: errors.length === 0 ? 'valid' : 'error', data, errors });
    });

    if (rows.length === 0) throw new BadRequestException('Tidak ada data siswa ditemukan di file');
    if (rows.length > 500) throw new BadRequestException('Maksimal 500 baris per import');

    const validNames = rows.filter((r) => r.status === 'valid' && r.data?.name && r.data?.parentName);
    const existingDedup: { name: string; parentName: string }[] = [];

    if (validNames.length > 0) {
      const conditions = validNames.map((r) =>
        and(
          sql`LOWER(${students.name}) = ${r.data!.name.toLowerCase()}`,
          sql`LOWER(${students.parentName}) = ${r.data!.parentName.toLowerCase()}`,
        ),
      );
      const existing = await this.db
        .select({ name: students.name, parentName: students.parentName })
        .from(students)
        .where(or(...conditions));
      existingDedup.push(...existing.map((e) => ({ name: e.name, parentName: e.parentName! })));
    }

    if (existingDedup.length > 0) {
      const dedupSet = new Set(existingDedup.map((d) => `${d.name.toLowerCase()}|${d.parentName!.toLowerCase()}`));
      for (const row of rows) {
        if (row.status === 'valid' && row.data?.name && row.data?.parentName) {
          if (dedupSet.has(`${row.data.name.toLowerCase()}|${row.data.parentName.toLowerCase()}`)) {
            row.status = 'error';
            row.errors = ['Nama dan Nama Orang Tua sudah ada di database'];
          }
        }
      }
    }

    const validNisns = rows.filter((r) => r.status === 'valid' && r.data?.nisn);
    if (validNisns.length > 0) {
      const nisnValues = validNisns.map((r) => r.data!.nisn!);
      const existingNisns = await this.db
        .select({ nisn: students.nisn })
        .from(students)
        .where(or(...nisnValues.map((n) => eq(students.nisn, n))));
      const nisnSet = new Set(existingNisns.map((e) => e.nisn));
      for (const row of rows) {
        if (row.status === 'valid' && row.data?.nisn && nisnSet.has(row.data.nisn)) {
          row.status = 'error';
          row.errors = ['NISN sudah dipakai'];
        }
      }
    }

    return { rows };
  }

  private parseExcelDate(dateStr: string): string {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      const fallback = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      const d = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
      if (!isNaN(d.getTime())) return fallback;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    throw new BadRequestException('Format tanggal lahir tidak valid');
  }

  async commitImport(entryYear: number, rows: Record<string, any>[]) {
    let success = 0;

    try {
      await this.db.transaction(async (tx) => {
        for (const row of rows) {
          const isoDate = this.parseExcelDate(row.birthDate);
          let nis: string | null = null;

          for (let attempt = 0; attempt < 3; attempt++) {
            nis = this.generateNis(isoDate, entryYear);
            try {
              await tx.insert(students).values({
                nis,
                nisn: row.nisn || null,
                name: row.name,
                gender: row.gender,
                birthPlace: row.birthPlace || '-',
                birthDate: isoDate,
                parentName: row.parentName,
                phone: row.phone || null,
                address: row.address || null,
                registrationStatus: row.registrationStatus || 'baru',
                studentStatus: row.studentStatus || 'aktif',
                entryYear,
              });
              success++;
              break;
            } catch (err: any) {
              if (isUniqueViolation(err) && getUniqueField(err) === 'nis' && attempt < 2) continue;
              throw err;
            }
          }
        }
      });
      return { success, failed: 0 };
    } catch (err: any) {
      if (isUniqueViolation(err) && getUniqueField(err) === 'nisn') {
        throw new ConflictException('NISN sudah dipakai — data tidak ada yang tersimpan');
      }
      throw new InternalServerErrorException('Gagal menyimpan data siswa — semua data dibatalkan');
    }
  }
}
