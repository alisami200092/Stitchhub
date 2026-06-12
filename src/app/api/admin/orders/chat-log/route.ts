import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs, invoices } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { eq, desc, sql } from "drizzle-orm";
import { isAdmin } from "@/utils/admin";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");
    const invoiceNumber = searchParams.get("invoiceNumber");

    if (!invoiceId && !invoiceNumber) {
      return NextResponse.json({ error: "invoiceId or invoiceNumber is required." }, { status: 400 });
    }

    // 1. Fetch invoice to ensure we have the correct user reference
    let invoice = null;
    if (invoiceId) {
      const results = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
      if (results.length > 0) invoice = results[0];
    } else if (invoiceNumber) {
      const results = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber)).limit(1);
      if (results.length > 0) invoice = results[0];
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // 2. Fetch the corresponding log thread
    let logRecord = null;
    const logsByInvoice = await db
      .select()
      .from(emailLogs)
      .where(sql`${emailLogs.metadata}->>'invoiceNumber' = ${invoice.invoiceNumber}`)
      .limit(1);

    if (logsByInvoice.length > 0) {
      logRecord = logsByInvoice[0];
    } else if (invoice.userId) {
      // Fallback: match by userId
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

    if (!logRecord) {
      return NextResponse.json({
        success: true,
        messages: [],
        threadId: null,
        agentOverride: false,
        status: "draft_sourcing",
      });
    }

    // 3. Parse conversation messages
    let messages: any[] = [];
    if (logRecord.aiResponseDraft) {
      try {
        const parsed = JSON.parse(logRecord.aiResponseDraft);
        if (Array.isArray(parsed)) {
          messages = parsed;
        } else {
          throw new Error();
        }
      } catch {
        messages = [
          { role: "user", content: logRecord.body || "" },
          { role: "assistant", content: logRecord.aiResponseDraft || "" }
        ];
      }
    } else {
      messages = [
        { role: "user", content: logRecord.body || "" }
      ];
    }

    return NextResponse.json({
      success: true,
      messages,
      threadId: logRecord.id,
      agentOverride: logRecord.agentOverride,
      status: logRecord.status,
    });

  } catch (error) {
    console.error("Failed to fetch chat logs:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
