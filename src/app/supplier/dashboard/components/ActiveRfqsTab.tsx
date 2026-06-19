import React, { useState, useEffect } from "react";
import { createClient } from "../../../../utils/supabase/client";
import { mapProductToInventoryItem } from "../../../../utils/inventory";

export default function ActiveRfqsTab() {
  const [activeRfqs, setActiveRfqs] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchActiveRfqs = async () => {
      try {
        const supabase = createClient();
        
        // Fetch email_logs with status 'draft sourcing' or 'review required'
        const { data: logs, error: logsError } = await supabase
          .from("email_logs")
          .select("*")
          .in("status", ["draft sourcing", "review required", "draft_sourcing", "review_required"]);

        if (logsError) {
          console.error("Error fetching logs:", logsError);
          setLoading(false);
          return;
        }

        if (!logs || logs.length === 0) {
          setActiveRfqs([]);
          setLoading(false);
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
          setLoading(false);
          return;
        }

        const { data: invs, error: invsError } = await supabase
          .from("invoices")
          .select("*")
          .in("invoice_number", invoiceNumbers);

        if (invsError) {
          console.error("Error fetching invoices:", invsError);
          setLoading(false);
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
        setLoading(false);
      }
    };

    fetchActiveRfqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRfq = activeRfqs[selectedIdx];
    if (!selectedRfq) return;

    setSubmitting(true);
    setMessage(null);

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
        setMessage({
          type: "error",
          text: error.message || "Failed to submit quote to database.",
        });
      } else {
        // 🛠️ Update materials_inventory stock back to StitchHub
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

        setMessage({
          type: "success",
          text: `Quote submitted and stock successfully updated back to StitchHub for ${selectedRfq.invoiceNumber}!`,
        });
        setPrice("");
        setDays("");
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (activeRfqs.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl mx-auto p-8">
        <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 className="text-lg font-bold text-zinc-300 mb-2">No Active Requests</h3>
        <p className="text-zinc-500 text-sm">
          There are currently no requisitions in the sourcing stage. Checked emails will appear here as soon as they are approved for supplier matching.
        </p>
      </div>
    );
  }

  const selectedRfq = activeRfqs[selectedIdx];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar RFQ Selector */}
      <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 max-h-[600px] overflow-y-auto">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2 mb-4">
          Active Sourcing Batches
        </h3>
        {activeRfqs.map((rfq, idx) => (
          <button
            key={rfq.id}
            onClick={() => {
              setSelectedIdx(idx);
              setMessage(null);
            }}
            className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all cursor-pointer ${
              selectedIdx === idx
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:bg-zinc-800/40"
            }`}
          >
            <p className="font-mono font-bold text-xs truncate">{rfq.invoiceNumber}</p>
            <p className="text-xs text-zinc-500 truncate mt-1">{rfq.subject}</p>
          </button>
        ))}
      </div>

      {/* Main Specs Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-amber-500 rounded-full block"></span>
            {selectedRfq.invoiceNumber} — Specifications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 uppercase tracking-wider font-bold">Subject</p>
              <p className="text-zinc-100 font-medium bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 truncate">
                {selectedRfq.subject}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 uppercase tracking-wider font-bold">Date Received</p>
              <p className="text-zinc-100 font-medium bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                {new Date(selectedRfq.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-800/50 pt-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Items in Order ({selectedRfq.items.length})
            </h3>
            <div className="space-y-4">
              {selectedRfq.items.length === 0 ? (
                <p className="text-zinc-500 text-sm italic">No specifications snapshot parsed. Rely on request parameters below.</p>
              ) : (
                selectedRfq.items.map((item: any, i: number) => (
                  <div key={i} className="bg-zinc-950/30 border border-zinc-800/50 rounded-lg p-4 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-zinc-200">{item.product?.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">Category: {item.product?.cat} | Size: {item.size}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-zinc-300">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-800/50 pt-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Customer Requisition Requirements
            </h3>
            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-lg p-4">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {selectedRfq.body || "No additional parameters provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Submit Form */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-amber-500/20 rounded-xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.05)] sticky top-24">
          <h3 className="text-lg font-bold text-amber-500 mb-6 uppercase tracking-widest">
            Submit Wholesale Quote
          </h3>

          <div className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm font-medium border ${
                message.type === "success" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-fade-in" 
                  : "bg-red-500/10 text-red-400 border-red-500/20 animate-fade-in"
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-zinc-400">
                Your Wholesale Price per Unit ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500 font-medium">
                  $
                </span>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={submitting}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-8 pr-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="days" className="block text-sm font-medium text-zinc-400">
                Days to Deliver to Warehouse
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="days"
                  min="1"
                  required
                  disabled={submitting}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 pr-16 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0"
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500">
                  Days
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold uppercase tracking-wider py-4 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 ${
                submitting ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Quote...
                </>
              ) : (
                "Submit Bulk Quote to StitchHub"
              )}
            </button>
            <p className="text-xs text-center text-zinc-500">
              By submitting this quote, you agree to StitchHub's supplier terms and conditions.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
