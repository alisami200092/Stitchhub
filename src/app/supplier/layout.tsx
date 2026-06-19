"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "ACTIVE REQUESTS", href: "/supplier/active-requests" },
    { name: "SUBMITTED QUOTES", href: "/supplier/submitted-quotes" },
    { name: "MESSAGES", href: "/supplier/messages" },
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 font-sans selection:bg-[#d4af37]/30 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#070708]/60 backdrop-blur-md border-b border-zinc-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-white font-display">
                  StitchHub <span className="text-[#d4af37] font-medium">Procurement</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-bold mt-0.5">
                  Supplier Portal
                </span>
              </div>
            </div>

            {/* Profile / Notification */}
            <div className="flex items-center gap-4">
              <button className="text-zinc-400 hover:text-[#d4af37] transition-colors relative cursor-pointer">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#d4af37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Tabs (Pill style container) */}
        <div className="flex gap-2 p-1.5 bg-zinc-900/30 border border-zinc-900 rounded-full w-fit mb-10 backdrop-blur-md">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-6 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-linear-to-r from-[#b38e20] via-[#ebd06f] to-[#b38e20] text-black shadow-[0_0_25px_rgba(212,175,55,0.25)]"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Page Content */}
        <div className="transition-opacity duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}
