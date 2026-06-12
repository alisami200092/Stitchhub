// ──────────────────────────────────────────────
// LandingFooter — Footer with logo, navigation links, and copyright
// ──────────────────────────────────────────────

import Link from "next/link";

/** Site footer with brand logo, nav links, and copyright line */
export default function LandingFooter() {
  return (
    <footer className="bg-black pb-12 px-6 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <svg className="w-6 h-6 text-[#d4af37] group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="text-xl font-black tracking-widest text-white select-none">
            STITCH<span className="text-[#d4af37]">HUB</span>
          </div>
        </Link>
        <div className="flex gap-8 text-sm font-medium text-zinc-400">
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <a href="#" className="hover:text-white transition-colors">Logistics</a>
          <a href="#" className="hover:text-white transition-colors">Capabilities</a>
          <a href="#" className="hover:text-white transition-colors">Admin Login</a>
        </div>
        <div className="text-xs text-zinc-600">
          © 2026 Stitch Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
