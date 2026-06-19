"use client";

import React from "react";
import ActiveRfqSidebar from "../../../components/supplier/ActiveRfqSidebar";
import ActiveRfqDetails from "../../../components/supplier/ActiveRfqDetails";
import WholesaleQuoteForm from "../../../components/supplier/WholesaleQuoteForm";
import { useActiveRequests } from "../../../hooks/useActiveRequests";

export default function ActiveRequestsPage() {
  const {
    activeRfqs,
    selectedIdx,
    price,
    days,
    loadingRequests,
    submittingQuote,
    quoteMessage,
    setPrice,
    setDays,
    handleSelectRfq,
    handleSubmit,
  } = useActiveRequests();

  if (loadingRequests) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="h-10 w-10 rounded-full border-4 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (activeRfqs.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/30 border border-zinc-900 rounded-3xl max-w-2xl mx-auto p-8 backdrop-blur-md">
        <svg className="w-12 h-12 text-zinc-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 className="text-lg font-bold text-zinc-300 mb-2 font-display">No Active Requests</h3>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          There are currently no requisitions in the sourcing stage. Checked emails will appear here as soon as they are approved for supplier matching.
        </p>
      </div>
    );
  }

  const selectedRfq = activeRfqs[selectedIdx];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar RFQ Selector */}
      <ActiveRfqSidebar
        rfqs={activeRfqs}
        selectedIdx={selectedIdx}
        onSelect={handleSelectRfq}
        onSelectMessageReset={() => {}}
      />

      {/* Main Workspace (Specs & Bidding Form) */}
      <div className="lg:col-span-3 space-y-6">
        <ActiveRfqDetails selectedRfq={selectedRfq} />
        
        <WholesaleQuoteForm
          price={price}
          onPriceChange={setPrice}
          days={days}
          onDaysChange={setDays}
          submitting={submittingQuote}
          message={quoteMessage}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}


