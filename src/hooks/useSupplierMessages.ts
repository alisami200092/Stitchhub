"use client";

import React, { useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSupplierStore } from "@/stores/supplier-store";

export function useSupplierMessages() {
  const {
    threads,
    activeThread,
    messageText,
    chatMessages,
    loadingThreads,
    statusMessage,
    setThreads,
    setActiveThread,
    setMessageText,
    setChatMessages,
    setLoadingThreads,
    setStatusMessage,
  } = useSupplierStore();

  // 1. Fetch unique active threads from supplier_bids and email_logs
  const fetchThreads = useCallback(async () => {
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

      // Fetch unique order IDs from email_logs with status 'draft_sourcing' or 'review_required' (active RFQs)
      const { data: logs } = await supabase
        .from("email_logs")
        .select("metadata")
        .in("status", ["draft_sourcing", "review_required", "draft sourcing", "review required"]);
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
      if (dynamicThreads.length > 0 && !activeThread) {
        setActiveThread(dynamicThreads[0].id);
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  }, [activeThread, setThreads, setActiveThread, setLoadingThreads]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

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
          const currentMsgs = useSupplierStore.getState().chatMessages;
          if (!currentMsgs.some(m => m.id === payload.new.id)) {
            setChatMessages([...currentMsgs, payload.new]);
          }

          // Also update the thread list's last message text and time in real-time
          const currentThreads = useSupplierStore.getState().threads;
          const updatedThreads = currentThreads.map((t: any) => 
            t.id === activeThread 
              ? {
                  ...t,
                  lastMessage: payload.new.message_text,
                  time: new Date(payload.new.createdAt || payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              : t
          );
          setThreads(updatedThreads);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread, setChatMessages, setThreads]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !messageText.trim()) return;

    const textToSend = messageText.trim();
    setMessageText("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("supplier_messages")
        .insert({
          order_id: activeThread,
          sender: "supplier",
          message_text: textToSend,
        })
        .select();

      if (!error && data && data.length > 0) {
        const currentMsgs = useSupplierStore.getState().chatMessages;
        if (!currentMsgs.some((m) => m.id === data[0].id)) {
          setChatMessages([...currentMsgs, data[0]]);
        }
        setStatusMessage("Message sent to Admin!");
        setTimeout(() => setStatusMessage(null), 3000);
      }

      if (error) {
        console.error("Error inserting message:", error);
      }
    } catch (err) {
      console.error("Unexpected messaging error:", err);
    }
  };

  return {
    threads,
    activeThread,
    messageText,
    chatMessages,
    loadingThreads,
    statusMessage,
    setActiveThread,
    setMessageText,
    handleSendMessage,
  };
}
