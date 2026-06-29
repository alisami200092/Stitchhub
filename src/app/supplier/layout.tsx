"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSupplierStore } from "@/stores/supplier-store";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setActiveThread = useSupplierStore((state) => state.setActiveThread);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("supplier_messages")
          .select("*")
          .neq("sender", "supplier")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setNotifications(data);
          
          // Check if there are messages newer than lastSeen
          const lastSeen = localStorage.getItem("supplier_notifications_last_seen");
          if (data.length > 0) {
            const newestTime = new Date(data[0].created_at || data[0].createdAt || "").getTime();
            if (!lastSeen || newestTime > parseInt(lastSeen, 10)) {
              setHasUnread(true);
            } else {
              setHasUnread(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();

    // Subscribe to real-time new supplier_messages
    const channel = supabase
      .channel("supplier_notifications_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "supplier_messages",
        },
        (payload) => {
          if (payload.new.sender !== "supplier") {
            setNotifications((prev) => [payload.new, ...prev.slice(0, 9)]);
            setHasUnread(true);
          }
        }
      )
      .subscribe();

    // Click outside handler to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length > 0) {
      // Clear unread indicator
      const newestTime = new Date(notifications[0].created_at || notifications[0].createdAt || "").getTime();
      localStorage.setItem("supplier_notifications_last_seen", newestTime.toString());
      setHasUnread(false);
    }
  };

  const handleNotificationClick = (orderId: string) => {
    setActiveThread(orderId);
    setIsOpen(false);
    router.push("/supplier/messages");
  };

  const tabs = [
    { name: "ACTIVE REQUESTS", href: "/supplier/active-requests" },
    { name: "SUBMITTED QUOTES", href: "/supplier/submitted-quotes" },
    { name: "MESSAGES", href: "/supplier/messages" },
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 font-sans selection:bg-[#d4af37]/30 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-20 z-40 bg-[#070708]/60 backdrop-blur-md border-b border-zinc-900/60">
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
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              <button 
                onClick={handleToggleDropdown}
                className="text-zinc-400 hover:text-[#d4af37] transition-colors relative cursor-pointer p-2 rounded-full hover:bg-zinc-900/60"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#d4af37] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)] animate-pulse"></span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 top-12 w-80 bg-zinc-950/95 border border-zinc-900 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-lg animate-fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-900">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] font-mono">Notifications</span>
                    {hasUnread && (
                      <button 
                        onClick={() => {
                          if (notifications.length > 0) {
                            const newestTime = new Date(notifications[0].created_at || notifications[0].createdAt || "").getTime();
                            localStorage.setItem("supplier_notifications_last_seen", newestTime.toString());
                            setHasUnread(false);
                          }
                        }}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase cursor-pointer bg-transparent border-0"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-xs text-zinc-600 font-mono italic">
                        No notifications received yet.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isAgent = notif.sender === "stitchhub_procurement_agent";
                        const timeStr = new Date(notif.created_at || notif.createdAt || "").toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric'
                        });

                        return (
                          <div 
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif.order_id || notif.orderId)}
                            className="p-3 bg-zinc-900/30 hover:bg-[#d4af37]/5 border border-zinc-900 hover:border-[#d4af37]/20 rounded-xl transition-all duration-200 cursor-pointer text-left"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-zinc-400 font-mono">
                                {notif.order_id || notif.orderId}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono tracking-wider ${
                                isAgent 
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                  : "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20"
                              }`}>
                                {isAgent ? "Agent" : "Admin"}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-1.5 font-medium">
                              {notif.message_text || notif.messageText}
                            </p>
                            <span className="text-[9px] text-zinc-600 font-mono block">
                              {timeStr}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
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
