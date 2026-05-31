CREATE TYPE "public"."gender_enum" AS ENUM('L', 'P');--> statement-breakpoint
CREATE TYPE "public"."registration_status_enum" AS ENUM('baru', 'pindahan', 'mengulang');--> statement-breakpoint
CREATE TYPE "public"."student_status_enum" AS ENUM('aktif', 'lulus', 'keluar', 'pindah');--> statement-breakpoint
CREATE TYPE "public"."payment_type_enum" AS ENUM('bulanan', 'bebas');--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" bigint NOT NULL,
	"permission_id" bigint NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role_id" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"school_unit_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"level" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_units" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_units_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "school_years" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	"start_year" smallint NOT NULL,
	"end_year" smallint NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_years_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "student_classes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"student_id" bigint NOT NULL,
	"class_id" bigint NOT NULL,
	"school_year_id" bigint NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_student_school_year" UNIQUE("student_id","school_year_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"nis" varchar(20) NOT NULL,
	"nisn" varchar(20),
	"name" varchar(255) NOT NULL,
	"gender" "gender_enum" NOT NULL,
	"birth_place" varchar(100) NOT NULL,
	"birth_date" date NOT NULL,
	"parent_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"registration_status" "registration_status_enum" DEFAULT 'baru' NOT NULL,
	"student_status" "student_status_enum" DEFAULT 'aktif' NOT NULL,
	"entry_year" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_nis_unique" UNIQUE("nis"),
	CONSTRAINT "students_nisn_unique" UNIQUE("nisn")
);
--> statement-breakpoint
CREATE TABLE "payment_posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "payment_type_enum" NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_posts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"action" varchar(20) NOT NULL,
	"table_name" varchar(100) NOT NULL,
	"record_id" bigint NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_unit_id_school_units_id_fk" FOREIGN KEY ("school_unit_id") REFERENCES "public"."school_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_classes" ADD CONSTRAINT "student_classes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_classes" ADD CONSTRAINT "student_classes_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_classes" ADD CONSTRAINT "student_classes_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;