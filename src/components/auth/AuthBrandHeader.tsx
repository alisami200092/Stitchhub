// ─────────────────────────────────────────────────────────────────────
// AuthBrandHeader.tsx — Brand logo + contextual heading for auth screens
// ─────────────────────────────────────────────────────────────────────

// Props: isLogin — when true the subtitle reads "Sign in …", otherwise it
// reads "Create a new partner account".
interface AuthBrandHeaderProps {
  isLogin: boolean;
}

/** Renders the StitchHub wordmark with a gold "S" favicon-like badge and a
 * dynamic subtitle that toggles between sign-in / sign-up copy. */
export default function AuthBrandHeader({ isLogin }: AuthBrandHeaderProps) {
  return (
    <div className="text-center space-y-1.5">
      {/* ── Brand mark: gold gradient box with the letter "S" ── */}
      <div className="flex items-center justify-center gap-2 text-white font-bold text-xl tracking-wider uppercase font-display">
        <span className="h-6 w-6 rounded-lg bg-linear-to-br from-[#b38e20] to-[#ebd06f] flex items-center justify-center text-black text-xs font-black">
          S
        </span>
        STITCH<span className="text-[#d4af37]">HUB</span>
      </div>
      <p className="text-xs text-zinc-400 font-medium pt-1">
        {isLogin ? "Sign in to your B2B account" : "Create a new partner account"}
      </p>
    </div>
  );
}
