"use client";

import React from "react";
import Image from "next/image";

interface OrderTrackingTabProps {
  invoice: any;
}

const STAGES = [
  {
    key: "draft sourcing",
    label: "Inquiry Received",
    description: "Your sourcing requisition cart has been received and compiled into our neural routing agent context.",
  },
  {
    key: "review required",
    label: "Compliance & Inventory",
    description: "Operational checks verify fabric/blank inventory stock levels and timeline feasibility parameters.",
  },
  {
    key: "approved",
    label: "Quote & Approval",
    description: "Tiered pricing is finalized, digital invoice generated, and deposit checkout made available.",
  },
  {
    key: "processing",
    label: "Production Floor",
    description: "Raw fabric blocks are allocated to mills and high-capacity machinery begins precision custom print runs.",
  },
  {
    key: "shipping",
    label: "In Transit",
    description: "Bulk shipment has been verified, packed, and dispatched to global cargo carrier hubs.",
  },
  {
    key: "delivered",
    label: "Warehouse Delivered",
    description: "Bulk custom apparel cargo has successfully arrived at the client destination warehouse.",
  },
];

export default function OrderTrackingTab({ invoice }: OrderTrackingTabProps) {
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h7a1 1 0 011 1v7m-9 0h9" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-zinc-300">No Sourcing Pipeline Selected</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          Please select an order from your history list to track its operational progress.
        </p>
      </div>
    );
  }

  // Get current active status index
  const currentStatus = invoice.status || "draft sourcing";
  
  // Custom compliance/warning flag
  const isEscalated = currentStatus === "review required";

  // Map status string to stage indexes
  const getStatusIndex = (status: string) => {
    switch (status) {
      case "review required":
        return 1;
      case "approved":
        return 2;
      case "processing":
        return 3;
      case "shipping":
        return 4;
      case "delivered":
        return 5;
      case "draft sourcing":
      default:
        return 0;
    }
  };

  const activeIndex = getStatusIndex(currentStatus);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Pipeline Telemetry Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Stepper Timeline */}
        <div className="lg:col-span-8 bg-black/20 border border-zinc-800/60 p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono mb-8">Operational Pipeline</h3>
          
          <div className="relative pl-8 sm:pl-10 space-y-8">
            {/* Visual connector line running down */}
            <div className="absolute top-2.5 bottom-2.5 left-3.5 sm:left-4.5 w-px bg-zinc-800" />

            {STAGES.map((stage, idx) => {
              const isCompleted = activeIndex > idx;
              const isActive = activeIndex === idx;
              const isFuture = activeIndex < idx;

              // Override colors for review required / escalated
              let iconBg = "bg-zinc-950 border-zinc-800 text-zinc-600";
              let iconRing = "";
              let titleColor = "text-zinc-500";
              let descColor = "text-zinc-600";

              if (isActive) {
                if (isEscalated) {
                  iconBg = "bg-amber-500/10 border-amber-500 text-amber-400";
                  iconRing = "ring-4 ring-amber-500/20";
                  titleColor = "text-amber-400 font-bold";
                  descColor = "text-zinc-300";
                } else {
                  iconBg = "bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]";
                  iconRing = "ring-4 ring-[#d4af37]/20";
                  titleColor = "text-[#d4af37] font-bold";
                  descColor = "text-zinc-300";
                }
              } else if (isCompleted) {
                iconBg = "bg-emerald-500/10 border-emerald-500 text-emerald-400";
                titleColor = "text-zinc-300 font-medium";
                descColor = "text-zinc-500";
              }

              return (
                <div key={stage.key} className="relative transition-all duration-300">
                  {/* Indicator Icon Node */}
                  <div className={`absolute -left-8 sm:-left-10 top-0.5 h-7 w-7 rounded-full border flex items-center justify-center text-xs font-mono font-bold transition-all z-10 ${iconBg} ${iconRing}`}>
                    {isCompleted ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isEscalated && isActive ? (
                      <span>!</span>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Stage copy */}
                  <div className="space-y-1.5 pl-2">
                    <h4 className={`text-sm font-display ${titleColor}`}>
                      {stage.label}
                      {isActive && isEscalated && (
                        <span className="ml-2.5 inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md animate-pulse">
                          Escalated Review
                        </span>
                      )}
                      {isActive && !isEscalated && (
                        <span className="ml-2.5 inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] rounded-md">
                          Current Stage
                        </span>
                      )}
                    </h4>
                    <p className={`text-xs leading-relaxed ${descColor}`}>{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Specs & Logistics Information */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Sourcing Summary Card */}
          <div className="bg-[#16171d] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">Invoice Info</h3>
            
            <div className="space-y-3 font-mono text-xs border-b border-zinc-800/80 pb-4">
              <div className="flex justify-between">
                <span className="text-zinc-500">Invoice Ref:</span>
                <span className="text-white font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Quote Value:</span>
                <span className="text-[#d4af37] font-bold">{invoice.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Logistics Status:</span>
                <span className={`font-bold uppercase ${isEscalated ? "text-amber-400" : "text-emerald-400"}`}>{currentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Submission Date:</span>
                <span className="text-zinc-300">{new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Logistics Tracking ID Slot */}
            {invoice.supplierPayload?.tracking_id ? (
              <div className="bg-black/20 border border-zinc-800/60 p-4 rounded-xl space-y-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Cargo Tracking Number</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{invoice.supplierPayload.tracking_id}</span>
                  <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase">Dispatched</span>
                </div>
                {invoice.supplierPayload.dispatched_at && (
                  <p className="text-[9px] text-zinc-500 font-mono">Dispatched on: {new Date(invoice.supplierPayload.dispatched_at).toLocaleString()}</p>
                )}
              </div>
            ) : (
              <div className="bg-black/20 border border-zinc-800/40 p-4 rounded-xl text-center">
                <p className="text-[10px] text-zinc-500 italic font-mono">Cargo tracking ID will be generated upon carrier package dispatch.</p>
              </div>
            )}
          </div>

          {/* Cart items */}
          {invoice.itemsSnapshot && invoice.itemsSnapshot.length > 0 && (
            <div className="bg-[#16171d] border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">Fabric Requisition Specs</h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {invoice.itemsSnapshot.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 bg-black/10 border border-zinc-800/40 p-3 rounded-xl">
                    {item.product?.img && (
                      <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded overflow-hidden shrink-0">
                        <Image src={item.product.img} alt={item.product.title} width={40} height={40} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h5 className="text-xs font-bold text-white truncate">{item.product?.title || "Product Spec"}</h5>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>Qty: {item.quantity}</span>
                        <span>Size: {item.size}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
