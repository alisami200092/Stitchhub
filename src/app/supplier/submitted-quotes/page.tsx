"use client";

import React from "react";
import SubmittedQuoteCard from "../../../components/supplier/SubmittedQuoteCard";
import { useSubmittedQuotes } from "../../../hooks/useSubmittedQuotes";

export default function SubmittedQuotesPage() {
  const { mappedBids, loadingBids } = useSubmittedQuotes();

  if (loadingBids) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="h-10 w-10 rounded-full border-4 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold font-display text-white flex items-center gap-3">
          <span className="w-[3px] h-6 bg-gradient-to-b from-[#ebd06f] to-[#b38e20] rounded-full block"></span>
          Submitted Quotes History
        </h2>
        {mappedBids.length > 0 && (
          <div className="flex gap-2">
            <button className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/30 border border-zinc-900 rounded-full hover:text-white hover:border-[#d4af37]/40 transition-all cursor-pointer backdrop-blur-md">
              Filter
            </button>
            <button className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/30 border border-zinc-900 rounded-full hover:text-white hover:border-[#d4af37]/40 transition-all cursor-pointer backdrop-blur-md">
              Export
            </button>
          </div>
        )}
      </div>

      {mappedBids.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 border border-zinc-900 rounded-3xl max-w-2xl mx-auto p-8 backdrop-blur-md">
          <svg className="w-12 h-12 text-zinc-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="text-lg font-bold text-zinc-300 mb-2 font-display">No Quotes Submitted Yet</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            You have not submitted any B2B pricing bids yet. When you submit a quote from the "Active Requests" tab, it will appear here under review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mappedBids.map((quote, idx) => (
            <SubmittedQuoteCard key={idx} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}

