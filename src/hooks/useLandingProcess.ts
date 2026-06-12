"use client";

// ─────────────────────────────────────────────────────────────
// useLandingProcess — Active step tracker for the How-It-Works section
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

/**
 * Returns activeStep index and a setter so the landing page can highlight the current process step.
 */
export function useLandingProcess() {
  const [activeStep, setActiveStep] = useState(0);

  return { activeStep, setActiveStep };
}
