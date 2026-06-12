"use client";

import React from "react";
import type { ProfileTab } from "@/types";

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  hasEscalations: boolean;
  onTabChange: (tab: ProfileTab) => void;
}

const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "inbox",
    label: "My Inbox",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
  },
  {
    key: "account",
    label: "Profile Settings",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: "security",
    label: "Security & 2FA",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    key: "ledger",
    label: "Order History",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export default function ProfileSidebar({ activeTab, hasEscalations, onTabChange }: ProfileSidebarProps) {
  return (
    <div className="flex flex-col space-y-2">
      {tabs.map(({ key, label, icon }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border font-medium text-xs transition-all ${
              isActive
                ? "bg-[#121316] text-white border-zinc-700 shadow-xl"
                : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/40"
            }`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span>{label}</span>
            </div>
            {key === "inbox" && hasEscalations && (
              <span className="h-2 w-2 rounded-full bg-red-500 ring-4 ring-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
