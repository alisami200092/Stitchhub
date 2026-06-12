// ─────────────────────────────────────────────────────────────────────
// login/page.tsx — Login / Sign-up page with auth-hook orchestration
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useAuth } from "../../../hooks/useAuth";
import AuthBrandHeader from "../../../components/auth/AuthBrandHeader";
import AuthAlert from "../../../components/auth/AuthAlert";
import AuthForm from "../../../components/auth/AuthForm";

/** Renders the unified login/sign-up page. Delegates state and business
 * logic to the `useAuth` hook and composes shared presentational
 * components (brand header, alert, form). Also includes an ambient
 * background glow for visual polish. */
export default function AuthPage() {
  const auth = useAuth();

  return (
    // ── Page shell: dark full-screen background, centred content ──
    <div className="min-h-screen bg-[#090a0c] flex items-center justify-center px-4 relative overflow-hidden font-sans select-none">
      {/* ── Ambient background glow (gold orb decoration) ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Card container ── */}
      <div className="w-full max-w-md bg-[#121316] border border-zinc-900 rounded-3xl p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 relative">
        {/* Brand Header */}
        <AuthBrandHeader isLogin={auth.isLogin} />

        {/* Alert banners */}
        {auth.error && <AuthAlert type="error" message={auth.error} />}
        {auth.success && <AuthAlert type="success" message={auth.success} />}

        {/* Auth Form */}
        <AuthForm
          isLogin={auth.isLogin}
          loading={auth.loading}
          name={auth.name}
          setName={auth.setName}
          email={auth.email}
          setEmail={auth.setEmail}
          password={auth.password}
          setPassword={auth.setPassword}
          rememberMe={auth.rememberMe}
          setRememberMe={auth.setRememberMe}
          handleSubmit={auth.handleSubmit}
          handleForgotPassword={auth.handleForgotPassword}
        />

        {/* ── Mode toggle: switch between login / sign-up ── */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={auth.toggleMode}
            className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            {auth.isLogin ? (
              <span>
                Don&apos;t have an account?{" "}
                <span className="text-[#d4af37] font-medium hover:underline">Sign up</span>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <span className="text-[#d4af37] font-medium hover:underline">Sign in</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
