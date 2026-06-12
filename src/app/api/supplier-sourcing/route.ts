import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs, invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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
    const supplierPrompt = `
      System Prompt: You are the StitchHub B2B Head of Procurement. Your objective is to translate customer accessory/apparel manifests into a formal, highly professional wholesale inventory procurement request.

      CUSTOMER REQUISITION MANIFEST:
      ${JSON.stringify(cartManifest, null, 2)}

      CUSTOMER SPECIFICATIONS & CONSTRAINTS:
      "${log.body || "No specific instructions declared."}"

      Please output a formalized wholesale purchase order (PO) detailing distributor supply-chain assignments, item sizes/quantities allocations, warehouse packaging tags, and factory production queuing commands.
    `;

    // 5. Query local Ollama model stitchhub_v5
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "stitchhub_v5",
        prompt: supplierPrompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error("Ollama procurement agent reasoning cycle failed.");
    }

    const ollamaData = await ollamaResponse.json();
    const vendorPoOutput = ollamaData.response;

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
