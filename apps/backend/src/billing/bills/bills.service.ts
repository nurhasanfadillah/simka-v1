import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, inArray, SQL, sum } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import { bills, billMonths, paymentTemplates, paymentPosts, transactions, transactionItems } from '../../db/schema/financial.schema';
import { classes, schoolYears, students, studentClasses, schoolUnits } from '../../db/schema/academic.schema';

interface BillFilters {
  studentId?: number;
  classId?: number;
  schoolYearId?: number;
  paymentTemplateId?: number;
  paymentPostId?: number;
  status?: 'belum_bayar' | 'cicilan' | 'lunas';
}

@Injectable()
export class BillsService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  private buildBaseQuery() {
    return this.db
      .select({
        id: bills.id,
        studentId: bills.studentId,
        studentName: students.name,
        nis: students.nis,
        classId: classes.id,
        className: classes.name,
        schoolYearId: bills.schoolYearId,
        schoolYearName: schoolYears.name,
        schoolYearStart: schoolYears.startYear,
        paymentTemplateId: bills.paymentTemplateId,
        paymentPostName: paymentTemplates.name,
        paymentPostType: paymentPosts.type,
        totalAmount: bills.totalAmount,
        status: bills.status,
        createdAt: bills.createdAt,
        updatedAt: bills.updatedAt,
      })
      .from(bills)
      .innerJoin(students, eq(bills.studentId, students.id))
      .innerJoin(paymentTemplates, eq(bills.paymentTemplateId, paymentTemplates.id))
      .innerJoin(paymentPosts, eq(paymentTemplates.paymentPostId, paymentPosts.id))
      .innerJoin(studentClasses, and(
        eq(studentClasses.studentId, bills.studentId),
        eq(studentClasses.schoolYearId, bills.schoolYearId),
      ))
      .innerJoin(classes, eq(studentClasses.classId, classes.id))
      .innerJoin(schoolYears, eq(bills.schoolYearId, schoolYears.id));
  }

  findAll(filters: BillFilters = {}) {
    const conditions: SQL[] = [];
    if (filters.studentId) conditions.push(eq(bills.studentId, filters.studentId));
    if (filters.classId) conditions.push(eq(classes.id, filters.classId));
    if (filters.schoolYearId) conditions.push(eq(bills.schoolYearId, filters.schoolYearId));
    if (filters.paymentTemplateId) conditions.push(eq(bills.paymentTemplateId, filters.paymentTemplateId));
    if (filters.paymentPostId) conditions.push(eq(paymentPosts.id, filters.paymentPostId));
    if (filters.status) conditions.push(eq(bills.status, filters.status));

    return this.buildBaseQuery()
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(students.name));
  }

  findTunggakan(filters: { classId?: number; schoolYearId?: number } = {}) {
    const conditions: SQL[] = [inArray(bills.status, ['belum_bayar', 'cicilan'])];
    if (filters.classId) conditions.push(eq(classes.id, filters.classId));
    if (filters.schoolYearId) conditions.push(eq(bills.schoolYearId, filters.schoolYearId));

    return this.buildBaseQuery()
      .where(and(...conditions))
      .orderBy(asc(students.name));
  }

  async findOne(id: number) {
    const [bill] = await this.buildBaseQuery()
      .where(eq(bills.id, id))
      .limit(1);

    if (!bill) throw new NotFoundException('Tagihan tidak ditemukan');

    const months = await this.db
      .select()
      .from(billMonths)
      .where(eq(billMonths.billId, id))
      .orderBy(asc(billMonths.year), asc(billMonths.month));

    return { ...bill, billMonths: months };
  }

  async getStudentTransactionData(studentId: number) {
    const [student] = await this.db
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
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const allBills = await this.buildBaseQuery()
      .where(eq(bills.studentId, studentId));

    const billIds = allBills.map(b => b.id);

    const [monthsData, paymentsData] = await Promise.all([
      billIds.length > 0
        ? this.db
            .select()
            .from(billMonths)
            .where(inArray(billMonths.billId, billIds))
            .orderBy(asc(billMonths.year), asc(billMonths.month))
        : Promise.resolve([]),
      billIds.length > 0
        ? this.db
            .select({
              billId: transactionItems.billId,
              billMonthId: transactionItems.billMonthId,
              paid: sum(transactionItems.amount).mapWith(Number),
            })
            .from(transactionItems)
            .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
            .where(
              and(
                inArray(transactionItems.billId, billIds),
                eq(transactions.status, 'aktif'),
              ),
            )
            .groupBy(transactionItems.billId, transactionItems.billMonthId)
        : Promise.resolve([]),
    ]);

    const paymentByBill: Record<number, number> = {};
    const paymentByMonth: Record<number, number> = {};
    for (const p of paymentsData) {
      if (p.billMonthId) {
        paymentByMonth[p.billMonthId] = (paymentByMonth[p.billMonthId] ?? 0) + (p.paid ?? 0);
      }
      paymentByBill[p.billId] = (paymentByBill[p.billId] ?? 0) + (p.paid ?? 0);
    }

    const monthsByBill: Record<number, { id: number; billId: number; month: number; year: number; amount: number; status: 'belum_bayar' | 'lunas'; paidAt: Date | null; createdAt: Date }[]> = {};
    for (const m of monthsData) {
      (monthsByBill[m.billId] ??= []).push(m);
    }

    const bebas: Array<Record<string, unknown>> = [];
    const bulanan: Array<Record<string, unknown>> = [];
    let totalTunggakan = 0;

    for (const bill of allBills) {
      const postType = (bill as any).paymentPostType ?? 'bebas';
      const billMonthsList = monthsByBill[bill.id] ?? [];
      const computedTotal = postType === 'bulanan'
        ? billMonthsList.reduce((s, m) => s + m.amount, 0)
        : bill.totalAmount;
      const paidAmount = paymentByBill[bill.id] ?? 0;
      const remaining = computedTotal - paidAmount;

      if (bill.status !== 'lunas') {
        totalTunggakan += remaining;
      }

      if (postType === 'bebas') {
        bebas.push({
          id: bill.id,
          paymentPostName: bill.paymentPostName,
          totalAmount: bill.totalAmount,
          paidAmount,
          remaining,
          status: bill.status,
        });
      } else {
        const months = billMonthsList.map(m => ({
          id: m.id,
          month: m.month,
          year: m.year,
          amount: m.amount,
          status: m.status,
        }));
        bulanan.push({
          id: bill.id,
          paymentPostName: bill.paymentPostName,
          schoolYearName: bill.schoolYearName,
          startYear: (bill as any).schoolYearStart,
          months,
          totalAmount: computedTotal,
          paidAmount,
          remaining,
          status: bill.status,
        });
      }
    }

    return {
      student,
      totalTunggakan,
      bebas,
      bulanan,
    };
  }

  async getTunggakanSummary(schoolYearId?: number) {
    const billQuery = this.db
      .select({
        id: bills.id,
        totalAmount: bills.totalAmount,
        schoolYearId: bills.schoolYearId,
        schoolYearName: schoolYears.name,
        paymentPostId: paymentPosts.id,
        paymentPostName: paymentPosts.name,
        paymentTemplateId: paymentTemplates.id,
        paymentTemplateName: paymentTemplates.name,
        unitId: schoolUnits.id,
        unitName: schoolUnits.name,
        classId: classes.id,
        className: classes.name,
      })
      .from(bills)
      .innerJoin(paymentTemplates, eq(bills.paymentTemplateId, paymentTemplates.id))
      .innerJoin(paymentPosts, eq(paymentTemplates.paymentPostId, paymentPosts.id))
      .innerJoin(schoolYears, eq(bills.schoolYearId, schoolYears.id))
      .innerJoin(studentClasses, and(
        eq(studentClasses.studentId, bills.studentId),
        eq(studentClasses.schoolYearId, bills.schoolYearId),
      ))
      .innerJoin(classes, eq(studentClasses.classId, classes.id))
      .innerJoin(schoolUnits, eq(classes.schoolUnitId, schoolUnits.id));

    if (schoolYearId) {
      billQuery.where(eq(bills.schoolYearId, schoolYearId));
    }

    const allBills = await billQuery;
    const billIds = allBills.map(b => b.id);

    const paymentsData = billIds.length > 0
      ? await this.db
          .select({ billId: transactionItems.billId, paid: sum(transactionItems.amount).mapWith(Number) })
          .from(transactionItems)
          .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
          .where(and(inArray(transactionItems.billId, billIds), eq(transactions.status, 'aktif')))
          .groupBy(transactionItems.billId)
      : [];

    const paidMap: Record<number, number> = {};
    for (const p of paymentsData) paidMap[p.billId] = (paidMap[p.billId] ?? 0) + (p.paid ?? 0);

    const agg = (nameField: string, idField: string) => {
      const groups: Record<string, { label: string; total: number; paid: number }> = {};
      for (const b of allBills) {
        const gid = String((b as any)[idField] ?? '_');
        if (!groups[gid]) groups[gid] = { label: (b as any)[nameField] ?? '-', total: 0, paid: 0 };
        groups[gid].total += b.totalAmount;
        groups[gid].paid += (paidMap[b.id] ?? 0);
      }
      return Object.values(groups).map(g => ({ label: g.label, total: g.total, paid: g.paid, remaining: g.total - g.paid }));
    };

    const allTotal = allBills.reduce((s, b) => s + b.totalAmount, 0);
    const allPaid = allBills.reduce((s, b) => s + (paidMap[b.id] ?? 0), 0);

    return {
      totalTagihan: allTotal,
      totalPembayaran: allPaid,
      totalTunggakan: allTotal - allPaid,
      byYear: agg('schoolYearName', 'schoolYearId'),
      byPos: agg('paymentPostName', 'paymentPostId'),
      byPembayaran: agg('paymentTemplateName', 'paymentTemplateId'),
      byUnit: agg('unitName', 'unitId'),
      byClass: agg('className', 'classId'),
    };
  }
}
