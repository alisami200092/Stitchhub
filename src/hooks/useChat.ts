"use client";

import { useState, useEffect } from "react";

export type Message = {
  role: "user" | "assistant";
  content: string;
  isHuman?: boolean;
};

export type ChatThread = {
  id: string;
  subject: string;
  status: "draft sourcing" | "review required" | "approved" | "processing" | "shipping" | "delivered";
  messages: Message[];
  finalQuoteAmount?: string | null;
  agentOverride?: boolean;
};

export function useChat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // 1. Fetch historical threads from local API route on load (bypasses RLS limits)
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch("/api/agent/history");
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.logs) {
          const formattedThreads = data.logs.map((log: any) => {
            let history: Message[] = [];
            
            try {
              // Try parsing multi-turn format
              const parsed = JSON.parse(log.aiResponseDraft || "");
              if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].role) {
                history = parsed;
              } else {
                throw new Error();
              }
            } catch {
              // Fallback for initial checkout text
              history = [
                { role: "user", content: log.body || "" },
                { role: "assistant", content: log.aiResponseDraft || "No response generated." }
              ];
            }

            let mappedStatus = log.status || "draft sourcing";
            if (mappedStatus === "escalated" || mappedStatus === "pending" || mappedStatus === "review_required" || mappedStatus === "review required") {
              mappedStatus = "review required";
            } else if (mappedStatus === "drafted" || mappedStatus === "draft_sourcing" || mappedStatus === "draft sourcing") {
              mappedStatus = "draft sourcing";
            } else if (mappedStatus === "sourcing_active" || mappedStatus === "sourcing active") {
              mappedStatus = "processing";
            }

            // Check if any assistant message has escalation keywords (e.g. from historical runs)
            const hasEscalationKeyword = history.some(
              (msg) =>
                msg.role === "assistant" &&
                !msg.isHuman &&
                (msg.content.toLowerCase().includes("escalat") ||
                  msg.content.toLowerCase().includes("stitchhub team") ||
                  msg.content.toLowerCase().includes("admin team") ||
                  msg.content.toLowerCase().includes("human admin") ||
                  msg.content.toLowerCase().includes("operations manager") ||
                  msg.content.toLowerCase().includes("custom mill team"))
            );

            if (hasEscalationKeyword && (mappedStatus === "draft sourcing" || mappedStatus === "review required")) {
              mappedStatus = "review required";
            }

            return {
              id: log.id,
              subject: log.subject,
              status: mappedStatus as "draft sourcing" | "review required" | "approved" | "processing" | "shipping" | "delivered",
              messages: history,
              finalQuoteAmount: log.finalQuoteAmount,
              agentOverride: log.agentOverride
            };
          });

          setThreads(formattedThreads);
          if (formattedThreads.length > 0) setActiveThreadId(formattedThreads[0].id);
        }
      } catch (err) {
        console.error("Chat Thread Sync Error:", err);
      }
    };
    fetchThreads();
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  // 2. Send message, get AI reply, and persist on server
  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeThread) return;

    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...activeThread.messages, userMessage];

    // Optimistic UI Update
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, messages: updatedMessages } : t))
    );
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: updatedMessages,
          threadId: activeThreadId 
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to receive AI response.");
      }

      const aiMessage: Message = { role: "assistant", content: data.reply };
      const finalMessages = [...updatedMessages, aiMessage];

      // Update UI with AI reply
      setThreads((prev) =>
        prev.map((t) => (t.id === activeThreadId ? { ...t, messages: finalMessages } : t))
      );

    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return { threads, activeThread, setActiveThreadId, sendMessage, isTyping };
}