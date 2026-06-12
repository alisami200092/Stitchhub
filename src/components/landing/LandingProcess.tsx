// ──────────────────────────────────────────────
// LandingProcess — Step‑by‑step B2B sourcing process with step selector and detail panel
// ──────────────────────────────────────────────

"use client";

interface LandingProcessProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
}

/** Interactive process flow: grid of step cards + active step detail panel */
export default function LandingProcess({ activeStep, setActiveStep }: LandingProcessProps) {
  // ── Steps data: each object defines a sourcing stage with title, description, and feature list ──
  const steps = [
    {
      num: "01",
      title: "Design & Material Review",
      subtitle: "Material & Pattern Validation",
      desc: "We evaluate fabric weight, tension, and print properties to catch issues before sampling.",
      features: ["Fabric Physics Mapping", "Sublimation Shrink Safety", "Tension Load Checks"]
    },
    {
      num: "02",
      title: "Color Matching",
      subtitle: "Color Accuracy Guarantee",
      desc: "We match your brand colors across different fabric types so your logo looks consistent on every material.",
      features: ["Multi-fabric Dye Lot Alignment", "Hex to Pantone Verification", "RGB Ambient Calibration"]
    },
    {
      num: "03",
      title: "Supplier Matching",
      subtitle: "Automated Supplier Matching",
      desc: "Orders are matched to suppliers based on capacity, material availability, and delivery timelines.",
      features: ["Live Capacity Balancing", "Direct API Inventory Lock", "Tier-1 Pricing Interception"]
    },
    {
      num: "04",
      title: "QC & Delivery",
      subtitle: "Quality Check & Dispatch",
      desc: "Every shipment passes a three-stage quality check before dispatch with full tracking.",
      features: ["Three-tier Visual Pass", "B2B Courier Integration", "End-to-End Auditable Logs"]
    }
  ];

  return (
    <section className="bg-zinc-950 py-24 px-6 md:px-12 border-t border-zinc-900 relative overflow-hidden">
      {/* Subtle top-right ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/3 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our B2B Sourcing Flow</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Four steps from design to delivery. We handle the complexity so your team doesn&apos;t have to.
          </p>
        </div>

        {/* Step Selector Grid — clicking a step button sets it active and reveals its detail panel below */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`p-6 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                activeStep === i
                  ? "bg-white/5 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                  : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className={`text-2xl font-black ${activeStep === i ? "text-[#d4af37]" : "text-zinc-600"}`}>
                  {step.num}
                </span>
                <span className={`w-2 h-2 rounded-full ${activeStep === i ? "bg-[#d4af37]" : "bg-zinc-700"}`} />
              </div>
              <h3 className="font-bold text-white mb-1 text-base">{step.title}</h3>
              <p className="text-zinc-500 text-xs">{step.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Active Step Showcase Frame — detail panel shows the currently selected step's info and features */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 md:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Active Step Content (7 cols) — badge, title, description, feature checklist */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-xs text-[#d4af37] font-semibold tracking-wide">
              STEP {steps[activeStep].num} • {steps[activeStep].subtitle}
            </div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{steps[activeStep].title}</h3>
            <p className="text-zinc-400 text-lg leading-relaxed">{steps[activeStep].desc}</p>
            
            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {steps[activeStep].features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                  <span className="text-[#d4af37] font-black">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 aspect-video lg:aspect-square bg-zinc-950/80 rounded-2xl border border-zinc-800/80 flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-inner relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04),transparent)]" />
            
            <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/15 flex items-center justify-center relative z-10">
              <svg className="w-8 h-8 text-[#d4af37] animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            
            <div className="relative z-10 space-y-2">
              <h4 className="font-bold text-white text-lg">Step {steps[activeStep].num} Overview</h4>
              <p className="text-zinc-500 text-sm max-w-xs">
                Real-time tracking is active for this stage of the process.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
