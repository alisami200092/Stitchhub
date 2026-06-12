import { pgTable, uuid, text, timestamp, jsonb, integer, doublePrecision, numeric, boolean } from "drizzle-orm/pg-core";

// ==========================================
// 1. SUPABASE AUTH SYNCHRONIZED USER TABLE
// ==========================================

export const users = pgTable("user", {
  id: text("id").primaryKey(), // Populated by trigger from auth.users.id
  name: text("name"),
  email: text("email").unique().notNull(),
  image: text("image"),
  role: text("role").default("client").notNull(), // 'client' or 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 2. STITCHHUB WORKSPACE REQUISITION TABLES
// ==========================================

export const emailLogs = pgTable("email_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), 
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default("draft_sourcing").notNull(), // draft_sourcing, review_required, approved, sourcing_active, processing
  aiResponseDraft: text("ai_response_draft"),
  metadata: jsonb("metadata"), 
  finalQuoteAmount: numeric("final_quote_amount", { precision: 10, scale: 2 }),
  supplierPayload: jsonb("supplier_payload"),
  agentOverride: boolean("agent_override").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull().unique(), // e.g., INV-2026-XXXX
  totalAmount: text("total_amount").notNull(),
  status: text("status").default("unpaid").notNull(), // paid, unpaid, shipping
  itemsSnapshot: jsonb("items_snapshot").notNull(), // Captures the cart array state permanently
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==========================================
// 3. PRODUCT CATALOG TABLE
// ==========================================

export const products = pgTable("products", {
  id: text("id").primaryKey(), // e.g., 'gildan-18500-hoodie'
  title: text("title").notNull(),
  cat: text("cat").notNull(),
  img: text("img").notNull(),
  price: doublePrecision("price").notNull(),
  priceRange: text("price_range").notNull(),
  description: text("description").notNull(),
  moq: integer("moq").notNull(),
  customization: text("customization").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});