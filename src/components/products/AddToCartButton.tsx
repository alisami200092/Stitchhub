// ──────────────────────────────────────────────
// AddToCartButton — Shows selected quantity, estimated quote label, and submit-to-cart action
// ──────────────────────────────────────────────

"use client";

import GoldButton from "../ui/GoldButton";

interface AddToCartButtonProps {
  /** Currently selected unit quantity from VolumeStepper */
  currentQty: number;
  /** Callback when user clicks "Add to Sourcing Cart" */
  onAdd: () => void;
}

export default function AddToCartButton({ currentQty, onAdd }: AddToCartButtonProps) {
  return (
    <div className="border-t border-zinc-900 pt-6">
      {/* Quantity + Estimated Quote row */}
      <div className="flex justify-between items-center mb-6">
        {/* Selected quantity display */}
        <div>
          <p className="text-xs text-zinc-500">Selected Quantity</p>
          <p className="text-xl font-bold text-white">
            {currentQty} <span className="text-xs text-zinc-500 font-normal">units</span>
          </p>
        </div>
        {/* Estimated quote — placeholder until backend pricing is linked */}
        <div className="text-right">
          <p className="text-xs text-zinc-500">Estimated Quote</p>
          <p className="text-[#d4af37] font-semibold text-xs uppercase tracking-wider mt-1">
            Calculated on Submission
          </p>
        </div>
      </div>

      <GoldButton onClick={onAdd} className="w-full">
        Add to Cart
      </GoldButton>
    </div>
  );
}
