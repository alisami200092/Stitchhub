// ──────────────────────────────────────────────
// SupabaseProvider.tsx — Auth session provider with consumer hook
// ──────────────────────────────────────────────

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

/**
 * Context shape: exposes the current Supabase session, user, and loading flag.
 * Components can subscribe to auth state without re-creating the Supabase client.
 */
interface SupabaseContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const Context = createContext<SupabaseContextType | undefined>(undefined);

/**
 * Wraps the app tree with Supabase auth context.
 * - Calls getSession on mount to hydrate the initial session.
 * - Subscribes to onAuthStateChange for real-time updates (login, logout, token refresh).
 * - Cleans up the subscription on unmount to prevent memory leaks.
 */
export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  // Start in loading state; cleared once getSession resolves or auth event fires
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // ── getSession on mount — hydrate initial auth state ──
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // ── onAuthStateChange listener subscription — react to login/logout/refresh ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // ── Cleanup on unmount — unsubscribe listener ──
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <Context.Provider value={{ session, user, isLoading }}>
      {children}
    </Context.Provider>
  );
}

/**
 * useSupabase consumer hook.
 * Throws an error if called outside of SupabaseProvider to catch misuse at dev time.
 */
export const useSupabase = () => {
  const context = useContext(Context);
  // Error guard — ensures the provider wraps the consuming component
  if (!context) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};
