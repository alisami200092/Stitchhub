# StitchHub Quickstart & Local Setup Guide

This guide walks you through setting up and running StitchHub locally on your machine.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- **Node.js 18+** or **Bun** (recommended for speed)
- A **Supabase** project (PostgreSQL database, Auth, and Storage)
- (Optional) **Ollama** installed locally if you want to run the local `stitchhub-v5` model

---

## 🚀 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/1ewig/Stitchhub.git
cd Stitchhub
```

### 2. Install Dependencies

Using **Bun** (recommended):
```bash
bun install
```

Or using **npm**:
```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env.local` file by copying the template:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:

```env
# ── Database & Supabase ──
DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# ── AI Reasoning Engine ──
# If Ollama is running locally on http://localhost:11434, the app will prioritize it.
# Otherwise, it automatically falls back to Google Gemini:
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# ── Polar.sh Payments (Sandbox) ──
POLAR_ACCESS_TOKEN="polar_at_..."
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"
POLAR_PRODUCT_ID="your-polar-product-id"

# ── Transactional Email (Brevo) ──
BREVO_API_KEY="xkeysib-..."

# ── Vector Search (Pinecone - optional fallback) ──
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="stitchhub-catalog"
```

---

### 4. Setup Database & Seed Data

1. **Run Drizzle Migrations** to create all tables and relationships:
   ```bash
   bun run db:migrate
   # or: npm run db:migrate
   ```

2. **Seed the Product Catalog**:
   ```bash
   bun src/db/seed.ts
   # or: npx tsx src/db/seed.ts
   ```

3. **Seed Raw Materials Inventory**:
   ```bash
   bun src/db/seed_inventory.ts
   # or: npx tsx src/db/seed_inventory.ts
   ```

---

### 5. (Optional) Run the Local AI Model with Ollama

StitchHub is built to query a local Ollama model (`stitchhub-v5`) with an automatic cloud fallback to Google Gemini.

1. Install [Ollama](https://ollama.ai/).
2. Verify Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```
3. If the local model is not running or times out, the app seamlessly falls back to `gemini-1.5-flash` using your `GEMINI_API_KEY`.

---

### 6. Start the Development Server

```bash
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 🔑 User Accounts & Access Control

StitchHub uses an **email allowlist** model for role-based access:

- **Clients / Regular Users**: Any authenticated user can browse products, build carts, submit quotes, and view their order dashboard at `/profile`.
- **Admins (`/admin`)**: Restricted to emails listed in `ADMIN_EMAILS` (e.g., `admin@stitchhub.com`, `superadmin@stitchhub.com`).
- **Suppliers (`/supplier`)**: Restricted to emails listed in `SUPPLIER_EMAILS` (e.g., `supplier@stitchhub.com`).

---

## 🛠️ Helpful Scripts

| Command | Description |
|---|---|
| `bun run dev` | Starts Next.js development server with Turbopack |
| `bun run build` | Builds the production bundle & verifies TypeScript |
| `bun run db:generate` | Generates new SQL migration files from Drizzle schema |
| `bun run db:migrate` | Applies pending migrations to your database |
| `bun run lint` | Runs ESLint code checks |

---

## ❓ Troubleshooting

- **Database Connection Issues**: Make sure your `DATABASE_URL` uses the direct connection or transaction pooler mode (`prepare: false`).
- **AI Timeout**: If the local Ollama instance is busy or unresponsive, ensure your `GEMINI_API_KEY` is set in `.env.local` for automatic cloud fallback.
- **Image Uploads in Admin**: Ensure your Supabase Storage has a public bucket named `product-images`.
