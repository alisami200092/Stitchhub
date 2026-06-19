ALTER TABLE "supplier_bids" RENAME TO "supplier_quotes";--> statement-breakpoint
ALTER TABLE "supplier_quotes" ALTER COLUMN "status" SET DEFAULT 'under review';