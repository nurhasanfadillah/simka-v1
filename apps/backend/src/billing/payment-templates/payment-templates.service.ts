import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, eq, SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import { bills, paymentTemplates, paymentPosts } from '../../db/schema/financial.schema';
import { schoolYears } from '../../db/schema/academic.schema';
import { CreatePaymentTemplateDto } from './dto/create-payment-template.dto';
import { UpdatePaymentTemplateDto } from './dto/update-payment-template.dto';

function isUniqueViolation(err: any): boolean {
  return (err?.code ?? err?.cause?.code) === '23505';
}

@Injectable()
export class PaymentTemplatesService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  findAll(schoolYearId?: number) {
    const conditions: SQL[] = [];
    if (schoolYearId) conditions.push(eq(paymentTemplates.schoolYearId, schoolYearId));

    return this.db
      .select({
        id: paymentTemplates.id,
        name: paymentTemplates.name,
        paymentPostId: paymentTemplates.paymentPostId,
        schoolYearId: paymentTemplates.schoolYearId,
        amount: paymentTemplates.amount,
        paymentPostName: paymentPosts.name,
        schoolYearName: schoolYears.name,
        createdAt: paymentTemplates.createdAt,
        updatedAt: paymentTemplates.updatedAt,
      })
      .from(paymentTemplates)
      .leftJoin(paymentPosts, eq(paymentTemplates.paymentPostId, paymentPosts.id))
      .leftJoin(schoolYears, eq(paymentTemplates.schoolYearId, schoolYears.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(schoolYears.name), asc(paymentPosts.name));
  }

  async findOne(id: number) {
    const [template] = await this.db
      .select({
        id: paymentTemplates.id,
        name: paymentTemplates.name,
        paymentPostId: paymentTemplates.paymentPostId,
        schoolYearId: paymentTemplates.schoolYearId,
        amount: paymentTemplates.amount,
        paymentPostName: paymentPosts.name,
        schoolYearName: schoolYears.name,
        createdAt: paymentTemplates.createdAt,
        updatedAt: paymentTemplates.updatedAt,
      })
      .from(paymentTemplates)
      .leftJoin(paymentPosts, eq(paymentTemplates.paymentPostId, paymentPosts.id))
      .leftJoin(schoolYears, eq(paymentTemplates.schoolYearId, schoolYears.id))
      .where(eq(paymentTemplates.id, id))
      .limit(1);

    if (!template) throw new NotFoundException('Template tagihan tidak ditemukan');
    return template;
  }

  async create(dto: CreatePaymentTemplateDto) {
    try {
      const [created] = await this.db
        .insert(paymentTemplates)
        .values({
          name: dto.name,
          paymentPostId: dto.paymentPostId,
          schoolYearId: dto.schoolYearId,
          amount: dto.amount,
        })
        .returning();
      return created;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(
          'Template tagihan sudah ada untuk kombinasi pos dan tahun ajaran ini',
        );
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdatePaymentTemplateDto) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(paymentTemplates)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(paymentTemplates.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    const [billsCount] = await this.db
      .select({ value: count() })
      .from(bills)
      .where(eq(bills.paymentTemplateId, id));
    if (billsCount.value > 0) {
      throw new ConflictException({
        message: 'Tidak dapat dihapus karena masih memiliki data terkait',
        relatedData: { tagihan: billsCount.value },
      });
    }
    await this.db.delete(paymentTemplates).where(eq(paymentTemplates.id, id));
  }
}
