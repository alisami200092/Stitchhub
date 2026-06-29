"use client";

import React, { useState } from "react";

interface ProfileSecurityTabProps {
  mfaEnabled: boolean;
  isUpdatingPassword: boolean;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  mfaEnrollmentData: { qrCode: string; secret: string; factorId: string } | null;
  isMfaSetupOpen: boolean;
  isMfaDisableOpen: boolean;
  mfaError: string;
  onStartEnrollment: () => void;
  onCancelEnrollment: () => void;
  onVerifyEnrollment: (code: string) => Promise<void>;
  onStartDisable: () => void;
  onCancelDisable: () => void;
  onDisableMfa: (code: string) => Promise<void>;
}

export default function ProfileSecurityTab({
  mfaEnabled,
  isUpdatingPassword,
  onUpdatePassword,
  mfaEnrollmentData,
  isMfaSetupOpen,
  isMfaDisableOpen,
  mfaError,
  onStartEnrollment,
  onCancelEnrollment,
  onVerifyEnrollment,
  onStartDisable,
  onCancelDisable,
  onDisableMfa,
}: ProfileSecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await onUpdatePassword(currentPassword, newPassword);
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return;
    try {
      await onVerifyEnrollment(verificationCode);
      setVerificationCode("");
    } catch (err) {
      // Error handled inside useProfile hook
    }
  };

  const handleDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return;
    try {
      await onDisableMfa(verificationCode);
      setVerificationCode("");
    } catch (err) {
      // Error handled inside useProfile hook
    }
  };

  return (
    <div className="space-y-8 max-w-xl animate-fadeIn">
      {/* 2FA Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white font-display">Security Settings</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Manage your account security parameters and authentication factors.</p>
        </div>
        <div className="bg-[#090a0f] border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Two-Factor Authentication</h4>
            <p className="text-[11px] text-zinc-500 leading-normal">
              {mfaEnabled 
                ? "✓ Secured with Google Authenticator or other TOTP apps." 
                : "Add an extra layer of protection by requiring a temporary verification code."}
            </p>
          </div>
          {!isMfaSetupOpen && !isMfaDisableOpen && (
            <button
              type="button"
              onClick={mfaEnabled ? onStartDisable : onStartEnrollment}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${mfaEnabled ? "bg-[#d4af37]" : "bg-zinc-800"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-[#090a0f] shadow-md transform transition-transform duration-300 ${mfaEnabled ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          )}
        </div>

        {/* MFA Setup Panel */}
        {isMfaSetupOpen && mfaEnrollmentData && (
          <div className="bg-[#090a0f] border border-zinc-800 rounded-xl p-5 space-y-5 animate-fadeIn">
            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">1. Set Up Authenticator App</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Scan the QR code below using Google Authenticator, Authy, or another TOTP application. If you cannot scan the image, manually enter the secret key text.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
              <div className="bg-white p-2.5 rounded-xl border border-zinc-800 inline-block">
                <img 
                  src={mfaEnrollmentData.qrCode} 
                  alt="MFA QR Code" 
                  className="w-40 h-40 object-contain select-none"
                />
              </div>
              
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Secret Key</span>
                <div className="bg-[#050608] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-[#d4af37] select-all break-all max-w-[200px] text-center">
                  {mfaEnrollmentData.secret}
                </div>
                <p className="text-[10px] text-zinc-500">Copy this code if you cannot scan the QR code.</p>
              </div>
            </div>

            <div className="h-px bg-zinc-800/80 w-full" />

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  2. Enter Authenticator Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-[#050608] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors text-center font-mono font-bold tracking-[0.5em]"
                />
              </div>

              {mfaError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
                  ⚠️ {mfaError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-[#d4af37] text-[#090a0f] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#bfa032] transition-colors font-mono disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingPassword ? "Verifying..." : "Verify & Activate"}
                </button>
                <button
                  type="button"
                  onClick={onCancelEnrollment}
                  className="bg-transparent border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:text-white hover:border-zinc-700 transition-colors font-mono cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MFA Disable Panel */}
        {isMfaDisableOpen && (
          <form onSubmit={handleDisableSubmit} className="bg-[#090a0f] border border-zinc-800 rounded-xl p-5 space-y-4 animate-fadeIn">
            <h4 className="text-xs font-bold text-red-400 font-display uppercase tracking-wider">⚠️ Disable Two-Factor Authentication</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Disabling MFA reduces your account security. To confirm, please enter the current 6-digit verification code from your authenticator app.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full bg-[#050608] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors text-center font-mono font-bold tracking-[0.5em]"
              />
            </div>

            {mfaError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
                ⚠️ {mfaError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-red-700 transition-colors font-mono disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingPassword ? "Disabling..." : "Verify & Disable"}
              </button>
              <button
                type="button"
                onClick={onCancelDisable}
                className="bg-transparent border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:text-white hover:border-zinc-700 transition-colors font-mono cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800/80 w-full" />

      {/* Change Password Section */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h4 className="text-xs font-bold text-white font-display">Change Password</h4>
          <p className="text-xs text-zinc-500 mt-0.5">Configure a new secure password for your account.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono">
            ✓ {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090a0f] border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
              >
                {showCurrentPassword ? (
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
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090a0f] border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
              >
                {showNewPassword ? (
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
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090a0f] border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? (
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

        <button
          type="submit"
          disabled={isUpdatingPassword}
          className="bg-[#d4af37] text-[#090a0f] text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#bfa032] transition-colors font-mono disabled:opacity-50 cursor-pointer"
        >
          {isUpdatingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
