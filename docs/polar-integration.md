# Polar.sh Payment Provider Integration — StitchHub

## Overview

This document documents the complete Polar.sh payment provider integration for the StitchHub B2B sourcing platform. The integration replaces the original mock "pay deposit" flow with real payment processing via Polar.sh's sandbox environment.

### Architecture

```
User submits order → AI generates quote → Auto-approved (testing) or Admin approves
  → POST /api/agent/checkout → Creates Polar.sh checkout session with 30% deposit
  → User redirected to Polar.sh hosted checkout → Pays with test card
  → Redirected to /payment/success
  → POST /api/agent/confirm-payment → Verifies checkout via Polar API
  → Updates DB: invoice=paid, emailLog=sourcing_active
  → Triggers supplier sourcing agent
```

## Files Created / Modified

### New Files

| File | Purpose |
|------|---------|
| `src/lib/polar.ts` | Polar API client (sandbox) + raw fetch helpers |
| `src/lib/polar-utils.ts` | Shared `handleSuccessfulPayment()` for webhooks + confirm-payment |
| `src/app/api/agent/checkout/route.ts` | Creates Polar.sh checkout sessions |
| `src/app/api/agent/confirm-payment/route.ts` | Verifies payment + updates DB (local dev, no webhook needed) |
| `src/app/api/webhook/polar/route.ts` | Polar.sh webhook handler (for deployed environments) |
| `src/app/payment/success/page.tsx` | Post-payment confirmation page |

### Modified Files

| File | Change |
|------|--------|
| `package.json` | Added `@polar-sh/sdk`, `@polar-sh/nextjs` |
| `.env.example` | Added `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID` |
| `src/components/profile/InboxPanel.tsx` | Updated `handlePayDeposit()` to call `/api/agent/checkout` and redirect |
| `src/app/api/agent/route.ts` | Added auto-approve + quote calculation for testing |

### Deleted Files

| File | Reason |
|------|--------|
| `src/app/api/agent/pay-deposit/route.ts` | Mock route replaced by real checkout flow |

---

## Step-by-Step Setup

### 1. Polar.sh Sandbox Account

Go to [sandbox.polar.sh](https://sandbox.polar.sh) and create an account + organization.

### 2. Create a Product

- **Products** → **Create Product**
- Name: `Deposit Payment`
- Price: set any placeholder (e.g. $1.00 fixed) — the real price is overridden per checkout
- Click **Save**
- Copy the **Product ID** (`prod_...`) from the product page

### 3. Create an Access Token

- **Settings** → **Tokens** → **Create Token**
- Name: `StitchHub Dev`
- Scopes: `checkouts:read`, `checkouts:write`
- Copy the token (`polar_at_...`)

### 4. Install Dependencies

```bash
bun add @polar-sh/sdk @polar-sh/nextjs
```

### 5. Environment Variables

Add to `.env.local`:

```
POLAR_ACCESS_TOKEN=polar_at_...
POLAR_PRODUCT_ID=prod_...
POLAR_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Code Implementation

#### `src/lib/polar.ts` — Polar API Client

```typescript
import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  server: "sandbox",
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
});

const POLAR_API = "https://sandbox-api.polar.sh/v1";

async function polarFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${POLAR_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Polar API error (${res.status}): ${err}`);
  }
  return res.json();
}

export async function createCheckoutSession(payload: Record<string, unknown>) {
  return polarFetch("/checkouts/", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<{
    url: string;
    id: string;
    status: string;
    metadata?: Record<string, string | number | boolean | undefined>;
  }>;
}

export async function getCheckoutSession(id: string) {
  return polarFetch(`/checkouts/${id}`) as Promise<{
    id: string;
    status: string;
    metadata?: Record<string, string | number | boolean | undefined>;
  }>;
}
```

**Note:** Raw `fetch()` is used instead of the SDK's `polar.checkouts.create()` because Bun has a compatibility issue with the SDK's internal `new Request()` construction (`expected non-null body source` error).

#### `src/lib/polar-utils.ts` — Shared Payment Handler

```typescript
import { db } from "@/db";
import { emailLogs, invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface CheckoutData {
  id: string;
  status?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

export async function handleSuccessfulPayment(checkout: CheckoutData) {
  if (checkout.status && checkout.status !== "succeeded") return;

  const logId = checkout.metadata?.logId;
  const userId = checkout.metadata?.userId;
  if (!logId || !userId) return;

  const logIdStr = String(logId);
  const userIdStr = String(userId);

  const existing = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.id, logIdStr))
    .limit(1);

  if (existing.length === 0) return;
  if (existing[0].status === "sourcing_active") return;

  const currentMetadata = existing[0].metadata ?? {};
  if (typeof currentMetadata === "object") {
    (currentMetadata as Record<string, unknown>).polarCheckoutId = checkout.id;
  }

  await db
    .update(emailLogs)
    .set({
      status: "sourcing_active",
      metadata: currentMetadata,
    })
    .where(eq(emailLogs.id, logIdStr));

  const invoiceNumber = checkout.metadata?.invoiceNumber;
  if (invoiceNumber) {
    await db
      .update(invoices)
      .set({ status: "paid" })
      .where(eq(invoices.invoiceNumber, String(invoiceNumber)));
  } else {
    const userInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userIdStr))
      .orderBy(desc(invoices.createdAt))
      .limit(1);

    if (userInvoices.length > 0) {
      await db
        .update(invoices)
        .set({ status: "paid" })
        .where(eq(invoices.id, userInvoices[0].id));
    }
  }

  fetch(`${SITE_URL}/api/supplier-sourcing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: logIdStr }),
  }).catch((err: unknown) => {
    console.error("Background supplier agent activation failure:", err);
  });
}
```

#### `src/app/api/agent/checkout/route.ts` — Create Checkout Session

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { createCheckoutSession } from "@/lib/polar";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { logId } = await req.json();

    if (!logId) {
      return NextResponse.json({ error: "Missing required logId." }, { status: 400 });
    }

    const [log] = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.id, logId))
      .limit(1);

    if (!log) {
      return NextResponse.json({ error: "Log thread not found." }, { status: 404 });
    }

    if (log.status !== "approved") {
      return NextResponse.json({ error: "Order is not in approved status." }, { status: 400 });
    }

    if (!log.finalQuoteAmount) {
      return NextResponse.json({ error: "No final quote amount set." }, { status: 400 });
    }

    const [customer] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const quoteAmount = Number(log.finalQuoteAmount);
    // 30% deposit — change to quoteAmount * 100 for full amount
    const depositCents = Math.round(quoteAmount * 0.30 * 100);

    const metadata: Record<string, string> = {
      logId: log.id,
      userId: user.id,
    };
    if (log.metadata && typeof log.metadata === "object" && "invoiceNumber" in log.metadata) {
      metadata.invoiceNumber = String(log.metadata.invoiceNumber);
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const checkout = await createCheckoutSession({
      products: [process.env.POLAR_PRODUCT_ID!],
      prices: {
        [process.env.POLAR_PRODUCT_ID!]: [
          {
            amount_type: "fixed",
            price_amount: depositCents,
            price_currency: "usd",
          },
        ],
      },
      metadata,
      external_customer_id: user.id,
      customer_name: customer?.name ?? undefined,
      customer_email: customer?.email ?? undefined,
      success_url: `${baseUrl}/payment/success?checkout_id={CHECKOUT_ID}`,
      return_url: `${baseUrl}/profile`,
    });

    return NextResponse.json({ checkoutUrl: checkout.url });

  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
```

#### `src/app/api/agent/confirm-payment/route.ts` — Confirm Payment

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCheckoutSession } from "@/lib/polar";
import { handleSuccessfulPayment } from "@/lib/polar-utils";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { checkoutId } = await req.json();
    if (!checkoutId) {
      return NextResponse.json({ error: "Missing checkoutId." }, { status: 400 });
    }

    const checkout = await getCheckoutSession(checkoutId);

    if (checkout.status !== "succeeded") {
      return NextResponse.json({ error: "Checkout has not been completed." }, { status: 400 });
    }

    if (String(checkout.metadata?.userId ?? "") !== user.id) {
      return NextResponse.json({ error: "Checkout does not belong to this user." }, { status: 403 });
    }

    await handleSuccessfulPayment(checkout);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json({ error: "Failed to confirm payment." }, { status: 500 });
  }
}
```

#### `src/app/api/webhook/polar/route.ts` — Webhook Handler

```typescript
import { Webhooks } from "@polar-sh/nextjs";
import { handleSuccessfulPayment } from "@/lib/polar-utils";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onCheckoutUpdated: async (payload) => {
    const { data: checkout } = payload as {
      data: {
        id: string;
        status: string;
        metadata?: Record<string, string | number | boolean | undefined>;
      };
    };

    if (checkout.status !== "succeeded") return;

    await handleSuccessfulPayment(checkout);
  },
});
```

#### `src/app/payment/success/page.tsx` — Success Page

```typescript
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const [status, setStatus] = useState<"confirming" | "confirmed" | "error">("confirming");

  useEffect(() => {
    if (!checkoutId) {
      setStatus("error");
      return;
    }

    fetch("/api/agent/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("confirmed");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [checkoutId]);

  return (
    <div className="min-h-screen w-full bg-[#090a0f] text-zinc-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "confirming" && (
          <div className="space-y-4">
            <span className="h-12 w-12 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin inline-block" />
            <p className="text-sm text-zinc-400 font-mono">Confirming your payment...</p>
          </div>
        )}

        {status === "confirmed" && (
          <>
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white font-mono">Payment Confirmed</h1>
              <p className="text-sm text-zinc-400 font-mono leading-relaxed">
                Your deposit payment has been verified. The Supplier AI Procurement Agent is now sourcing materials.
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-block w-full py-2.5 bg-[#d4af37] hover:bg-[#bfa032] text-[#090a0f] rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] text-center"
            >
              Return to Dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white font-mono">Payment Pending</h1>
              <p className="text-sm text-zinc-400 font-mono leading-relaxed">
                We're still waiting for confirmation. Return to your dashboard to check status.
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-block w-full py-2.5 bg-[#d4af37] hover:bg-[#bfa032] text-[#090a0f] rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] text-center"
            >
              Return to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#090a0f] flex items-center justify-center text-zinc-400 font-mono text-xs">
        <span className="h-4 w-4 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mr-3" />
        Loading...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
```

#### `src/components/profile/InboxPanel.tsx` — Updated Pay Button

Replace the `handlePayDeposit` function:

```typescript
const handlePayDeposit = async (logId: string) => {
  setIsPaying(true);
  try {
    const res = await fetch("/api/agent/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logId }),
    });
    const data = await res.json();
    if (res.ok && data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      alert(data.error || "Failed to create checkout session.");
    }
  } catch (e) {
    console.error("Checkout error:", e);
    alert("Failed to initiate payment checkout.");
  } finally {
    setIsPaying(false);
  }
};
```

#### `src/app/api/agent/route.ts` — Auto-Approve for Testing (Optional)

For testing without an admin, add this block after the escalation detection logic (after line 142):

```typescript
/* ── Auto-approve for testing — bypass admin review, set quote from cart ── */
logStatus = "approved";
const quoteTotal = cart.reduce(
  (sum: number, item: { product: { price: number }; quantity: number }) =>
    sum + item.product.price * item.quantity,
  0
);
const finalQuoteAmount = quoteTotal.toFixed(2);
```

Then include `finalQuoteAmount` in the `emailLogs` insert:

```typescript
await db.insert(emailLogs).values({
  userId: currentUserId,
  subject: subject || "Bulk Apparel Production Inquiry",
  body: message || "",
  status: logStatus,
  finalQuoteAmount,
  aiResponseDraft: generatedAiResponse,
  metadata: { recipientEmail: toEmail, itemCount: cart.length, invoiceNumber: generatedInvoiceNumber },
});
```

---

## Testing

### Local Development (no webhook tunnel needed)

1. Start the dev server: `bun run dev`
2. Add products to cart → submit sourcing request
3. AI generates quote → auto-approved → "Proceed to Secure Deposit Payment" appears
4. Click the button → redirected to Polar.sh sandbox checkout page
5. Pay with test card: `4242 4242 4242 4242` (any future date, any CVC)
6. Redirected to `http://localhost:3000/payment/success`
7. Page calls `POST /api/agent/confirm-payment` → payment verified via Polar API
8. DB updated → supplier sourcing agent triggered

### Using Webhooks (deployed/preview environments)

For production or deployed previews, configure the webhook in Polar sandbox:
1. **Settings** → **Webhooks** → **Add Endpoint**
2. URL: `https://your-site.com/api/webhook/polar`
3. Format: **Raw**
4. Events: select **checkout.updated**
5. Save → copy `POLAR_WEBHOOK_SECRET` to `.env.local`

---

## Architecture Notes

### Dual Payment Confirmation

The system has two paths for confirming payment:

| Path | Triggered By | Use Case |
|------|-------------|----------|
| **confirm-payment** | Success page on mount | Local dev, immediate feedback |
| **Webhook** | Polar.sh server event | Production, reliable async delivery |

Both call the same `handleSuccessfulPayment()` function, so they're idempotent — if both fire, the second call exits early due to the `status === "sourcing_active"` check.

### Ad-Hoc Pricing

Polar.sh's ad-hoc pricing overrides the product's catalog price per checkout. The `prices` field in the checkout session maps a product ID to a list of price definitions. Only the `amount_type: "fixed"` type is used here.

### Price Calculation

```typescript
const quoteAmount = Number(log.finalQuoteAmount);   // e.g. 799.00
const depositCents = Math.round(quoteAmount * 0.30 * 100); // 23970 (30% deposit in cents)
```

To charge the full amount instead of 30%:

```typescript
const depositCents = Math.round(quoteAmount * 100); // 79900 (full amount in cents)
```

### Metadata Convention

Polar.sh metadata is passed as a flat key-value object. StitchHub stores:

- `logId` — emailLogs UUID for DB lookup
- `userId` — auth user ID for ownership verification
- `invoiceNumber` — for cross-referencing invoices

After payment, `polarCheckoutId` is appended to `emailLogs.metadata` via `handleSuccessfulPayment()`.

### Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| `POLAR_ACCESS_TOKEN` | Yes | Polar sandbox Settings → Tokens |
| `POLAR_PRODUCT_ID` | Yes | Polar sandbox Products → Copy ID |
| `POLAR_WEBHOOK_SECRET` | Deploy only | Polar sandbox Settings → Webhooks |
| `NEXT_PUBLIC_SITE_URL` | No (defaults to localhost:3000) | Your app URL |

### Bun Compatibility Note

The `@polar-sh/sdk` uses Node.js `new Request()` internally which can crash with Bun's fetch implementation. All checkout operations use raw `fetch()` calls to `https://sandbox-api.polar.sh/v1/*` as a workaround. The SDK is still installed and its TypeScript types are used, but runtime calls bypass it.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `ConnectionError: Unable to make request` | Bun/SDK fetch compatibility | Use raw `fetch()` (already done) |
| Polar shows wrong amount | `depositCents` calculation | Check `quoteAmount × 0.30 × 100` logic |
| Payment not confirmed | `POLAR_ACCESS_TOKEN` not set | Add to `.env.local` |
| Checkout returns 422 | `POLAR_PRODUCT_ID` invalid | Verify product exists in sandbox |
| `checkout_id` param missing on success URL | Polar template not applied | Ensure `{CHECKOUT_ID}` is in the URL (Polar replaces it) |
