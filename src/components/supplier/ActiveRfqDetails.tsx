import React from "react";

interface ActiveRfqDetailsProps {
  selectedRfq: {
    id: string;
    invoiceNumber: string;
    subject: string;
    body: string;
    items: any[];
    createdAt: string;
  };
}

export default function ActiveRfqDetails({ selectedRfq }: ActiveRfqDetailsProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 shadow-xl backdrop-blur-md">
      <h2 className="text-xl font-bold font-display text-white mb-6 flex items-center gap-3">
        <span className="w-[3px] h-6 bg-gradient-to-b from-[#ebd06f] to-[#b38e20] rounded-full block"></span>
        {selectedRfq.invoiceNumber} — Specifications
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Subject</p>
          <p className="text-zinc-100 font-medium bg-[#070708]/60 p-4 rounded-2xl border border-zinc-900/60 truncate">
            {selectedRfq.subject}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Date Received</p>
          <p className="text-zinc-100 font-medium bg-[#070708]/60 p-4 rounded-2xl border border-zinc-900/60">
            {new Date(selectedRfq.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-zinc-900/80 pt-6">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 font-mono">
          Items in Order ({selectedRfq.items.length})
        </h3>
        <div className="space-y-4">
          {selectedRfq.items.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">No specifications snapshot parsed. Rely on request parameters below.</p>
          ) : (
            selectedRfq.items.map((item: any, i: number) => (
              <div key={i} className="bg-zinc-950/30 border border-zinc-900/80 rounded-2xl p-4 flex justify-between items-center text-sm hover:border-[#d4af37]/20 transition-all duration-300">
                <div>
                  <p className="font-bold text-zinc-200">{item.product?.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">Category: {item.product?.cat} | Size: {item.size}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-zinc-300 font-bold">Qty: {item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-zinc-900/80 pt-6">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 font-mono">
          Customer Requisition Requirements
        </h3>
        <div className="bg-zinc-950/30 border border-zinc-900/80 rounded-2xl p-5">
          <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {selectedRfq.body || "No additional parameters provided."}
          </p>
        </div>
      </div>
    </div>
  );
}
