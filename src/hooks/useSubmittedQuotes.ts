"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSupplierStore } from "@/stores/supplier-store";

export function useSubmittedQuotes() {
  const {
    bids,
    invoices,
    loadingBids,
    setBids,
    setInvoices,
    setLoadingBids,
  } = useSupplierStore();

  const fetchBids = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingBids(false);
        return;
      }

      const { data, error } = await supabase
        .from("supplier_quotes")
        .select("*")
        .eq("supplier_name", user.email)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBids(data);

        const orderIds = data.map((b) => b.order_id).filter(Boolean);
        if (orderIds.length > 0) {
          const { data: invs } = await supabase
            .from("invoices")
            .select("*")
            .in("invoice_number", orderIds);

          if (invs) {
            const invMap: Record<string, any> = {};
            invs.forEach((inv) => {
              invMap[inv.invoice_number] = inv;
            });
            setInvoices(invMap);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch bids:", err);
    } finally {
      setLoadingBids(false);
    }
  }, [setBids, setInvoices, setLoadingBids]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const mappedBids = bids.map((b) => {
    const invoice = invoices[b.order_id];
    const items = invoice?.items_snapshot || invoice?.itemsSnapshot || [];
    const productNames = items
      .map((item: any) => `${item.product?.title || "Unknown Item"} (x${item.quantity})`)
      .join(", ");

    return {
      id: b.order_id.startsWith("INV") || b.order_id.startsWith("RFQ") ? b.order_id : `RFQ #${b.order_id}`,
      product: productNames || "Bulk Sourcing Batch",
      price: `$${parseFloat(b.quoted_cost_per_unit).toFixed(2)}`,
      status: (b.status === "pending" || b.status === "under review") ? "Under Review" : b.status,
    };
  });

  return {
    mappedBids,
    loadingBids,
  };
}
