import { NextResponse } from "next/server";
import { db } from "@/db";
import { supplierQuotes, emailLogs, invoices, materialsInventory } from "@/db/schema";
import { eq, sql, or } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/admin";
import { calculateTieredPricing } from "@/utils/pricing";
import { mapProductToInventoryItem } from "@/utils/inventory";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    // Fetch supplier quotes that are 'under review' or legacy 'pending'
    const quotes = await db
      .select({
        id: supplierQuotes.id,
        orderId: supplierQuotes.orderId,
        supplierName: supplierQuotes.supplierName,
        quotedCostPerUnit: supplierQuotes.quotedCostPerUnit,
        estimatedDeliveryDays: supplierQuotes.estimatedDeliveryDays,
        status: supplierQuotes.status,
        createdAt: supplierQuotes.createdAt,
        clientTotalPrice: emailLogs.totalPrice,
        clientUnitPrice: emailLogs.unitPrice,
        clientItems: emailLogs.items,
        clientSubject: emailLogs.subject,
        invoiceItems: invoices.itemsSnapshot,
        invoiceTotal: invoices.totalAmount,
      })
      .from(supplierQuotes)
      .leftJoin(
        emailLogs,
        sql`${emailLogs.metadata}->>'invoiceNumber' = ${supplierQuotes.orderId}`
      )
      .leftJoin(
        invoices,
        eq(invoices.invoiceNumber, supplierQuotes.orderId)
      )
      .where(
        or(
          eq(supplierQuotes.status, "under review"),
          eq(supplierQuotes.status, "pending")
        )
      );

    const processedQuotes = quotes.map((q) => {
      // Fallback for items
      let items = q.clientItems;
      if (!items || (Array.isArray(items) && items.length === 0)) {
        items = q.invoiceItems || [];
      }

      // Fallback for client total and unit price
      let totalPrice = q.clientTotalPrice;
      let unitPrice = q.clientUnitPrice;

      if (!totalPrice || parseFloat(totalPrice) === 0) {
        if (q.invoiceTotal && q.invoiceTotal !== "Pending Dynamic Quote Lock") {
          const cleanTotal = q.invoiceTotal.replace(/[$,]/g, "");
          totalPrice = cleanTotal;
        } else if (items && Array.isArray(items) && items.length > 0) {
          let calcTotal = 0;
          let calcUnit = 0;
          items.forEach((item: any) => {
            const prod = item.product || {};
            const qty = item.quantity || 0;
            const res = calculateTieredPricing(prod.id || "", qty, prod.price || 0);
            calcTotal += res.totalPrice;
            calcUnit = res.unitPrice;
          });
          totalPrice = calcTotal.toFixed(2);
          unitPrice = calcUnit.toFixed(2);
        }
      }

      // Fallback for subject line
      let subject = q.clientSubject;
      if (!subject) {
        if (items && Array.isArray(items) && items.length > 0) {
          const firstItem = items[0]?.product?.title || "Custom Product";
          subject = `Wholesale Requisition: ${firstItem}`;
        } else {
          subject = "Bulk Sourcing Request";
        }
      }

      return {
        id: q.id,
        orderId: q.orderId,
        supplierName: q.supplierName,
        quotedCostPerUnit: q.quotedCostPerUnit,
        estimatedDeliveryDays: q.estimatedDeliveryDays,
        status: q.status,
        createdAt: q.createdAt,
        clientTotalPrice: totalPrice,
        clientUnitPrice: unitPrice,
        clientItems: items,
        clientSubject: subject,
      };
    });

    return NextResponse.json({ success: true, quotes: processedQuotes });
  } catch (error) {
    console.error("Failed to fetch under-review supplier quotes:", error);
    return NextResponse.json({ error: "Failed to fetch quotes." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    const { quoteId, decision } = await req.json();

    if (!quoteId || !decision) {
      return NextResponse.json({ error: "Missing quoteId or decision." }, { status: 400 });
    }

    const nextStatus = decision === "approve" ? "supplier approved" : "supplier rejected";

    // Fetch the specific supplier quote record
    const [quote] = await db
      .select()
      .from(supplierQuotes)
      .where(eq(supplierQuotes.id, quoteId))
      .limit(1);

    if (!quote) {
      return NextResponse.json({ error: "Supplier quote not found." }, { status: 404 });
    }

    // Run database transaction to update supplier quote status and client's order status
    await db.transaction(async (tx) => {
      // 1. Update supplier quote status
      await tx
        .update(supplierQuotes)
        .set({ status: nextStatus })
        .where(eq(supplierQuotes.id, quoteId));

      // 2. If approved, unlock/advance the client's quote
      if (decision === "approve") {
        // Find client log matching the quote's orderId (invoiceNumber)
        const [log] = await tx
          .select()
          .from(emailLogs)
          .where(sql`${emailLogs.metadata}->>'invoiceNumber' = ${quote.orderId}`)
          .limit(1);

        // Fetch invoice too
        const [invoice] = await tx
          .select()
          .from(invoices)
          .where(eq(invoices.invoiceNumber, quote.orderId))
          .limit(1);

        // Fallback items and price calculation
        let items = log?.items || invoice?.itemsSnapshot || [];
        let finalPrice = log?.totalPrice || (invoice?.totalAmount && invoice.totalAmount !== "Pending Dynamic Quote Lock" ? invoice.totalAmount.replace(/[$,]/g, "") : null);
        let unitPrice = log?.unitPrice;

        if (!finalPrice && items && Array.isArray(items) && items.length > 0) {
          let calcTotal = 0;
          let calcUnit = 0;
          items.forEach((item: any) => {
            const prod = item.product || {};
            const qty = item.quantity || 0;
            const res = calculateTieredPricing(prod.id || "", qty, prod.price || 0);
            calcTotal += res.totalPrice;
            calcUnit = res.unitPrice;
          });
          finalPrice = calcTotal.toFixed(2);
          unitPrice = calcUnit.toFixed(2);
        }

        if (log) {
          // Set the client's order status to "approved" (unlocking checkout)
          await tx
            .update(emailLogs)
            .set({ 
              status: "approved",
              totalPrice: finalPrice,
              unitPrice: unitPrice,
              items: items
            })
            .where(eq(emailLogs.id, log.id));
        }

        if (invoice) {
          const displayTotal = finalPrice ? `$${parseFloat(finalPrice).toFixed(2)}` : invoice.totalAmount;
          await tx
            .update(invoices)
            .set({
              totalAmount: displayTotal,
              itemsSnapshot: items
            })
            .where(eq(invoices.invoiceNumber, quote.orderId));
        }

        // 3. Replenish materials inventory stock since the wholesale supplier's quote is approved!
        for (const item of (items as any[])) {
          const productTitle = item.product?.title;
          const quantity = Number(item.quantity) || 0;
          if (productTitle && quantity > 0) {
            const invName = mapProductToInventoryItem(productTitle);
            if (invName) {
              const invRecord = await tx
                .select()
                .from(materialsInventory)
                .where(eq(materialsInventory.productName, invName))
                .limit(1);

              if (invRecord.length > 0) {
                const newQty = invRecord[0].stockQuantity + quantity;
                await tx
                  .update(materialsInventory)
                  .set({ stockQuantity: newQty })
                  .where(eq(materialsInventory.productName, invName));
              } else {
                await tx.insert(materialsInventory).values({
                  productName: invName,
                  stockQuantity: quantity,
                  reorderLevel: 20
                });
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, message: `Supplier quote successfully ${decision === "approve" ? "approved" : "rejected"}.` });
  } catch (error) {
    console.error("Failed to process supplier quote decision:", error);
    return NextResponse.json({ error: "Failed to process quote decision." }, { status: 500 });
  }
}

