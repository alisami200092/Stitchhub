// ──────────────────────────────────────────────
// ProductImage — Sticky product photo with fill layout, priority loading, and category badge overlay
// ──────────────────────────────────────────────

import Image from "next/image";

interface ProductImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Product category label rendered as a badge overlay */
  category: string;
}

export default function ProductImage({ src, alt, category }: ProductImageProps) {
  return (
    // Sticky positioning keeps the image visible while scrolling info on the right
    <div className="lg:sticky lg:top-28 space-y-6">
      <div className="relative aspect-square w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-900 shadow-xl flex items-center justify-center">
        {/* Fill the parent container with the product photo, priority-loaded for LCP */}
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
        />
        {/* Category badge overlay in the top-left corner */}
        <div className="absolute top-6 left-6 bg-zinc-950/80 backdrop-blur-sm border border-[#d4af37]/30 px-4 py-1.5 rounded-full text-xs font-bold text-[#d4af37] tracking-wider uppercase">
          {category}
        </div>
      </div>
    </div>
  );
}
