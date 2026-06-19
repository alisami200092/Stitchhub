import React, { useState, useEffect } from "react";
import { createClient } from "../../../../utils/supabase/client";

const getStatusStyles = (status: string) => {
  const norm = status.toLowerCase();
  if (norm.includes("approved") || norm === "accepted" || norm === "approved / active") {
    return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
  }
  if (norm === "under review" || norm === "pending" || norm === "processing") {
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
  if (norm.includes("rejected") || norm === "dismissed") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  return "bg-zinc-800 text-zinc-400 border-zinc-700";
};

export default function SubmittedQuotesTab() {
  const [bids, setBids] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
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
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const mappedBids = bids.map((b) => {
    const invoice = invoices[b.order_id];
    const items = invoice?.items_snapshot || invoice?.itemsSnapshot || [];
    const productNames = items
      .map((item: any) => `${item.product?.title || "Unknown Item"} (x${item.quantity})`)
      .join(", ");

    let displayStatus = b.status;
    if (b.status === "pending" || b.status === "under review") {
      displayStatus = "Under Review";
    } else if (b.status === "supplier approved") {
      displayStatus = "Approved / Active";
    } else if (b.status === "supplier rejected") {
      displayStatus = "Rejected";
    }

    return {
      id: b.order_id.startsWith("INV") || b.order_id.startsWith("RFQ") ? b.order_id : `RFQ #${b.order_id}`,
      product: productNames || "Bulk Sourcing Batch",
      price: `$${parseFloat(b.quoted_cost_per_unit).toFixed(2)}`,
      status: displayStatus,
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-medium text-white flex items-center gap-3">
          <span className="w-2 h-8 bg-zinc-700 rounded-full block"></span>
          Submitted Quotes History
        </h2>
        {mappedBids.length > 0 && (
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white hover:border-zinc-700 transition-all cursor-pointer">
              Filter
            </button>
            <button className="px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white hover:border-zinc-700 transition-all cursor-pointer">
              Export
            </button>
          </div>
        )}
      </div>

      {mappedBids.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl mx-auto p-8">
          <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="text-lg font-bold text-zinc-300 mb-2">No Quotes Submitted Yet</h3>
          <p className="text-zinc-500 text-sm">
            You have not submitted any B2B pricing bids yet. When you submit a quote from the "Active Requests" tab, it will appear here under review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mappedBids.map((quote, idx) => {
            const isApproved = quote.status === "Approved / Active";
            return (
              <div
                key={idx}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all shadow-lg hover:shadow-xl group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-zinc-500 text-sm font-bold tracking-wider mb-1 font-mono">
                      {quote.id}
                    </p>
                    <h3 className="text-zinc-100 font-medium text-lg group-hover:text-amber-500 transition-colors">
                      {quote.product}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 whitespace-nowrap shrink-0 ${getStatusStyles(
                      quote.status
                    )}`}
                  >
                    {isApproved && (
                      <span className="text-[10px] font-bold">✓</span>
                    )}
                    {quote.status}
                  </span>
                </div>

              <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-end mt-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Submitted Price</p>
                  <p className="text-2xl font-mono text-zinc-100">{quote.price}</p>
                </div>
                <button className="text-sm font-medium text-amber-500 hover:text-amber-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  View Details
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
