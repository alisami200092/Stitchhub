// ──────────────────────────────────────────────
// SourcingVolumeMatrix — Static tiered-pricing grid (MOQ–99, 100–249, 250+) with discount callouts
// ──────────────────────────────────────────────

export default function SourcingVolumeMatrix() {
  return (
    <div className="mb-8 bg-zinc-950/60 border border-zinc-900/80 rounded-2xl p-5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
        Volume Pricing
      </h4>
      {/* ── Tiered pricing grid display ── */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl">
          <p className="text-zinc-500 mb-1">25 - 99</p>
          <p className="font-semibold text-zinc-300">Standard Tier</p>
        </div>
        <div className="p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl">
          <p className="text-zinc-500 mb-1">100 - 249</p>
          <p className="font-semibold text-emerald-400">10% Discount</p>
        </div>
        <div className="p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl">
          <p className="text-zinc-500 mb-1">250+</p>
          <p className="font-semibold text-emerald-400">15% Discount</p>
        </div>
      </div>
    </div>
  );
}
