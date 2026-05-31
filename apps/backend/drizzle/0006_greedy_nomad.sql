DO $$ BEGIN
  ALTER TABLE "payment_templates" ADD COLUMN "name" varchar(255);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
