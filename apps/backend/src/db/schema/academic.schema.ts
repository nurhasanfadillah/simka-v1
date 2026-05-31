import {
  pgTable,
  pgEnum,
  bigserial,
  bigint,
  varchar,
  boolean,
  smallint,
  date,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const genderEnum = pgEnum('gender_enum', ['L', 'P']);
export const registrationStatusEnum = pgEnum('registration_status_enum', [
  'baru',
  'pindahan',
  'mengulang',
]);
export const studentStatusEnum = pgEnum('student_status_enum', [
  'aktif',
  'lulus',
  'keluar',
  'pindah',
]);

export const schoolUnits = pgTable('school_units', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const schoolYears = pgTable('school_years', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 20 }).notNull().unique(),
  startYear: smallint('start_year').notNull(),
  endYear: smallint('end_year').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const classes = pgTable('classes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  schoolUnitId: bigint('school_unit_id', { mode: 'number' })
    .notNull()
    .references(() => schoolUnits.id),
  name: varchar('name', { length: 100 }).notNull(),
  level: smallint('level').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const students = pgTable('students', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  nis: varchar('nis', { length: 20 }).notNull().unique(),
  nisn: varchar('nisn', { length: 20 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  gender: genderEnum('gender').notNull(),
  birthPlace: varchar('birth_place', { length: 100 }).notNull(),
  birthDate: date('birth_date').notNull(),
  parentName: varchar('parent_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  registrationStatus: registrationStatusEnum('registration_status').notNull().default('baru'),
  studentStatus: studentStatusEnum('student_status').notNull().default('aktif'),
  entryYear: smallint('entry_year').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const studentClasses = pgTable(
  'student_classes',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    studentId: bigint('student_id', { mode: 'number' })
      .notNull()
      .references(() => students.id),
    classId: bigint('class_id', { mode: 'number' })
      .notNull()
      .references(() => classes.id),
    schoolYearId: bigint('school_year_id', { mode: 'number' })
      .notNull()
      .references(() => schoolYears.id),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // Satu siswa hanya boleh di satu kelas per tahun ajaran
    unique('uq_student_school_year').on(table.studentId, table.schoolYearId),
  ],
);

// Relations
export const schoolUnitsRelations = relations(schoolUnits, ({ many }) => ({
  classes: many(classes),
}));

export const schoolYearsRelations = relations(schoolYears, ({ many }) => ({
  studentClasses: many(studentClasses),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  schoolUnit: one(schoolUnits, { fields: [classes.schoolUnitId], references: [schoolUnits.id] }),
  studentClasses: many(studentClasses),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  studentClasses: many(studentClasses),
}));

export const studentClassesRelations = relations(studentClasses, ({ one }) => ({
  student: one(students, { fields: [studentClasses.studentId], references: [students.id] }),
  class: one(classes, { fields: [studentClasses.classId], references: [classes.id] }),
  schoolYear: one(schoolYears, { fields: [studentClasses.schoolYearId], references: [schoolYears.id] }),
}));
