import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { asc, count, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import { classes, schoolUnits } from '../../db/schema';
function isUniqueViolation(err: any): boolean {
  return (err?.code ?? err?.cause?.code) === '23505';
}

import { CreateSchoolUnitDto } from './dto/create-school-unit.dto';
import { UpdateSchoolUnitDto } from './dto/update-school-unit.dto';

@Injectable()
export class SchoolUnitsService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  findAll() {
    return this.db
      .select({
        id: schoolUnits.id,
        name: schoolUnits.name,
        code: schoolUnits.code,
        createdAt: schoolUnits.createdAt,
        updatedAt: schoolUnits.updatedAt,
        classCount: count(classes.id),
      })
      .from(schoolUnits)
      .leftJoin(classes, eq(classes.schoolUnitId, schoolUnits.id))
      .groupBy(schoolUnits.id, schoolUnits.name, schoolUnits.code, schoolUnits.createdAt, schoolUnits.updatedAt)
      .orderBy(asc(schoolUnits.name));
  }

  async findOne(id: number) {
    const [unit] = await this.db
      .select()
      .from(schoolUnits)
      .where(eq(schoolUnits.id, id))
      .limit(1);
    if (!unit) throw new NotFoundException('Unit sekolah tidak ditemukan');
    return unit;
  }

  async create(dto: CreateSchoolUnitDto) {
    try {
      const [created] = await this.db
        .insert(schoolUnits)
        .values({ name: dto.name, code: dto.code })
        .returning();
      return created;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Kode unit sekolah sudah dipakai');
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdateSchoolUnitDto) {
    await this.findOne(id);
    try {
      const [updated] = await this.db
        .update(schoolUnits)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(schoolUnits.id, id))
        .returning();
      return updated;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Kode unit sekolah sudah dipakai');
      }
      throw err;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    const [classesCount] = await this.db
      .select({ value: count() })
      .from(classes)
      .where(eq(classes.schoolUnitId, id));
    if (classesCount.value > 0) {
      throw new BadRequestException('Unit sekolah tidak dapat dihapus karena masih memiliki kelas terkait');
    }
    await this.db.delete(schoolUnits).where(eq(schoolUnits.id, id));
  }
}
