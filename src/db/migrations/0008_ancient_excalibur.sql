ALTER TABLE "email_logs" ALTER COLUMN "status" SET DEFAULT 'draft sourcing';--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "unit_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "total_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "items" jsonb;