"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export default function LoadingSpinner({ message = "Loading...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex-1 flex flex-col justify-center items-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d4af37] mb-3" />
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{message}</span>
    </div>
  );
}
