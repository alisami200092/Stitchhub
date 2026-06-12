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
    const { threadId, invoiceId, message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "A non-empty message string is required." }, { status: 400 });
    }

    let targetThreadId = threadId;

    // Resolve threadId from invoiceId if not provided directly
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

    // Retrieve active thread
    const [logRecord] = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.id, targetThreadId))
      .limit(1);

    if (!logRecord) {
      return NextResponse.json({ error: "Thread log record not found." }, { status: 404 });
    }

    // Parse existing messages
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

    // Append human admin reply as assistant
    const updatedMessages = [...messages, { role: "assistant" as const, content: message, isHuman: true }];

    // Persist thread updates
    await db
      .update(emailLogs)
      .set({
        aiResponseDraft: JSON.stringify(updatedMessages)
      })
      .where(eq(emailLogs.id, targetThreadId));

    return NextResponse.json({ success: true, messages: updatedMessages });

  } catch (error) {
    console.error("Failed to append manual override response:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
