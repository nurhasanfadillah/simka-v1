import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import {
  classes,
  schoolUnits,
  schoolYears,
  studentClasses,
  students,
} from '../../db/schema';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { TransferStudentDto } from './dto/transfer-student.dto';

function isUniqueViolation(err: any): boolean {
  return (err?.code ?? err?.cause?.code) === '23505';
}

@Injectable()
export class StudentClassesService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async findByClass(classId: number, schoolYearId: number) {
    return this.db
      .select({
        enrollmentId: studentClasses.id,
        studentId: studentClasses.studentId,
        nis: students.nis,
        name: students.name,
        gender: students.gender,
      })
      .from(studentClasses)
      .innerJoin(students, eq(students.id, studentClasses.studentId))
      .where(
        and(
          eq(studentClasses.classId, classId),
          eq(studentClasses.schoolYearId, schoolYearId),
        ),
      )
      .orderBy(students.name);
  }

  async findByStudent(studentId: number) {
    return this.db
      .select({
        id: studentClasses.id,
        studentId: studentClasses.studentId,
        classId: studentClasses.classId,
        schoolYearId: studentClasses.schoolYearId,
        isActive: studentClasses.isActive,
        createdAt: studentClasses.createdAt,
        className: classes.name,
        classLevel: classes.level,
        unitName: schoolUnits.name,
        yearName: schoolYears.name,
      })
      .from(studentClasses)
      .innerJoin(classes, eq(classes.id, studentClasses.classId))
      .innerJoin(schoolUnits, eq(schoolUnits.id, classes.schoolUnitId))
      .innerJoin(schoolYears, eq(schoolYears.id, studentClasses.schoolYearId))
      .where(eq(studentClasses.studentId, studentId))
      .orderBy(desc(schoolYears.startYear));
  }

  async remove(id: number) {
    const [enrollment] = await this.db
      .select()
      .from(studentClasses)
      .where(eq(studentClasses.id, id))
      .limit(1);
    if (!enrollment) throw new NotFoundException('Data enrollment tidak ditemukan');

    await this.db.delete(studentClasses).where(eq(studentClasses.id, id));
    return { success: true, id };
  }

  async enroll(dto: EnrollStudentDto) {
    const [student] = await this.db
      .select()
      .from(students)
      .where(eq(students.id, dto.studentId))
      .limit(1);
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const [cls] = await this.db
      .select()
      .from(classes)
      .where(eq(classes.id, dto.classId))
      .limit(1);
    if (!cls) throw new NotFoundException('Kelas tidak ditemukan');

    const [year] = await this.db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.id, dto.schoolYearId))
      .limit(1);
    if (!year) throw new NotFoundException('Tahun ajaran tidak ditemukan');

    try {
      const [enrolled] = await this.db
        .insert(studentClasses)
        .values({
          studentId: dto.studentId,
          classId: dto.classId,
          schoolYearId: dto.schoolYearId,
          isActive: true,
        })
        .returning();
      return enrolled;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Siswa sudah terdaftar di tahun ajaran ini');
      }
      throw err;
    }
  }

  async transfer(id: number, dto: TransferStudentDto) {
    const [enrollment] = await this.db
      .select()
      .from(studentClasses)
      .where(eq(studentClasses.id, id))
      .limit(1);
    if (!enrollment) throw new NotFoundException('Data enrollment tidak ditemukan');

    const [cls] = await this.db
      .select()
      .from(classes)
      .where(eq(classes.id, dto.classId))
      .limit(1);
    if (!cls) throw new NotFoundException('Kelas tujuan tidak ditemukan');

    // Unique constraint uq_student_school_year pada (studentId, schoolYearId) tanpa isActive
    // — sehingga transfer dilakukan dengan UPDATE classId pada enrollment yang ada,
    //   bukan insert record baru.
    const [updated] = await this.db
      .update(studentClasses)
      .set({ classId: dto.classId })
      .where(eq(studentClasses.id, id))
      .returning();
    return updated;
  }
}
