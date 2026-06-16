CREATE TABLE "supplier_bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"supplier_name" text NOT NULL,
	"quoted_cost_per_unit" numeric(10, 2) NOT NULL,
	"estimated_delivery_days" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
