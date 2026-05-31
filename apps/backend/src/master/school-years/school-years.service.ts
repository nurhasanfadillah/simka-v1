import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import { bills, paymentTemplates, schoolYears, studentClasses } from '../../db/schema';
function isUniqueViolation(err: any): boolean {
  return (err?.code ?? err?.cause?.code) === '23505';
}

import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';

@Injectable()
export class SchoolYearsService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  findAll() {
    return this.db
      .select()
      .from(schoolYears)
      .orderBy(desc(schoolYears.startYear));
  }

  async findOne(id: number) {
    const [year] = await this.db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.id, id))
      .limit(1);
    if (!year) throw new NotFoundException('Tahun ajaran tidak ditemukan');
    return year;
  }

  async create(dto: CreateSchoolYearDto) {
    if (dto.endYear <= dto.startYear) {
      throw new BadRequestException('Tahun akhir harus lebih besar dari tahun awal');
    }
    try {
      const [created] = await this.db
        .insert(schoolYears)
        .values({
          name: dto.name,
          startYear: dto.startYear,
          endYear: dto.endYear,
          isActive: false,
        })
        .returning();
      return created;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Nama tahun ajaran sudah ada');
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdateSchoolYearDto) {
    await this.findOne(id);
    if (dto.startYear && dto.endYear && dto.endYear <= dto.startYear) {
      throw new BadRequestException('Tahun akhir harus lebih besar dari tahun awal');
    }
    try {
      const [updated] = await this.db
        .update(schoolYears)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(schoolYears.id, id))
        .returning();
      return updated;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Nama tahun ajaran sudah ada');
      }
      throw err;
    }
  }

  async activate(id: number) {
    await this.findOne(id);
    return this.db.transaction(async (tx) => {
      await tx
        .update(schoolYears)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(schoolYears.isActive, true));
      const [activated] = await tx
        .update(schoolYears)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(schoolYears.id, id))
        .returning();
      return activated;
    });
  }

  async remove(id: number) {
    const year = await this.findOne(id);
    if (year.isActive) {
      throw new BadRequestException('Tahun pelajaran aktif tidak dapat dihapus');
    }
    const [billsCount, templatesCount, classesCount] = await Promise.all([
      this.db.select({ value: count() }).from(bills).where(eq(bills.schoolYearId, id)),
      this.db.select({ value: count() }).from(paymentTemplates).where(eq(paymentTemplates.schoolYearId, id)),
      this.db.select({ value: count() }).from(studentClasses).where(eq(studentClasses.schoolYearId, id)),
    ]);
    const relatedData: Record<string, number> = {};
    if (billsCount[0].value > 0) relatedData['tagihan'] = billsCount[0].value;
    if (templatesCount[0].value > 0) relatedData['template'] = templatesCount[0].value;
    if (classesCount[0].value > 0) relatedData['kelas'] = classesCount[0].value;
    if (Object.keys(relatedData).length > 0) {
      throw new ConflictException({
        message: 'Tidak dapat dihapus karena masih memiliki data terkait',
        relatedData,
      });
    }
    await this.db.delete(schoolYears).where(eq(schoolYears.id, id));
  }
}
