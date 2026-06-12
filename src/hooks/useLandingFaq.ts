"use client";

// ─────────────────────────────────────────────────────────────
// useLandingFaq — Accordion-style FAQ toggle (one open at a time)
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

/**
 * Returns openIdx (null when all collapsed) and a toggle function that opens or closes an item.
 */
export function useLandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return { openIdx, toggle };
}
