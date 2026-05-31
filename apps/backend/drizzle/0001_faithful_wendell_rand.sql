CREATE TYPE "public"."bill_month_status_enum" AS ENUM('belum_bayar', 'lunas');--> statement-breakpoint
CREATE TYPE "public"."bill_status_enum" AS ENUM('belum_bayar', 'cicilan', 'lunas');--> statement-breakpoint
CREATE TABLE "bill_months" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bill_id" bigint NOT NULL,
	"month" smallint NOT NULL,
	"year" smallint NOT NULL,
	"amount" integer NOT NULL,
	"status" "bill_month_status_enum" DEFAULT 'belum_bayar' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_bill_month" UNIQUE("bill_id","month","year")
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoice_number" varchar(30) NOT NULL,
	"student_id" bigint NOT NULL,
	"payment_template_id" bigint NOT NULL,
	"school_year_id" bigint NOT NULL,
	"total_amount" integer NOT NULL,
	"status" "bill_status_enum" DEFAULT 'belum_bayar' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bills_invoice_number_unique" UNIQUE("invoice_number"),
	CONSTRAINT "uq_bill" UNIQUE("student_id","payment_template_id")
);
--> statement-breakpoint
CREATE TABLE "payment_templates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"class_id" bigint NOT NULL,
	"payment_post_id" bigint NOT NULL,
	"school_year_id" bigint NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_payment_template" UNIQUE("class_id","payment_post_id","school_year_id")
);
--> statement-breakpoint
ALTER TABLE "bill_months" ADD CONSTRAINT "bill_months_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_payment_template_id_payment_templates_id_fk" FOREIGN KEY ("payment_template_id") REFERENCES "public"."payment_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_templates" ADD CONSTRAINT "payment_templates_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_templates" ADD CONSTRAINT "payment_templates_payment_post_id_payment_posts_id_fk" FOREIGN KEY ("payment_post_id") REFERENCES "public"."payment_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_templates" ADD CONSTRAINT "payment_templates_school_year_id_school_years_id_fk" FOREIGN KEY ("school_year_id") REFERENCES "public"."school_years"("id") ON DELETE no action ON UPDATE no action;