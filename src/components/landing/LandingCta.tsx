// ──────────────────────────────────────────────
// LandingCta — Centered 3-Column Wholesale Grid
// ──────────────────────────────────────────────

import Link from "next/link";

export default function LandingCta() {
  return (
    <section className="bg-black py-28 px-6 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto">

        {/* TOP: Title & Description */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 h-[1px] bg-[#d4af37]" />
            <p className="text-[#d4af37] text-xs font-mono uppercase tracking-widest">
              Built For Volume
            </p>
            <div className="w-8 h-[1px] bg-[#d4af37]" />
          </div>

          <h2 className="text-white font-bold text-4xl md:text-5xl tracking-tight mb-8 leading-tight">
            Transparent margins.<br />No hidden landed costs.
          </h2>

          <p className="text-zinc-400 text-lg leading-relaxed">
            From 50-unit pilot runs to 5,000-unit global rollouts, our pricing matrix calculates total landed costs upfront. Freight surcharges, customs duties, and material baseline rates are fully locked the second you approve the draft quote.
          </p>
        </div>

        {/* MIDDLE: 3 Boxes in a straight row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

          {/* Box 1: MOQ */}
          <div className="group bg-zinc-950/40 border border-zinc-900 rounded-xl p-8 hover:border-zinc-800 hover:bg-zinc-900/40 transition-all duration-300 text-left flex flex-col items-start h-full">
            <div className="h-14 w-14 rounded-full bg-black flex items-center justify-center border border-zinc-800 text-[#d4af37] text-xl font-bold font-mono mb-6 group-hover:border-[#d4af37]/40 transition-colors">
              50
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">Strict MOQ Floor</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Every custom run begins at a consistent 50-unit manufacturing threshold, maintaining a standard baseline across all catalog categories.
            </p>
          </div>

          {/* Box 2: Landed Cost */}
          <div className="group bg-zinc-950/40 border border-zinc-900 rounded-xl p-8 hover:border-zinc-800 hover:bg-zinc-900/40 transition-all duration-300 text-left flex flex-col items-start h-full">
            <div className="h-14 w-14 rounded-full bg-black flex items-center justify-center border border-zinc-800 text-[#d4af37] text-xl font-bold font-mono mb-6 group-hover:border-[#d4af37]/40 transition-colors">
              $
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">Landed Cost Calculation</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our matrix fully computes custom duties, freight, and material baselines into a single locked unit price before you pay.
            </p>
          </div>

          {/* Box 3: Volume Discounts */}
          <div className="group bg-zinc-950/40 border border-zinc-900 rounded-xl p-8 hover:border-zinc-800 hover:bg-zinc-900/40 transition-all duration-300 text-left flex flex-col items-start h-full">
            <div className="h-14 w-14 rounded-full bg-black flex items-center justify-center border border-zinc-800 text-[#d4af37] mb-6 group-hover:border-[#d4af37]/40 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">Tiered Discounts</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your unit economics improve automatically as production volume scales. Aggressive pricing tiers calculate dynamically at high volumes.
            </p>
          </div>

        </div>

        {/* BOTTOM: Action Button */}
        <div className="text-center pt-4">
          <Link
            href="/products"
            className="inline-block bg-[#d4af37] text-black px-12 py-4 rounded-md font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-black hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
          >
            Open Wholesale Catalog
          </Link>
        </div>

      </div>
    </section>
  );
}