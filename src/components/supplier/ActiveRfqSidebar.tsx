import React from "react";

interface ActiveRfqSidebarProps {
  rfqs: any[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onSelectMessageReset: () => void;
}

export default function ActiveRfqSidebar({
  rfqs,
  selectedIdx,
  onSelect,
  onSelectMessageReset,
}: ActiveRfqSidebarProps) {
  return (
    <div className="lg:col-span-1 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-5 space-y-3 max-h-[620px] overflow-y-auto backdrop-blur-md">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1 mb-4 font-mono">
        Active Sourcing Batches
      </h3>
      {rfqs.map((rfq, idx) => (
        <button
          key={rfq.id}
          onClick={() => {
            onSelect(idx);
            onSelectMessageReset();
          }}
          className={`w-full text-left p-4 rounded-2xl border text-sm transition-all cursor-pointer ${
            selectedIdx === idx
              ? "bg-[#d4af37]/5 border-[#d4af37]/30 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.05)]"
              : "bg-zinc-950/40 border-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
          }`}
        >
          <p className="font-mono font-bold text-xs truncate">{rfq.invoiceNumber}</p>
          <p className="text-xs text-zinc-500 truncate mt-1.5">{rfq.subject}</p>
        </button>
      ))}
    </div>
  );
}
