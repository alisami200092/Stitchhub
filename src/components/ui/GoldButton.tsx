// ──────────────────────────────────────────────
// GoldButton.tsx — Polymorphic gold-toned CTA button (link or button tag)
// ──────────────────────────────────────────────

"use client";

import Link from "next/link";

/** Props for the polymorphic gold action button */
interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  shimmer?: boolean;
  type?: "button" | "submit" | "reset";
}

// Size style map — maps shorthand size key to Tailwind padding/font classes
const sizeStyles: Record<string, string> = {
  sm: "px-5 py-2.5 text-xs",
  md: "px-6 py-3.5 text-sm",
  lg: "px-8 py-4 text-base",
};

/**
 * Gold-themed call-to-action button.
 * Polymorphic: renders a <Link> when `href` is provided, otherwise a <button>.
 * Supports loading spinner state, shimmer animation overlay, and disabled state.
 */
export default function GoldButton({
  children,
  onClick,
  href,
  disabled,
  className = "",
  size = "lg",
  loading = false,
  shimmer = true,
  type = "button",
}: GoldButtonProps) {
  // Base styles shared by both link and button render paths
  const base =
    "relative group overflow-hidden rounded-full font-bold text-black bg-linear-to-r from-[#b38e20] via-[#ebd06f] to-[#b38e20] bg-size-[200%_auto] hover:bg-right transition-all duration-500 flex items-center justify-center disabled:opacity-40 cursor-pointer";

  const btnClass = `${base} ${sizeStyles[size]} shadow-[0_0_30px_rgba(212,175,55,0.3)] ${className}`;

  // Inner content handles three states: loading spinner, shimmer overlay, or default
  const content = (
    <>
      {loading ? (
        // ── Loading spinner state ──
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{children}</span>
        </div>
      ) : (
        <>
          {/* ── Shimmer animation overlay — sweeps left-to-right on hover ── */}
          {shimmer && (
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
          )}
          <span>{children}</span>
        </>
      )}
    </>
  );

  // ── Polymorphic link/button rendering ──
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={btnClass}>
        {content}
      </Link>
    );
  }

  // ── Disabled state handled natively via `disabled` attribute ──
  return (
    <button onClick={onClick} disabled={disabled} type={type} className={btnClass}>
      {content}
    </button>
  );
}
