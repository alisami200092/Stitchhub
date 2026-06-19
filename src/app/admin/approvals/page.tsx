"use client";

import React, { useEffect, useState } from "react";

interface EscalationLog {
  id: string;
  subject: string;
  body: string;
  status: string;
  aiResponseDraft: string;
  createdAt: string;
  metadata?: { recipientEmail?: string; itemCount?: number };
  finalQuoteAmount?: string | null;
  unitPrice?: string | null;
  totalPrice?: string | null;
  items?: any;
}

export default function AdminApprovalsPage() {
  const [tickets, setTickets] = useState<EscalationLog[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<EscalationLog | null>(null);
  const [editableResponse, setEditableResponse] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch all live escalated workflows from the API we built
  useEffect(() => {
    async function loadEscalations() {
      try {
        const res = await fetch("/api/admin/escalations");
        if (res.ok) {
          const data = await res.json();
          setTickets(data.escalations || []);
          if (data.escalations && data.escalations.length > 0) {
            const ticket = data.escalations[0];
            setSelectedTicket(ticket);
            setEditableResponse(cleanAiResponse(ticket.aiResponseDraft));
            setQuoteAmount(ticket.finalQuoteAmount || "");
            setUnitPrice(ticket.unitPrice || "");
            setTotalPrice(ticket.totalPrice || "");
          }
        }
      } catch (error) {
        console.error("Failed syncing admin approvals queue:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEscalations();
  }, []);

  // Sync text area when switching selected tickets
  useEffect(() => {
    if (selectedTicket) {
      setEditableResponse(cleanAiResponse(selectedTicket.aiResponseDraft));
      setQuoteAmount(selectedTicket.finalQuoteAmount || "");
      setUnitPrice(selectedTicket.unitPrice || "");
      setTotalPrice(selectedTicket.totalPrice || "");
    } else {
      setEditableResponse("");
      setQuoteAmount("");
      setUnitPrice("");
      setTotalPrice("");
    }
  }, [selectedTicket]);

  // Helper helper to strip out structural tags for human previewing
  const cleanAiResponse = (rawStr: string) => {
    let text = rawStr;
    try {
      const parsed = JSON.parse(rawStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const lastMsg = [...parsed].reverse().find((m) => m.role === "assistant") || parsed[parsed.length - 1];
        text = lastMsg ? lastMsg.content : "";
      } else if (parsed && typeof parsed === "object") {
        if (parsed.ai_response) text = parsed.ai_response;
        else if (parsed.aiResponse) text = parsed.aiResponse;
        else if (parsed.content) text = parsed.content;
        else if (parsed.response) text = parsed.response;
        else if (parsed.message) text = parsed.message;
      }
    } catch {
      // Plain text fallback
    }
    return text
      .replace(/<action>PAUSE<\/action>/gi, "")
      .replace(/escalate_to_admin:?/gi, "")
      .trim();
  };

  const getQuantity = () => {
    if (selectedTicket?.items && Array.isArray(selectedTicket.items)) {
      return selectedTicket.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    }
    return selectedTicket?.metadata?.itemCount || 0;
  };

  const handleUnitPriceChange = (val: string) => {
    setUnitPrice(val);
    const parsedUnit = parseFloat(val);
    const qty = getQuantity();
    if (!isNaN(parsedUnit) && qty > 0) {
      setTotalPrice((parsedUnit * qty).toFixed(2));
    }
  };

  const handleTotalPriceChange = (val: string) => {
    setTotalPrice(val);
    const parsedTotal = parseFloat(val);
    const qty = getQuantity();
    if (!isNaN(parsedTotal) && qty > 0) {
      setUnitPrice((parsedTotal / qty).toFixed(2));
    }
  };

  const handleProcessDecision = async (decision: "approve" | "reject") => {
    if (!selectedTicket) return;
    setProcessing(true);
    try {
      // 📡 POST to an admin control endpoint to handle email updating and routing
      const res = await fetch("/api/admin/process-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: selectedTicket.id,
          decision,
          finalText: editableResponse,
          unitPrice,
          totalPrice,
        }),
      });

      if (res.ok) {
        alert(`Ticket successfully ${decision === "approve" ? "approved and dispatched" : "rejected"}.`);
        // Remove processed item from local state array list
        const updatedList = tickets.filter((t) => t.id !== selectedTicket.id);
        setTickets(updatedList);
        setSelectedTicket(updatedList.length > 0 ? updatedList[0] : null);
      } else {
        alert("Failed to compile operational override decision.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const glassCard = "bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden";

  if (loading) {
    return (
      <div className="text-xs font-mono text-zinc-500 text-center py-24 animate-pulse">
        Synchronizing Operational Escalation Ledger Threads...
      </div>
    );
  }

  let chatHistory: { role: string; content: string }[] = [];
  if (selectedTicket) {
    try {
      const parsed = JSON.parse(selectedTicket.aiResponseDraft || "");
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].role) {
        chatHistory = parsed;
      } else {
        throw new Error();
      }
    } catch {
      let bodyText = selectedTicket.body || "";
      try {
        const parsed = JSON.parse(selectedTicket.aiResponseDraft || "");
        if (parsed && typeof parsed === "object" && parsed.user_request) {
          bodyText = parsed.user_request;
        }
      } catch {}
      chatHistory = [
        { role: "user", content: bodyText || "No initial metadata prompt declared." },
        { role: "assistant", content: cleanAiResponse(selectedTicket.aiResponseDraft || "") }
      ];
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <div>
        <h2 className="text-2xl font-bold text-white font-display tracking-tight">Escalated Approvals Queue</h2>
        <p className="text-xs text-zinc-400 mt-1">Review raw agent logic, manipulate dynamic variables, and execute human overrides.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[65vh]">
        
        {/* LEFT COLUMN: ACTIVE INTERCEPT QUEUE LIST */}
        <div className="lg:col-span-4 flex flex-col space-y-3 h-full overflow-y-auto pr-2">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Awaiting Human Review</h3>
          {tickets.length === 0 ? (
            <div className="p-6 bg-white/1 border border-white/5 rounded-xl text-xs text-zinc-600 font-mono text-center">
              Queue completely clear. No active interventions required.
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? (t.status === "review_required" || t.status === "escalated" || t.status === "review required")
                        ? "bg-red-500/5 border-red-500/40 shadow-lg"
                        : "bg-[#d4af37]/5 border-[#d4af37]/40 shadow-lg"
                      : "bg-white/1 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-xs font-bold truncate max-w-[150px] ${
                      isSelected
                        ? (t.status === "review_required" || t.status === "escalated" || t.status === "review required")
                          ? "text-red-400"
                          : "text-[#d4af37]"
                        : "text-zinc-200"
                    }`}>{t.subject}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase ${
                      (t.status === "review_required" || t.status === "escalated" || t.status === "review required")
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                        : "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
                    }`}>
                      {(t.status === "review_required" || t.status === "escalated" || t.status === "review required") ? "Intercept" : "Active"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate mt-1.5">{t.body || "No initial metadata prompt declared."}</p>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: MANAGEMENT DETAILS INTERFACE CONSOLE */}
        <div className={`lg:col-span-8 ${glassCard} h-full p-6 flex flex-col`}>
          {selectedTicket ? (
            <div className="space-y-4 flex flex-col h-full overflow-y-auto">
              <div className="border-b border-white/10 pb-3 flex justify-between items-start gap-4">
                <div>
                  <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${
                    (selectedTicket.status === "review_required" || selectedTicket.status === "escalated" || selectedTicket.status === "review required") ? "text-red-400" : "text-[#d4af37]"
                  }`}>
                    {(selectedTicket.status === "review_required" || selectedTicket.status === "escalated" || selectedTicket.status === "review required") ? "Priority Resolution Intercept" : "Active Thread Monitoring"}
                  </span>
                  <h2 className="text-sm font-bold text-white mt-0.5">{selectedTicket.subject}</h2>
                </div>
                <div className="text-right font-mono text-[9px] text-zinc-500">
                  <p>Ref ID: {selectedTicket.id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-1 text-xs">
                {/* Scrollable Chat History Log */}
                <div className="space-y-3 bg-black/30 border border-white/5 p-4 rounded-xl max-h-[220px] overflow-y-auto">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1 font-mono">Conversation Thread</span>
                  <div className="space-y-3">
                    {chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs leading-relaxed max-w-[85%] ${
                          msg.role === "user"
                            ? "bg-zinc-900/50 border-zinc-800 mr-auto text-zinc-300"
                            : "bg-[#d4af37]/5 border-[#d4af37]/10 ml-auto text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/5 pb-1">
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${
                            msg.role === "user" ? "text-zinc-500" : "text-[#d4af37]"
                          }`}>
                            {msg.role === "user" ? "Client" : "Agentic AI / Override"}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items in Quote Section */}
                {selectedTicket.items && Array.isArray(selectedTicket.items) && selectedTicket.items.length > 0 && (
                  <div className="space-y-2 bg-black/30 border border-white/5 p-4 rounded-xl max-h-[150px] overflow-y-auto">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1 font-mono">Items In Quote</span>
                    <div className="space-y-2">
                      {selectedTicket.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                          <div>
                            <span className="font-bold text-zinc-200">{item.product?.title || "Custom Product"}</span>
                            <span className="text-zinc-500 ml-2">({item.size || "Standard"}, {item.color || "Default"})</span>
                          </div>
                          <div className="text-zinc-400">
                            <span className="font-mono">{item.quantity} units</span>
                            <span className="text-zinc-600 font-mono ml-2">@ ${item.product?.price || 0}/unit</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Override Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                  <div className="space-y-2 flex flex-col">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                      Unit Price ($)
                    </span>
                    <input
                      type="text"
                      value={unitPrice}
                      onChange={(e) => handleUnitPriceChange(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="e.g. 38.00"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                      Total Price ($)
                    </span>
                    <input
                      type="text"
                      value={totalPrice}
                      onChange={(e) => handleTotalPriceChange(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="e.g. 1900.00"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Total Quantity
                    </span>
                    <div className="w-full bg-zinc-900/30 border border-white/5 rounded-xl px-4 py-3 text-xs text-zinc-400 select-none">
                      {getQuantity()} units
                    </div>
                  </div>
                </div>

                {/* Drafting Override Response Panel */}
                <div className="space-y-2 flex flex-col font-mono">
                  <span className="text-[9px] font-bold text-[#d4af37] uppercase tracking-wider block">
                    {selectedTicket.status === "escalated"
                      ? "Drafting Override Response Panel"
                      : "Send Reply / Interference Message"}
                  </span>
                  <textarea
                    value={editableResponse}
                    onChange={(e) => setEditableResponse(e.target.value)}
                    className="w-full h-24 min-h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none resize-none transition-colors leading-relaxed"
                    placeholder="Type response override..."
                  />
                </div>
              </div>

              {/* Action Operations Execution Buttons Trigger Footer Layout */}
              <div className="flex gap-3 pt-3 border-t border-white/10 mt-auto bg-transparent">
                <button
                  onClick={() => handleProcessDecision("reject")}
                  disabled={processing}
                  className="bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Dismiss Thread
                </button>
                <button
                  onClick={() => handleProcessDecision("approve")}
                  disabled={processing}
                  className="flex-1 bg-[#d4af37] text-[#090a0f] hover:bg-[#bfa032] px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] text-center disabled:opacity-40"
                >
                  {processing ? "Authorizing Security Dispatch Loop..." : "Approve & Send Quote"}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-600 font-mono">
              Select an item context from the left intercept layout matrix.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}