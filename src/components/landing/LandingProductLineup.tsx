// ──────────────────────────────────────────────
// LandingProductLineup — Product grid with four category cards and hover overlay
// ──────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";

/** 2×2 product grid showing category thumbnails with hover‑reveal gradient */
export default function LandingProductLineup() {
  return (
    <section className="bg-zinc-950 py-24 px-6 md:px-12 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Product Lineup</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: "gildan-18500-hoodie", title: "Gildan 18500 Hoodie", cat: "Apparel", img: "/images/products/apparel/hoodie.webp" },
            { id: "matte-black-tumbler", title: "Matte Black Tumbler", cat: "Drinkware", img: "/images/products/drinkware/tumbler.webp" },
            { id: "under-armour-polo", title: "Under Armour Polo", cat: "Performance", img: "/images/products/performance/polo.webp" },
            { id: "tech-organizer", title: "Tech Organizer", cat: "Accessories", img: "/images/products/accessories/pouch.webp" }
          ].map((product, i) => (
            <Link key={i} href={`/products/${product.id}`} className="group cursor-pointer">
              <div className="w-full aspect-[4/5] bg-zinc-900 rounded-xl mb-4 overflow-hidden border border-zinc-800 group-hover:border-[#d4af37]/40 transition-colors flex items-center justify-center relative">
                <Image 
                  src={product.img} 
                  alt={product.title} 
                  fill 
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  priority={product.img === '/images/products/drinkware/tumbler.webp' || product.img === '/images/products/apparel/hoodie.webp'}
                />
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-lg font-bold group-hover:text-[#d4af37] transition-colors">{product.title}</h4>
              <p className="text-sm text-zinc-500">{product.cat}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
