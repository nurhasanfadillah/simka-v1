import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { asc, count, eq, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import { classes, schoolUnits, studentClasses } from '../../db/schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async findAll(schoolUnitId?: number, schoolYearId?: number) {
    const query = this.db
      .select({
        id: classes.id,
        name: classes.name,
        level: classes.level,
        schoolUnitId: classes.schoolUnitId,
        unitName: schoolUnits.name,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
        studentCount: sql<number>`(
          SELECT COUNT(*)::int FROM student_classes sc
          WHERE sc.class_id = ${classes.id}
          ${schoolYearId ? sql`AND sc.school_year_id = ${schoolYearId}` : sql``}
        )`,
      })
      .from(classes)
      .innerJoin(schoolUnits, eq(classes.schoolUnitId, schoolUnits.id))
      .orderBy(asc(schoolUnits.name), asc(classes.level), asc(classes.name));

    if (schoolUnitId) {
      return query.where(eq(classes.schoolUnitId, schoolUnitId));
    }
    return query;
  }

  async findOne(id: number) {
    const [cls] = await this.db
      .select({
        id: classes.id,
        name: classes.name,
        level: classes.level,
        schoolUnitId: classes.schoolUnitId,
        unitName: schoolUnits.name,
        createdAt: classes.createdAt,
        updatedAt: classes.updatedAt,
      })
      .from(classes)
      .innerJoin(schoolUnits, eq(classes.schoolUnitId, schoolUnits.id))
      .where(eq(classes.id, id))
      .limit(1);
    if (!cls) throw new NotFoundException('Kelas tidak ditemukan');
    return cls;
  }

  private async verifySchoolUnit(schoolUnitId: number) {
    const [unit] = await this.db
      .select({ id: schoolUnits.id })
      .from(schoolUnits)
      .where(eq(schoolUnits.id, schoolUnitId))
      .limit(1);
    if (!unit) throw new NotFoundException('Unit sekolah tidak ditemukan');
  }

  async create(dto: CreateClassDto) {
    await this.verifySchoolUnit(dto.schoolUnitId);
    const [created] = await this.db
      .insert(classes)
      .values({
        schoolUnitId: dto.schoolUnitId,
        name: dto.name,
        level: dto.level,
      })
      .returning();
    return this.findOne(created.id);
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.findOne(id);
    if (dto.schoolUnitId) await this.verifySchoolUnit(dto.schoolUnitId);
    await this.db
      .update(classes)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(classes.id, id));
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const [scCount] = await Promise.all([
      this.db.select({ value: count() }).from(studentClasses).where(eq(studentClasses.classId, id)),
    ]);
    const relatedData: Record<string, number> = {};
    if (scCount[0].value > 0) relatedData['siswa'] = scCount[0].value;
    if (Object.keys(relatedData).length > 0) {
      throw new ConflictException({
        message: 'Tidak dapat dihapus karena masih memiliki data terkait',
        relatedData,
      });
    }
    await this.db.delete(classes).where(eq(classes.id, id));
  }
}
