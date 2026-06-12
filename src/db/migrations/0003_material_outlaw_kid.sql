CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"cat" text NOT NULL,
	"img" text NOT NULL,
	"price" double precision NOT NULL,
	"price_range" text NOT NULL,
	"description" text NOT NULL,
	"moq" integer NOT NULL,
	"customization" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
