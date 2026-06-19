import React from "react";

const getStatusStyles = (status: string) => {
  const norm = status.toLowerCase();
  if (norm.includes("approved") || norm === "accepted" || norm === "approved / active") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (norm === "under review" || norm === "pending" || norm === "processing") {
    return "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20";
  }
  if (norm.includes("rejected") || norm === "dismissed") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  if (norm === "re-quoted") {
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
  return "bg-zinc-800/40 text-zinc-400 border-zinc-900";
};

interface SubmittedQuoteCardProps {
  quote: {
    id: string;
    product: string;
    price: string;
    status: string;
  };
}

export default function SubmittedQuoteCard({ quote }: SubmittedQuoteCardProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 hover:border-[#d4af37]/30 transition-all duration-300 shadow-lg hover:shadow-xl group backdrop-blur-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-500 text-xs font-bold tracking-wider mb-1 font-mono">
            {quote.id}
          </p>
          <h3 className="text-zinc-100 font-bold text-lg group-hover:text-[#d4af37] transition-colors leading-snug">
            {quote.product}
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 ${getStatusStyles(
            quote.status
          )}`}
        >
          {quote.status}
        </span>
      </div>

      <div className="pt-4 border-t border-zinc-900/80 flex justify-between items-end mt-4">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold mb-1">Submitted Price</p>
          <p className="text-2xl font-mono text-zinc-100 font-bold">{quote.price}</p>
        </div>
        <button className="text-xs font-bold uppercase tracking-wider text-[#d4af37] hover:text-[#ebd06f] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
          View Details
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
