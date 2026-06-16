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
  /** Callback when user clicks "Checkout Now" */
  onCheckout: () => void;
  /** Whether this product+size is already in the cart */
  isInCart?: boolean;
}

export default function AddToCartButton({ currentQty, onAdd, onCheckout, isInCart = false }: AddToCartButtonProps) {
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

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Add to Cart - Secondary Outline Button */}
        <button
          type="button"
          onClick={onAdd}
          disabled={isInCart}
          className="flex-1 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 font-bold text-zinc-300 hover:text-white py-3.5 px-6 text-sm transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-900/40 disabled:hover:border-zinc-800 disabled:text-zinc-500 cursor-pointer text-center"
        >
          {isInCart ? "Already in Cart" : "Add to Cart"}
        </button>

        {/* Checkout Now - Primary Gold Button */}
        <GoldButton onClick={onCheckout} size="md" className="flex-1">
          Checkout Now
        </GoldButton>
      </div>
    </div>
  );
}
