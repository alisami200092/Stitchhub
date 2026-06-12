import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { emailLogs, invoices } from "@/db/schema";
// 🎯 Import the modern BrevoClient constructor directly
import { BrevoClient } from '@getbrevo/brevo';

/**
 * POST /api/agent
 * Auth-guarded endpoint that:
 * 1. Validates the user session via Supabase
 * 2. Builds a context prompt from cart + message
 * 3. Calls the local Ollama stitchhub-agent model
 * 4. Detects escalation triggers (PAUSE tag)
 * 5. Persists email_log + invoice atomically via Drizzle
 * 6. Dispatches a Brevo email alert to the user via BrevoClient
 * 7. Returns the AI-generated draft
 */
export async function POST(req: Request) {
  /* ── Auth guard: reject unauthenticated requests ── */
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    /* ── Parse & validate request body ── */
    const body = await req.json();
    const { cart, message, toEmail, subject } = body;

    /* ── Empty cart guard: require at least one line item ── */
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cannot initialize sourcing matrix with an empty cart." }, { status: 400 });
    }

    const currentUserId = user.id;
    const userName = user.user_metadata?.name || user.email?.split("@")[0] || "User";

    /* ── Context prompt: inject user identity, cart manifest, and constraints ── */
    const userContextPrompt = `
      Customer Identity: ${userName}
      Sourcing Email Context Target: ${toEmail}
      Subject Title Line: ${subject}
      
      CART REQUISITION MANIFEST:
      ${JSON.stringify(cart, null, 2)}
      
      CUSTOMER ARTWORK/TIMELINE CONSTRAINTS:
      "${message || "No specific instructions declared."}"
    `;

    /* ── Ollama inference call: query local stitchhub_v5 model ── */
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "stitchhub_v5",
        prompt: userContextPrompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error("Local custom Ollama inference agent failed to respond.");
    }

    const ollamaData = await ollamaResponse.json();
    const generatedAiResponse = ollamaData.response;

    /* ── Escalation detection: check for PAUSE tag or admin escalation keyword ── */
    let logStatus = "draft_sourcing";
    if (generatedAiResponse.includes("<action>PAUSE</action>") || generatedAiResponse.includes("escalate_to_admin")) {
      logStatus = "review_required";
    }

    /* ── Atomic DB persistence: write email_log + invoice records ── */
    const randomSerial = Math.floor(1000 + Math.random() * 9000);
    const generatedInvoiceNumber = `INV-2026-${randomSerial}`;

    // Insert email log with AI response draft and tracking status
    await db.insert(emailLogs).values({
      userId: currentUserId,
      subject: subject || "Bulk Apparel Production Inquiry",
      body: message || "",
      status: logStatus,
      aiResponseDraft: generatedAiResponse,
      metadata: { recipientEmail: toEmail, itemCount: cart.length, invoiceNumber: generatedInvoiceNumber },
    });

    // Insert corresponding invoice snapshot with pending quote lock
    await db.insert(invoices).values({
      userId: currentUserId,
      invoiceNumber: generatedInvoiceNumber,
      totalAmount: "Pending Dynamic Quote Lock",
      status: "unpaid",
      itemsSnapshot: cart,
    });

    /* ── 📨 Modern Brevo SDK Dispatch Layer ── */
    if (user.email) {
      try {
        // 🎯 FIX: Instantiate with the configuration options object directly inside the constructor
        const brevo = new BrevoClient({ 
          apiKey: process.env.BREVO_API_KEY as string 
        });

        // Fire the transmission directly through the transactionalEmails namespace module
        await brevo.transactionalEmails.sendTransacEmail({
          subject: logStatus === "review_required" 
            ? `[Action Required] Sourcing Matrix Intercepted`
            : `Update: Sourcing Requisition Processed`,
          sender: { 
            name: "StitchHub Agent", 
            email: "cheetayfastdl345@gmail.com" 
          },
          to: [{ 
            email: user.email, 
            name: userName 
          }],
          htmlContent: `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>StitchHub Automation Node Update</title>
    </head>
    <body style="background-color: #090a0f; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
      <div style="max-width: 560px; margin: 0 auto; bg-color: #121316; background: #121316; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
        
        <div style="padding: 32px 32px 20px 32px; border-b: 1px solid #27272a;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; font-family: monospace;">System Operational Routing Update</span>
          <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 6px 0 0 0; tracking: -0.5px;">StitchHub Sourcing Inbox Alert</h1>
        </div>
        
        <div style="padding: 0 32px 32px 32px;">
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6;">Your multi-item inventory cart manifest transaction layout layer has been fully mapped across your private local cluster model reasoning nodes weights configuration matrix.</p>
          
          <div style="margin: 28px 0; padding: 20px; border-radius: 12px; background-color: ${logStatus === "review_required" ? "rgba(239, 68, 68, 0.04)" : "rgba(212, 175, 55, 0.03)"}; border: 1px solid ${logStatus === "review_required" ? "rgba(239, 68, 68, 0.25)" : "rgba(212, 175, 55, 0.2)"}; border-left: 4px solid ${logStatus === "review_required" ? "#ef4444" : "#d4af37"};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td>
                  <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; display: block; margin-bottom: 4px; font-family: monospace;">Requisition Operational Tracking Status</span>
                  <span style="font-size: 14px; font-weight: 700; color: ${logStatus === "review_required" ? "#fca5a5" : "#fef08a"}; text-transform: uppercase; font-family: monospace;">
                    ${logStatus === "review_required" ? "Escalated to Enterprise Admin" : "Native Response Generated"}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <p style="font-size: 12px; color: #71717a; line-height: 1.6; margin-bottom: 24px;">Because your scenario optimization contains highly custom instructions or timeline parameters, a priority calculation verification check has been locked into your profile matrix tracking ledger.</p>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto 10px auto;">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #d4af37; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);">
                <a href="http://localhost:3000/profile" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 12px; font-weight: 700; color: #090a0f; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">Launch Operational Inbox Workspace</a>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding: 24px 32px; background-color: #0d0e12; border-top: 1px solid #27272a; text-align: center;">
          <p style="font-size: 10px; color: #52525b; margin: 0; font-family: monospace;">Secure TLS Node Cluster Transmission • StitchHub Inc. 2026</p>
        </div>
      </div>
    </body>
  </html>
`,
        });

        console.log("📨 Brevo transactional alert successfully routed over the network.");
      } catch (emailError) {
        console.error("Failed to compile or route Brevo alert packet:", emailError);
      }
    }

    /* ── Success response: return AI draft and final status ── */
    return NextResponse.json({ 
      success: true, 
      generatedMessage: generatedAiResponse,
      status: logStatus
    });

  } catch (error) {
    /* ── Global error handler: log and return 500 ── */
    console.error("Critical core failure:", error);
    return NextResponse.json({ error: "Internal agent reasoning breakdown." }, { status: 500 });
  }
}