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
}

export default function AdminApprovalsPage() {
  const [tickets, setTickets] = useState<EscalationLog[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<EscalationLog | null>(null);
  const [editableResponse, setEditableResponse] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
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
            setSelectedTicket(data.escalations[0]);
            setEditableResponse(cleanAiResponse(data.escalations[0].aiResponseDraft));
            setQuoteAmount(data.escalations[0].finalQuoteAmount || "");
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
    } else {
      setEditableResponse("");
      setQuoteAmount("");
    }
  }, [selectedTicket]);

  // Helper helper to strip out structural tags for human previewing
  const cleanAiResponse = (rawStr: string) => {
    try {
      const parsed = JSON.parse(rawStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const lastMsg = [...parsed].reverse().find((m) => m.role === "assistant") || parsed[parsed.length - 1];
        return lastMsg ? lastMsg.content : "";
      }
    } catch {
      // Plain text fallback
    }
    return rawStr
      .replace("<action>PAUSE</action>", "")
      .replace("escalate_to_admin", "")
      .trim();
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
          finalQuoteAmount: quoteAmount,
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
      chatHistory = [
        { role: "user", content: selectedTicket.body || "" },
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
                      ? (t.status === "review_required" || t.status === "escalated")
                        ? "bg-red-500/5 border-red-500/40 shadow-lg"
                        : "bg-[#d4af37]/5 border-[#d4af37]/40 shadow-lg"
                      : "bg-white/1 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-xs font-bold truncate max-w-[150px] ${
                      isSelected
                        ? (t.status === "review_required" || t.status === "escalated")
                          ? "text-red-400"
                          : "text-[#d4af37]"
                        : "text-zinc-200"
                    }`}>{t.subject}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase ${
                      (t.status === "review_required" || t.status === "escalated")
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                        : "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
                    }`}>
                      {(t.status === "review_required" || t.status === "escalated") ? "Intercept" : "Active"}
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
                    (selectedTicket.status === "review_required" || selectedTicket.status === "escalated") ? "text-red-400" : "text-[#d4af37]"
                  }`}>
                    {(selectedTicket.status === "review_required" || selectedTicket.status === "escalated") ? "Priority Resolution Intercept" : "Active Thread Monitoring"}
                  </span>
                  <h2 className="text-sm font-bold text-white mt-0.5">{selectedTicket.subject}</h2>
                </div>
                <div className="text-right font-mono text-[9px] text-zinc-500">
                  <p>Ref ID: {selectedTicket.id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-1 text-xs">
                {/* Scrollable Chat History Log */}
                <div className="space-y-3 bg-black/30 border border-white/5 p-4 rounded-xl max-h-[300px] overflow-y-auto">
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

                {/* Drafting Override Response Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                  <div className="space-y-2 flex flex-col">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                      Assign Wholesale Quote ($)
                    </span>
                    <input
                      type="text"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
                      placeholder="e.g. 1599.00 (numeric only)"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                      {selectedTicket.status === "escalated"
                        ? "Drafting Override Response Panel"
                        : "Send Reply / Interference Message"}
                    </span>
                    <textarea
                      value={editableResponse}
                      onChange={(e) => setEditableResponse(e.target.value)}
                      className="w-full h-10 min-h-10 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none resize-none transition-colors leading-relaxed"
                      placeholder="Type response override..."
                    />
                  </div>
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
                  {processing ? "Authorizing Security Dispatch Loop..." : "Authorize and Send Response Quote"}
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