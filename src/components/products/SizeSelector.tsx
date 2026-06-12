// ──────────────────────────────────────────────
// SizeSelector — Apparel-only size picker (S–XXL) with conditional visibility and active-state styling
// ──────────────────────────────────────────────

"use client";

interface SizeSelectorProps {
  /** When false, the entire component returns null (apparel-only field) */
  visible: boolean;
  /** Currently selected size value */
  selectedSize: string;
  /** Called when a size button is clicked */
  onSelect: (size: string) => void;
}

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function SizeSelector({ visible, selectedSize, onSelect }: SizeSelectorProps) {
  // ── Conditional visibility: hidden for non-apparel categories ──
  if (!visible) return null;

  return (
    <div className="mb-8">
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
        Select Size
      </label>
      {/* Size button grid with active-state highlight */}
      <div className="flex flex-wrap gap-2.5">
        {SIZES.map((sz) => (
          <button
            key={sz}
            onClick={() => onSelect(sz)}
            className={`h-11 w-14 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
              selectedSize === sz
                ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {sz}
          </button>
        ))}
      </div>
    </div>
  );
}
