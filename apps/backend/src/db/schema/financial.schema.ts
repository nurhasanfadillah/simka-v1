import {
  pgTable,
  pgEnum,
  bigserial,
  bigint,
  integer,
  smallint,
  varchar,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { schoolYears, students } from './academic.schema';
import { users } from './auth.schema';

// Enums
export const paymentTypeEnum = pgEnum('payment_type_enum', ['bulanan', 'bebas']);

export const billStatusEnum = pgEnum('bill_status_enum', [
  'belum_bayar',
  'cicilan',
  'lunas',
]);

export const billMonthStatusEnum = pgEnum('bill_month_status_enum', [
  'belum_bayar',
  'lunas',
]);

export const transactionStatusEnum = pgEnum('transaction_status_enum', [
  'aktif',
  'void',
]);

// Tables
export const paymentPosts = pgTable('payment_posts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  type: paymentTypeEnum('type').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paymentTemplates = pgTable(
  'payment_templates',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 255 }),
    paymentPostId: bigint('payment_post_id', { mode: 'number' })
      .notNull()
      .references(() => paymentPosts.id),
    schoolYearId: bigint('school_year_id', { mode: 'number' })
      .notNull()
      .references(() => schoolYears.id),
    amount: integer('amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    unique('uq_payment_template').on(
      table.paymentPostId,
      table.schoolYearId,
    ),
  ],
);

export const bills = pgTable(
  'bills',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    studentId: bigint('student_id', { mode: 'number' })
      .notNull()
      .references(() => students.id),
    paymentTemplateId: bigint('payment_template_id', { mode: 'number' })
      .notNull()
      .references(() => paymentTemplates.id),
    schoolYearId: bigint('school_year_id', { mode: 'number' })
      .notNull()
      .references(() => schoolYears.id),
    totalAmount: integer('total_amount').notNull(),
    status: billStatusEnum('status').default('belum_bayar').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    unique('uq_bill').on(table.studentId, table.paymentTemplateId),
  ],
);

export const billMonths = pgTable(
  'bill_months',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    billId: bigint('bill_id', { mode: 'number' })
      .notNull()
      .references(() => bills.id, { onDelete: 'cascade' }),
    month: smallint('month').notNull(),
    year: smallint('year').notNull(),
    amount: integer('amount').notNull(),
    status: billMonthStatusEnum('status').default('belum_bayar').notNull(),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    unique('uq_bill_month').on(table.billId, table.month, table.year),
  ],
);

export const transactions = pgTable('transactions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  transactionNumber: varchar('transaction_number', { length: 30 }).notNull().unique(),
  studentId: bigint('student_id', { mode: 'number' })
    .notNull()
    .references(() => students.id),
  totalAmount: integer('total_amount').notNull(),
  status: transactionStatusEnum('status').default('aktif').notNull(),
  notes: text('notes'),
  createdBy: bigint('created_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'set null' }),
  voidedAt: timestamp('voided_at'),
  voidedBy: bigint('voided_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'set null' }),
  voidReason: text('void_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactionItems = pgTable('transaction_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  transactionId: bigint('transaction_id', { mode: 'number' })
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  billId: bigint('bill_id', { mode: 'number' })
    .notNull()
    .references(() => bills.id),
  billMonthId: bigint('bill_month_id', { mode: 'number' })
    .references(() => billMonths.id),
  amount: integer('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const paymentPostsRelations = relations(paymentPosts, ({ many }) => ({
  paymentTemplates: many(paymentTemplates),
}));

export const paymentTemplatesRelations = relations(paymentTemplates, ({ one, many }) => ({
  paymentPost: one(paymentPosts, { fields: [paymentTemplates.paymentPostId], references: [paymentPosts.id] }),
  schoolYear: one(schoolYears, { fields: [paymentTemplates.schoolYearId], references: [schoolYears.id] }),
  bills: many(bills),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  student: one(students, { fields: [bills.studentId], references: [students.id] }),
  paymentTemplate: one(paymentTemplates, { fields: [bills.paymentTemplateId], references: [paymentTemplates.id] }),
  schoolYear: one(schoolYears, { fields: [bills.schoolYearId], references: [schoolYears.id] }),
  billMonths: many(billMonths),
}));

export const billMonthsRelations = relations(billMonths, ({ one }) => ({
  bill: one(bills, { fields: [billMonths.billId], references: [bills.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  student: one(students, { fields: [transactions.studentId], references: [students.id] }),
  createdByUser: one(users, { fields: [transactions.createdBy], references: [users.id], relationName: 'transactionCreatedBy' }),
  voidedByUser: one(users, { fields: [transactions.voidedBy], references: [users.id], relationName: 'transactionVoidedBy' }),
  items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, { fields: [transactionItems.transactionId], references: [transactions.id] }),
  bill: one(bills, { fields: [transactionItems.billId], references: [bills.id] }),
  billMonth: one(billMonths, { fields: [transactionItems.billMonthId], references: [billMonths.id] }),
}));
