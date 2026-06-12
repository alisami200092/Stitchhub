// ──────────────────────────────────────────────
// Navbar.tsx — Top navigation bar with brand, nav links, cart, and user auth dropdown
// ──────────────────────────────────────────────

"use client";

import React from "react";
import Link from "next/link";
import { useNavbar } from "../hooks/useNavbar";

/**
 * Primary site navigation bar.
 * Displays brand identity, global navigation links, cart icon with badge,
 * and a dynamic user profile / authentication slot.
 */
export default function Navbar() {
  const {
    session,
    status,
    cartCount,
    openCart,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleSignOut,
  } = useNavbar();

  return (
    <nav className="w-full bg-black border-b border-zinc-900 sticky top-0 z-50 px-6 md:px-12 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">

        {/* ── Brand Identity Zone ── */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <svg className="w-6 h-6 text-[#d4af37] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="text-xl font-black tracking-widest text-white select-none">
            STITCH<span className="text-[#d4af37]">HUB</span>
          </div>
        </Link>

        {/* ── Nav Links ── */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <Link href="/products/checkout" className="hover:text-white transition-colors">Quote</Link>
        </div>

        {/* ── Right Side: Cart Icon + Authentication ── */}
        <div className="flex items-center gap-6">

          {/* Cart icon with quantity count badge */}
          <button
            onClick={openCart}
            className="relative p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
          >
            <svg className="w-6 h-6 group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {/* Gold badge showing total cart item count */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-[#d4af37] text-black text-[10px] font-black rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-[0_0_10px_rgba(212,175,55,0.5)]">
              {cartCount}
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-zinc-800 hidden md:block"></div>

          {/* ── Loading skeleton vs user avatar vs sign-in button ── */}
          {status === "loading" ? (
            // Pulse skeleton while auth status resolves
            <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse" />
          ) : session?.user ? (
            // Authenticated user — gold avatar circle triggers dropdown menu
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-linear-to-br from-[#b38e20] to-[#ebd06f] flex items-center justify-center text-black font-black text-sm uppercase shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer select-none border border-transparent hover:border-white transition-colors"
              >
                {/* First letter of user's name, fallback to "U" */}
                {session.user.name ? session.user.name.charAt(0) : "U"}
              </button>

              {/* ── Dropdown Menu Structure ── */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#121316] border border-zinc-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] py-2 z-50 animate-scaleIn">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-zinc-900">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Partner Account</p>
                    <p className="text-sm font-semibold text-white truncate mt-0.5">{session.user.name}</p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{session.user.email}</p>
                  </div>

                  <Link href="/profile" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-[#d4af37] hover:bg-white/5 transition-colors">
                    Partner Profile
                  </Link>

                  <Link href="/products/checkout" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
                    Order Workspace
                  </Link>

                  {/* signOut handler — clears session and redirects */}
                  <div className="border-t border-zinc-900 mt-1 pt-1">
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Unauthenticated — gold "Sign In" link
            <Link href="/auth/login" className="text-xs tracking-wider uppercase font-bold text-black bg-[#d4af37] hover:bg-[#ebd06f] px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.15)]">
              Sign In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}
