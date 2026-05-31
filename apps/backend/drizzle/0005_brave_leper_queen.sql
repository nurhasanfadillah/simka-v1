ALTER TABLE "bills" DROP CONSTRAINT "bills_invoice_number_unique";--> statement-breakpoint
ALTER TABLE "payment_templates" DROP CONSTRAINT "uq_payment_template";--> statement-breakpoint
ALTER TABLE "payment_templates" DROP CONSTRAINT "payment_templates_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "bills" DROP COLUMN "invoice_number";--> statement-breakpoint
ALTER TABLE "payment_templates" DROP COLUMN "class_id";--> statement-breakpoint
ALTER TABLE "payment_templates" ADD CONSTRAINT "uq_payment_template" UNIQUE("payment_post_id","school_year_id");