// ──────────────────────────────────────────────────────
// page.tsx — Home / landing page (route: /)
// ──────────────────────────────────────────────────────
"use client";

import { useLandingProcess } from "../hooks/useLandingProcess";
import { useLandingFaq } from "../hooks/useLandingFaq";
import LandingHero from "../components/landing/LandingHero";
import LandingAiAdvantage from "../components/landing/LandingAiAdvantage";
import LandingProcess from "../components/landing/LandingProcess";
import LandingProductFeatures from "../components/landing/LandingProductFeatures";
import LandingProductLineup from "../components/landing/LandingProductLineup";
import LandingTestimonials from "../components/landing/LandingTestimonials";
import LandingFaq from "../components/landing/LandingFaq";
import LandingCta from "../components/landing/LandingCta";
import LandingFooter from "../components/landing/LandingFooter";

/** Home page — composes the full landing funnel from hero to footer */
export default function Home() {
  const { activeStep, setActiveStep } = useLandingProcess();
  const { openIdx, toggle } = useLandingFaq();

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-[#d4af37] selection:text-black">
      {/* 1. Hero — headline, sub-copy, primary CTA */}
      <LandingHero />

      {/* 2. AI advantage — glassmorphism card showcasing proprietary AI differentiator */}
      <LandingAiAdvantage />

      {/* 3. B2B process flow — interactive step-through of the operational pipeline */}
      <LandingProcess activeStep={activeStep} setActiveStep={setActiveStep} />

      {/* 4. Product features — high-contrast break-out highlighting key product benefits */}
      <LandingProductFeatures />

      {/* 5. Product lineup — grid of available sourcing categories */}
      <LandingProductLineup />

      {/* 6. Testimonials — verified B2B social proof carousel */}
      <LandingTestimonials />

      {/* 7. FAQ — accordion-driven frequently asked queries */}
      <LandingFaq openIdx={openIdx} onToggle={toggle} />

      {/* 8. Bottom CTA — final conversion call-to-action before footer */}
      <LandingCta />

      {/* 9. Footer — links, legal, brand */}
      <LandingFooter />
    </main>
  );
}