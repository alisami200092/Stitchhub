"use client";

import React, { useState } from "react";

interface ProfileAccountTabProps {
  profileName: string;
  routingEmail: string;
  isUpdating: boolean;
  emailStep: "form" | "password";
  emailSuccessMessage: string;
  onClearSuccessMessage: () => void;
  onEmailStepChange: (step: "form" | "password") => void;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onSave: (e: React.FormEvent) => void;
  onVerifyPassword: (password: string) => Promise<void>;
}

export default function ProfileAccountTab({
  profileName,
  routingEmail,
  isUpdating,
  emailStep,
  emailSuccessMessage,
  onClearSuccessMessage,
  onEmailStepChange,
  onNameChange,
  onEmailChange,
  onSave,
  onVerifyPassword,
}: ProfileAccountTabProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await onVerifyPassword(password);
      setPassword("");
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please check your password.");
    }
  };

  // Step 2: Password Verification Screen
  if (emailStep === "password") {
    return (
      <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5 animate-fadeIn">
        <div>
          <h3 className="text-sm font-bold text-white font-display">Confirm Current Password</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Please verify your identity to authorize sending a verification link to <strong className="text-white">{routingEmail}</strong>.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090a0f] border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.822 7.822L21 21m-2.228-2.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-[#d4af37] text-[#090a0f] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#bfa032] transition-colors font-mono disabled:opacity-50 cursor-pointer"
          >
            {isUpdating ? "Verifying..." : "Verify & Send Link"}
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              onEmailStepChange("form");
            }}
            className="bg-transparent border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:text-white hover:border-zinc-700 transition-colors font-mono cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // Step 1: Default Settings Form
  return (
    <form onSubmit={onSave} className="max-w-md space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-sm font-bold text-white font-display">Profile Settings</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Update your personal information and contact details.</p>
      </div>

      {emailSuccessMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono flex items-start gap-3 relative animate-fadeIn">
          <span className="text-sm select-none">✉️</span>
          <div className="flex-1 pr-6">
            <p className="font-bold uppercase tracking-wider mb-1">Confirmation Email Sent</p>
            <p className="text-[11px] text-emerald-400/80 leading-relaxed">
              {emailSuccessMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={onClearSuccessMessage}
            className="absolute right-3 top-3 text-emerald-500 hover:text-emerald-300 transition-colors focus:outline-none cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Full Name</label>
          <input
            type="text"
            value={profileName}
            onChange={(e) => {
              onNameChange(e.target.value);
              if (emailSuccessMessage) onClearSuccessMessage();
            }}
            className="w-full bg-[#090a0f] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email Address</label>
          <input
            type="email"
            value={routingEmail}
            onChange={(e) => {
              onEmailChange(e.target.value);
              if (emailSuccessMessage) onClearSuccessMessage();
            }}
            className="w-full bg-[#090a0f] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
          />
          <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
            💡 Modifying your email address requires password re-authentication. A confirmation link will be sent to the new email.
          </p>
        </div>
      </div>
      <button
        type="submit"
        disabled={isUpdating}
        className="bg-[#d4af37] text-[#090a0f] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#bfa032] transition-colors font-mono disabled:opacity-50 cursor-pointer"
      >
        {isUpdating ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

