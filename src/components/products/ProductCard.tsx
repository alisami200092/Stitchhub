// ──────────────────────────────────────────────
// ProductCard — Catalog grid card with image, title, category badge, and MOQ metadata
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
  return (
    <Link
      href={`/products/${product.id}`}
      onClick={onClick}
      className="group cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Image fill with hover scale effect */}
        <div className="w-full aspect-4/5 bg-zinc-900 rounded-2xl mb-4 overflow-hidden border border-zinc-900 group-hover:border-[#d4af37]/40 transition-colors flex items-center justify-center relative shadow-sm">
          <Image
            src={product.img}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-bold group-hover:text-[#d4af37] transition-colors leading-snug">
            {product.title}
          </h4>
        </div>
      </div>
      {/* Category / MOQ footer metadata */}
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900/60 pt-3">
        <span>Category: {product.cat}</span>
        <span>Minimum: {product.moq} units</span>
      </div>
    </Link>
  );
}
