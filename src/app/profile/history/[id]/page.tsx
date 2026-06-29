"use client";

import React, { use } from "react";
import Link from "next/link";
import { useProfileStore } from "@/stores/profile-store";
import OrderTrackingTab from "@/components/profile/OrderTrackingTab";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const invoices = useProfileStore((s) => s.invoices);
  const activeInvoice = invoices.find((inv) => inv.id === id);

  return (
    <div className="space-y-6">
      {/* Back to History Link Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
        <div>
          <Link
            href="/profile/history"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#d4af37] font-mono transition-colors"
          >
            <span>←</span> <span>Back to Order History</span>
          </Link>
          {activeInvoice && (
            <h2 className="text-lg font-bold text-white font-display mt-2">
              Pipeline Tracking: {activeInvoice.invoiceNumber}
            </h2>
          )}
        </div>
      </div>

      <OrderTrackingTab invoice={activeInvoice} />
    </div>
  );
}
