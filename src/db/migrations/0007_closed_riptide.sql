CREATE TABLE "materials_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_name" text NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"reorder_level" integer DEFAULT 20 NOT NULL,
	CONSTRAINT "materials_inventory_product_name_unique" UNIQUE("product_name")
);
--> statement-breakpoint
CREATE TABLE "supplier_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"sender" text NOT NULL,
	"message_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
