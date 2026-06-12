"use client";

import React from "react";

interface ProfileSecurityTabProps {
  mfaEnabled: boolean;
  onToggle: () => void;
}

export default function ProfileSecurityTab({ mfaEnabled, onToggle }: ProfileSecurityTabProps) {
  return (
    <div className="space-y-6 max-w-xl animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-white font-display">Security & 2FA</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Keep your account secure with Two-Factor Authentication.</p>
      </div>
      <div className="bg-[#090a0f] border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white">Two-Factor Authentication</h4>
          <p className="text-[11px] text-zinc-500 leading-normal">Require an extra security code when logging in.</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${mfaEnabled ? "bg-[#d4af37]" : "bg-zinc-800"}`}
        >
          <div className={`w-4 h-4 rounded-full bg-[#090a0f] shadow-md transform transition-transform duration-300 ${mfaEnabled ? "translate-x-6" : "translate-x-0"}`} />
        </button>
      </div>
    </div>
  );
}
