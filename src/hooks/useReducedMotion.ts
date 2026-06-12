// ─────────────────────────────────────────────────────────────
// useReducedMotion — OS-level prefers-reduced-motion listener
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useReducedMotionStore } from "../stores/reduced-motion-store";

/**
 * Returns a boolean reflecting the user's `prefers-reduced-motion` OS setting.
 * Subscribes to media query changes and syncs them to the Zustand store.
 */
export function useReducedMotion() {
  const prefersReduced = useReducedMotionStore((s) => s.prefersReduced);
  const setPrefersReduced = useReducedMotionStore((s) => s.setPrefersReduced);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Read initial value from the OS-level media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    // Subscribe to live changes (e.g. user toggles OS setting while page is open)
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [setPrefersReduced]);

  return prefersReduced;
}
