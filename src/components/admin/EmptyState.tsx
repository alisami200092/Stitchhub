"use client";

import React from "react";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export default function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <div className={`h-full flex flex-col justify-center items-center text-zinc-500 text-xs ${className}`}>
      {message}
    </div>
  );
}
