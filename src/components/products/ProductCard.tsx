// ──────────────────────────────────────────────
// ProductCard — Minimal catalog grid card with image, title, category, and MOQ metadata
// ──────────────────────────────────────────────

"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "../../types";

interface ProductCardProps {
  /** Product data object (id, img, title, cat, moq, etc.) */
  product: Product;
  /** Optional click override (e.g. for analytics or drawer close) */
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const categoryClean = product.cat.includes(" (")
    ? product.cat.split(" (")[0]
    : product.cat;

  return (
    <Link
      href={`/products/${product.id}`}
      onClick={onClick}
      className="group cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Image fill with hover scale effect */}
        <div className="w-full aspect-4/5 bg-zinc-900 rounded-xl sm:rounded-2xl mb-2 sm:mb-3.5 overflow-hidden border border-zinc-800/80 group-hover:border-[#d4af37]/40 transition-colors flex items-center justify-center relative shadow-sm">
          <Image
            src={product.img}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Title */}
        <h4
          className="text-xs sm:text-sm md:text-base font-semibold text-zinc-100 group-hover:text-[#d4af37] transition-colors leading-snug truncate"
          title={product.title}
        >
          {product.title}
        </h4>
      </div>

      {/* Category / MOQ footer metadata */}
      <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs text-zinc-500">
        <span className="truncate">{categoryClean}</span>
        <span className="shrink-0 ml-1.5 sm:ml-2">Min: {product.moq}</span>
      </div>
    </Link>
  );
}


