// ─────────────────────────────────────────────────────────────────────
// AuthInput.tsx — Reusable form input with built-in password visibility toggle
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";

// Props mirror a native <input /> but enforce controlled value + onChange.
// When `type` is "password", the component renders a toggle button that
// switches the input between visible text and masked characters.
interface AuthInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

/** Renders a labelled input field. For password fields it shows an eye / eye-off
 * icon button that toggles the input type between "password" (masked) and "text"
 * (visible), giving the user control over credential visibility. */
export default function AuthInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: AuthInputProps) {
  // ── Password toggle state ──
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  // When the field is a password and the user has opted to show it, switch
  // the rendered type to "text" so the browser displays the characters.
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          // Extra right padding (pr-10) reserves space for the toggle icon
          // so the text doesn't overlap it.
          className={`w-full bg-[#18191d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors ${
            isPassword ? "pr-10" : ""
          }`}
          placeholder={placeholder}
        />
        {/* ── Visibility toggle: only rendered for password fields ── */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            {showPassword ? (
              // Eye-off icon — indicates passwords are currently visible
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              // Eye icon — indicates password is currently masked
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
