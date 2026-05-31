import { Inject, Injectable } from '@nestjs/common';
import { and, count, countDistinct, eq, gte, inArray, lte, sql, sum } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db';
import { classes, schoolUnits, studentClasses, students } from '../db/schema/academic.schema';
import {
  bills,
  paymentPosts,
  paymentTemplates,
  transactionItems,
  transactions,
} from '../db/schema/financial.schema';

@Injectable()
export class ReportsService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [siswaResult] = await this.db
      .select({ total: count() })
      .from(students)
      .where(eq(students.studentStatus, 'aktif'));

    const [penerimaanResult] = await this.db
      .select({ total: sum(transactions.totalAmount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, 'aktif'),
          gte(transactions.createdAt, startOfMonth),
          lte(transactions.createdAt, endOfMonth),
        ),
      );

    const [pembayarResult] = await this.db
      .select({ total: countDistinct(transactions.studentId) })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, 'aktif'),
          gte(transactions.createdAt, startOfMonth),
          lte(transactions.createdAt, endOfMonth),
        ),
      );

    return {
      totalSiswaAktif: siswaResult.total,
      penerimaanBulanIni: Number(penerimaanResult.total ?? 0),
      pembayarBulanIni: pembayarResult.total,
    };
  }

  async getLaporanHarian(date: string) {
    const start = new Date(date + 'T00:00:00');
    const end = new Date(date + 'T23:59:59');

    const rows = await this.db
      .select({
        id: transactions.id,
        transactionNumber: transactions.transactionNumber,
        studentName: students.name,
        nis: students.nis,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(students, eq(transactions.studentId, students.id))
      .where(and(gte(transactions.createdAt, start), lte(transactions.createdAt, end)))
      .orderBy(transactions.createdAt);

    const aktifRows = rows.filter((r) => r.status === 'aktif');
    const totalPenerimaan = aktifRows.reduce((s, r) => s + r.totalAmount, 0);

    return {
      date,
      totalPenerimaan,
      jumlahTransaksi: aktifRows.length,
      transactions: rows,
    };
  }

  async getLaporanBulanan(
    month: number,
    year: number,
    classId?: number,
    unitId?: number,
  ) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const conditions = [
      eq(transactions.status, 'aktif'),
      gte(transactions.createdAt, start),
      lte(transactions.createdAt, end),
    ];

    if (classId) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM student_classes sc WHERE sc.student_id = ${transactions.studentId} AND sc.class_id = ${classId})` as any,
      );
    }
    if (unitId) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM student_classes sc2 INNER JOIN classes cl ON cl.id = sc2.class_id WHERE sc2.student_id = ${transactions.studentId} AND cl.school_unit_id = ${unitId})` as any,
      );
    }

    const rows = await this.db
      .select({
        date: sql<string>`DATE(${transactions.createdAt})`.as('date'),
        totalPenerimaan: sum(transactions.totalAmount),
        jumlahTransaksi: count(),
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`DATE(${transactions.createdAt})`)
      .orderBy(sql`DATE(${transactions.createdAt})`);

    const totalPenerimaan = rows.reduce((s, r) => s + Number(r.totalPenerimaan ?? 0), 0);
    const jumlahTransaksi = rows.reduce((s, r) => s + r.jumlahTransaksi, 0);

    return {
      month,
      year,
      totalPenerimaan,
      jumlahTransaksi,
      perHari: rows.map((r) => ({
        date: r.date,
        totalPenerimaan: Number(r.totalPenerimaan ?? 0),
        jumlahTransaksi: r.jumlahTransaksi,
      })),
    };
  }

  async getLaporanTahunan(schoolYearId: number) {
    const rows = await this.db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${transactions.createdAt})::int`.as('month'),
        year: sql<number>`EXTRACT(YEAR FROM ${transactions.createdAt})::int`.as('year'),
        totalPenerimaan: sum(transactions.totalAmount),
        jumlahTransaksi: count(),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, 'aktif'),
          sql`EXISTS (SELECT 1 FROM student_classes sc WHERE sc.student_id = ${transactions.studentId} AND sc.school_year_id = ${schoolYearId})` as any,
        ),
      )
      .groupBy(
        sql`EXTRACT(YEAR FROM ${transactions.createdAt})`,
        sql`EXTRACT(MONTH FROM ${transactions.createdAt})`,
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${transactions.createdAt})`,
        sql`EXTRACT(MONTH FROM ${transactions.createdAt})`,
      );

    const totalPenerimaan = rows.reduce((s, r) => s + Number(r.totalPenerimaan ?? 0), 0);
    const jumlahTransaksi = rows.reduce((s, r) => s + r.jumlahTransaksi, 0);

    return {
      schoolYearId,
      totalPenerimaan,
      jumlahTransaksi,
      perBulan: rows.map((r) => ({
        month: r.month,
        year: r.year,
        totalPenerimaan: Number(r.totalPenerimaan ?? 0),
        jumlahTransaksi: r.jumlahTransaksi,
      })),
    };
  }

  async getLaporanTunggakan(filters: {
    schoolYearId?: number;
    classId?: number;
    unitId?: number;
  } = {}) {
    const conditions: any[] = [
      inArray(bills.status, ['belum_bayar', 'cicilan']),
    ];

    if (filters.schoolYearId) {
      conditions.push(eq(bills.schoolYearId, filters.schoolYearId));
    }
    if (filters.classId) {
      conditions.push(eq(studentClasses.classId, filters.classId));
    }
    if (filters.unitId) {
      conditions.push(eq(classes.schoolUnitId, filters.unitId));
    }

    const rows = await this.db
      .select({
        studentId: students.id,
        studentName: students.name,
        nis: students.nis,
        className: classes.name,
        billId: bills.id,
        billAmount: bills.totalAmount,
        billStatus: bills.status,
      })
      .from(bills)
      .innerJoin(students, eq(bills.studentId, students.id))
      .innerJoin(paymentTemplates, eq(bills.paymentTemplateId, paymentTemplates.id))
      .innerJoin(studentClasses, and(
        eq(studentClasses.studentId, bills.studentId),
        eq(studentClasses.schoolYearId, bills.schoolYearId),
      ))
      .innerJoin(classes, eq(studentClasses.classId, classes.id))
      .innerJoin(schoolUnits, eq(classes.schoolUnitId, schoolUnits.id))
      .where(and(...conditions))
      .orderBy(students.name);

    const byStudent = new Map<number, {
      studentId: number;
      studentName: string;
      nis: string;
      className: string;
      totalTunggakan: number;
      jumlahTagihan: number;
    }>();

    for (const row of rows) {
      const existing = byStudent.get(row.studentId);
      if (existing) {
        existing.totalTunggakan += row.billAmount;
        existing.jumlahTagihan += 1;
      } else {
        byStudent.set(row.studentId, {
          studentId: row.studentId,
          studentName: row.studentName,
          nis: row.nis,
          className: row.className,
          totalTunggakan: row.billAmount,
          jumlahTagihan: 1,
        });
      }
    }

    return {
      total: byStudent.size,
      siswa: Array.from(byStudent.values()),
    };
  }

  async getRekapPos(filters: {
    dateFrom?: string;
    dateTo?: string;
    schoolYearId?: number;
  } = {}) {
    const conditions: any[] = [eq(transactions.status, 'aktif')];

    if (filters.dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(filters.dateFrom + 'T00:00:00')));
    }
    if (filters.dateTo) {
      conditions.push(lte(transactions.createdAt, new Date(filters.dateTo + 'T23:59:59')));
    }
    if (filters.schoolYearId) {
      conditions.push(eq(bills.schoolYearId, filters.schoolYearId));
    }

    const rows = await this.db
      .select({
        posId: paymentPosts.id,
        posCode: paymentPosts.code,
        posName: paymentPosts.name,
        totalPenerimaan: sum(transactionItems.amount),
        jumlahTransaksi: countDistinct(transactions.id),
        jumlahSiswa: countDistinct(transactions.studentId),
      })
      .from(transactions)
      .innerJoin(transactionItems, eq(transactionItems.transactionId, transactions.id))
      .innerJoin(bills, eq(bills.id, transactionItems.billId))
      .innerJoin(paymentTemplates, eq(paymentTemplates.id, bills.paymentTemplateId))
      .innerJoin(paymentPosts, eq(paymentPosts.id, paymentTemplates.paymentPostId))
      .where(and(...conditions))
      .groupBy(paymentPosts.id, paymentPosts.code, paymentPosts.name)
      .orderBy(paymentPosts.code);

    return {
      total: rows.length,
      perPos: rows.map((r) => ({
        posId: r.posId,
        posCode: r.posCode,
        posName: r.posName,
        totalPenerimaan: Number(r.totalPenerimaan ?? 0),
        jumlahTransaksi: r.jumlahTransaksi,
        jumlahSiswa: r.jumlahSiswa,
      })),
    };
  }
}
