ALTER TABLE "email_logs" ALTER COLUMN "status" SET DEFAULT 'draft_sourcing';--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "final_quote_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "supplier_payload" jsonb;