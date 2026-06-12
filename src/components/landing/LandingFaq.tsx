// ──────────────────────────────────────────────
// LandingFaq — Accordion FAQ section controlled by parent state
// ──────────────────────────────────────────────

"use client";

interface LandingFaqProps {
  openIdx: number | null;
  onToggle: (idx: number) => void;
}

/** Accordion-style FAQ — one item open at a time via openIdx/onToggle props */
export default function LandingFaq({ openIdx, onToggle }: LandingFaqProps) {
  // ── FAQ data: questions and answers about B2B apparel operations ──
  const faqs = [
    {
      q: "What is your minimum B2B order volume?",
      a: "Our bulk garment runs typically start at 100 units per style to balance raw material sourcing and setup costs. For high-volume projects or continuous fulfillment plans, we offer custom volume tiers."
    },
    {
      q: "How does your color matching work?",
      a: "We use spectral analysis to match your brand colors across different fabric types — whether it&apos;s 100% cotton or poly-blends. Your hex codes get converted to factory dye formulas so your branding stays consistent."
    },
    {
      q: "What are your production and shipping timelines?",
      a: "Standard design review takes 48 hours. Production generally takes 10 to 14 business days depending on volume, followed by fast customs clearance and door-to-door delivery."
    },
    {
      q: "Can we review samples before committing to production?",
      a: "Absolutely. We build detailed digital mockups first. Once approved, you can request physical samples showing the actual stitch and embroidery quality before the bulk run."
    }
  ];

  return (
    <section className="bg-[#f5f2eb] py-24 px-6 md:px-12 text-zinc-900 border-t border-zinc-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Frequently Asked Questions</h2>
          <p className="text-zinc-600 text-lg leading-relaxed max-w-2xl mx-auto">
            Clear, transparent operational answers regarding our custom apparel logistics and tech integrations.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden transition-all duration-300 shadow-sm"
              >
                {/* Accordion Toggle Button — clicking toggles this item open/closed via parent state */}
                <button
                  onClick={() => onToggle(i)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-lg text-zinc-900 pr-6">
                    {faq.q}
                  </span>
                  {/* Chevron rotates 180° when the item is open */}
                  <span className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {/* Collapsible Answer Panel — animated max-h transition for open/close, opacity fades in/out */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-75 border-t border-zinc-100 p-6 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <p className="text-zinc-600 text-base leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
