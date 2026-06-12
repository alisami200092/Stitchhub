"use client";

import React, { useState, useRef, useEffect } from "react";
import type { EscalationLog } from "@/types";
import { useChat } from "@/hooks/useChat";
import DancingDots from "@/components/ui/DancingDots";

interface InboxPanelProps {
  logs?: EscalationLog[];
  selectedLog?: EscalationLog | null;
  onSelectLog?: (log: EscalationLog | null) => void;
}

function renderParsedAiResponse(draftText: string, status: string) {
  const rawText = draftText.replace("<action>PAUSE</action>", "").trim();
  let parsedData: Record<string, string> | null = null;

  try {
    parsedData = JSON.parse(rawText);
  } catch {
    // plain text fallback
  }

  if (parsedData) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#090a0f] p-3 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-bold mb-1 font-mono">Target Product</span>
            <span className="text-zinc-200 font-medium">{parsedData.product || "N/A"}</span>
          </div>
          <div className="bg-[#090a0f] p-3 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-bold mb-1 font-mono">Scenario Evaluation</span>
            <span className="text-zinc-200 font-medium truncate block">{parsedData.scenario_type || "Standard Parsing"}</span>
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${status === "escalated" ? "bg-red-500/5 border-red-500/20" : "bg-[#090a0f] border-[#d4af37]/25"}`}>
          <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-bold mb-2 font-mono">Agent Response</span>
          <p className={`text-xs leading-relaxed whitespace-pre-wrap ${status === "escalated" ? "text-red-200/90 font-mono" : "text-zinc-300"}`}>
            {parsedData.ai_response || rawText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className={`text-xs leading-relaxed whitespace-pre-wrap ${status === "escalated" ? "text-red-200/90 font-mono" : "text-zinc-300"}`}>
      {rawText}
    </p>
  );
}

export default function InboxPanel({ logs, selectedLog, onSelectLog }: InboxPanelProps) {
  const { threads, activeThread, setActiveThreadId, sendMessage, isTyping } = useChat();
  const [replyText, setReplyText] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, isTyping]);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    const textToSend = replyText;
    setReplyText("");
    await sendMessage(textToSend);
  };

  const handlePayDeposit = async (logId: string) => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/agent/pay-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });
      if (res.ok) {
        alert("Deposit payment verified! Supplier Sourcing Agent deployed.");
        window.location.reload();
      } else {
        alert("Payment capture transaction failed.");
      }
    } catch (e) {
      console.error("Mock payment error:", e);
      alert("Mock payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-[55vh] animate-fadeIn">
      {/* Thread list */}
      <div className="md:col-span-5 border-r border-zinc-800/60 pr-2 space-y-3 max-h-[55vh] overflow-y-auto">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">Message Threads</h3>
        {threads.length === 0 ? (
          <div className="text-xs text-zinc-600 font-mono text-center py-12">No messages yet.</div>
        ) : (
          threads.map((thread) => {
            const isReview = thread.status === "review_required";
            const isApproved = thread.status === "approved";
            const isSourcing = thread.status === "sourcing_active";
            const isProcessing = thread.status === "processing";
            const isSelected = activeThread?.id === thread.id;
            
            // Get preview of the last message in the thread
            const lastMsgObj = thread.messages[thread.messages.length - 1];
            const previewMsg = lastMsgObj?.content || "";
            
            // If the preview is JSON (like the first assistant response), try to extract clean response text
            let cleanPreview = previewMsg;
            try {
              const cleaned = previewMsg.replace("<action>PAUSE</action>", "").trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.ai_response) {
                cleanPreview = parsed.ai_response;
              }
            } catch {}

            // Determine badge classes and label based on state machine
            let badgeClass = "bg-zinc-800 text-zinc-400 border border-zinc-700";
            let badgeLabel = "Draft";
            if (isReview) {
              badgeClass = "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse";
              badgeLabel = "Under Review";
            } else if (isApproved) {
              badgeClass = "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20";
              badgeLabel = "Quote Ready";
            } else if (isSourcing) {
              badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse";
              badgeLabel = "Sourcing";
            } else if (isProcessing) {
              badgeClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
              badgeLabel = "Processing";
            }

            return (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden ${
                  isSelected
                    ? thread.agentOverride
                      ? "bg-[#090a0f] border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse-slow"
                      : "bg-[#090a0f] border-[#d4af37] shadow-xl"
                    : thread.agentOverride
                      ? "bg-red-950/5 border-red-900/20 hover:border-red-900/40"
                      : "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className={`text-xs font-bold truncate max-w-[140px] ${isSelected ? "text-white" : "text-zinc-300"}`}>{thread.subject}</p>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                    {thread.agentOverride && (
                      <span className="text-[7px] bg-red-500/10 text-red-400 border border-red-500/25 px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider animate-pulse">
                        Takeover
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 truncate mt-1.5">{cleanPreview}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Message Chat View */}
      <div className="md:col-span-7 flex flex-col h-[55vh] justify-between">
        {activeThread ? (
          <div className="flex flex-col h-full justify-between overflow-hidden">
            {/* Thread Header */}
            <div className="border-b border-zinc-800 pb-3 shrink-0 flex justify-between items-end">
              <div>
                <span className="text-[9px] font-mono text-[#d4af37] uppercase tracking-wider">Subject</span>
                <h2 className="text-sm font-bold text-white mt-0.5 leading-snug">{activeThread.subject}</h2>
              </div>
              {activeThread.agentOverride && (
                <div className="flex items-center gap-1.5 bg-red-950/20 border border-red-500/30 px-2 py-0.5 rounded text-red-400 font-mono text-[8px] font-bold tracking-wider uppercase animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span>Human Support Active</span>
                </div>
              )}
            </div>

            {/* Conversation Log (Scrollable Area) */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {activeThread.messages.map((msg, index) => {
                const isUser = msg.role === "user";
                const isThreadEsc = activeThread.status === "review_required";
                const isTakeoverMsg = !isUser && (msg.isHuman === true || msg.content.startsWith("This is the StitchHub Custom Mill team stepping in"));
                return (
                  <div
                    key={index}
                    className={`flex flex-col space-y-1 max-w-[85%] ${
                      isUser ? "mr-auto items-start" : "ml-auto items-end"
                    }`}
                  >
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                      {isUser 
                        ? "You" 
                        : isTakeoverMsg
                          ? "StitchHub Operations Manager" 
                          : "StitchHub Agent"
                      }
                    </span>
                    <div className={`p-3.5 rounded-xl border text-xs leading-relaxed shadow-md ${
                      isUser
                        ? "bg-zinc-900/50 border-zinc-800/80 text-zinc-300 rounded-tl-none"
                        : isTakeoverMsg
                          ? "bg-red-950/10 border-red-500/30 text-red-200/90 border-dashed rounded-tr-none shadow-[0_0_8px_rgba(239,68,68,0.05)]"
                          : "bg-[#d4af37]/5 border-[#d4af37]/20 text-zinc-300 rounded-tr-none"
                    }`}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        renderParsedAiResponse(msg.content, isTakeoverMsg ? "escalated" : "drafted")
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col space-y-1 items-end ml-auto max-w-[85%]">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    StitchHub Agent
                  </span>
                  <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/30 text-zinc-300 rounded-tr-none flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">Thinking</span>
                    <DancingDots color="gold" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Pinned Status Banners / Cards */}
            <div className="shrink-0 space-y-2 mb-2">
              {activeThread.status === "review_required" && !activeThread.agentOverride && (
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3.5 text-xs text-red-200/90 flex items-center gap-3 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="font-medium leading-relaxed">
                    Verifying order specs against factory floor capacity...
                  </span>
                </div>
              )}

              {activeThread.agentOverride && activeThread.status === "review_required" && (
                <div className="bg-red-950/15 border border-red-500/25 rounded-xl p-3.5 text-xs text-red-200/90 flex items-center gap-3 shadow-[0_0_12px_rgba(239,68,68,0.1)]">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="font-medium leading-relaxed">
                    StitchHub Human Operations Manager has intercepted this thread. Direct conversation is enabled.
                  </span>
                </div>
              )}

              {activeThread.status === "approved" && (
                <div className="bg-zinc-900/80 border border-[#d4af37]/30 rounded-xl p-4 space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Wholesale Production Quote</span>
                    <span className="text-[#d4af37] font-bold text-base font-mono">${activeThread.finalQuoteAmount || "0.00"}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal font-mono">
                    Your production specs have been verified. Secure a 30% deposit payment to lock in the production queue and activate supplier material sourcing.
                  </p>
                  <button
                    onClick={() => handlePayDeposit(activeThread.id)}
                    disabled={isPaying}
                    className="w-full py-2.5 bg-[#d4af37] hover:bg-[#bfa032] disabled:opacity-50 text-[#090a0f] rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer text-center"
                  >
                    {isPaying ? "Processing Secure Deposit..." : "Proceed to Secure Deposit Payment"}
                  </button>
                </div>
              )}

              {activeThread.status === "sourcing_active" && (
                <div className="bg-[#10b981]/5 border border-[#10b981]/20 rounded-xl p-4 space-y-1 shadow-md">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sourcing Active</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Your deposit payment has cleared. The Supplier AI Procurement Agent is currently verifying raw materials availability and dispatching POs to distributors.
                  </p>
                </div>
              )}

              {activeThread.status === "processing" && (
                <div className="bg-blue-950/10 border border-blue-900/30 rounded-xl p-4 space-y-2 shadow-md">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>Production Queue Processing</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Materials locked. Manufacturing process has officially initiated on the factory floor.
                  </p>
                </div>
              )}
            </div>

            {/* Chat Input Area */}
            <div className="border-t border-zinc-800 pt-3 shrink-0 flex gap-2.5 items-end">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (activeThread.status !== "review_required" || activeThread.agentOverride) handleSend();
                  }
                }}
                disabled={activeThread.status === "review_required" && !activeThread.agentOverride}
                placeholder={
                  activeThread.status === "review_required" && !activeThread.agentOverride
                    ? "Chat is locked during review." 
                    : activeThread.agentOverride
                      ? "Type your response to Operations Manager..."
                      : "Type your response to StitchHub Agent..."
                }
                className={`flex-1 bg-zinc-900/40 border rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:ring-1 focus:outline-none resize-none h-12 leading-relaxed transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeThread.agentOverride
                    ? "border-red-950/60 focus:border-red-500 focus:ring-red-500"
                    : "border-zinc-800 focus:border-[#d4af37] focus:ring-[#d4af37]"
                }`}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !replyText.trim() || (activeThread.status === "review_required" && !activeThread.agentOverride)}
                className={`h-12 w-12 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${
                  activeThread.agentOverride
                    ? "bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-[#d4af37] hover:bg-[#bfa032] text-[#090a0f] disabled:opacity-40 disabled:hover:bg-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                }`}
                title="Send Message"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-zinc-600 font-mono py-24">
            Select a message thread to view details and start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
