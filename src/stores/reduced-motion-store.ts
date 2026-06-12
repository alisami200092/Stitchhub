// ──────────────────────────────────────────────
// reduced-motion-store.ts — SSR-safe prefers-reduced-motion observer
// ──────────────────────────────────────────────

import { create } from "zustand";

/**
 * Tracks the user's system-level "prefers-reduced-motion" preference
 * so the UI can disable or tone down animations out of respect for
 * accessibility settings.
 */
interface ReducedMotionState {
  prefersReduced: boolean;
  setPrefersReduced: (value: boolean) => void;
}

/**
 * Reads the OS-level accessibility preference at init time so every
 * animation-aware component can check prefersReduced and skip or
 * soften animations.
 */
export const useReducedMotionStore = create<ReducedMotionState>()((set) => ({
  // Guard against SSR: window is undefined on the server, so we default
  // to false (motion allowed). On the client, matchMedia reads the real
  // system preference.
  prefersReduced:
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  setPrefersReduced: (prefersReduced) => set({ prefersReduced }),
}));
