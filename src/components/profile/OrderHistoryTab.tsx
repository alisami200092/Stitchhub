"use client";

import React from "react";
import type { Invoice } from "@/types";

interface OrderHistoryTabProps {
  invoices: Invoice[];
}

function statusBadge(status: string) {
  const isPaid = status === "paid";
  return (
    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase font-mono border ${
      isPaid
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
    }`}>
      {status}
    </span>
  );
}

export default function OrderHistoryTab({ invoices }: OrderHistoryTabProps) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-white font-display">Order History</h3>
        <p className="text-xs text-zinc-500 mt-0.5">View your past orders, invoices, and payment statuses.</p>
      </div>
      <div className="border border-zinc-800 rounded-xl overflow-hidden mt-4">
        <table className="w-full text-left font-body text-xs border-collapse">
          <thead>
            <tr className="bg-[#090a0f] text-zinc-500 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <th className="p-4 font-bold">Invoice #</th>
              <th className="p-4 font-bold">Date</th>
              <th className="p-4 font-bold">Amount</th>
              <th className="p-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="p-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                <td className="p-4 text-zinc-400">{inv.createdAt}</td>
                <td className="p-4 font-mono font-semibold text-[#d4af37]">{inv.totalAmount}</td>
                <td className="p-4">{statusBadge(inv.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
