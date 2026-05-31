import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, gte, like, lte, SQL, sum } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db';
import {
  transactions,
  transactionItems,
  bills,
  billMonths,
  paymentPosts,
  paymentTemplates,
} from '../db/schema/financial.schema';
import { students } from '../db/schema/academic.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

interface TransactionFilters {
  studentId?: number;
  status?: 'aktif' | 'void';
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class TransactionsService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  private async generateTrxNumber(tx: DB): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TRX-${dateStr}`;

    const existing = await tx
      .select({ trxNumber: transactions.transactionNumber })
      .from(transactions)
      .where(like(transactions.transactionNumber, `${prefix}-%`));

    const seq =
      existing.length > 0
        ? Math.max(
            ...existing.map((t) => {
              const parts = t.trxNumber.split('-');
              return parseInt(parts[parts.length - 1], 10);
            }),
          ) + 1
        : 1;

    return `${prefix}-${String(seq).padStart(5, '0')}`;
  }

  async create(dto: CreateTransactionDto, createdById: number) {
    return this.db.transaction(async (tx) => {
      const trxNumber = await this.generateTrxNumber(tx as unknown as DB);
      const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

      const [transaction] = await tx
        .insert(transactions)
        .values({
          transactionNumber: trxNumber,
          studentId: dto.studentId,
          totalAmount,
          status: 'aktif',
          notes: dto.notes ?? null,
          createdBy: createdById,
        })
        .returning();

      await tx.insert(transactionItems).values(
        dto.items.map((item) => ({
          transactionId: transaction.id,
          billId: item.billId,
          billMonthId: item.billMonthId ?? null,
          amount: item.amount,
        })),
      );

      const billMonthIds = dto.items
        .map((i) => i.billMonthId)
        .filter((id): id is number => id != null);

      if (billMonthIds.length > 0) {
        for (const bmId of billMonthIds) {
          const [monthData] = await tx
            .select({ amount: billMonths.amount })
            .from(billMonths)
            .where(eq(billMonths.id, bmId));

          if (!monthData) continue;

          const [paid] = await tx
            .select({ total: sum(transactionItems.amount).mapWith(Number) })
            .from(transactionItems)
            .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
            .where(
              and(
                eq(transactionItems.billMonthId, bmId),
                eq(transactions.status, 'aktif'),
              ),
            )
            .groupBy(transactionItems.billMonthId);

          const totalPaid = paid?.total ?? 0;
          const newStatus = totalPaid >= monthData.amount ? 'lunas' as const : 'belum_bayar' as const;

          await tx
            .update(billMonths)
            .set({ status: newStatus, paidAt: newStatus === 'lunas' ? new Date() : null })
            .where(eq(billMonths.id, bmId));
        }
      }

      const uniqueBillIds = [...new Set(dto.items.map((i) => i.billId))];
      for (const billId of uniqueBillIds) {
        const months = await tx
          .select({ status: billMonths.status })
          .from(billMonths)
          .where(eq(billMonths.billId, billId));

        let newBillStatus: 'belum_bayar' | 'cicilan' | 'lunas';
        if (months.length === 0) {
          newBillStatus = 'lunas';
        } else {
          const lunasCount = months.filter((m) => m.status === 'lunas').length;
          if (lunasCount === months.length) newBillStatus = 'lunas';
          else if (lunasCount > 0) newBillStatus = 'cicilan';
          else newBillStatus = 'belum_bayar';
        }

        await tx
          .update(bills)
          .set({ status: newBillStatus, updatedAt: new Date() })
          .where(eq(bills.id, billId));
      }

      return {
        id: transaction.id,
        transactionNumber: transaction.transactionNumber,
        totalAmount: transaction.totalAmount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      };
    });
  }

  async findAll(filters: TransactionFilters = {}) {
    const conditions: SQL[] = [];
    if (filters.studentId) conditions.push(eq(transactions.studentId, filters.studentId));
    if (filters.status) conditions.push(eq(transactions.status, filters.status));
    if (filters.dateFrom) conditions.push(gte(transactions.createdAt, new Date(filters.dateFrom)));
    if (filters.dateTo) conditions.push(lte(transactions.createdAt, new Date(filters.dateTo + 'T23:59:59')));

    return this.db
      .select({
        id: transactions.id,
        transactionNumber: transactions.transactionNumber,
        studentId: transactions.studentId,
        studentName: students.name,
        nis: students.nis,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        notes: transactions.notes,
        createdBy: transactions.createdBy,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(students, eq(transactions.studentId, students.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactions.createdAt));
  }

  async findOne(id: number) {
    const [transaction] = await this.db
      .select({
        id: transactions.id,
        transactionNumber: transactions.transactionNumber,
        studentId: transactions.studentId,
        studentName: students.name,
        nis: students.nis,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        notes: transactions.notes,
        createdBy: transactions.createdBy,
        voidedAt: transactions.voidedAt,
        voidedBy: transactions.voidedBy,
        voidReason: transactions.voidReason,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
      })
      .from(transactions)
      .innerJoin(students, eq(transactions.studentId, students.id))
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction) throw new NotFoundException('Transaksi tidak ditemukan');

    const items = await this.db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, id));

    return { ...transaction, items };
  }

  async getReceiptData(id: number) {
    const [transaction] = await this.db
      .select({
        id: transactions.id,
        transactionNumber: transactions.transactionNumber,
        studentId: transactions.studentId,
        studentName: students.name,
        nis: students.nis,
        totalAmount: transactions.totalAmount,
        status: transactions.status,
        notes: transactions.notes,
        voidReason: transactions.voidReason,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(students, eq(transactions.studentId, students.id))
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction) throw new NotFoundException('Transaksi tidak ditemukan');

    const items = await this.db
      .select({
        id: transactionItems.id,
        billId: transactionItems.billId,
        billMonthId: transactionItems.billMonthId,
        amount: transactionItems.amount,
        paymentPostName: paymentPosts.name,
        paymentPostCode: paymentPosts.code,
        month: billMonths.month,
        year: billMonths.year,
      })
      .from(transactionItems)
      .innerJoin(bills, eq(transactionItems.billId, bills.id))
      .innerJoin(paymentTemplates, eq(bills.paymentTemplateId, paymentTemplates.id))
      .innerJoin(paymentPosts, eq(paymentTemplates.paymentPostId, paymentPosts.id))
      .leftJoin(billMonths, eq(transactionItems.billMonthId, billMonths.id))
      .where(eq(transactionItems.transactionId, id));

    return { ...transaction, items };
  }

  async voidTransaction(id: number, voidedById: number, voidReason: string) {
    return this.db.transaction(async (tx) => {
      const [trx] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, id))
        .limit(1);

      if (!trx) throw new NotFoundException('Transaksi tidak ditemukan');
      if (trx.status === 'void') throw new BadRequestException('Transaksi sudah di-void');

      const items = await tx
        .select()
        .from(transactionItems)
        .where(eq(transactionItems.transactionId, id));

      await tx
        .update(transactions)
        .set({
          status: 'void',
          voidedAt: new Date(),
          voidedBy: voidedById,
          voidReason,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, id));

      const billMonthIds = items
        .map((i) => i.billMonthId)
        .filter((bmId): bmId is number => bmId != null);

      for (const bmId of billMonthIds) {
        const [monthData] = await tx
          .select({ amount: billMonths.amount })
          .from(billMonths)
          .where(eq(billMonths.id, bmId));

        if (!monthData) continue;

        const [paid] = await tx
          .select({ total: sum(transactionItems.amount).mapWith(Number) })
          .from(transactionItems)
          .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
          .where(
            and(
              eq(transactionItems.billMonthId, bmId),
              eq(transactions.status, 'aktif'),
            ),
          )
          .groupBy(transactionItems.billMonthId);

        const totalPaid = paid?.total ?? 0;
        const newStatus = totalPaid >= monthData.amount ? 'lunas' as const : 'belum_bayar' as const;

        await tx
          .update(billMonths)
          .set({ status: newStatus, paidAt: newStatus === 'lunas' ? new Date() : null })
          .where(eq(billMonths.id, bmId));
      }

      const uniqueBillIds = [...new Set(items.map((i) => i.billId))];
      for (const billId of uniqueBillIds) {
        const months = await tx
          .select({ status: billMonths.status })
          .from(billMonths)
          .where(eq(billMonths.billId, billId));

        let newBillStatus: 'belum_bayar' | 'cicilan' | 'lunas';
        if (months.length === 0) {
          newBillStatus = 'belum_bayar';
        } else {
          const lunasCount = months.filter((m) => m.status === 'lunas').length;
          if (lunasCount === months.length) newBillStatus = 'lunas';
          else if (lunasCount > 0) newBillStatus = 'cicilan';
          else newBillStatus = 'belum_bayar';
        }

        await tx
          .update(bills)
          .set({ status: newBillStatus, updatedAt: new Date() })
          .where(eq(bills.id, billId));
      }

      return {
        id: trx.id,
        transactionNumber: trx.transactionNumber,
        status: 'void' as const,
        voidedAt: new Date(),
        voidReason,
      };
    });
  }

  async remove(id: number) {
    const [tx] = await this.db
      .select({ id: transactions.id, status: transactions.status })
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    if (!tx) throw new NotFoundException('Transaksi tidak ditemukan');
    if (tx.status !== 'void') {
      throw new ConflictException({
        message: 'Transaksi aktif tidak dapat dihapus. Gunakan fitur Void terlebih dahulu.',
        relatedData: {},
      });
    }
    await this.db.transaction(async (trx) => {
      await trx.delete(transactionItems).where(eq(transactionItems.transactionId, id));
      await trx.delete(transactions).where(eq(transactions.id, id));
    });
  }
}
