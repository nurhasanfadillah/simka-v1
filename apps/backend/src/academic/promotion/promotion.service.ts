import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import {
  bills,
  classes,
  schoolYears,
  studentClasses,
  students,
} from '../../db/schema';
import { PreviewPromotionDto } from './dto/preview-promotion.dto';
import { PromoteDto } from './dto/promote.dto';

function isUniqueViolation(err: any): boolean {
  return (err?.code ?? err?.cause?.code) === '23505';
}

@Injectable()
export class PromotionService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async previewPromotion(dto: PreviewPromotionDto) {
    const studentList = await this.db
      .select({
        enrollmentId: studentClasses.id,
        studentId: studentClasses.studentId,
        classId: studentClasses.classId,
        nis: students.nis,
        name: students.name,
        gender: students.gender,
        className: classes.name,
        classLevel: classes.level,
        yearName: schoolYears.name,
      })
      .from(studentClasses)
      .innerJoin(students, eq(students.id, studentClasses.studentId))
      .innerJoin(classes, eq(classes.id, studentClasses.classId))
      .innerJoin(schoolYears, eq(schoolYears.id, studentClasses.schoolYearId))
      .where(
        and(
          eq(studentClasses.classId, dto.fromClassId),
          eq(studentClasses.schoolYearId, dto.fromYearId),
        ),
      )
      .orderBy(students.name);

    if (studentList.length === 0) {
      return { fromClass: null, students: [] };
    }

    const studentIds = studentList.map((s) => s.studentId);
    const tunggakanSet = await this.db
      .select({ studentId: bills.studentId })
      .from(bills)
      .where(and(inArray(bills.studentId, studentIds), ne(bills.status, 'lunas')))
      .then((rows) => new Set(rows.map((r) => r.studentId)));

    const first = studentList[0];
    return {
      fromClass: {
        id: first.classId,
        name: first.className,
        level: first.classLevel,
        schoolYearName: first.yearName,
      },
      students: studentList.map((s) => ({
        studentId: s.studentId,
        nis: s.nis,
        name: s.name,
        gender: s.gender,
        currentClass: { id: s.classId, name: s.className, level: s.classLevel },
        hasTunggakan: tunggakanSet.has(s.studentId),
      })),
    };
  }

  async promote(dto: PromoteDto) {
    for (const item of dto.items) {
      if (!['lulus', 'keluar', 'pindah'].includes(item.action) && !item.toClassId) {
        throw new BadRequestException(
          `studentId ${item.studentId}: toClassId wajib diisi untuk action "${item.action}"`,
        );
      }
    }

    const result = {
      processed: 0,
      naik: 0,
      tinggal: 0,
      lulus: 0,
      keluar: 0,
      pindah: 0,
      errors: [] as Array<{ studentId: number; message: string }>,
    };

    for (const item of dto.items) {
      try {
        if (item.action === 'naik') {
          await this.db.insert(studentClasses).values({
            studentId: item.studentId,
            classId: item.toClassId!,
            schoolYearId: dto.toYearId,
            isActive: true,
          });
          result.naik++;
          result.processed++;
        } else if (item.action === 'tinggal') {
          await this.db.transaction(async (tx) => {
            await tx.insert(studentClasses).values({
              studentId: item.studentId,
              classId: item.toClassId!,
              schoolYearId: dto.toYearId,
              isActive: true,
            });
            await tx
              .update(students)
              .set({ registrationStatus: 'mengulang' })
              .where(eq(students.id, item.studentId));
          });
          result.tinggal++;
          result.processed++;
        } else if (item.action === 'lulus') {
          await this.db
            .update(students)
            .set({ studentStatus: 'lulus' })
            .where(eq(students.id, item.studentId));
          result.lulus++;
          result.processed++;
        } else if (item.action === 'keluar') {
          await this.db
            .update(students)
            .set({ studentStatus: 'keluar' })
            .where(eq(students.id, item.studentId));
          result.keluar++;
          result.processed++;
        } else if (item.action === 'pindah') {
          await this.db
            .update(students)
            .set({ studentStatus: 'pindah' })
            .where(eq(students.id, item.studentId));
          result.pindah++;
          result.processed++;
        }
      } catch (err: any) {
        if (isUniqueViolation(err)) {
          result.errors.push({
            studentId: item.studentId,
            message: 'Siswa sudah terdaftar di tahun ajaran tujuan',
          });
        } else {
          result.errors.push({
            studentId: item.studentId,
            message: err?.message ?? 'Gagal memproses',
          });
        }
      }
    }

    return result;
  }
}
