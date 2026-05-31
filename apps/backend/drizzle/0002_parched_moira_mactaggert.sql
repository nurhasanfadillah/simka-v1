CREATE TYPE "public"."transaction_status_enum" AS ENUM('aktif', 'void');--> statement-breakpoint
CREATE TABLE "transaction_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"transaction_id" bigint NOT NULL,
	"bill_id" bigint NOT NULL,
	"bill_month_id" bigint,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"transaction_number" varchar(30) NOT NULL,
	"student_id" bigint NOT NULL,
	"total_amount" integer NOT NULL,
	"status" "transaction_status_enum" DEFAULT 'aktif' NOT NULL,
	"notes" text,
	"created_by" bigint,
	"voided_at" timestamp,
	"voided_by" bigint,
	"void_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_transaction_number_unique" UNIQUE("transaction_number")
);
--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_bill_month_id_bill_months_id_fk" FOREIGN KEY ("bill_month_id") REFERENCES "public"."bill_months"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_voided_by_users_id_fk" FOREIGN KEY ("voided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;