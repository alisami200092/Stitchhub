"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    const base = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 backdrop-blur-md border";
    if (isActive) {
      return `${base} bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]`;
    }
    return `${base} text-zinc-400 hover:text-white hover:bg-white/10 border-transparent`;
  };

  return (
    // 🎯 The inline style guarantees the image loads from your public folder
    <div 
      className="fixed inset-0 z-50 flex text-zinc-100 font-body overflow-hidden bg-[#090a0f]"
      style={{
        backgroundImage: "url('/admin-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Dark overlay to ensure the glassmorphism pops and text is readable */}
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none"></div>
      
      {/* ── LEFT SIDEBAR NAVIGATION ── */}
      <aside className="w-64 bg-[#0a0a0f]/40 backdrop-blur-3xl border-r border-white/10 flex flex-col hidden md:flex shrink-0 relative z-10 shadow-2xl">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <svg className="w-6 h-6 text-[#d4af37] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-xl font-black tracking-widest text-white select-none">
              STITCH<span className="text-[#d4af37]">HUB</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-4 mb-4">Core Systems</div>
          
          <Link href="/admin" className={getLinkClass("/admin")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          <Link href="/admin/products" className={getLinkClass("/admin/products")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <span className="text-sm font-medium">Product Catalog</span>
          </Link>

          <Link href="/admin/orders" className={getLinkClass("/admin/orders")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span className="text-sm font-medium">Active Orders</span>
          </Link>



        </nav>

        {/* Admin Profile Footer */}
        <div className="p-4 border-t border-white/10 mt-auto bg-black/20">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="h-8 w-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xs font-bold text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]">AD</div>
            <div>
              <p className="text-xs font-bold text-white">System Admin</p>
              <p className="text-[10px] text-zinc-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE AREA ── */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 bg-transparent">
        <div className="p-8 relative w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
