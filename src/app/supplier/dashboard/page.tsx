"use client";

import React, { useState } from "react";
import ActiveRfqsTab from "./components/ActiveRfqsTab";
import SubmittedQuotesTab from "./components/SubmittedQuotesTab";
import MessagesTab from "./components/MessagesTab";

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState<"active" | "quotes" | "messages">("active");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-white">StitchHub <span className="font-light text-zinc-400">Procurement</span></span>
                <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Supplier Portal</span>
              </div>
            </div>

            {/* Profile / Notification */}
            <div className="flex items-center gap-4">
              <button className="text-zinc-400 hover:text-amber-500 transition-colors relative">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-8">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-4 px-4 text-sm font-medium transition-all ${activeTab === "active" ? "text-amber-500 border-b-2 border-amber-500" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            ACTIVE REQUESTS
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`pb-4 px-4 text-sm font-medium transition-all ${activeTab === "quotes" ? "text-amber-500 border-b-2 border-amber-500" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            SUBMITTED QUOTES
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`pb-4 px-4 text-sm font-medium transition-all ${activeTab === "messages" ? "text-amber-500 border-b-2 border-amber-500" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            MESSAGES
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-opacity duration-300">
          {activeTab === "active" && <ActiveRfqsTab />}
          {activeTab === "quotes" && <SubmittedQuotesTab />}
          {activeTab === "messages" && <MessagesTab />}
        </div>
      </main>
    </div>
  );
}
