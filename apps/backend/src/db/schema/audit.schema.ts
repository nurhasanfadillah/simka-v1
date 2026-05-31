import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth.schema';

export const auditLogs = pgTable('audit_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, {
    onDelete: 'set null',
  }),
  action: varchar('action', { length: 20 }).notNull(), // CREATE | UPDATE | DELETE | VOID
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: bigint('record_id', { mode: 'number' }).notNull(),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
