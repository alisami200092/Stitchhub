// ──────────────────────────────────────────────
// LandingProductFeatures — Alternating image/text feature rows for product highlights
// ──────────────────────────────────────────────

import Image from "next/image";

/** Two feature rows alternating between image‑left and image‑right layout */
export default function LandingProductFeatures() {
  return (
    <section className="bg-[#f5f2eb] py-24 px-6 md:px-12 text-zinc-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-20 text-black">Why Choose Our Products</h2>
        
        <div className="space-y-24">
          {/* Feature 1 (Image Left, Text Right) */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* The relative container handles layout, Next.js Image handles the source path inside public */}
            <div className="w-full md:w-1/2 aspect-square md:aspect-4/3 bg-zinc-300 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center relative">
              <Image 
                src="/images/products/performance/polo.webp" 
                alt="Minimalist Performance Polo" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-500" 
                priority
              />
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h3 className="text-3xl font-bold">Minimalist Performance Polo</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Premium moisture-wicking fabrics keep your team comfortable and on-brand all day. 
              </p>
              <ul className="space-y-3 font-medium text-zinc-800">
                <li className="flex items-center gap-3">
                  <span className="text-[#b38e20] font-bold">✓</span> Exact Hex-Code Sublimation
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#b38e20] font-bold">✓</span> Wrinkle-Resistant Fabric
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2 (Text Left, Image Right) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="w-full md:w-1/2 aspect-square md:aspect-4/3 bg-zinc-300 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center relative">
              <Image 
                src="/images/products/accessories/pouch.webp" // 🎯 Updated path matching your folder
                alt="EOC Tech Organizer Pouch" 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h3 className="text-3xl font-bold">EOC Tech Organizer Pouch</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Keep your gear organized and protected on the go. Water-resistant zips, padded compartments, and a sleek profile.
              </p>
              <ul className="space-y-3 font-medium text-zinc-800">
                <li className="flex items-center gap-3">
                  <span className="text-[#b38e20] font-bold">✓</span> Ballistic Nylon Construction
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#b38e20] font-bold">✓</span> Precision Logo Embroidery
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}