// ──────────────────────────────────────────────
// LandingCta — Call‑to‑action section with headline and gold button
// ──────────────────────────────────────────────

import Link from "next/link";

/** Simple CTA banner: heading + gold link button to /products */
export default function LandingCta() {
  return (
    <section className="bg-black pt-24 px-6 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto text-center mb-24">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">Ready to Get Started?</h2>
        <Link
          href="/products"
          className="inline-block bg-[#d4af37] text-black px-12 py-4 rounded-full font-bold text-lg hover:bg-[#ebd06f] hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.2)] cursor-pointer"
        >
          Browse Products
        </Link>
      </div>
    </section>
  );
}
