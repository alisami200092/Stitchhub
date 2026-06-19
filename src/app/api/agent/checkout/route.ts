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
