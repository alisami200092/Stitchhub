import { NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { logId } = await req.json();

    if (!logId) {
      return NextResponse.json({ error: "Missing required logId." }, { status: 400 });
    }

    // 1. Update status to sourcing_active
    const updated = await db
      .update(emailLogs)
      .set({ status: "sourcing_active" })
      .where(eq(emailLogs.id, logId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Target log thread not found." }, { status: 404 });
    }

    // 2. Trigger supplier sourcing agent asynchronously in the background
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const supplierSourcingUrl = `${protocol}://${host}/api/supplier-sourcing`;

    fetch(supplierSourcingUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: logId }),
    }).catch((err) => {
      console.error("Background supplier agent activation failure:", err);
    });

    return NextResponse.json({ success: true, status: "sourcing_active" });

  } catch (error) {
    console.error("Deposit payment capture error:", error);
    return NextResponse.json({ error: "Internal payment processing error." }, { status: 500 });
  }
}
