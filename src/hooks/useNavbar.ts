"use client";

// ─────────────────────────────────────────────────────────────
// useNavbar — Session state, dropdown toggle, cart badge, sign-out
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { useSupabase } from "../providers/SupabaseProvider";
import { createClient } from "../utils/supabase/client";
import { useCartStore } from "../stores/cart-store";

/**
 * Returns a normalized session (matching the shape the Navbar expects),
 * an auth status string, cart item count, dropdown ref/handlers, and signOut.
 */
export function useNavbar() {
  const { session, isLoading } = useSupabase();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = useCartStore((s) => s.cart.reduce((acc, item) => acc + item.quantity, 0));
  const setIsOpen = useCartStore((s) => s.setIsOpen);

  const status = isLoading ? "loading" : session ? "authenticated" : "unauthenticated";

  // Map Supabase session shape to { user: { name, email } } as Navbar components expect
  const normalizedSession = session?.user ? {
    user: {
      name: session.user.user_metadata.name || session.user.email?.split("@")[0] || "User",
      email: session.user.email,
    }
  } : null;

  // Close dropdown when user clicks outside the dropdown DOM node
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sign out from Supabase and redirect to login page
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return {
    session: normalizedSession,
    status,
    cartCount,
    openCart: () => setIsOpen(true),
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleSignOut,
  };
}
