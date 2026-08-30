# StitchHub

> **A modern B2B custom merchandise & apparel sourcing platform powered by an agentic AI procurement engine.**

Corporate merchandise sourcing has traditionally been a slow, manual grind of back-and-forth emails, vague pricing matrices, untracked revisions, and disconnected supplier communication. 

**StitchHub** transforms this process into a seamless operational command center. From configuring bulk garment orders and calculating tiered volume pricing in real time, to AI-driven quote drafting, automated manufacturing guardrails, and instant deposit payments, StitchHub handles the heavy lifting so creative directors and brand teams can focus on their vision.

---

## 🌟 The Experience

StitchHub unites three key user journeys into one fluid application:

### 1. 🛍️ Corporate Buyers & Brand Teams
- **Curated B2B Catalog**: Explore customizable heavyweight hoodies, performance polos, double-wall tumblers, tech pouches, and office acoustics with live Minimum Order Quantity (MOQ) rules.
- **AI Sourcing Assistant**: Submit an order requisition and converse with an AI agent that understands customization techniques, validates timelines, and computes tiered volume pricing instantly.
- **Frictionless Deposits**: Approve quotes and pay the 30% production deposit directly via Polar checkout.
- **Partner Dashboard**: Track order states, review invoices, and manage past sourcing runs.

### 2. ⚡ Operations & Admin Command Center
- **Order Oversight**: A single dashboard to monitor active production pipelines, invoice statuses, and escalations.
- **Human-in-the-Loop Takeover**: Intercept and directly take over any AI client conversation thread at any time.
- **Review & Approval Queue**: Manually verify high-stakes or custom-tailored quotes before they unlock for customer payment.
- **Catalog & Inventory Management**: Live stock tracking, reorder thresholds, and dynamic product CRUD with image uploads.

### 3. 🏭 Suppliers & Mills
- **Procurement Portal**: Access active Request for Quotes (RFQs) generated from approved customer orders.
- **Bidding Engine**: Submit competitive wholesale bids with unit pricing and estimated lead times.
- **Direct Logistics Chat**: Real-time messaging with StitchHub operations to resolve fabric, colorway, and shipping specs.

---

## 🧠 The AI Sourcing Engine

The intelligence behind StitchHub is its **Business Logic Interceptor**:
- **Prose + Deterministic Business Truth**: While the AI agent drafts natural, conversational responses, strict code-level guardrails govern manufacturing truth.
- **Production Guardrails**: Automatically enforces 28-day timeline minimums, validates material compatibility (e.g. laser engraving vs. screen print), and checks raw warehouse inventory.
- **Graceful Escalation Protocol**: Requests that breach manufacturing limits or ask for complex custom cut-and-sew work are smoothly paused and flagged for human operations review without breaking the client thread.
- **Hybrid AI Runtime**: Prioritizes a local **Ollama** model (`stitchhub-v5`) with an automatic, resilient cloud fallback to **Google Gemini**.

---

## 💻 Technical Architecture & Stack

| Layer | Technology | Key Highlights |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) | CSR-first interactive pages, Node.js API route handlers |
| **UI & Styling** | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Dark-luxury palette (`#d4af37` gold accents), glassmorphic surfaces |
| **Database & ORM** | PostgreSQL ([Supabase](https://supabase.com/)) + [Drizzle ORM](https://orm.drizzle.team/) | Drizzle queries with transaction pooling, schema migrations |
| **Auth & Security** | Supabase Auth + Edge Proxy | Email allowlist authorization, TOTP MFA, defense-in-depth API guards |
| **State & Cache** | [Zustand 5](https://github.com/pmndrs/zustand) + [TanStack Query 5](https://tanstack.com/query) | LocalStorage cart persistence, 60s server cache with smart invalidation |
| **AI & Search** | Local Ollama + Gemini + [Pinecone](https://www.pinecone.io/) | Semantic catalog matching, multi-turn chat threads, GGUF local model |
| **Payments** | [Polar.sh](https://polar.sh/) | Sandbox deposit checkouts with cryptographically verified webhooks |
| **Email Alerts** | [Brevo](https://www.brevo.com/) | Transactional customer notifications and quote alerts |

---

## 🚀 Getting Started

Want to run StitchHub on your machine? Check out the complete step-by-step setup guide:

👉 **[Read the Quickstart Guide](docs/QUICKSTART.md)**

```bash
# Quick install & start
git clone https://github.com/1ewig/Stitchhub.git
cd Stitchhub
bun install          # or npm install
cp .env.example .env.local
bun run db:migrate
bun run dev
```

---

## 📚 Documentation

Detailed documentation and architectural references are available in the [`docs/`](docs/) directory:

- 📖 **[Quickstart Guide](docs/QUICKSTART.md)** — Step-by-step local setup, environment variables, and database seeding.
- 🏛️ **[System Architecture & Context](docs/SUMMARY.md)** — Complete deep-dive into domain models, data flows, authz rules, and state invariants.
- 💳 **[Polar Payment Integration](docs/polar-integration.md)** — Details on deposit checkouts, webhook verification, and payment confirmation.

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are welcome!
1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

Proprietary — built with care by the StitchHub team.
