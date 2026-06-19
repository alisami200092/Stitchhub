"use client";

import React from "react";
import ChatThreadSidebar from "../../../components/supplier/ChatThreadSidebar";
import ChatMessageBubble from "../../../components/supplier/ChatMessageBubble";
import ChatInputForm from "../../../components/supplier/ChatInputForm";
import { useSupplierMessages } from "../../../hooks/useSupplierMessages";

export default function MessagesPage() {
  const {
    threads,
    activeThread,
    messageText,
    chatMessages,
    loadingThreads,
    statusMessage,
    setActiveThread,
    setMessageText,
    handleSendMessage,
  } = useSupplierMessages();

  if (loadingThreads) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="h-10 w-10 rounded-full border-4 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/30 border border-zinc-900 rounded-3xl max-w-2xl mx-auto p-8 backdrop-blur-md">
        <svg className="w-12 h-12 text-zinc-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-bold text-zinc-300 mb-2 font-display">No Active Conversations</h3>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          You do not have any active message threads. Threads are created automatically when an RFQ is assigned to sourcing or when a pricing bid is submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl flex h-[620px] backdrop-blur-md">
      
      {/* Left Sidebar: Threads */}
      <ChatThreadSidebar
        threads={threads}
        activeThreadId={activeThread}
        onSelectThread={setActiveThread}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-transparent">
        {/* Chat Header */}
        <div className="p-6 border-b border-zinc-900/80 flex justify-between items-center bg-zinc-950/10">
          <div>
            <h3 className="text-lg font-bold font-display text-white">{activeThread}</h3>
            <p className="text-xs text-zinc-400">Logistical Chat with StitchHub Admin</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-full text-[10px] uppercase font-bold tracking-wider animate-pulse-slow">
            Live Link
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest font-mono">Message Log</span>
          </div>

          {chatMessages.length === 0 ? (
            <div className="text-center text-zinc-500 text-xs py-12 font-mono italic">
              No correspondence recorded for this thread yet.<br/>
              Type a message below to coordinate with the admin.
            </div>
          ) : (
            chatMessages.map((msg) => (
              <ChatMessageBubble key={msg.id} msg={msg} />
            ))
          )}
        </div>

        {/* Chat Input */}
        <ChatInputForm
          message={messageText}
          onChange={setMessageText}
          onSubmit={handleSendMessage}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  );
}

