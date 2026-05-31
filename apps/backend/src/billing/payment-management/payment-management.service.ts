import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, eq, ilike, or, SQL, sql, sum } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import {
  bills,
  billMonths,
  paymentPosts,
  paymentTemplates,
  transactionItems,
  transactions,
} from '../../db/schema/financial.schema';
import {
  classes,
  schoolYears,
  studentClasses,
  students,
} from '../../db/schema/academic.schema';
import { CreateBillsDto, EditBillAmountDto } from './dto/payment-management.dto';

type PaymentType = 'bulanan' | 'bebas';

@Injectable()
export class PaymentManagementService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async getTemplate(paymentPostId: number, schoolYearId: number) {
    const [template] = await this.db
      .select({
        id: paymentTemplates.id,
        paymentPostId: paymentTemplates.paymentPostId,
        schoolYearId: paymentTemplates.schoolYearId,
        amount: paymentTemplates.amount,
        paymentPostName: paymentPosts.name,
        paymentPostType: paymentPosts.type,
        schoolYearName: schoolYears.name,
      })
      .from(paymentTemplates)
      .innerJoin(paymentPosts, eq(paymentTemplates.paymentPostId, paymentPosts.id))
      .innerJoin(schoolYears, eq(paymentTemplates.schoolYearId, schoolYears.id))
      .where(
        and(
          eq(paymentTemplates.paymentPostId, paymentPostId),
          eq(paymentTemplates.schoolYearId, schoolYearId),
        ),
      )
      .limit(1);

    return template ?? null;
  }

  async getWithBills(
    paymentPostId: number,
    schoolYearId: number,
    filters: { classId?: number; unitId?: number; search?: string },
  ) {
    const template = await this.getTemplate(paymentPostId, schoolYearId);
    if (!template) return [];

    const conditions: (SQL | undefined)[] = [];
    conditions.push(eq(students.studentStatus, 'aktif'));
    if (filters.classId) conditions.push(eq(classes.id, filters.classId));
    if (filters.unitId) conditions.push(eq(classes.schoolUnitId, filters.unitId));
    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(or(ilike(students.name, term), ilike(students.nis, term))!);
    }

    return this.db
      .select({
        studentId: students.id,
        studentName: students.name,
        nis: students.nis,
        className: classes.name,
        classId: classes.id,
        billId: bills.id,
        amount: bills.totalAmount,
        paidAmount: sum(transactionItems.amount).mapWith(Number),
        status: bills.status,
      })
      .from(students)
      .innerJoin(
        studentClasses,
        and(
          eq(studentClasses.studentId, students.id),
          eq(studentClasses.schoolYearId, schoolYearId),
        ),
      )
      .innerJoin(classes, eq(studentClasses.classId, classes.id))
      .innerJoin(
        bills,
        and(
          eq(bills.studentId, students.id),
          eq(bills.paymentTemplateId, template.id),
        ),
      )
      .leftJoin(transactionItems, eq(transactionItems.billId, bills.id))
      .leftJoin(
        transactions,
        and(
          eq(transactions.id, transactionItems.transactionId),
          eq(transactions.status, 'aktif'),
        ),
      )
      .where(and(...conditions))
      .groupBy(
        students.id,
        students.name,
        students.nis,
        classes.name,
        classes.id,
        bills.id,
        bills.totalAmount,
        bills.status,
      )
      .orderBy(asc(students.name));
  }

  async getWithoutBills(
    paymentPostId: number,
    schoolYearId: number,
    filters: { classId?: number; unitId?: number; search?: string },
  ) {
    const template = await this.getTemplate(paymentPostId, schoolYearId);
    if (!template) return [];

    const studentsWithBills = this.db
      .select({ studentId: bills.studentId })
      .from(bills)
      .where(eq(bills.paymentTemplateId, template.id));

    const conditions: (SQL | undefined)[] = [];
    conditions.push(eq(students.studentStatus, 'aktif'));
    conditions.push(sql`${students.id} NOT IN (${studentsWithBills})`);
    if (filters.classId) conditions.push(eq(classes.id, filters.classId));
    if (filters.unitId) conditions.push(eq(classes.schoolUnitId, filters.unitId));
    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(or(ilike(students.name, term), ilike(students.nis, term))!);
    }

    return this.db
      .select({
        studentId: students.id,
        studentName: students.name,
        nis: students.nis,
        className: classes.name,
        classId: classes.id,
      })
      .from(students)
      .innerJoin(
        studentClasses,
        and(
          eq(studentClasses.studentId, students.id),
          eq(studentClasses.schoolYearId, schoolYearId),
        ),
      )
      .innerJoin(classes, eq(studentClasses.classId, classes.id))
      .where(and(...conditions))
      .orderBy(asc(students.name));
  }

  async createBills(dto: CreateBillsDto) {
    let template = await this.getTemplate(dto.paymentPostId, dto.schoolYearId);
    let postType: PaymentType = 'bebas';

    if (!template) {
      const [post] = await this.db
        .select({ name: paymentPosts.name, type: paymentPosts.type })
        .from(paymentPosts)
        .where(eq(paymentPosts.id, dto.paymentPostId))
        .limit(1);

      postType = (post?.type as PaymentType) ?? 'bebas';

      const [created] = await this.db
        .insert(paymentTemplates)
        .values({
          name: `${post?.name ?? 'Pembayaran'} ${new Date().getFullYear()}`,
          paymentPostId: dto.paymentPostId,
          schoolYearId: dto.schoolYearId,
          amount: 0,
        })
        .returning();

      template = {
        id: created.id,
        paymentPostId: created.paymentPostId,
        schoolYearId: created.schoolYearId,
        amount: created.amount,
        paymentPostName: post?.name ?? '',
        paymentPostType: postType,
        schoolYearName: '',
      };
    } else {
      postType = template.paymentPostType as PaymentType;
    }

    const createdBills: Array<{ id: number; studentId: number; amount: number }> = [];

    await this.db.transaction(async (tx) => {
      for (const item of dto.bills) {
        const existing = await tx
          .select({ id: bills.id })
          .from(bills)
          .where(
            and(
              eq(bills.studentId, item.studentId),
              eq(bills.paymentTemplateId, template!.id),
            ),
          )
          .limit(1);

        if (existing.length > 0) continue;

        const [newBill] = await tx
          .insert(bills)
          .values({
            studentId: item.studentId,
            paymentTemplateId: template!.id,
            schoolYearId: dto.schoolYearId,
            totalAmount: item.amount,
            status: 'belum_bayar',
          })
          .returning();

        if (postType === 'bulanan') {
          const startYear = await this.getStartYear(tx, dto.schoolYearId);
          const billMonthValues: Array<{
            billId: number;
            month: number;
            year: number;
            amount: number;
          }> = [];
          for (let m = 7; m <= 12; m++) {
            billMonthValues.push({ billId: newBill.id, month: m, year: startYear, amount: item.amount });
          }
          for (let m = 1; m <= 6; m++) {
            billMonthValues.push({ billId: newBill.id, month: m, year: startYear + 1, amount: item.amount });
          }
          await tx.insert(billMonths).values(billMonthValues);
        }

        createdBills.push({ id: newBill.id, studentId: item.studentId, amount: item.amount });
      }
    });

    return { created: createdBills.length, bills: createdBills };
  }

  async editBillAmount(billId: number, dto: EditBillAmountDto) {
    const [bill] = await this.db
      .select({ id: bills.id, totalAmount: bills.totalAmount, status: bills.status })
      .from(bills)
      .where(eq(bills.id, billId))
      .limit(1);

    if (!bill) throw new NotFoundException('Tagihan tidak ditemukan');

    const paidResult = await this.db
      .select({ total: sum(transactionItems.amount).mapWith(Number) })
      .from(transactionItems)
      .innerJoin(
        transactions,
        and(
          eq(transactions.id, transactionItems.transactionId),
          eq(transactions.status, 'aktif'),
        ),
      )
      .where(eq(transactionItems.billId, billId));

    const totalPaid = paidResult[0]?.total ?? 0;

    if (dto.amount < totalPaid) {
      throw new BadRequestException(
        `Nominal tidak boleh lebih kecil dari yang sudah dibayarkan (Rp ${totalPaid.toLocaleString('id-ID')})`,
      );
    }

    let newStatus: typeof bill.status = 'belum_bayar';
    if (totalPaid >= dto.amount) newStatus = 'lunas';
    else if (totalPaid > 0) newStatus = 'cicilan';

    const [updated] = await this.db
      .update(bills)
      .set({ totalAmount: dto.amount, status: newStatus, updatedAt: new Date() })
      .where(eq(bills.id, billId))
      .returning();

    return updated;
  }

  async removeBill(billId: number) {
    const [bill] = await this.db
      .select({ id: bills.id })
      .from(bills)
      .where(eq(bills.id, billId))
      .limit(1);

    if (!bill) throw new NotFoundException('Tagihan tidak ditemukan');

    const txItemCount = await this.db
      .select({ value: count() })
      .from(transactionItems)
      .innerJoin(
        transactions,
        and(
          eq(transactions.id, transactionItems.transactionId),
          eq(transactions.status, 'aktif'),
        ),
      )
      .where(eq(transactionItems.billId, billId));

    if (txItemCount[0].value > 0) {
      throw new ConflictException(
        'Tagihan tidak dapat dihapus karena sudah memiliki transaksi pembayaran',
      );
    }

    await this.db.delete(billMonths).where(eq(billMonths.billId, billId));
    await this.db.delete(bills).where(eq(bills.id, billId));

    return { message: 'Tagihan berhasil dihapus' };
  }

  private async getStartYear(tx: any, schoolYearId: number): Promise<number> {
    const [sy] = await tx
      .select({ startYear: schoolYears.startYear })
      .from(schoolYears)
      .where(eq(schoolYears.id, schoolYearId))
      .limit(1);
    return sy?.startYear ?? new Date().getFullYear();
  }
}
