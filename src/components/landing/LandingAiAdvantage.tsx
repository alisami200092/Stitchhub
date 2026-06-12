// ──────────────────────────────────────────────
// LandingAiAdvantage — Three‑card grid highlighting AI‑powered features with glassmorphism
// ──────────────────────────────────────────────

/** Three glassmorphism cards demonstrating AI capabilities */
export default function LandingAiAdvantage() {
  return (
    <section className="bg-black py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Subtle background glow to make the glass pop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">Our AI Advantage</h2>
        
        {/* Card Data Mapping — inline array of AI feature cards rendered in a 3‑column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Color Matching",
              desc: "Validates Pantone color accuracy across different fabric blends before the order reaches the supplier.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z"
            },
            {
              title: "Smart Alerts",
              desc: "Flags tight timelines or pricing disputes and routes them to an administrator instantly.",
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            },
            {
              title: "Live Inventory",
              desc: "Real-time supplier inventory checks ensure bulk orders ship without delays.",
              icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            }
          ].map((card, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-[#d4af37]/40 transition-all duration-300">
              {/* Glassmorphism Card — translucent glass bg with backdrop blur, gold border on hover */}
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{card.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
