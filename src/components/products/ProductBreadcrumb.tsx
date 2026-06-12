// ──────────────────────────────────────────────
// ProductBreadcrumb — "Back to Directory" link with arrow icon; navigates to /products
// ──────────────────────────────────────────────

import Link from "next/link";

export default function ProductBreadcrumb() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
      <Link
        href="/products"
        className="inline-flex items-center text-zinc-400 hover:text-[#d4af37] transition-colors group mb-6 text-sm font-semibold"
      >
        <svg
          className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Directory
      </Link>
    </div>
  );
}
