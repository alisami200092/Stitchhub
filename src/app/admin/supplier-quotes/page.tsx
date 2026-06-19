"use client";

import React, { useEffect, useState } from "react";
import GlassCard from "@/components/admin/GlassCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface SupplierQuote {
  id: string;
  orderId: string;
  supplierName: string;
  quotedCostPerUnit: string;
  estimatedDeliveryDays: number;
  status: string;
  createdAt: string;
  clientTotalPrice: string | null;
  clientUnitPrice: string | null;
  clientItems: any;
  clientSubject: string | null;
}

export default function SupplierQuotesPage() {
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchQuotes = async () => {
    try {
      const res = await fetch("/api/admin/supplier-quotes");
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes || []);
        if (data.quotes && data.quotes.length > 0) {
          setSelectedQuote(data.quotes[0]);
        } else {
          setSelectedQuote(null);
        }
      }
    } catch (error) {
      console.error("Failed to load supplier quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleDecision = async (decision: "approve" | "reject") => {
    if (!selectedQuote) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/admin/supplier-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: selectedQuote.id,
          decision,
        }),
      });

      if (res.ok) {
        alert(`Supplier quote has been successfully ${decision === "approve" ? "approved" : "rejected"}.`);
        const updatedList = quotes.filter((q) => q.id !== selectedQuote.id);
        setQuotes(updatedList);
        setSelectedQuote(updatedList.length > 0 ? updatedList[0] : null);
      } else {
        alert("Failed to process quote approval decision.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  const getQuantity = (quote: SupplierQuote) => {
    if (quote.clientItems && Array.isArray(quote.clientItems)) {
      return quote.clientItems.reduce((sum, item: any) => sum + (item.quantity || 0), 0);
    }
    return 0;
  };

  const calculateMargin = (quote: SupplierQuote) => {
    const qty = getQuantity(quote);
    const clientTotal = parseFloat(quote.clientTotalPrice || "0");
    const supplierUnit = parseFloat(quote.quotedCostPerUnit);
    const supplierTotal = supplierUnit * qty;
    
    const profit = clientTotal - supplierTotal;
    const marginPercent = clientTotal > 0 ? (profit / clientTotal) * 100 : 0;
    
    return {
      supplierTotal,
      profit,
      marginPercent,
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <AdminPageHeader 
        title="Supplier Quote Reviews" 
        subtitle="Evaluate bulk wholesale bids, check margins, and sync client order queues." 
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[65vh]">
          {/* Left panel: list of quotes under review */}
          <div className="lg:col-span-4 flex flex-col space-y-3 h-full overflow-y-auto pr-2">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Quotes Under Review</h3>
            {quotes.length === 0 ? (
              <div className="p-6 bg-white/1 border border-white/5 rounded-xl text-xs text-zinc-600 font-mono text-center">
                No active supplier quotes awaiting review.
              </div>
            ) : (
              quotes.map((q) => {
                const isSelected = selectedQuote?.id === q.id;
                const { profit, marginPercent } = calculateMargin(q);
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuote(q)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#d4af37]/5 border-[#d4af37]/45 shadow-lg"
                        : "bg-white/1 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className={`text-xs font-bold truncate max-w-[150px] ${isSelected ? "text-[#d4af37]" : "text-zinc-200"}`}>
                        {q.orderId}
                      </p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        marginPercent > 20 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : marginPercent > 0 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {marginPercent.toFixed(0)}% Margin
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-2 truncate">{q.clientSubject || "Bulk Sourcing Request"}</p>
                    <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-zinc-500">
                      <span>{q.supplierName.split("@")[0]}</span>
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right panel: details of selected quote */}
          <div className="lg:col-span-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 h-full flex flex-col overflow-hidden">
            {selectedQuote ? (
              <div className="space-y-6 flex flex-col h-full overflow-y-auto">
                <div className="border-b border-white/10 pb-4 flex justify-between items-start gap-4 shrink-0">
                  <div>
                    <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider block font-bold">Supplier Quote Details</span>
                    <h2 className="text-base font-bold text-white mt-1">{selectedQuote.orderId}</h2>
                  </div>
                  <div className="text-right font-mono text-[10px] text-zinc-500">
                    <p>Submitted: {new Date(selectedQuote.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                  {/* Profit Margin Analysis Section */}
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 font-mono">Profit Margin Analysis</h3>
                    {(() => {
                      const { supplierTotal, profit, marginPercent } = calculateMargin(selectedQuote);
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-1">
                            <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">AI Client Price</span>
                            <p className="text-xl font-bold text-white font-mono">${parseFloat(selectedQuote.clientTotalPrice || "0").toFixed(2)}</p>
                            <span className="text-[9px] text-zinc-400 font-mono">@ ${parseFloat(selectedQuote.clientUnitPrice || "0").toFixed(2)}/unit</span>
                          </div>

                          <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-1">
                            <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Supplier Cost</span>
                            <p className="text-xl font-bold text-white font-mono">${supplierTotal.toFixed(2)}</p>
                            <span className="text-[9px] text-zinc-400 font-mono">@ ${parseFloat(selectedQuote.quotedCostPerUnit).toFixed(2)}/unit</span>
                          </div>

                          <div className={`border p-4 rounded-xl space-y-1 ${
                            marginPercent > 20 
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                              : marginPercent > 0 
                                ? "bg-amber-500/5 border-amber-500/20 text-amber-400" 
                                : "bg-red-500/5 border-red-500/20 text-red-400"
                          }`}>
                            <span className="text-[9px] uppercase font-mono tracking-wider">Projected Profit</span>
                            <p className="text-xl font-bold font-mono">${profit.toFixed(2)}</p>
                            <span className="text-[9px] font-mono">({marginPercent.toFixed(1)}% margin)</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Supplier & Delivery Specifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Supplier Profile</h3>
                      <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-1 text-xs">
                        <p className="text-white font-bold">{selectedQuote.supplierName}</p>
                        <p className="text-zinc-400 font-mono">Matches client requisition specifications</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Delivery Schedule</h3>
                      <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-1 text-xs">
                        <p className="text-white font-bold">{selectedQuote.estimatedDeliveryDays} Days to Warehouse</p>
                        <p className="text-zinc-400 font-mono">Fulfillment Lead Time Estimate</p>
                      </div>
                    </div>
                  </div>

                  {/* Sourcing Order Items Spec */}
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 font-mono">Requisition Specifications</h3>
                    <div className="space-y-2 bg-black/20 border border-white/5 p-4 rounded-xl max-h-[160px] overflow-y-auto">
                      {selectedQuote.clientItems && Array.isArray(selectedQuote.clientItems) && selectedQuote.clientItems.length > 0 ? (
                        selectedQuote.clientItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <div>
                              <span className="font-bold text-zinc-200">{item.product?.title || "Custom Product"}</span>
                              <span className="text-zinc-500 ml-2">({item.size || "Standard"}, {item.color || "Default"})</span>
                            </div>
                            <span className="font-mono text-zinc-400">{item.quantity} units</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 italic text-xs">No specifications parsed.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex gap-3 pt-4 border-t border-white/10 mt-auto bg-transparent shrink-0">
                  <button
                    onClick={() => handleDecision("reject")}
                    disabled={processing}
                    className="bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-40"
                  >
                    Reject Cost
                  </button>
                  <button
                    onClick={() => handleDecision("approve")}
                    disabled={processing}
                    className="flex-1 bg-[#d4af37] text-[#090a0f] hover:bg-[#bfa032] px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] text-center disabled:opacity-40"
                  >
                    {processing ? "Authorizing Supplier Allocation..." : "Approve Supplier Price"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-600 font-mono">
                Select a supplier quote from the left list to review margins.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
