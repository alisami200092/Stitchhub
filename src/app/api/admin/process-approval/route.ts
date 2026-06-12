import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/admin";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BrevoClient } from '@getbrevo/brevo';

export async function POST(req: Request) {
  // 1. 🛡️ Security Check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Access Denied. Unauthorized Node." }, { status: 403 });
  }

  try {
    const { logId, decision, finalText, finalQuoteAmount } = await req.json();

    if (!logId) {
      return NextResponse.json({ error: "Missing Target Log Identifier." }, { status: 400 });
    }

    // Determine the next architectural status state based on the button clicked
    const nextStatus = decision === "approve" ? "approved" : "dismissed";

    // Fetch current record to check if it's a multi-turn conversation
    const currentRecords = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.id, logId));

    if (currentRecords.length === 0) {
      return NextResponse.json({ error: "Target transaction record not found." }, { status: 404 });
    }

    const currentRecord = currentRecords[0];
    let finalDraftValue = finalText;

    let isMultiTurn = false;

    try {
      const parsed = JSON.parse(currentRecord.aiResponseDraft || "");
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].role) {
        isMultiTurn = true;
        // Multi-turn format: append the admin's message as an assistant message
        parsed.push({ role: "assistant" as const, content: finalText, isHuman: true });
        finalDraftValue = JSON.stringify(parsed);
      }
    } catch {
      // Plain text fallback or first-turn fallback
    }

    if (!isMultiTurn) {
      // Convert first turn to a JSON array with user's body and admin's approved reply (marked as isHuman: true)
      const parsed = [
        { role: "user" as const, content: currentRecord.body || "" },
        { role: "assistant" as const, content: finalText, isHuman: true }
      ];
      finalDraftValue = JSON.stringify(parsed);
    }

    // 2. 📊 Update the Database via Drizzle
    const updatedLogs = await db
      .update(emailLogs)
      .set({
        status: nextStatus,
        aiResponseDraft: finalDraftValue, // Saves either the plain text or updated chat history array!
        finalQuoteAmount: finalQuoteAmount || null,
      })
      .where(eq(emailLogs.id, logId))
      .returning();

    const processedLog = updatedLogs[0];
    const targetCustomerMetadata = processedLog.metadata as { recipientEmail?: string } | null;
    const customerEmail = targetCustomerMetadata?.recipientEmail;

    // 3. 📨 Dispatch Brevo Cloud Notification if approved
    if (decision === "approve" && customerEmail) {
      const brevo = new BrevoClient({ 
        apiKey: process.env.BREVO_API_KEY as string 
      });

      await brevo.transactionalEmails.sendTransacEmail({
        subject: `Update: Sourcing Requisition Verified`,
        sender: { 
          name: "StitchHub Management", 
          email: "cheetayfastdl345@gmail.com" 
        },
        to: [{ email: customerEmail }],
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"></head>
            <body style="background-color: #090a0f; margin: 0; padding: 40px 20px; font-family: sans-serif; color: #e4e4e7;">
              <div style="max-width: 560px; margin: 0 auto; background: #121316; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;">
                <div style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #27272a;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37;">Managerial Resolution Loop</span>
                  <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 6px 0 0 0;">Your Quote Has Been Verified</h1>
                </div>
                <div style="padding: 32px;">
                  <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; white-space: pre-wrap;">${finalText}</p>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto 10px auto;">
                    <tr>
                      <td align="center" style="border-radius: 8px; background-color: #d4af37;">
                        <a href="http://localhost:3000/profile" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 12px; font-weight: 705; color: #090a0f; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">View Workspace Thread</a>
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="padding: 24px 32px; background-color: #0d0e12; border-top: 1px solid #27272a; text-align: center;">
                  <p style="font-size: 10px; color: #52525b; margin: 0; font-family: monospace;">Secure TLS Node Loop • StitchHub Inc. 2026</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    }

    return NextResponse.json({ success: true, status: nextStatus });

  } catch (error) {
    console.error("Critical Admin Override breakdown failure:", error);
    return NextResponse.json({ error: "Internal core processing interruption." }, { status: 500 });
  }
}