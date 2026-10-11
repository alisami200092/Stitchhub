"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/client";
import AuthAlert from "../../../components/auth/AuthAlert";
import GoldButton from "../../../components/ui/GoldButton";
import AuthInput from "../../../components/auth/AuthInput";

/** Renders the "set new password" page shown after the user clicks the
 * magic-link in their email. Validates session, handles PKCE code exchange,
 * and calls `supabase.auth.updateUser` to persist the change. */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // 1. Check for error parameters in query string or URL hash
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const errorCode = searchParams.get("error_code") || hashParams.get("error_code");
      const errorDesc = searchParams.get("error_description") || hashParams.get("error_description");

      if (errorCode === "otp_expired" || errorDesc?.includes("expired") || errorDesc?.includes("invalid")) {
        setIsExpired(true);
        setError("This password reset link has expired or was already used. Please request a fresh reset link.");
        return;
      }

      // 2. Handle PKCE code exchange if ?code= is present in query
      const code = searchParams.get("code");
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
          if (exchangeError) {
            setIsExpired(true);
            setError("Unable to authenticate reset link: " + exchangeError.message);
          } else {
            setSessionReady(true);
          }
        });
      }
    }

    // 3. Listen for PASSWORD_RECOVERY event or check existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setSessionReady(true);
        setError("");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message.toLowerCase().includes("session")) {
          setIsExpired(true);
          setError("Your reset session has expired or is invalid. Please request a new reset email.");
        } else {
          setError(updateError.message || "Failed to update password.");
        }
        setLoading(false);
      } else {
        setSuccess("Password updated successfully! Redirecting to workspace...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    // ── Page shell: same dark layout as the login page ──
    <div className="min-h-screen bg-[#090a0c] flex items-center justify-center px-4 relative overflow-hidden font-sans select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Card container ── */}
      <div className="w-full max-w-md bg-[#121316] border border-zinc-900 rounded-3xl p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 relative">
        {/* ── Brand Header ── */}
        <div className="text-center space-y-2">
          <div className="text-xl font-black tracking-widest text-white select-none">
            STITCH<span className="text-[#d4af37]">HUB</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-100">Set New Password</h2>
          <p className="text-xs text-zinc-500">Enter your new password below.</p>
        </div>

        {/* Alert banners */}
        {error && <AuthAlert type="error" message={error} />}
        {success && <AuthAlert type="success" message={success} />}

        {/* Reset form or Expired Link CTA */}
        {isExpired ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-zinc-400 text-center leading-relaxed">
              Password reset links are single-use and expire quickly for security. Click below to return to the login screen and request a fresh link.
            </p>
            <Link href="/auth/login" className="block w-full">
              <GoldButton
                type="button"
                size="md"
                className="w-full shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
              >
                Back to Login
              </GoldButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="New Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <AuthInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <GoldButton
              type="submit"
              disabled={loading}
              loading={loading}
              size="md"
              className="w-full mt-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
              shimmer={!loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </GoldButton>
          </form>
        )}
      </div>
    </div>
  );
}
