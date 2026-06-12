import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs, invoices } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { eq, desc, sql } from "drizzle-orm";
import { isAdmin } from "@/utils/admin";

export async function POST(req: Request) {
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
    const { threadId, invoiceId, agentOverride } = body;

    if (agentOverride === undefined) {
      return NextResponse.json({ error: "agentOverride (boolean) is required." }, { status: 400 });
    }

    let targetThreadId = threadId;

    // If no threadId was passed but an invoiceId was provided, resolve the threadId
    if (!targetThreadId && invoiceId) {
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
      if (invoice) {
        const logsByInvoice = await db
          .select({ id: emailLogs.id })
          .from(emailLogs)
          .where(sql`${emailLogs.metadata}->>'invoiceNumber' = ${invoice.invoiceNumber}`)
          .limit(1);

        if (logsByInvoice.length > 0) {
          targetThreadId = logsByInvoice[0].id;
        } else if (invoice.userId) {
          const logsByUser = await db
            .select({ id: emailLogs.id })
            .from(emailLogs)
            .where(eq(emailLogs.userId, invoice.userId))
            .orderBy(desc(emailLogs.createdAt))
            .limit(1);

          if (logsByUser.length > 0) {
            targetThreadId = logsByUser[0].id;
          }
        }
      }
    }

    if (!targetThreadId) {
      return NextResponse.json({ error: "Target thread could not be identified." }, { status: 404 });
    }

    await db
      .update(emailLogs)
      .set({ agentOverride })
      .where(eq(emailLogs.id, targetThreadId));

    return NextResponse.json({ success: true, agentOverride });

  } catch (error) {
    console.error("Failed to toggle takeover override:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
