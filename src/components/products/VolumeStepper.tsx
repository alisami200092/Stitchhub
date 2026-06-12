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
      <div className="flex items-center gap-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-2.5">
        {/* Decrement — clamped to MOQ so value never goes below minQty */}
        <button
          onClick={() => onChange(Math.max(minQty, currentQty - 10))}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={currentQty <= minQty}
        >
          -10
        </button>
        <span className="flex-1 text-center font-display font-bold text-white text-lg">
          {currentQty} <span className="text-xs text-zinc-500">units</span>
        </span>
        {/* Increment — always allowed upward */}
        <button
          onClick={() => onChange(currentQty + 10)}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          +10
        </button>
      </div>
    </div>
  );
}
