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
  // ── Corrected FAQ data matching StitchHub's actual business rules ──
  const faqs = [
    {
      q: "What is your minimum B2B order volume?",
      a: "To keep our production lines efficient and pass wholesale savings directly to you, our absolute minimum order quantity (MOQ) is strictly 50 units. This standard baseline applies across our entire catalog, whether you are ordering tech pouches or acoustic panels."
    },
    {
      q: "What are your standard production timelines?",
      a: "We operate on a strict, guaranteed 4-week (28-day) turnaround. Custom manufacturing requires precision, so we never skip steps or accept expedited rush fees. If your deadline is at least 28 days out, your timeline is 100% secure."
    },
    {
      q: "Can you accommodate custom structural garment changes?",
      a: "We focus exclusively on premium external decorations—like plush puff printing, woven labels, and precision embroidery—applied to our proven catalog. We do not deconstruct garments, alter internal liners, or take on bespoke cut-and-sew requests. This ensures your quality remains perfectly consistent and defect-free."
    },
    {
      q: "How does the automated quoting process work?",
      a: "It is incredibly fast. You submit your requirements, and our sourcing engine instantly audits inventory and calculates your margins. But no robots sign the final contracts—before your payment gateway is unlocked, one of our Operations Admins manually reviews your project to ensure every detail is perfect."
    }
  ];

  return (
    <section className="bg-[#f5f2eb] py-24 px-6 md:px-12 text-zinc-900 border-t border-zinc-200">
      <div className="max-w-4xl mx-auto">

        {/* Humanized Header with original light theme styling */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Frequently Asked Questions</h2>
          <p className="text-zinc-600 text-lg leading-relaxed max-w-2xl mx-auto">
            No corporate fluff. Just straightforward, operational answers regarding our production lines, timelines, and technical capabilities.
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
                {/* Accordion Toggle Button */}
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

                {/* Collapsible Answer Panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-75 border-t border-zinc-100 p-6 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
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