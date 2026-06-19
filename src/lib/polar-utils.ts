import { db } from "@/db";
import { emailLogs, invoices, materialsInventory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { mapProductToInventoryItem } from "@/utils/inventory";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface CheckoutData {
  id: string;
  status?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

export async function handleSuccessfulPayment(checkout: CheckoutData) {
  if (checkout.status && checkout.status !== "succeeded") return;

  const logId = checkout.metadata?.logId;
  const userId = checkout.metadata?.userId;
  if (!logId || !userId) return;

  const logIdStr = String(logId);
  const userIdStr = String(userId);

  const existing = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.id, logIdStr))
    .limit(1);

  if (existing.length === 0) return;
  if (existing[0].status === "processing") return;

  // Deduct inventory stock for the order
  let cartItems: any[] = (existing[0].items as any[]) || [];
  if (cartItems.length === 0) {
    const invoiceNumber = checkout.metadata?.invoiceNumber;
    if (invoiceNumber) {
      const inv = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceNumber, String(invoiceNumber)))
        .limit(1);
      if (inv.length > 0) {
        cartItems = (inv[0].itemsSnapshot as any[]) || [];
      }
    }
  }

  for (const item of cartItems) {
    const productTitle = item.product?.title;
    const quantity = Number(item.quantity) || 0;
    if (productTitle && quantity > 0) {
      const invName = mapProductToInventoryItem(productTitle);
      if (invName) {
        const invRecord = await db
          .select()
          .from(materialsInventory)
          .where(eq(materialsInventory.productName, invName))
          .limit(1);

        if (invRecord.length > 0) {
          const newQty = Math.max(0, invRecord[0].stockQuantity - quantity);
          await db
            .update(materialsInventory)
            .set({ stockQuantity: newQty })
            .where(eq(materialsInventory.productName, invName));
        }
      }
    }
  }

  const currentMetadata = existing[0].metadata ?? {};
  if (typeof currentMetadata === "object") {
    (currentMetadata as Record<string, unknown>).polarCheckoutId = checkout.id;
  }

  await db
    .update(emailLogs)
    .set({
      status: "processing",
      metadata: currentMetadata,
    })
    .where(eq(emailLogs.id, logIdStr));

  const invoiceNumber = checkout.metadata?.invoiceNumber;
  if (invoiceNumber) {
    await db
      .update(invoices)
      .set({ status: "paid" })
      .where(eq(invoices.invoiceNumber, String(invoiceNumber)));
  } else {
    const userInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userIdStr))
      .orderBy(desc(invoices.createdAt))
      .limit(1);

    if (userInvoices.length > 0) {
      await db
        .update(invoices)
        .set({ status: "paid" })
        .where(eq(invoices.id, userInvoices[0].id));
    }
  }

  fetch(`${SITE_URL}/api/supplier-sourcing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: logIdStr }),
  }).catch((err: unknown) => {
    console.error("Background supplier agent activation failure:", err);
  });
}
