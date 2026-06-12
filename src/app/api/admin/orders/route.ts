import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, users, emailLogs } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { eq, desc, sql } from "drizzle-orm";
import { isAdmin } from "@/utils/admin";

/**
 * GET /api/admin/orders
 * Admin-only route to retrieve all invoices/orders joined with user profiles.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    // Query invoices joined with users
    const orders = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        itemsSnapshot: invoices.itemsSnapshot,
        createdAt: invoices.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(invoices)
      .leftJoin(users, eq(invoices.userId, users.id))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders
 * Admin-only route to update status or totalAmount of an order/invoice.
 */
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, totalAmount } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    // Fetch the invoice details first to get invoiceNumber and userId
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const updateData: Partial<typeof invoices.$inferInsert> = {};
    if (status !== undefined) updateData.status = status;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;

    await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id));

    // If totalAmount is updated, sync it with the email logs' finalQuoteAmount and set status to approved
    if (totalAmount !== undefined) {
      let logRecord = null;

      // 1. Try to find the log thread matching the invoiceNumber inside metadata
      const logsByInvoice = await db
        .select()
        .from(emailLogs)
        .where(sql`${emailLogs.metadata}->>'invoiceNumber' = ${invoice.invoiceNumber}`)
        .limit(1);

      if (logsByInvoice.length > 0) {
        logRecord = logsByInvoice[0];
      } else if (invoice.userId) {
        // 2. Fallback to the latest log thread for this user
        const logsByUser = await db
          .select()
          .from(emailLogs)
          .where(eq(emailLogs.userId, invoice.userId))
          .orderBy(desc(emailLogs.createdAt))
          .limit(1);

        if (logsByUser.length > 0) {
          logRecord = logsByUser[0];
        }
      }

      if (logRecord) {
        const numericAmount = totalAmount.replace(/[^0-9.]/g, "");
        await db
          .update(emailLogs)
          .set({
            finalQuoteAmount: numericAmount || "0.00",
            status: "approved"
          })
          .where(eq(emailLogs.id, logRecord.id));
      }
    }

    return NextResponse.json({ success: true, message: "Order updated successfully." });
  } catch (error) {
    console.error("Failed to update admin order:", error);
    return NextResponse.json({ error: "Failed to update order details." }, { status: 500 });
  }
}
