import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { invoices, emailLogs } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Access Denied." }, { status: 401 });
  }

  try {
    // Select all invoices for the current user and join with emailLog status if available
    const userInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: invoices.totalAmount,
        status: sql<string>`coalesce(${emailLogs.status}, ${invoices.status})`,
        itemsSnapshot: invoices.itemsSnapshot,
        createdAt: invoices.createdAt,
        supplierPayload: emailLogs.supplierPayload,
      })
      .from(invoices)
      .leftJoin(
        emailLogs,
        sql`${emailLogs.metadata}->>'invoiceNumber' = ${invoices.invoiceNumber}`
      )
      .where(eq(invoices.userId, user.id))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json({ invoices: userInvoices });
  } catch (error) {
    console.error("Failed to load user invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices." }, { status: 500 });
  }
}
