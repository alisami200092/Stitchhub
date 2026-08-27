# StitchHub

> **A modern B2B custom merchandise & apparel sourcing platform powered by an AI procurement engine.**

StitchHub streamlines the traditional, messy back-and-forth of corporate merchandise sourcing. Instead of waiting days for custom price quotes, timeline validations, and supplier checks, buyers can configure bulk orders, get real-time tiered pricing and AI-assisted quotes, pay deposits seamlessly, and track their production run from one place.

---

## 🌟 What is StitchHub?

StitchHub brings three key players together on one unified platform:

1. **Clients & Corporate Buyers**
   - Browse a curated catalog of customizable apparel, drinkware, gear, and office products.
   - Build custom cart orders with MOQ (Minimum Order Quantity) enforcement.
   - Submit an RFQ (Request for Quote) and chat directly with an AI Sourcing Agent that checks timelines, fabric rules, and tiered volume discounts.
   - Pay a 30% production deposit online via Polar checkout once quotes are approved.
   - Track order status, download invoices, and manage past sourcing runs.

2. **Operations & Admins**
   - Central command center to oversee all customer orders, production stages, and inventory levels.
   - Review AI quotes flagged for manual review (e.g., custom fabric requests, tight deadlines, low stock).
   - Seamless "human-in-the-loop" takeover of customer chat threads.
   - Review and accept supplier bids, sync costs, and manage catalog items.

3. **Suppliers & Manufacturers**
   - Dedicated supplier portal to view active procurement RFQs.
   - Submit wholesale bids with unit costs and delivery timelines.
   - Direct messaging channel with StitchHub operations for logistical coordination.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a sleek dark-luxury theme (`#d4af37` gold accents)
- **Database & ORM**: PostgreSQL on [Supabase](https://supabase.com/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: Supabase Auth (Email/Password + TOTP MFA sessions)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (cart, filters, UI) + [TanStack React Query](https://tanstack.com/query) (server cache)
- **AI & Reasoning**: Local [Ollama](https://ollama.ai/) (`stitchhub-v5`) with cloud [Google Gemini](https://ai.google.dev/) fallback
- **Vector Search**: [Pinecone](https://www.pinecone.io/) for catalog spec retrieval
- **Payments**: [Polar.sh](https://polar.sh/) (30% production deposit checkout + webhooks)
- **Transactional Emails**: [Brevo](https://www.brevo.com/)

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js 18+** or **Bun** (recommended)
- A **Supabase** project (Postgres DB + Auth + Storage)
- (Optional) A local **Ollama** instance running on `localhost:11434` for local AI inference

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/1ewig/Stitchhub.git
cd Stitchhub

# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your required credentials:
```env
# Database & Supabase
DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# AI Inference (Gemini fallback)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"

# Payments (Polar Sandbox)
POLAR_ACCESS_TOKEN="polar_at_..."
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"
POLAR_PRODUCT_ID="your-polar-product-id"

# Transactional Email (Brevo)
BREVO_API_KEY="xkeysib-..."

# Vector Retrieval (Pinecone - optional)
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="stitchhub-catalog"
```

### 3. Setup Database & Seed Data

Run Drizzle migrations and seed initial products and materials inventory:

```bash
# Run migrations
bun run db:migrate

# Seed catalog products
bun src/db/seed.ts

# Seed raw materials inventory
bun src/db/seed_inventory.ts
```

### 4. Start the Dev Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router routes & API endpoints
│   ├── (storefront)/       # Landing page, catalog (/products), detail (/products/[id]), checkout
│   ├── admin/              # Operations command center (orders, approvals, inventory, products)
│   ├── supplier/           # Supplier portal (active RFQs, bids, messages)
│   ├── profile/            # Buyer dashboard (inbox, history, invoices, settings)
│   └── api/                # Secure backend route handlers (AI agent, chat, orders, webhook)
├── components/             # Reusable UI atoms, layouts, cards, and modal components
├── data/                   # Default catalog and specs
├── db/                     # Drizzle schema, DB client, migrations, and seed scripts
├── hooks/                  # Client-side custom hooks & React Query wrappers
├── lib/                    # Payment utils, vector retrieval helpers
├── stores/                 # Zustand stores (cart, filters, supplier state)
├── types/                  # Shared TypeScript interfaces & types
└── utils/                  # Auth checks, pricing rules, inventory mapping, colors
```

---

## 🤖 The AI Sourcing Engine

The core differentiator of StitchHub is the **Business Logic Interceptor**:
- The AI agent understands conversational client requests while remaining strictly bounded by manufacturing reality.
- **Automated Guardrails**: Enforces 28-day production minimums, validates product-specific customization techniques (e.g., laser engraving vs. screen printing), checks warehouse inventory stock, and calculates tiered volume pricing deterministically.
- **Graceful Human Escalation**: If an order violates constraints or asks for custom modifications, the system flags it for admin review without breaking the customer conversation.

---

## 🤝 Contributing

Contributions, feedback, and suggestions are always welcome!
1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Proprietary — built with care by the StitchHub team.

