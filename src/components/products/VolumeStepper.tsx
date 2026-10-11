// ──────────────────────────────────────────────
// VolumeStepper — Increment/decrement by 10 with MOQ floor clamping
// ──────────────────────────────────────────────

"use client";

interface VolumeStepperProps {
  /** Minimum order quantity — stepper cannot go below this value */
  minQty: number;
  /** Current quantity displayed in the stepper */
  currentQty: number;
  /** Called with the new quantity after each step */
  onChange: (qty: number) => void;
}

export default function VolumeStepper({ minQty, currentQty, onChange }: VolumeStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Quantity
        </label>
        <span className="text-xs font-medium text-zinc-500">
          Minimum: {minQty} units
        </span>
      </div>
      <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-2">
        {/* Step -10 */}
        <button
          type="button"
          onClick={() => onChange(Math.max(1, currentQty - 10))}
          className="h-10 px-2.5 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={currentQty <= minQty}
          title="-10 units"
        >
          -10
        </button>

        {/* Step -1 */}
        <button
          type="button"
          onClick={() => onChange(Math.max(1, currentQty - 1))}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={currentQty <= minQty}
          title="-1 unit"
        >
          -
        </button>

        {/* Direct number input for any arbitrary quantity */}
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <input
            type="number"
            min={1}
            value={currentQty === 0 ? "" : currentQty}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange(isNaN(val) ? 0 : val);
            }}
            onBlur={() => {
              if (currentQty < minQty) {
                onChange(minQty);
              }
            }}
            className="w-20 text-center bg-zinc-900/60 border border-zinc-800 rounded-lg py-1 font-display font-bold text-white text-lg focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          <span className="text-xs text-zinc-500 font-medium select-none">units</span>
        </div>

        {/* Step +1 */}
        <button
          type="button"
          onClick={() => onChange(currentQty + 1)}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-bold transition-colors cursor-pointer"
          title="+1 unit"
        >
          +
        </button>

        {/* Step +10 */}
        <button
          type="button"
          onClick={() => onChange(currentQty + 10)}
          className="h-10 px-2.5 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          title="+10 units"
        >
          +10
        </button>
      </div>
    </div>
  );
}
