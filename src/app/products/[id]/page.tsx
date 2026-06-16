// ──────────────────────────────────────────────────────
// page.tsx — Product detail page (route: /products/[id])
// ──────────────────────────────────────────────────────
"use client";

import React, { use } from "react";
import Link from "next/link";
import LandingFooter from "../../../components/landing/LandingFooter";
import ProductBreadcrumb from "../../../components/products/ProductBreadcrumb";
import ProductImage from "../../../components/products/ProductImage";
import ProductInfo from "../../../components/products/ProductInfo";
import CustomizationMethods from "../../../components/products/CustomizationMethods";
import SizeSelector from "../../../components/products/SizeSelector";
import SourcingVolumeMatrix from "../../../components/products/SourcingVolumeMatrix";
import VolumeStepper from "../../../components/products/VolumeStepper";
import AddToCartButton from "../../../components/products/AddToCartButton";
import { useProductDetailPage } from "../../../hooks/useProductDetailPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/** Product detail — shows not-found fallback or full product content with customization, sizing, volume, and add-to-cart */
export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { product, detail, loading } = useProductDetailPage(id);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
        <p className="mt-4 text-xs text-zinc-400 font-mono uppercase tracking-wider">Loading product details...</p>
      </main>
    );
  }

  /* ── Not-found state — product is missing or invalid id ── */
  if (!product) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between font-sans">
        <section className="py-24 text-center max-w-xl mx-auto px-6">
          {/* Error icon */}
          <svg
            className="h-16 w-16 text-zinc-700 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-3xl font-bold font-display mb-4">Product Not Found</h2>
          <p className="text-zinc-500 mb-8">
            This product is either discontinued or no longer available.
          </p>
          {/* Link back to the full directory */}
          <Link
            href="/products"
            className="inline-block px-8 py-3 rounded-full bg-[#d4af37] text-black font-bold hover:bg-[#b38e20] transition-colors"
          >
            Back to Directory
          </Link>
        </section>
        <LandingFooter />
      </main>
    );
  }

  /* ── Product found — two-column detail layout ── */
  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Breadcrumb navigation (Products > Product Name) */}
      <ProductBreadcrumb />

      {/* ── Split layout: image (5 cols) + info/customization (7 cols) ── */}
      <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

        {/* Left zone: product image with category badge */}
        <div className="lg:col-span-5">
          <ProductImage src={product.img} alt={product.title} category={product.cat} />
        </div>

        {/* Right zone: product info, customization, sizing, volume matrix, stepper, add-to-cart */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="bg-zinc-900/30 border border-zinc-900 p-8 rounded-3xl backdrop-blur-md">
            {/* Title, description, minimum order qty */}
            <ProductInfo title={product.title} description={product.description} minQty={detail.minQty} />

            {/* Available customization methods (embroidery, screen-print, etc.) — conditionally rendered */}
            {product.customization && (
              <CustomizationMethods methods={product.customization} />
            )}

            {/* Size selector — only visible for apparel-type products */}
            <SizeSelector visible={detail.isApparel} selectedSize={detail.size} onSelect={detail.setSize} />

            {/* Volume-based pricing matrix table */}
            <SourcingVolumeMatrix />

            {/* Quantity stepper with min-qty enforcement */}
            <VolumeStepper minQty={detail.minQty} currentQty={detail.currentQty} onChange={detail.setQuantity} />

            {/* Add-to-cart button with current qty snapshot */}
            <AddToCartButton
              currentQty={detail.currentQty}
              onAdd={detail.handleAddToCart}
              onCheckout={detail.handleCheckout}
              isInCart={detail.isInCart}
            />
          </div>
        </div>
      </section>

      {/* Reusable landing footer */}
      <LandingFooter />
    </main>
  );
}
