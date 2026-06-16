import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs, invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateSupplierPrompt } from "@/utils/prompts";

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json({ error: "Missing required order_id identifier." }, { status: 400 });
    }

    // 1. Fetch the targeted log row
    const logs = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.id, order_id));

    if (logs.length === 0) {
      return NextResponse.json({ error: "Order log record not found." }, { status: 404 });
    }

    const log = logs[0];

    // 2. Verify status
    if (log.status !== "sourcing_active") {
      return NextResponse.json({ error: "Access Denied. Sourcing pipeline is not active for this order." }, { status: 400 });
    }

    // 3. Fetch latest invoice snapshot to get the item cart details
    const userInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, log.userId || ""))
      .orderBy(desc(invoices.createdAt))
      .limit(1);

    const cartManifest = userInvoices[0]?.itemsSnapshot || [];

    // 4. Construct system prompt for the Supplier Agent
    const supplierPrompt = generateSupplierPrompt(cartManifest as any[], log.body || "");

    // 5. Query local Ollama model stitchhub_v5 (with Gemini fallback)
    let vendorPoOutput = "";
    try {
      const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "stitchhub_v5",
          prompt: supplierPrompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(3000), // Timeout fast to fall back to Gemini
      });

      if (!ollamaResponse.ok) {
        throw new Error("Ollama procurement agent reasoning cycle failed.");
      }

      const ollamaData = await ollamaResponse.json();
      vendorPoOutput = ollamaData.response;
    } catch (ollamaError) {
      console.warn("Ollama failed, attempting Gemini fallback...", ollamaError);
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Ollama inference failed and no GEMINI_API_KEY is configured.");
      }

      const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: supplierPrompt }] }],
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini fallback also failed: ${geminiResponse.statusText}`);
      }

      const geminiData = await geminiResponse.json();
      vendorPoOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    const mockTrackingId = `TRK-PO-${Math.floor(100000 + Math.random() * 900000)}`;

    // 6. Update database record with payload and transition to 'processing'
    await db
      .update(emailLogs)
      .set({
        status: "processing",
        supplierPayload: {
          vendor_po: vendorPoOutput,
          tracking_id: mockTrackingId,
          dispatched_at: new Date().toISOString()
        }
      })
      .where(eq(emailLogs.id, order_id));

    return NextResponse.json({
      success: true,
      status: "processing",
      trackingId: mockTrackingId,
      dispatched: true
    });

  } catch (error) {
    console.error("Critical Supplier Agent breakdown error:", error);
    return NextResponse.json({ error: "Internal supplier sourcing failure." }, { status: 500 });
  }
}
