"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  shipping: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  unpaid: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.unpaid;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wide ${style}`}>
      {status}
    </span>
  );
}
