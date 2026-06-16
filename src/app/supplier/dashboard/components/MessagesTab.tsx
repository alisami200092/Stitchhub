import React, { useState, useEffect } from "react";
import { createClient } from "../../../../utils/supabase/client";

export default function MessagesTab() {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  // 1. Fetch unique active threads from supplier_bids and email_logs
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingThreads(false);
          return;
        }
        
        // Fetch unique order IDs from supplier_bids (past bids by this supplier)
        const { data: bids } = await supabase
          .from("supplier_bids")
          .select("order_id")
          .eq("supplier_name", user.email);
        const bidOrderIds = bids ? bids.map((b) => b.order_id) : [];

        // Fetch unique order IDs from email_logs with status 'draft_sourcing' (active RFQs)
        const { data: logs } = await supabase
          .from("email_logs")
          .select("metadata")
          .eq("status", "draft_sourcing");
        const logOrderIds = logs ? logs.map((l) => (l.metadata as any)?.invoiceNumber).filter(Boolean) : [];

        // Combine and get unique IDs
        const uniqueOrderIds = Array.from(new Set([...bidOrderIds, ...logOrderIds]));

        if (uniqueOrderIds.length === 0) {
          setThreads([]);
          setLoadingThreads(false);
          return;
        }

        // Fetch last message for each of these unique order IDs from supplier_messages
        const { data: msgData } = await supabase
          .from("supplier_messages")
          .select("*")
          .in("order_id", uniqueOrderIds)
          .order("created_at", { ascending: false });

        const dynamicThreads = uniqueOrderIds.map((orderId) => {
          const threadMsgs = msgData?.filter((m) => m.order_id === orderId) || [];
          const lastMsg = threadMsgs[0]; // because it's sorted descending
          const timeStr = lastMsg 
            ? new Date(lastMsg.createdAt || lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : "";
          return {
            id: orderId,
            title: `RFQ #${orderId}`,
            lastMessage: lastMsg ? lastMsg.message_text : "No messages yet. Open correspondence log",
            time: timeStr,
            unread: false
          };
        });

        setThreads(dynamicThreads);
        if (dynamicThreads.length > 0) {
          setActiveThread(dynamicThreads[0].id);
        }
      } catch (err) {
        console.error("Failed to load threads:", err);
      } finally {
        setLoadingThreads(false);
      }
    };
    fetchThreads();
  }, []);

  // 2. Fetch and subscribe to chat messages matching activeThread in real-time
  useEffect(() => {
    if (!activeThread) {
      setChatMessages([]);
      return;
    }

    const supabase = createClient();

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("supplier_messages")
        .select("*")
        .eq("order_id", activeThread)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setChatMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to new supplier_messages
    const channel = supabase
      .channel(`supplier_messages:${activeThread}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "supplier_messages",
          filter: `order_id=eq.${activeThread}`,
        },
        (payload) => {
          setChatMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });

          // Also update the thread list's last message text and time in real-time
          setThreads((prevThreads) => 
            prevThreads.map((t) => 
              t.id === activeThread 
                ? {
                    ...t,
                    lastMessage: payload.new.message_text,
                    time: new Date(payload.new.createdAt || payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                : t
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !message.trim()) return;

    const textToSend = message.trim();
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("supplier_messages")
        .insert({
          order_id: activeThread,
          sender: "supplier",
          message_text: textToSend,
        });

      if (error) {
        console.error("Error inserting message:", error);
      }
    } catch (err) {
      console.error("Unexpected messaging error:", err);
    }
  };

  if (loadingThreads) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl mx-auto p-8">
        <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-bold text-zinc-300 mb-2">No Active Conversations</h3>
        <p className="text-zinc-500 text-sm">
          You do not have any active message threads. Threads are created automatically when an RFQ is assigned to sourcing or when a pricing bid is submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex h-[600px]">
      
      {/* Left Sidebar: Threads */}
      <div className="w-1/3 border-r border-zinc-800 bg-zinc-950/30 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Active Threads</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              className={`w-full text-left p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors ${
                activeThread === thread.id ? "bg-zinc-800/80 border-l-2 border-l-amber-500" : "border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1 font-mono">
                <span className="text-xs font-bold text-zinc-100">{thread.id}</span>
                <span className="text-xs text-zinc-500">{thread.time}</span>
              </div>
              <p className="text-sm text-zinc-300 truncate mb-1">{thread.title}</p>
              <p className="text-xs truncate text-zinc-500">
                {thread.lastMessage}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-900">
        {/* Chat Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/20">
          <div>
            <h3 className="text-lg font-medium text-white">{activeThread}</h3>
            <p className="text-xs text-zinc-400">Logistical Chat with StitchHub Admin</p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold animate-pulse">
            Live Link
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <span className="text-xs text-zinc-600 font-medium uppercase tracking-widest">Message Log</span>
          </div>

          {chatMessages.length === 0 ? (
            <div className="text-center text-zinc-500 text-xs py-12 font-mono italic">
              No correspondence recorded for this thread yet.<br/>
              Type a message below to coordinate with the admin.
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isAdmin = msg.sender === "admin";
              return (
                <div key={msg.id} className={`flex gap-4 ${isAdmin ? "" : "flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isAdmin 
                      ? "bg-zinc-800 border-zinc-700 text-zinc-400" 
                      : "bg-amber-500/20 border-amber-500/30 text-amber-500"
                  }`}>
                    <span className="text-xs font-bold">{isAdmin ? "SH" : "YOU"}</span>
                  </div>
                  <div className={`p-4 rounded-2xl rounded-tl-sm max-w-[80%] ${
                    isAdmin 
                      ? "bg-zinc-800 text-zinc-100" 
                      : "bg-amber-500/10 border border-amber-500/20 text-zinc-100"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message_text}</p>
                    <span className={`text-[10px] mt-2 block ${isAdmin ? "text-zinc-500" : "text-amber-500/60 text-right"}`}>
                      {new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message to StitchHub..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-4 pr-16 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-amber-500 text-zinc-950 rounded-lg flex items-center justify-center hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
