# StitchHub - System Context & Architecture Guide

> Primary ground-truth architectural reference. Read this before touching any code.
> Trust this over stale external assumptions. Where this conflicts with generic
> "best-practice" Next.js patterns, THIS codebase wins.

## 1. Executive Summary & Domain Purpose

### What this application is
- **StitchHub** is a **B2B custom apparel & merchandise sourcing platform** ("operational command center"). It connects three distinct users on one codebase:
  1. **Clients / Buyers** — browse a curated wholesale catalog, build a cart, and submit a sourcing requisition (RFQ) that an AI agent turns into a production quote and invoice.
  2. **Admins / Operations** — a dedicated command-center UI to review escalated orders, manually approve/reject quotes, take over AI threads, manage the product catalog, and reconcile supplier quote approvals.
  3. **Suppliers** — a procurement portal to view active RFQs, submit price quotes, and chat with the platform/agent on supply-channel threads.

### Core business problem solved
- Automate the **front half of a custom-manufacturing sales funnel**: take a vague corporate bulk order request (quantities, timelines, customization preferences) and deterministically translate it into a **MOQ-validated, timeline-checked, inventory-checked, tiered-priced quote + invoice + supplier outreach** — with a human escalation path when the request violates manufacturing guardrails.

### Primary revenue / value driver
- A **30% production deposit** collected at quote approval via Polar.sh checkout; the remaining balance is invoiced on fulfillment. Value is the AI-driven end-to-end requisition pipeline that removes manual RFQ handling.

### Non-functional constraints
- **Authorization model is EMAIL ALLOWLIST based, not DB-role based.** Admin/supplier identity is decided at runtime by hardcoded email lists (`ADMIN_EMAILS`, `SUPPLIER_EMAILS`) meaning access is WIDE-OPEN by default for any authenticated user who is NOT on a list — only the explicit `/admin`, `/api/admin`, `/supplier`, `/api/supplier`, checkout, and product-write boundaries are gated.
- **Sandbox/pilot posture**: payments run against Polar **sandbox**; supplier quotes are mock ("Test Supplier Alpha", 10% flat discount); the AI runtime depends on a **local Ollama instance** (localhost:11434) with a cloud Gemini fallback.
- **Latency tolerance**: AI generation can take up to 45s (Ollama generate) with hard `AbortSignal.timeout` budgets; most DB/API calls are synchronous on the Node runtime.
- **Multi-tenancy is implicit, not enforced**: records are isolated "logically" by `userId` foreign key and queried per-user, but there is NO tenant/project isolation key in the schema. RLS is deliberately bypassed (see Section 6 / 7).
- **Single region / no hard latency SLA**; no compliance regime (no PII/PCI storage — payment details never touch the app DB).

## 2. Technical Stack & Infrastructure

| Layer | Technology / Library | Purpose in this Project | Key Configuration & Notes |
|---|---|---|---|
| Framework | **Next.js 16.2.6** (App Router) | Routing, Server/Client rendering, Route Handlers, build/lint | Runs as CSR-first; only root `layout.tsx` is a Server Component. `middleware` is now `proxy.ts` (see Notes). Dev allowed origin: `rayna-spriggy-scarlett.ngrok-free.dev`. |
| React | **React 19.2.4** + react-dom | UI runtime | Uses async `params` (`use(params)`), client components throughout. No `useActionState`/Server Actions present. |
| Language | **TypeScript ~5.x** | All app source types | `strict: true`, path alias `@/* -> ./src/*`, `moduleResolution: bundler`. |
| Database | **PostgreSQL** (Supabase-hosted) | Source of truth for all domain entities | Accessed via `DATABASE_URL`; Supabase is used only for Auth + Storage + (client-side) Realtime, NOT for DB reads in handlers. |
| ORM / SQL | **Drizzle ORM 0.45 + postgres-js 3.4** | Type-safe queries, schema, migrations | `prepare:false` required for Supabase "Transaction" pool mode. Migrations in `src/db/migrations` (10 applied). |
| Auth | **Supabase Auth** (`@supabase/ssr`, `@supabase/supabase-js`) | Email/password + TOTP MFA sessions | ANON key or PUBLISHABLE key fallback (`??`). Sessions via server middleware (`proxy.ts`) + browser client + server client. MFA via Supabase auth. |
| Styling / UI | **Tailwind CSS 4** (`@tailwindcss/postcss`) + framer-motion 12 | All styling & animation | Global `globals.css` + `styles/animations.css`. "Luxury dark" theme: black/zinc + gold `#d4af37`. Glassmorphism (backdrop-blur) pervasive. CSS-first config (no `tailwind.config`). |
| State Management | **Zustand 5** (6 stores) + **TanStack React Query 5** | Client UI state vs server cache | Zustand for local/product/form/profile/supplier/cart (cart persisted to `localStorage`). React Query `staleTime: 60s`, `refetchOnWindowFocus:false`. |
| Validations | **Hand-rolled / manual** | Request & form validation | No Zod/schema lib. Route handlers do inline `typeof`/presence checks; uploads enforce 5MB + JPEG/PNG/WebP allow-list; email changes trigger password re-auth. |
| Testing | **None configured** | N/A | No test runner/suite exists. Lint only: ESLint 9 (`next/core-web-vitals` + `next/typescript`). |
| Background jobs | **In-process fire-and-forget** (`setImmediate`/unawaited `fetch`) | Supplier outreach + supplier-sourcing activation | No job queue. Unawaited `setImmediate` DB mutations and `fetch(...).catch` internal webhook calls; must not be relied on for durability. |
| Database tooling | **drizzle-kit 0.31** | Generate/migrate schema | `db:generate`, `db:migrate` scripts; config `drizzle.config.ts` (postgres, out `src/db/migrations`). |
| Payments | **Polar.sh** (`@polar-sh/sdk`, `@polar-sh/nextjs`) | 30% deposit checkout + webhook | Sandbox env (`POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID`). Webhook signature verified by `@polar-sh/nextjs` `Webhooks`. |
| Email | **Brevo** (`@getbrevo/brevo`) | Transactional customer alerts | `BREVO_API_KEY`; transactional endpoint `sendTransacEmail`; sender address hardcoded `cheetayfastdl345@gmail.com`. Many HTML bodies are inline hardcoded (gold-themed). |
| AI / LLM | **Local Ollama** + **Gemini fallback** | Sourcing agent, supplier agent, suggestions | Ollama `stitchhub_v5` (generate + chat), localhost:11434; fallback Gemini (`GEMINI_MODEL`). Ollama NOT required at build — only at runtime. |
| Vector DB | **Pinecone** (+ Ollama all-minilm embeddings) | Catalog spec retrieval | Rotates: Ollama embed -> Pinecone query -> in-memory catalog match fallback. `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`. |
| Object Storage | **Supabase Storage** | Product image uploads | Public `product-images` bucket, URL whitelisted in `next.config.ts` remotePatterns. |
| Validation / Security | **Server-client boundary + inline checks** | Authz & input guards | No rate limiting; no CSP config; allow-list emails compiled into bundle (admin list is intentionally public-ish). |

### Tooling / scripts (package.json)
- `dev`, `build`, `start`, `lint` (eslint)
- `db:generate`, `db:migrate` (drizzle-kit)
- Standalone scripts under `src/db`: `seed.ts`, `seed_inventory.ts`, `upload-images.ts`, `check_supplier_messages.js` (node). `lib/test_pinecone_retrieval.ts` is a manual debug harness.

## 3. High-Level Architectural Mental Model & Data Flow

### The single most important fact
**This app is Client-Side-Rendered. The entire interactive layer is `'use client'`.**
- Only `src/app/layout.tsx` is a Server Component. It provides global providers, the `<Navbar>`, the `<CartDrawerWrapper>`, and `<main>`.
- ALL pages (`/`, `/products`, `/admin/*`, `/supplier/*`, `/profile/*`, `/auth/*`, checkout, payment success) are Client Components that fetch data at runtime.
- There are **no Server Actions**, no `use cache`, no PPR/ISR on the page graph, no `generateStaticParams`, no `export const runtime`, and no tag/path revalidation anywhere. Caching is entirely **client-side** (React Query) or at the **Route Handler** (Node) level via runtime querying.

### End-to-end data lifecycle (client requisition -> payment -> sourcing)

> Browser (Client Components + Zustand + React Query)
>    ├── build cart (localStorage, MOQ-clamped) ──> /products/checkout
>    │      POST /api/agent             (cart + message + toEmail + subject)
>    │        └── Route Handler [Node]: Supabase user check
>    │              ├── global routing gate (locking active orders)
>    │              ├── Pinecone spec retrieval (fallback to catalog)
>    │              ├── Ollama stitchhub-v5 generate (45s) / Gemini fallback
>    │              ├── "Business Logic Interceptor" guardrail scans
>    │              ├── inventory pre-check against materials_inventory
>    │              ├── tiered pricing calc  ->  db INSERT emailLogs + invoices
>    │              ├── fire-and-forget supplier outreach (setImmediate)
>    │              └── Brevo email alert
>    │        └── response: { generatedMessage, status, engine } -> client
>    │              -> optimistic update + router.push('/profile')
>    │
>    ├── POST /api/chat  (thread reply on an existing emailLog)
>    │      └── same guardrail pipeline -> update emailLogs.aiResponseDraft (JSON array)
>    │
>    ├── Admin approves: POST /api/admin/process-approval
>    │      └── emailLogs.status -> 'approved' -> Brevo "quote verified" to client
>    │
>    ├── Client deposits: POST /api/agent/checkout (logId)
>    │      └── create Polar checkout (30% of finalQuote) -> redirect
>    │      └── Polar webhook POST /api/webhook/polar  (signature-verified)
>    │      └── client returns /payment/success?checkout_id -> POST /api/agent/confirm-payment
>    │      └── handleSuccessfulPayment: decrement inventory, emailLogs->processing,
>    │           invoices->paid, trigger /api/supplier-sourcing (background)
>    │
>    └── Supplier flow: /api/supplier-sourcing -> Ollama PO -> emailLogs.supplierPayload
>         └── suppliers POST quotes (/api/supplier/...) -> admin POST /api/admin/supplier-quotes
>              -> 'supplier approved' -> emailLogs 'approved' + inventory replenish
> (Flow diagram above is prose/structural ASCII — not executable code.)

### Supplier-side data flow (who sees what when)

> Client pays deposit (emailLogs->processing, invoice->paid)
>   └── fire-and-forget POST /api/supplier-sourcing
>        ├── requires status 'processing'  (else 400 "pipeline not active")
>        ├── Ollama/Gemini -> vendor PO text
>        ├── emailLogs.supplierPayload = { vendor_po, tracking_id (TRK-PO-#####), dispatched_at }
>        └── /api/supplier-sourcing returns { trackingId } (mock)
>   Suppliers (allowlist) see:
>        ├── /supplier/active-requests  -> emailLogs in sourcing stage w/ items
>        ├── submit quote -> supplier_quotes (orderId = invoiceNumber)
>        └── /supplier/messages         -> supplier_messages (real-time pushed via Supabase)
>   Admin:
>        └── /admin/supplier-quotes -> approve => supplier_quotes 'supplier approved'
>             + emailLogs 'approved' + invoice total=supplier cost + inventory replenish
>                  -> client sees updated quote + can now deposit
- **Real-time fan-in**: the supplier portal uses a **Supabase Realtime channel** on `supplier_messages` (INSERT events, sender != 'supplier') for the notification badge, with a `localStorage supplier_notifications_last_seen` timestamp for unread tracking. This is the ONLY Realtime usage in the app.
- **Nobody except admin/clients see the other party's money draft**: client sees its own emailLogs + invoices (via `/api/profile/invoices` and `/api/agent/history`); suppliers see only supplier_quotes and messages. There is no client-facing "supplier bid comparison" UI — supplier negotiation is admin-handled.

### Server vs. Client Component boundaries
- **Rule of thumb in this repo: everything is a Client Component** except the root layout. Interactivity is NOT "pushed down to leaves" — it is the default at the page level.
- The Server Component root exists to deliver the initial HTML shell + metadata + provider mount.
- **Real server execution lives in Route Handlers** (`src/app/api/**`), which run server-side (Node runtime) and are the ONLY place DB/AI/secrets are touched from the UI.
- Practical boundary rule: any component that uses `useRouter`, `useSearchParams`, Zustand, React Query, `useState/useEffect` events, or calls `fetch` to `/api/*` must be a client component. Presentational-only components may remain server-safe but the repo does not exploit that.

### Next.js Caching & Rendering Strategy
- **Rendering: dynamic everywhere.** Because every page reads browser state (cart, session via browser client) and calls API routes at runtime, nothing is pre-rendered/ISR. Output is effectively dynamic CSR.
- **No `use cache` / PPR / ISR / tag revalidation is used.** Do not add cache directives assuming they exist.
- **Route Handlers are uncached by default** (POST) or plainly query the DB each GET (`/api/products` GET is not memoized). `fetch` with `cache`/`revalidate`/`next.tags` has **no effect inside `proxy.ts`** (documented Next 16 behavior) — do not attempt tag-based invalidation there.
- **The only real caching is TanStack Query** (`staleTime: 60s`), plus `localStorage` persistence for cart state. React Query invalidation (e.g. `useChat` invalidates `['orders']`,`['active-order']`,`['history']`) is how cross-screen consistency is achieved.

### Runtime & edge deployment notes
- The **Proxy (`src/proxy.ts`) runs on the Edge runtime** (default for the proxy layer) — it must be **edge-compatible** (no Node-only APIs). `utils/supabase/middleware.ts` (`updateSession`) is edge-safe. It uses `NextResponse.next` chained writes and returns `{ supabaseResponse, user }`.
- **Route Handlers (`/api/*`) run on the Node.js runtime** — this is where `drizzle`, `postgres`, `@getbrevo/brevo`, `crypto`, `Buffer`, and SDKs that need Node (or localhost Ollama) are used. The Ollama calls intentionally target `localhost:11434`, so handlers MUST stay on Node (Node runtime), not edge, or the AI pipeline breaks.
- **`instrumentation.ts` does NOT exist.** There is no `register()`/`onRequestError()` instrumentation hook; error reporting is `console` only.
- **Env var contract** is centralized in `.env.example`; the server-side handlers read non-public vars (`DATABASE_URL`, `POLAR_*`, `BREVO_API_KEY`, `GEMINI_*`, `PINECONE_*`) while browser code only uses `NEXT_PUBLIC_SUPABASE_*`. Never import a server-only secret into a Client Component.

### Authentication, Authorization & Session Lifecycle
- **Three auth surfaces, all Supabase:**
  1. **Edge/Proxy (`src/proxy.ts`)** — Next 16 renamed `middleware`. Calls `updateSession` (refreshes tokens via cookie get/setAll), then GATES protected boundaries using hardcoded `ADMIN_EMAILS` / `SUPPLIER_EMAILS` allowlists. Returns 401 (API) or redirects to `/auth/login` (pages) for unauthenticated; 403 / redirect-home for allowlist violations. Matcher: `/products/checkout:*`, `/admin:*`, `/api/admin:*`, `/api/products`, `/supplier:*`, `/api/supplier:*`.
  2. **RSC/Server (route handlers via `createClient()` from `utils/supabase/server`)** — every protected API handler independently re-checks `supabase.auth.getUser()` AND `isAdmin(other.email)`/`isSupplier` — **defense in depth; never trust the proxy alone**.
  3. **Browser (`utils/supabase/client`)** — `SupabaseProvider` hydrates session + subscribes `onAuthStateChange`; `useAuth` handles login/signup/MFA challenge; `useProfile` reads identity, lists MFA factors, updates name/email/password via browser client.
- **Model**: effectively **ABAC/AoA (allowlist-of-email)** rather than RBAC. The `users.role` column exists but is NOT consulted for authorization (only allowlists are). A logged-in user with no admin/supplier email is a "client" by default and can use the storefront + profile.
- **Session refresh**: `proxy.ts` refreshes on protected-route traffic; Server Component `setAll` in `utils/supabase/server` warms a no-op try/catch (ignored because middleware refreshes).

## 4. Directory Structure Map

> Stitchhub-main/
> ├── next.config.ts            # allowedDevOrigins (ngrok), image remotePatterns (supabase storage)
> ├── drizzle.config.ts         # drizzle-kit: schema src/db/schema.ts -> src/db/migrations (postgres)
> ├── eslint.config.mjs         # next core-web-vitals + typescript, ignores .next/out/build
> ├── tsconfig.json             # strict, @/* -> ./src/*, bundler resolution
> ├── .env(.example)            # all secrets/URLs (see Section 2 table)
> ├── node_modules/next/dist/docs/  # THE Next 16 docs (breaking-changes source of truth; read here first)
> └── src/
>    ├── proxy.ts               # Next 16 "middleware" gatekeeper: token refresh + allowlist authz + redirects; matcher config
>    ├── app/                   # ALL app routes (page.tsx); contains api/ route handlers; every page 'use client'
>    │  ├── layout.tsx          # ONLY Server Component: metadata, SupabaseProvider->QueryProvider->Navbar->main->CartDrawerWrapper
>    │  ├── page.tsx            # '/' landing funnel (composes Landing* sections) — 'use client'
>    │  ├── globals.css          # tailwind + global dark-luxury resets
>    │  ├── icon.svg             # favicon
>    │  ├── admin/               # Admin command center (layout 'use client' with sidebar nav)
>    │  │  ├── layout.tsx        # fixed glass sidebar + main workspace
>    │  │  ├── page.tsx          # dashboard
>    │  │  ├── approvals/        # escalated review queue (approve/reject -> /api/admin/process-approval)
>    │  │  ├── orders/           # active orders grid + status editing
>    │  │  ├── products/         # catalog CRUD (create/edit/delete + image upload)
>    │  │  ├── supplier-quotes/  # supplier bid review/decision
>    │  │  └── inventory/        # materials_inventory stock/reorder management
>    │  ├── api/                 # LEADING Edge. Only server code in the app layer. Route handlers (Node)
>    │  │  ├── agent/            # POST core requisition; checkout; confirm-payment; history; suggestions; merge-suggestion; pay-deposit
>    │  │  ├── chat/             # POST thread continuation on emailLogs
>    │  │  ├── products/         # GET public catalog; POST admin create; [id] PUT/DELETE admin
>    │  │  ├── admin/            # orders (GET/PATCH), orders/send-message, orders/takeover, orders/chat-log, escalations, inventory, supplier-quotes, process-approval, upload
>    │  │  ├── supplier-sourcing/ # POST activate supplier agent, produce PO payload
>    │  │  ├── profile/invoices/ # GET per-user invoices joined to emailLog status
>    │  │  └── webhook/polar/    # Polar signature-verified checkout webhook
>    │  ├── auth/                # login (incl. MFA challenge), reset-password — 'use client'
>    │  ├── payment/success/     # checkout success confirm (useSearchParams + Suspense) — 'use client'
>    │  ├── products/            # catalog listing + [id] detail + checkout/quote composer — all 'use client'
>    │  ├── profile/             # layout 'use client' w/ sidebar; inbox, history(+[id]), settings, security
>    │  └── supplier/            # layout 'use client' w/ realtime notifications; active-requests, submitted-quotes, messages, dashboard
>    ├── components/             # Presentational + interactive composites (nearly all 'use client')
>    │  ├── CartDrawer(Wrapper)  # global slide-out cart
>    │  ├── Navbar.tsx           # global dark-luxury nav
>    │  ├── admin/               # AdminPageHeader, StatusBadge, GlassCard, FormField, LoadingSpinner, EmptyState
>    │  ├── agentic-ai-inbox/    # agent-response-form, agent-side-panel (checkout composer + AI sidebar)
>    │  ├── auth/                # AuthBrandHeader, AuthAlert, AuthForm, AuthInput (login/signup/MFA)
>    │  ├── landing/             # Landing* (Hero, AiAdvantage, Process, ProductFeatures, ProductLineup, Testimonials, Faq, Cta, Footer)
>    │  ├── products/            # ProductCard/Breadcrumb/Image/Info/Filters, ColorSelector, SizeSelector, VolumeStepper, AddToCartButton, CustomizationMethods, SourcingVolumeMatrix
>    │  ├── profile/             # ProfileSidebar, InboxPanel, OrderHistoryTab, OrderTrackingTab, ProfileAccountTab, ProfileSecurityTab
>    │  ├── supplier/            # ActiveRfqDetails, ActiveRfqSidebar, ChatInputForm, ChatMessageBubble, ChatThreadSidebar, SubmittedQuoteCard, WholesaleQuoteForm
>    │  └── ui/                  # GoldButton, DancingDots
>    ├── data/products.ts        # Static fallback product catalog (used by Pinecone fallback sorting)
>    ├── db/                     # schema.ts (Drizzle tables), index.ts (postgres client), seed scripts, migrations/ (10)
>    ├── hooks/                  # 'use client' custom hooks (data access layer + logic)
>    ├── lib/                    # polar.ts, polar-utils.ts (payment side-effects), pinecone.ts (vector retrieval), test_pinecone_retrieval.ts
>    ├── providers/              # QueryProvider (TanStack), SupabaseProvider (session context + useSupabase)
>    ├── stores/                 # Zustand stores: cart, checkout-form, product-filter, profile, supplier, reduced-motion
>    ├── styles/animations.css   # extra keyframes/animations
>    ├── types/index.ts          # Product, CartItem, Order, EscalationLog, Invoice, ProfileTab
>    └── utils/                  # admin.ts, supplier.ts (email allowlists), pricing.ts (tier calc), inventory.ts (title->inv map), colors.ts, prompts.ts (AI prompts), supabase/{client,server,middleware}.ts

## 5. Domain Models, Data Schemas & State Invariants

### Entities (7 tables, all in `src/db/schema.ts`)
- **user** (`users`) — mirrors Supabase `auth.users` id (a trigger keeps it synced). `email` unique + notNull, `name`, `image`, `role` (default `'client'`; **not used for authz**), `createdAt`. 1:user has many emailLogs and invoices (cascade delete on user).
- **email_logs** (`emailLogs`) — **the central "order/thread" entity.** Attributes: `userId` (FK cascade), `subject`, `body` (original client message), `status` (string default `'draft sourcing'`), `aiResponseDraft` (either a plain-text draft OR a **JSON array** of `{role, content, isHuman}` messages for multi-turn threads), `metadata` (jsonb: `recipientEmail`, `itemCount`, `invoiceNumber`, later `polarCheckoutId`), `finalQuoteAmount`/`unitPrice`/`totalPrice` (numeric), `items` (jsonb snapshot of cart), `supplierPayload` (jsonb, PO/tracking after sourcing), `agentOverride` (bool, when admin takes over the thread), `createdAt`.
- **invoices** — 1:1-per-order supplement to emailLogs. `userId`, `invoiceNumber` (unique, `INV-2026-XXXX`), `totalAmount` (stored as **string, sometimes with `$` prefix**), `status` (paid/unpaid/shipping), `itemsSnapshot` (jsonb cart snapshot), `createdAt`. Linked to emailLogs only implicitly via `emailLogs.metadata->>'invoiceNumber' = invoices.invoiceNumber` (NO foreign key).
- **products** — catalog. `id` (text PK, slug like `gildan-18500-hoodie`), `title`, `cat`, `img`, `price` (double), `priceRange` (text), `description`, `moq` (int), `customization` (text, allowed methods), `createdAt`.
- **supplier_quotes** (`supplierQuotes`) — supplier bid record. `orderId` (text, semantically = invoiceNumber/logId string), `supplierName`, `quotedCostPerUnit` (numeric), `estimatedDeliveryDays`, `status` (`under review` -> `supplier approved` / `supplier rejected`), `createdAt`.
- **materials_inventory** (`materialsInventory`) — `id` serial PK, `productName` (unique, canonical names like "Gildan 18500 Hoodie"), `stockQuantity` (int), `reorderLevel` (default 20). Decremented on payment, replenished on supplier-quote approval. No FK — matched by `mapProductToInventoryItem(productTitle)`.
- **supplier_messages** (`supplierMessages`) — channel/fan-out messaging to suppliers. `orderId`, `sender` (`admin` | `supplier` | `stitchhub_procurement_agent`), `messageText`, `channelType` (default `supplier_portal`), `createdAt` (withTimezone, used for Realtime notifications).

### Relationships & key invariants
- **user 1:N email_logs** (FK, cascade). **user 1:N invoices** (FK, cascade).
- **email_logs 1:1 invoices** — NO FK; joined via `sql` jsonb lookup `metadata->>'invoiceNumber'`. This is the canonical linkage everywhere (admin orders, profile invoices, takeover, chat-log). **Do not break this contract.**
- **email_logs 1:N supplier_quotes** — via `orderId` string; no FK.
- **emailLogs / invoices N:M products** — materialized only as jsonb snapshots.
- **Soft-delete: none.** `products` DELETE is a hard physical delete. No `deletedAt` columns.
- **Money is stored inconsistently** (numeric for emailLogs, text-with-`$` for invoices). Parsing helper strips `$`/commas before numeric use. Preserve this dual representation.

### Critical domain enums & status lifecycles

**emailLogs.status (the master order lifecycle):**
> draft sourcing -> review required (escalated/needs admin)
>                 -> escalate_to_admin (thread locked, sourcing halted)
>                 -> approved (only state that unlocks checkout deposit)
>                 -> processing (deposit paid / sourcing active)
>                 -> shipping -> delivered
> also: dismissed (admin rejects approval), and legacy aliases:
>       'draft_sourcing', 'review_required' (underscore variants) — many code paths
>       normalize these; new code MUST normalize before comparing.
- Transition rules enforced in code (`/api/agent`, `/api/chat`, `/api/admin/*`):
  - `checkout` requires `status === 'approved'` **and** a non-null `finalQuoteAmount`.
  - `supplier-sourcing` requires `status === 'processing'`.
  - `escalate_to_admin` / `review required` **freeze** the client UI (auto-regenerated blocked response, `finalQuote*` nulled).

**invoices.status:** `unpaid` -> `paid` (-> `shipping`). Updated when payment succeeds.
- Note: an order can reach "paid" WITHOUT a supplier quote being approved — the deposit checkout only requires the client `emailLogs.status === 'approved'`. Admin approval of a supplier quote REPLACES the client's final price with the supplier's cost (unit × total qty, fallback qty 120) and sets `emailLogs.status = 'approved'`. Thus the "approved" signification differs depending on which admin surface (process-approval vs supplier-quotes) reached it.

**Money & deposit math invariants:**
- `finalQuoteAmount` (emailLogs) and `invoices.totalAmount` are meant to correspond, but either may be the source of truth depending on which admin path last wrote it. `calculateTieredPricing` is the ONLY pricing oracle for the requisition; the supplier path computes its own from `quotedCostPerUnit`.
- Deposit is ALWAYS **30% floor of the final quote** (`Math.round(qty*0.30*100)` cents at checkout; displayed as 30% at supplier approval). The webhook/confirm-payment ignores the amount entirely (trusts Polar status + ownership) — there is no server-side reconciliation back to the expected deposit. If deposit amounts must be audited, this is a known gap.
- 10% bulk "mock discount" (`basePrice * 0.9`) fabricates supplier quote unit costs at requisition time for "Test Supplier Alpha". This is placeholder data, not real procurement.

**supplier_quotes.status:** `under review`/`pending` -> `supplier approved` | `supplier rejected`.

**supplier_messages.sender:** `admin` | `supplier` | `stitchhub_procurement_agent` (drives notification badge + sender chip).

### Database constraints & indexing notes
- Unique: `users.email`, `products.id`, `invoices.invoiceNumber`, `materials_inventory.productName`.
- FKs: `email_logs.user_id` -> user (cascade), `invoices.user_id` -> user (cascade).
- **Indexing strategy: minimal/absent.** Most lookups are `userId` or `invoiceNumber` equality; the hot join is the jsonb `metadata->>'invoiceNumber'` expression (not indexed). For high volume, add an index/expression on that jsonb path — but keep behavior identical.
- **Multitenancy isolation key: none enforced in DB.** Isolation is per-route `eq(emailLogs.userId, user.id)` filters. Admin routes query across all users. No soft tenant column.

## 6. Routing & Page Architecture (App Router)

| Path / Route Group | Rendering Type | Runtime | Auth Level | Purpose & Key Child Components |
|---|---|---|---|---|
| `/` (page.tsx) | Client | Edge/Node (CSR) | Public | Landing funnel: Hero, AiAdvantage, Process (interactive steps), ProductFeatures, ProductLineup, Testimonials, Faq, Cta, Footer |
| `/auth/login` | Client | CSR | Public | Unified login/signup + TOTP MFA challenge (AuthForm/useAuth) |
| `/auth/reset-password` | Client | CSR | Public | Password reset flow |
| `/products` | Client | CSR | Public | Catalog listing w/ filters (ProductFilters, ProductCard) — data via `useProducts` -> `/api/products` |
| `/products/[id]` | Client | CSR | Public | Detail: Breadcrumb, Image, Info, CustomizationMethods, ColorSelector (variants by base title), SizeSelector (apparel), SourcingVolumeMatrix, VolumeStepper, AddToCartButton; uses `use(params)` + `useProductDetailPage` |
| `/products/checkout` | Client | CSR | Protected (proxy matcher) | Quote composer: agent-response-form + agent-side-panel; `useCheckoutForm` POSTs `/api/agent`, redirects to `/profile` |
| `/payment/success` | Client | CSR | Public (but a guest would fail confirm) | Reads `checkout_id` searchParam (Suspense-wrapped), POSTs `/api/agent/confirm-payment`; confirming/confirmed/error states |
| `/profile` (layout+children) | Client | CSR | Protected (client-gated by session; NOT proxy-matched) | Partner Workspace: sidebar + tabs (inbox, account, security, ledger, tracking) via `useProfile` |
| `/profile/inbox` | Client | CSR | Protected | AI thread list + thread composer using `useChat` |
| `/profile/history` + `/[id]` | Client | CSR | Protected | Order history / detail |
| `/profile/settings` | Client | CSR | Protected | Profile name/email changes |
| `/profile/security` | Client | CSR | Protected | MFA enroll/verify/disable, password change (via browser Supabase; re-auth w/ password) |
| `/admin` (layout+children) | Client | CSR | Admin (proxy + allowlist) | Command center w/ fixed sidebar; dashboard |
| `/admin/approvals` | Client | CSR | Admin | Preparation queue: approve/reject via `/api/admin/process-approval` |
| `/admin/orders` | Client | CSR | Admin | Order grid: status editing, takeover, send-message, chat-log panels |
| `/admin/products` | Client | CSR | Admin | Catalog CRUD + image upload (`/api/admin/upload` -> Supabase Storage) |
| `/admin/supplier-quotes` | Client | CSR | Admin | Supplier bid review; approve => `/api/admin/supplier-quotes` |
| `/admin/inventory` | Client | CSR | Admin | Stock/reorder level editing (`/api/admin/inventory`) |
| `/supplier` (layout+children) | Client | CSR | Supplier/Admin (allowlist) | Supplier portal: header w/ realtime notifications (Supabase channel on `supplier_messages`) + pill tabs |
| `/supplier/active-requests` | Client | CSR | Supplier | Active RFQs + quote submission form |
| `/supplier/submitted-quotes` | Client | CSR | Supplier | Submitted bid cards (status-aware) |
| `/supplier/messages` | Client | CSR | Supplier | Thread chat w/ chat sidebar + bubbles |
| `/supplier/dashboard` (+ components/) | Client | CSR | Supplier | Tabs: ActiveRfqs, SubmittedQuotes, Messages |

> Note on routing groups: NO `(marketing)`/`(dashboard)`/`(auth)` route-group folders exist. Segments are flat (`/auth`,`/admin`,`/profile`,`/supplier`,`/products`,`/payment`). The `/api/*` namespace is the sole Route-Handler group. There are **no parallel or intercepting routes**, no `loading.tsx`, no `error.tsx`, no `not-found.tsx` (except an inline JS product-not-found branch); `payment/success` uses an inline `<Suspense>`.
>
> Auth-level here reflects proxy matcher + allowlist, NOT the `users.role` column. `/profile` is protected only by redirect-in-effect (no proxy matcher entry; session hydration may briefly show loading then redirect if absent). Verify before relying on `/profile` server-side protection.

## 7. Data Flow, Server Actions & Integration Map

### Server Actions Map — NONE EXIST
- This codebase uses **no Server Actions**. All server work is done in **Route Handlers** under `/api/*`. Grep for `'use server'` returns zero hits. When the task says "Server Actions", interpret it as the pattern documented here: client `fetch` -> Route Handler -> optional DB/AI -> JSON response.
- Do not introduce Server Actions without explicit approval and without reading `node_modules/next/dist/docs/` (the Next 16 API surface differs).

### Route Handler inventory & signatures
| Handler | Method | Auth | Effect |
|---|---|---|---|
| `/api/agent` | POST `{cart,message,toEmail,subject}` | user | Full requisition pipeline; creates emailLog + invoice; AI reply; Brevo alert. Returns `{generatedMessage,status,engine}`. |
| `/api/agent/checkout` | POST `{logId}` | user | Requires `status==='approved'` + `finalQuoteAmount`; creates Polar 30% deposit checkout; returns `{checkoutUrl}`. |
| `/api/agent/confirm-payment` | POST `{checkoutId}` | user (ownership) | Verifies Polar status `succeeded` + `metadata.userId===user.id`; calls `handleSuccessfulPayment`. |
| `/api/agent/pay-deposit` | POST `{logId}` | none (no auth!) | Sets status `processing`, fire-and-forget `/api/supplier-sourcing`. |
| `/api/agent/history` | GET | user | List user emailLogs; **self-heals** stale escalation statuses. |
| `/api/agent/suggestions` | POST `{cart,message}` | user | Ollama/Gemini -> 4-6 JSON-string suggestions. |
| `/api/agent/merge-suggestion` | POST `{message,suggestion}` | user | Merge a suggestion into the draft message. |
| `/api/chat` | POST `{messages,threadId}` | user | Continue thread (multi-turn); guardrails; persists JSON message array + status. |
| `/api/products` | GET / POST | GET public; POST admin | GET all products (desc); POST create (unique-constraint -> 409). |
| `/api/products/[id]` | PUT / DELETE | admin | Update/delete catalog product. |
| `/api/admin/orders` | GET / PATCH | admin | GET invoices joined users+emailLogs (status coalesced); PATCH status/totalAmount sync to emailLogs (total override forces `approved`). |
| `/api/admin/orders/send-message` | POST | admin | Append human admin assistant message to thread. |
| `/api/admin/orders/takeover` | POST `{threadId?,invoiceId?,agentOverride}` | admin | Set `agentOverride` (and resolve thread from invoice). |
| `/api/admin/orders/chat-log` | GET `?invoiceId|invoiceNumber` | admin | Fetch thread messages + agentOverride + status. |
| `/api/admin/escalations` | GET | admin | emailLogs where status in review required/review_required, desc. |
| `/api/admin/inventory` | GET / POST | admin | Read/update stock & reorder level. |
| `/api/admin/supplier-quotes` | GET / POST | admin | GET under-review quotes (joined enrichment); POST approve/reject (tx: supplier quote, client log->approved, invoice total, inventory replenish). |
| `/api/admin/process-approval` | POST `{logId,decision,finalText,unitPrice,totalPrice}` | admin | approve->approved / reject->dismissed; multi-turn aware; sync invoice; Brevo notify client. |
| `/api/admin/upload` | POST multipart `file` | admin | 5MB + jpeg/png/webp; upload to Supabase Storage `product-images`; returns public URL. |
| `/api/supplier-sourcing` | POST `{order_id}` | none (internal) | Requires status `processing`; Ollama/Gemini -> vendor PO -> `supplierPayload` + mock tracking ID. |
| `/api/profile/invoices` | GET | user | User invoices joined emailLog status + supplierPayload. |
| `/api/webhook/polar` | POST | signed webhook | `@polar-sh/nextjs` `Webhooks` verifies `POLAR_WEBHOOK_SECRET`; on checkout status `succeeded` -> `handleSuccessfulPayment`. |

### Input validation protocol
- **No schema library.** Handlers do manual guards: presence, `Array.isArray`, `typeof === 'number'`, `Math.max` clamps, and allowed-mime checklists. Error contract is uniform `{ error: string }` with 400/401/403/404/409/500 semantics. Client hooks `throw new Error(data.error)` and surface via `alert()` / sonner-style toast **not** present (alerts are native `alert`).
- Because validation is inline and per-route, adding a field means updating BOTH the handler and the shared `types/index.ts` + consuming hook. Keep the shape mirrored.

### Third-Party Integrations & failure mitigation
| Service | Role | Failure/Rate-limit mitigation |
|---|---|---|
| **Ollama** (localhost:11434) | Primary LLM (stitchhub_v5) | Every call is `try/catch` with `AbortSignal.timeout` (3s chat/outreach, 45s generate); on failure **falls back to Gemini**. If neither works and no `GEMINI_API_KEY`, throw 500. |
| **Gemini** | LLM fallback | Configurable `GEMINI_MODEL`; used for generate, chat, outreach, suggestions. Not rate-limited in app code. |
| **Pinecone** | Vector retrieval | Query pipeline degrades: embedding fail -> skip; describe/query fail or no key -> **structured in-memory catalog scoring fallback** (returns top-K products as spec text). Never blocks the main flow. |
| **Polar.sh** | Payments | Sandbox token; HTTP errors bubble as 500; `handleSuccessfulPayment` is idempotent-ish (checks existing status `'processing'` to avoid double-decrement). |
| **Brevo** | Email | Wrapped in try/catch; failure logs but does NOT fail the request (`console.error`, request still returns success). |
| **Supabase (auth/storage/rt)** | Sessions, file upload, realtime | Storage auto-creates bucket on first failure; browser session refresh via proxy. |
| **Internal `/api/supplier-sourcing`** | Background provenance | Triggered fire-and-forget `fetch(...).catch(console.error)`; **not durable** — a crash after webhook but before sourcing call loses the sourcing activation (accept current behavior). |

### Concurrency / race-condition surfaces (documented — do not "fix" casually)
- `handleSuccessfulPayment` guards double-processing via a status check on `emailLogs` but the check-then-write is **not atomic** (no unique constraint / no `WHERE status=...` in the update). A double webhook could theoretically double-decrement inventory. Mitigation today is the early-return if already `processing`.
- Fire-and-forget `setImmediate` supplier pings and unawaited `/api/supplier-sourcing` fetches run **after the response returns**; assume they may not run.
- `emailLogs.status` has two spellings (`review required` vs `review_required`). Code must normalize via lowercase/includes; new writes prefer space-joined canonical values except where underscore is expected by a downstream filter.

## 8. Unique Project Patterns, Optimizations & Quirks

### Signature pattern: the "StitchHub Business Logic Interceptor"
- Both `/api/agent` and `/api/chat` wrap raw LLM output in a **deterministic rule engine** that overrides the model. It:
  1. Scans for **forbidden/banned customization keywords** (individual names, cut-and-sew, distress, 350 gsm, bamboo, "name", etc.).
  2. Detects **AI hallucination phrases** ("approved but will require manual handling", "does not meet the minimum order requirement") and **false rejections** on valid timelines.
  3. **Extracts days/weeks** from the client prompt (`/(\d+)\s*days/`, `/(\d+)\s*weeks/`) and enforces a **28-day minimum** truth-gate.
  4. Runs a **pre-approval inventory check** (`mapProductToInventoryItem` -> `materials_inventory.stockQuantity < qty` -> lock to review).
  5. Computes pricing deterministically via `calculateTieredPricing`.
  - **Result is a hybrid**: the LLM writes prose, but business truth (timeline/MOQ/inventory/price/status) is decided by code. If you change pricing or guardrails, change the interceptor, NOT the prompt only.
- Escalation detection via `<action>PAUSE</action>` tag or keyword `escalate_to_admin` in model output.

### Multi-turn thread format
- `emailLogs.aiResponseDraft` dual-format: a **plain string** (first turn) OR a **JSON array** `[{role:'user'|'assistant', content, isHuman?}]` (multi-turn). Handlers (`process-approval`, `send-message`, `chat-log`, `useChat`) all attempt `JSON.parse` and gracefully fall back to wrapping plain text. **Preserve this tolerant parse-or-wrap behavior** — a hard parse failure breaks historical threads.

### Self-healing status logic
- `/api/agent/history` scans a user's logs and **repairs stale statuses**: if assistant messages contain escalation keywords but status isn't one of the terminal/progress values, it flips to `review required` or `escalate_to_admin` and persists. This masks data drift but is a deliberate safety net.

### Backend-for-frontend / RLS bypass pattern
- Route handlers use the **Server Supabase client** + Drizzle on `DATABASE_URL` to read across RLS, because Direct/anon keys are not used for DB. Client components only get data via `/api/*`. This is why "query via API, not direct Supabase.from().select" is a hard rule.

### Dual authz (proxy + per-handler)
- Proxy gates at the edge for UX (redirects/401s); every protected handler re-checks `getUser()` + allowlist BEFORE any DB write. **Never remove the in-handler check** in the belief the proxy covers it.

### Optimizations
- **Pinecone layering** avoids expensive trips when offline (embedding timeout 2.5s, describe/query 3s), with catalog fallback guaranteeing a response.
- **React Query staleTime 60s** reduces redundant `/api/products` calls; cross-screen invalidation keys keep order/active-order/history fresh after chat mutations.
- **Fast Ollama timeout on non-critical paths** (chat/outreach/suggestions: 3s) vs generous 45s on the core requisition generate — balances UX latency against fallback reliability.
- **Cart is localStorage-persisted** (survives reload); drawer open state in same store.
- **Insight**: the entire "cache" story is CRL (client), so a full page reload re-fetches. Avoid expensive endpoint-heavy UX (accepts 60s stale windows).

### How to debug the AI pipeline (what to check first)
1. **"engine" response field** tells you Ollama vs `gemini-fallback`. If everything is `gemini-fallback`, Ollama is down (or slow past the 3s chat/45s generate timeout).
2. **`console` logs** are emoji-tagged and go to the Node handler's stdout: `🤖 Querying Local Ollama model (stitchhub-v5)...`, `✅ Response generated by: Local Ollama`, `🌐 Querying Cloud Gemini`, `📬 Brevo transactional alert...`. Grep the server logs for these to trace each stage.
3. **Status vs content mismatches**: if a client sees "approved but will require manual handling" text, that is the interceptor's hallucination guard firing (do not "fix" the wording inside the LLM prompt; it is the code override you likely need to adjust).
4. **A stuck "locked" thread** means `emailLogs.status` is `escalate_to_admin`/`review required` and the global routing gate in `/api/agent` short-circuits to a frozen blocked response. To unstick, an admin sets a terminal/processing status or flips `agentOverride`.
5. **`/api/agent/pay-deposit` has NO auth check** — it is only reached internally after checkout. If auditing security, this is the highest-risk endpoint (any caller can move any thread to `processing`). Flag before hardening.
6. Use `src/db/check_supplier_messages.js` (standalone node script) to inspect `supplier_messages` rows directly against Postgres when the portal chat looks empty.

### Quirks / non-obvious workarounds (do not break)
- `DATABASE_URL` driver: postgres-js with `prepare:false` (Supabase transaction pool). Changing pooling mode may break queries.
- `users.role` exists but authz uses email allowlists only. Do not start honoring `role` for gating without a migration + proxy change, or you'll lock out existing admins.
- Money strings: `invoices.totalAmount` may be `$1,234.56`; sanitize `$`/`,` before arithmetic.
- `emailLogs.metadata.invoiceNumber` is the **joining key** between emailLogs and invoices — there is no FK. Any new "link order to thread" logic must use this jsonb path (or the by-user fallback).
- Product color variants: `getBaseTitle` strips `(Stitch Hub Original)`/`|` suffixes + maps "Matte Black Tumbler"→"Insulated Matte Tumbler"; color ordering via `getColorOrder`. Changing slug/name handling affects the variant selector and cart identity (cart dedupes by `product.title + size`).
- `mapProductToInventoryItem` uses substring rules (hoodie/windbreaker→hoodie, polo, tumbler/flask, etc.) — the inventory narrative is coupled to these 10 canonical names.
- The checkout "host/protocol" is derived from request headers (`x-forwarded-proto`) for building success URLs — correct behind the ngrok dev tunnel; verify on production TLS termination.

## 9. Global State, Forms & UI Conventions

### Client-side state strategy
- **Zustand stores** (all plain `create`, only cart uses `persist`):
  | Store | State | Persisted? |
  |---|---|---|
  | `cart-store` | cart[], drawer open   | YES (`stitchhub_cart` localStorage) |
  | `checkout-form-store` | toEmail, subject, message, submitting/success flags | No |
  | `product-filter-store` | selectedCategory, searchQuery, sortBy, selectedProduct | No |
  | `profile-store` | activeTab, user, logs, invoices, selectedLog, MFA flag, profile fields | No |
  | `supplier-store` | activeRfqs, bids, threads, chat messages, quote/message status | No |
  | `reduced-motion-store` | prefers-reduced-motion (SSR-safe matchMedia) | No |
- **Server data cache**: TanStack React Query (`QueryProvider`, `staleTime:60s`). Query keys in use: `['products']`, `['orders']`, `['active-order']`, `['history']`, plus admin/supplier hooks (`useAdminOrders`, `useAdminProducts`, `useAdminEscalations`, `useSupplierMessages`, etc.) which each wrap `fetch('/api/...')`.
- **URL/searchParam state is minimal** — only `/payment/success` reads `checkout_id`. No nuqs/URL-sync. Filter state lives in memory (Zustand), not the URL.

**Custom hooks (data-access layer) — the map of "who calls which API":**
| Hook | Data source | Role |
|---|---|---|
| `useAuth` | browser Supabase (`signInWithPassword`, `signUp`, MFA) | login/signup/MFA challenge lifecycle |
| `useCheckoutForm` | `/api/agent`, `/api/agent/suggestions`, `/api/agent/merge-suggestion` | cart->draft->submit RFQ; AI suggestion upsell; optimistic message merge |
| `useChat` | `/api/agent/history`, `/api/chat` | thread list + multi-turn send with optimistic UI + cache invalidation |
| `useProducts` | `/api/products` (React Query `['products']`) | catalog + filter pipeline |
| `useProductDetail` / `useProductDetailPage` | `/api/products` + props | detail overlay / PDP with color-variant derivation by base title |
| `useProfile` | browser Supabase + `/api/agent/history` + `/api/profile/invoices` | session, MFA factors, logs, invoices, account/security mutations |
| `useAdminOrders` / `useAdminProducts` / `useAdminEscalations` | `/api/admin/orders`, `/api/admin/products*`, `/api/admin/escalations` | admin grid data |
| `useActiveRequests` / `useSubmittedQuotes` / `useSupplierMessages` | `/api/supplier/*` equivalents | supplier portal data |
| `useNavbar`, `useReducedMotion`, `useLandingFaq`, `useLandingProcess` | local/none | presentational UI state + a11y + landing animation state |

> Pattern to reuse: every React-Query hook pairs a `queryKey` with a `queryFn` that fetches a handler and unwraps `data.success` else `throw data.error`. Additive endpoints should follow the same key discipline so invalidation works.

### Form & validation protocol
- **No React Hook Form / Zod / `useActionState`.** Forms are controlled via Zustand stores + local `useState`, submitted through a `handleSubmit` that does validation manually and calls `fetch('/api/...')`.
- **Auth forms** (`useAuth`): login/signup/toggle, MFA challenge (6-digit TOTP), reset password; errors via `AuthAlert`; state machine `login` <-> `signup` <-> `mfa`.
- **Checkout/profile/security forms**: email change is two-step (edit -> password re-auth -> confirmation link); password change requires re-auth with current password; MFA enroll uses QR + 6-digit verify; profile name uses `user_metadata.name`.
- **Schema sharing**: there is none across client/server (`types/index.ts` is the single shared type module, imported by both sides but not a runtime validator). Keep types centralized in `src/types`.

### Telemetry, logging & error management
- **Logging**: `console.log/error/warn` directly in handlers and hooks; verbose emoji-tagged logs ("🤖", "📬", "🛡️") are the de-facto instrumentation. No Sentry/PostHog/logger lib.
- **Error boundaries**: no `error.tsx`; API errors are JSON `{error}` caught in client hooks and surfaced via native `alert()` or inline state. Payment page has its own error branch.
- **Toast pattern**: none (native `alert`). If you add a toast lib, keep the same error contract (`data.error` string).
- **UI conventions**: "luxury dark" (zinc-950/black bg, white text, `#d4af37` gold accents), `font-display` headings, `font-mono` for labels/IDs/status, `backdrop-blur` glass surfaces, custom animations in `styles/animations.css`, `GoldenButton`, `StatusBadge` (status color coding), `AdminPageHeader`, `GlassCard`, `EmptyState`, `LoadingSpinner`, `DancingDots`.

## 10. Non-Negotiable Architectural Rules & Anti-Patterns

Future AI agents MUST treat these as hard constraints:

1. **All data reads/writes go through Route Handlers under `/api/*` — never call `db` or Supabase directly from a Client Component.** Client components may only use `fetch` to `/api/*` or the Supabase **browser** client for auth/storage/realtime. Direct `supabase.from('...').select()` for domain data is forbidden (RLS bypass is server-side-only).
2. **Never remove or relax the in-handler authz re-check** (`getUser()` + `isAdmin`/`isSupplier` allowlist). The `proxy.ts` gate is UX-only; handlers are the security boundary.
3. **Keep the email-allowlist authz model.** Do not silently switch to `users.role` for gating. If you change it, update `proxy.ts`, every handler, and both allowlist utils, and migrate data.
4. **Never break the emailLogs↔invoices join contract** (`emailLogs.metadata->>'invoiceNumber' = invoices.invoiceNumber`). Add an index on that jsonb path if you make it hot, but preserve the join semantics and the by-user/order-by-createdAt fallback.
5. **Treat `emailLogs.aiResponseDraft` as dual-format (plain string OR JSON array).** Any new reader must `JSON.parse` and degrade gracefully to `[{role:'user',...},{role:'assistant',...}]`. Never `JSON.parse` without try/catch.
6. **Preserve the `setImmediate` fire-and-forget and unawaited-`fetch` background patterns as-is.** They are deliberately best-effort. Do not wrap them with durable guarantees, and do not `await` them, which would block responses.
7. **Never strip the "Business Logic Interceptor" guardrails** (banned-keyword scan, 28-day timeline gate, inventory pre-check, `calculateTieredPricing`). These are the source of business truth; the LLM is only the prose author.
8. **Normalize `emailLogs.status` spellings (`review required` vs `review_required`, `draft sourcing` vs `draft_sourcing`, `escalate_to_admin`) before comparisons.** New code should prefer canonical space-joined values except where an underscore-dependent filter exists.
9. **Money is stored inconsistently (numeric vs `$`-prefixed text) across `emailLogs` and `invoices` — sanitize before arithmetic.** Never mix them without parsing.
10. **Every `/api/*` handler must return the uniform `{ error: string }` + correct HTTP status contract** (400/401/403/404/409/500). Client hooks throw `data.error`.
11. **Keep the whole page graph as Client Components** (CSR-first). Do not add Server Actions / `use cache` / ISR / `generateStaticParams` / `export const runtime` without explicit approval — the stack is built around client fetching + Node runtime handlers.
12. **Never call the LLM/storage/payment without the documented try/catch + fallback layering** (Ollama → Gemini; Pinecone → catalog; storage → bucket-autocreate). A new integration must not be able to crash the main flow.
13. **Do not add a brand-new hard dependency without reading `node_modules/next/dist/docs/01-app`** for the Next 16 API surface (AGENTS.md mandates this). Nest.js 16 renamed middleware→proxy; server/client async APIs differ.
14. **Do not read/write `.env` or commit secrets.** Secrets are injected via environment; `.env` is git-ignored.
15. **Keep `users` table authoritative via the Supabase auth trigger** — never insert/update user identity in a way that diverges from `auth.users`.
16. **Suspense boundary**: any page using `useSearchParams` must wrap its consumer in `<Suspense>` (see `/payment/success`) to avoid CSR bailout errors under App Router.

## 11. Feature Development Recipes (AI Agent Playbooks)

### Recipe A — Creating a New Feature Page (RSC layout, streaming, leaf client component)
1. **Decide the route**; create `src/app/<segment>/page.tsx` mirroring existing page conventions (import `"use client"` at top since all pages are client components; do NOT create a Server Component page unless you also move its data to a handler).
2. **Add data access**: create/extend a hook in `src/hooks/` that owns the query (React Query `useQuery` with a `queryKey` + `queryFn` that `fetch('/api/...')`), OR a Zustand store in `src/stores/` for UI-only state. See `useProducts` + `product-filter-store` as the canonical split.
3. **Build the Route Handler** (`src/app/api/<segment>/route.ts`) that owns all server work: `createClient()` (server supabase) → authz → validate body inline → Drizzle query/write → return `{success?, data}` or `{error}`. Add the handler's protected path to `proxy.ts` matcher if it needs a gate.
4. **Compose the page** from presentational `src/components/*` atoms using the "luxury dark" convention (zinc/black + `#d4af37`), `font-display`/`font-mono` labels, `StatusBadge`/`GlassCard`/`GoldButton` for recurring UI.
5. **Set metadata**: for the root layout only; add/verify `Metadata.export` in `src/app/layout.tsx`. Add the new route to the routing table in this file (Section 6).
6. **Wire navigation**: add Links in the relevant layout sidebar/nav (`Navbar`, `admin/layout`). Lint with `npm run lint`.
7. **Definition of Done**: (a) route renders with correct dark-lux theme; (b) all data flows through a handler (no direct client DB); (c) loading/empty/error states present; (d) `proxy.ts` matcher updated if the route is protected; (e) this file's routing table (Section 6) appended; (f) `npm run lint` clean.

### Recipe B — Adding a Mutation Flow (DB schema → handler → optimistic UI)
1. **Schema**: add the column/table to `src/db/schema.ts`, then `npm run db:generate` + `npm run db:migrate` (drizzle-kit). Keep the existing `emailLogs`/`invoices`/jsonb conventions if the entity relates to an order.
2. **Server handler**: add `POST` (or PATCH) to the appropriate `/api/<group>/route.ts` (or a new subfolder route). Do inline validation (presence/type/clamp), `getUser()` + allowlist check, perform the Drizzle write; use `db.transaction` when multiple tables must stay consistent (see `/api/admin/supplier-quotes`).
3. **Business rules**: if the mutation alters order status, enforce transition validity per Section 5 lifecycle (e.g., checkout needs `approved`). If prices are involved, recompute via `calculateTieredPricing`, not client-passed numbers.
4. **Client**: in the consuming hook, add **optimistic UI** — update the Zustand/Query cache immediately, then `fetch` the handler, then reconcile on success or roll back on `data.error` (see `useChat.sendMessage`). 
5. **Invalidation**: call `queryClient.invalidateQueries` on affected keys (`['orders']`, `['active-order']`, `['history']`, any admin key) after the mutation so dependent screens refresh.
6. **Error surfacing**: `throw new Error(data.error)`, catch it, and notify via the project's `alert()`/branch pattern. Keep the `{error}` contract.
7. **Transactional integrity**: if the mutation spans multiple tables (`emailLogs` + `invoices` + `supplier_quotes` + `materials_inventory`), wrap the writes in `db.transaction(async (tx) => ...)` exactly like `/api/admin/supplier-quotes`. Never update the emailLogs↔invoice linkage by anything other than the `metadata->>'invoiceNumber'` jsonb path (or the by-user/orderBy-createdAt fallback).
8. **Migration hygiene**: `db:generate` writes a numbered migration SQL + `meta/*_snapshot.json`; run `db:migrate` against the target DB. Two forward migrations touching the same table must not conflict — rebase by reviewing `src/db/migrations/meta/_journal.json`.
9. **Verification**: exercise the optimistic path (observable immediate UI), the error path (undo / alert), and the invalidation path (dependent screen refreshes). Confirm canonical status + money-string invariants hold after the mutation.

### Recipe C — Integrating an External API / Webhook
1. **Client request path** (user-initiated): create a handler under `/api/<feature>/route.ts`; auth + validate; call the external SDK/env+bearer; wrap in try/catch with a **fallback** (mirror Ollama→Gemini, Pinecone→catalog) so the primary flow degrades gracefully; map external errors to `{error}` + 500; never fail the request silently on optional side services (email).
2. **Webhook path** (external→app): create `src/app/api/webhook/<provider>/route.ts`. Verify authenticity FIRST using the provider's verifier (Polar uses `@polar-sh/nextjs` `Webhooks` with `webhookSecret`; do not hand-roll). Keep the handler lightweight; route side-effects through a shared lib (`lib/polar-utils.ts` `handleSuccessfulPayment`).
3. **Idempotency/safety**: guard re-entry (check target record status before mutating — `handleSuccessfulPayment` returns if already `processing`). If the external event maps to a status transition, ensure it validates against the lifecycle.
4. **Background activation**: if the webhook must trigger downstream work (e.g., supplier sourcing), use the fire-and-forget `fetch('/api/supplier-sourcing').catch(console.error)` pattern (or `setImmediate`) — never `await` it inside the webhook response.
5. **Secrets**: read from environment (`.env`/`.env.example` documents the full required set: DATABASE_URL, SUPABASE, BREVO, POLAR, GEMINI, PINECONE). Add any new secret to `.env.example` (no real values). Never log tokens.
6. **Signature-first**: always verify webhooks BEFORE any side-effect (the Polar `Webhooks` wrapper does this). If adapting for a new provider, use its canonical verifier (HMAC/secret) — never trust `x-*` headers without checking the secret.
7. **Contract parity**: keep the webhook path and the client `confirm-payment` path converging on ONE shared side-effect function (`lib/polar-utils.ts`) so behavior can't drift between "webhook fired" and "client polled".
8. **Document**: update this file's Third-Party table (Section 7) and the integration map.

---
*This document is derived directly from the codebase at commit-time of writing and the bundled `node_modules/next/dist/docs/` (Next 16). When Next.js behavior is in question, consult those local docs — they are authoritative for this version.*
