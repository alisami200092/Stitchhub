import React from "react";

interface WholesaleQuoteFormProps {
  price: string;
  onPriceChange: (v: string) => void;
  days: string;
  onDaysChange: (v: string) => void;
  submitting: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function WholesaleQuoteForm({
  price,
  onPriceChange,
  days,
  onDaysChange,
  submitting,
  message,
  onSubmit,
}: WholesaleQuoteFormProps) {
  return (
    <div className="bg-zinc-900/30 border border-[#d4af37]/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(212,175,55,0.02)] backdrop-blur-md">
      <h3 className="text-sm font-bold font-display text-[#d4af37] mb-6 uppercase tracking-widest flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse"></span>
        Submit Wholesale Pricing Bid
      </h3>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Wholesale Price */}
        <div className="space-y-2">
          <label htmlFor="price" className="block text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
            Wholesale Price / Unit ($)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500 font-medium">
              $
            </span>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0.01"
              required
              disabled={submitting}
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              className="w-full bg-[#070708] border border-zinc-900 rounded-2xl py-3.5 pl-8 pr-4 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-mono text-base disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Lead Time */}
        <div className="space-y-2">
          <label htmlFor="days" className="block text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
            Lead Time to Deliver
          </label>
          <div className="relative">
            <input
              type="number"
              id="days"
              min="1"
              required
              disabled={submitting}
              value={days}
              onChange={(e) => onDaysChange(e.target.value)}
              className="w-full bg-[#070708] border border-zinc-900 rounded-2xl py-3.5 px-4 pr-16 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all font-mono text-base disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 text-xs">
              Days
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className={`relative group overflow-hidden w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-black bg-linear-to-r from-[#b38e20] via-[#ebd06f] to-[#b38e20] bg-size-[200%_auto] hover:bg-right transition-all duration-500 transform hover:scale-[1.01] shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 ${
              submitting ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
            }`}
          >
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Bid...
              </>
            ) : (
              <span className="relative z-10">Submit Pricing Bid</span>
            )}
          </button>
        </div>
      </form>

      {message && (
        <div className={`mt-6 p-4 rounded-2xl text-xs font-medium border ${
          message.type === "success" 
            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10 animate-fade-in" 
            : "bg-red-500/5 text-red-400 border-red-500/10 animate-fade-in"
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

