"use client";

// ─────────────────────────────────────────────────────────────
// useAuth — Login / signup / forgot-password form state machine
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { createClient } from "../utils/supabase/client";

/**
 * Returns form state (email, password, name, rememberMe) plus submit / toggle / forgot-password handlers.
 * Manages loading / error / success UX and redirects on completion.
 */
export function useAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem("remembered_email") || ""; } catch { return ""; }
  });
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    try { return !!localStorage.getItem("remembered_email"); } catch { return false; }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const supabase = createClient();

    // ── Login branch ──────────────────────────────────────
    if (isLogin) {
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message || "Invalid email or password. Please try again.");
          setLoading(false);
        } else {
          // Persist (or clear) remembered email based on rememberMe toggle
          try {
            if (rememberMe) {
              localStorage.setItem("remembered_email", email);
            } else {
              localStorage.removeItem("remembered_email");
            }
          } catch (e) {
            console.warn("Failed to write to localStorage:", e);
          }

          setSuccess("Success! Directing to workspace...");

          setTimeout(() => {
            window.location.href = "/";
          }, 800);
        }
      } catch {
        setError("An unexpected error occurred during login.");
        setLoading(false);
      }
    // ── Signup branch ─────────────────────────────────────
    } else {
      try {
        // Create user via Supabase Auth; store display name + default B2B role in metadata
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              role: "client",
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message || "Registration failed.");
          setLoading(false);
        } else {
          // Auto-confirm enabled — session returned, redirect immediately
          if (data.session) {
            setSuccess("Account created and logged in! Directing to workspace...");
            setTimeout(() => {
              window.location.href = "/";
            }, 800);
          // Email-confirm enabled — no session, prompt user to verify
          } else {
            setSuccess("Account created successfully! Please check your email for verification, or switch to sign in.");
            setTimeout(() => {
              setIsLogin(true);
              setSuccess("");
              setPassword("");
            }, 3000);
          }
        }
      } catch {
        setError("Supabase communication failure during registration.");
        setLoading(false);
      }
    }
  };

  // Switch between login / signup forms and clear transient state
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
  };

  // Sends a Supabase password-reset email; user must click the link to proceed
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first to request a password reset.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    const supabase = createClient();
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || "Failed to trigger password reset process.");
      } else {
        setSuccess("Success! A password reset link has been dispatched to your email.");
      }
    } catch {
      setError("An unexpected error occurred during password reset.");
    } finally {
      setLoading(false);
    }
  };

  return {
    isLogin,
    loading,
    error,
    success,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    handleSubmit,
    toggleMode,
    handleForgotPassword,
  };
}
