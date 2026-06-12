"use client";

import React from "react";

interface ProfileAccountTabProps {
  profileName: string;
  routingEmail: string;
  isUpdating: boolean;
  onNameChange: (name: string) => void;
  onSave: (e: React.FormEvent) => void;
}

export default function ProfileAccountTab({
  profileName, routingEmail, isUpdating,
  onNameChange, onSave,
}: ProfileAccountTabProps) {
  return (
    <form onSubmit={onSave} className="max-w-md space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-white font-display">Profile Settings</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Update your personal information and contact details.</p>
      </div>
      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Full Name</label>
          <input
            type="text"
            value={profileName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-[#090a0f] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email Address</label>
          <input
            type="email"
            disabled
            value={routingEmail}
            className="w-full bg-[#090a0f]/40 border border-zinc-800/60 rounded-xl px-4 py-3 text-xs text-zinc-500 cursor-not-allowed"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isUpdating}
        className="bg-[#d4af37] text-[#090a0f] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#bfa032] transition-colors font-mono disabled:opacity-50"
      >
        {isUpdating ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
