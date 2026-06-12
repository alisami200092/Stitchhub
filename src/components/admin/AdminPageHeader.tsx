"use client";

import React from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export default function AdminPageHeader({ title, subtitle, children }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <div>
        <h2 className="text-2xl font-bold text-white font-display tracking-tight drop-shadow-md">{title}</h2>
        <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
      </div>
      {children && <div className="flex gap-3">{children}</div>}
    </div>
  );
}
