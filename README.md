# Stitch Hub

**Intelligent B2B custom apparel sourcing — powered by an agentic AI logistics engine.**

Stitch Hub is a premium B2B merchandise platform purpose-built for corporate sourcing teams, creative directors, and brand strategists who demand zero tolerance for color inconsistency, delayed timelines, or opaque procurement pipelines.

---

## ✦ Overview

This repository contains the full-stack landing page for the Stitch Hub platform. The design is built around a premium **dark-luxury** aesthetic — high-contrast black and gold palette, glassmorphic cards, studio-grade product photography, and fluid micro-interactions — all engineered to reflect the caliber of the operational engine behind it.

> *"We handle the complex material physics so you can focus on your legacy."*

---

## ✦ Landing Page Sections

| # | Section | Description |
|---|---------|-------------|
| 1 | **Hero** | Full-bleed banner with metallic shimmering CTA button |
| 2 | **AI Advantage** | Three glassmorphic benefit cards — Predictive Engine, Escalation Protocol, Procurement |
| 3 | **B2B Process Flow** | Interactive 4-step sourcing timeline with live selector panels |
| 4 | **Why Choose Us** | High-contrast product feature reveals with image zoom transitions |
| 5 | **Product Lineup** | 4-column responsive showcase grid with hover gradients |
| 6 | **Client Testimonials** | Verified B2B corporate reviews with gold star ratings |
| 7 | **FAQ** | State-driven interactive accordion panels |
| 8 | **Footer CTA** | Legacy-focused conversion section with clean brand navigation |

---

## ✦ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript |
| **Database** | Supabase PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) |
| **Authentication** | [Supabase Auth](https://supabase.com/docs/guides/auth) (replaced NextAuth Credentials provider) |
| **Styling** | Tailwind CSS v4 |
| **Images** | Optimized WebP images (q=85) for LCP and visual performance |
| **State** | Zustand (global cart and filter state) |
| **Inference** | Local custom Ollama B2B reasoning agent |

---

## ✦ Getting Started

**Prerequisites**: Node.js 18+, npm, and a Supabase project.

```bash
# 1. Clone the repository
git clone https://github.com/1ewig/stitch-hub.git
# 2. Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in the active environment variables:
```bash
cp .env.example .env
```
Provide the `DATABASE_URL` (direct PostgreSQL connection) and Supabase credentials:
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Database Setup & Triggers
Run Drizzle migrations to setup the tables and register the Supabase Auth user synchronization triggers:
```bash
npm run db:migrate
```

### 5. Running the Application
```bash
# Start development server
npm run dev

# Build for production
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✦ Database User Synchronization (Supabase Auth)
The authentication system synchronizes registered users from Supabase Auth (`auth.users`) to the public `user` table automatically using Postgres triggers.
To handle duplicate testing scenarios and dashboard deletions:
* An `AFTER INSERT` trigger (`on_auth_user_created`) inserts or overrides user profiles in the public `user` table.
* An `AFTER DELETE` trigger (`on_auth_user_deleted`) automatically cleans up public user records and cascaded data on dashboard deletion.

---

## ✦ License

This project is private. All product imagery and copy is proprietary to Stitch Hub B2B.

---

<div align="center">
  <strong>STITCH HUB<span style="color:#d4af37">.</span></strong><br/>
  <sub>Intelligent Design. Distinctive Presence. Ascend Your Brand.</sub>
</div>
