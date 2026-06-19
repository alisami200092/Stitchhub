"use client";

import React, { useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { mapProductToInventoryItem } from "@/utils/inventory";
import { useSupplierStore } from "@/stores/supplier-store";

export function useActiveRequests() {
  const {
    activeRfqs,
    selectedIdx,
    price,
    days,
    loadingRequests,
    submittingQuote,
    quoteMessage,
    setActiveRfqs,
    setSelectedIdx,
    setPrice,
    setDays,
    setLoadingRequests,
    setSubmittingQuote,
    setQuoteMessage,
  } = useSupplierStore();

  const fetchActiveRfqs = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Fetch email_logs with status 'draft_sourcing' or 'review_required'
      const { data: logs, error: logsError } = await supabase
        .from("email_logs")
        .select("*")
        .in("status", ["draft_sourcing", "review_required"]);

      if (logsError) {
        console.error("Error fetching logs:", logsError);
        setLoadingRequests(false);
        return;
      }

      if (!logs || logs.length === 0) {
        setActiveRfqs([]);
        setLoadingRequests(false);
        return;
      }

      // Fetch corresponding invoices to get itemsSnapshot
      const invoiceNumbers = logs
        .map((log) => (log.metadata as any)?.invoiceNumber)
        .filter(Boolean);

      if (invoiceNumbers.length === 0) {
        const mappedMockLogs = logs.map(l => ({
          id: l.id,
          invoiceNumber: l.id,
          subject: l.subject,
          body: l.body,
          items: [],
          createdAt: l.created_at || l.createdAt,
        }));
        setActiveRfqs(mappedMockLogs);
        setLoadingRequests(false);
        return;
      }

      const { data: invs, error: invsError } = await supabase
        .from("invoices")
        .select("*")
        .in("invoice_number", invoiceNumbers);

      if (invsError) {
        console.error("Error fetching invoices:", invsError);
        setLoadingRequests(false);
        return;
      }

      const mappedRfqs = logs.map((log) => {
        const invoiceNum = (log.metadata as any)?.invoiceNumber;
        const invoice = invs?.find((i) => i.invoice_number === invoiceNum);
        const items = invoice?.items_snapshot || invoice?.itemsSnapshot || [];
        return {
          id: log.id,
          invoiceNumber: invoiceNum || log.id,
          subject: log.subject,
          body: log.body,
          items: items,
          createdAt: log.created_at || log.createdAt,
        };
      });

      setActiveRfqs(mappedRfqs);
    } catch (err) {
      console.error("Failed to fetch active RFQs:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, [setActiveRfqs, setLoadingRequests]);

  useEffect(() => {
    fetchActiveRfqs();
  }, [fetchActiveRfqs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRfq = activeRfqs[selectedIdx];
    if (!selectedRfq) return;

    setSubmittingQuote(true);
    setQuoteMessage(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const supplierName = user?.email || "sellfor59@gmail.com";

      const { error } = await supabase
        .from("supplier_quotes")
        .insert({
          order_id: selectedRfq.invoiceNumber,
          supplier_name: supplierName,
          quoted_cost_per_unit: parseFloat(price),
          estimated_delivery_days: parseInt(days, 10),
          status: "under review",
        });

      if (error) {
        setQuoteMessage({
          type: "error",
          text: error.message || "Failed to submit quote to database.",
        });
      } else {
        // Update materials_inventory stock back to StitchHub
        for (const item of selectedRfq.items || []) {
          const title = item.product?.title;
          const qty = item.quantity || 0;
          if (title) {
            const invName = mapProductToInventoryItem(title) || title;
            const { data: invData } = await supabase
              .from("materials_inventory")
              .select("stock_quantity")
              .eq("product_name", invName)
              .maybeSingle();

            const currentStock = invData?.stock_quantity ?? 0;
            const newStock = currentStock + qty;

            await supabase
              .from("materials_inventory")
              .update({ stock_quantity: newStock })
              .eq("product_name", invName);
          }
        }

        setQuoteMessage({
          type: "success",
          text: `Quote submitted and stock successfully updated back to StitchHub for ${selectedRfq.invoiceNumber}!`,
        });
        setPrice("");
        setDays("");
      }
    } catch (err: any) {
      setQuoteMessage({
        type: "error",
        text: err.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleSelectRfq = (idx: number) => {
    setSelectedIdx(idx);
    setQuoteMessage(null);
  };

  return {
    activeRfqs,
    selectedIdx,
    price,
    days,
    loadingRequests,
    submittingQuote,
    quoteMessage,
    setPrice,
    setDays,
    handleSelectRfq,
    handleSubmit,
  };
}
