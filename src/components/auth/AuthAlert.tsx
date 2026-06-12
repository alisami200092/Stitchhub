// ─────────────────────────────────────────────────────────────────────
// AuthAlert.tsx — Conditional alert banner for auth error/success messages
// ─────────────────────────────────────────────────────────────────────

// Props: type determines the visual style (error/success), message is the
// text content to render. An empty/falsy message causes the component to
// return null (nothing rendered).
interface AuthAlertProps {
  type: "error" | "success";
  message: string;
}

// Lookup map that pairs each alert type with its Tailwind utility classes.
// Keeping this outside the component avoids re-creating the object on
// every render and centralises the styling.
const styles: Record<string, string> = {
  error:
    "bg-red-500/10 border border-red-500/20 text-red-400",
  success:
    "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
};

/** Renders a styled alert banner for auth feedback. Returns null when
 * there is no message so the caller can simply write `<AuthAlert … />`
 * without an explicit conditional guard. */
export default function AuthAlert({ type, message }: AuthAlertProps) {
  // ── Conditional render: bail out early when message is empty ──
  if (!message) return null;

  return (
    <div
      className={`${styles[type]} text-xs px-4 py-3 rounded-xl font-medium animate-scaleIn`}
    >
      {message}
    </div>
  );
}
