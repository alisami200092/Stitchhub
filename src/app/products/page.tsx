// ──────────────────────────────────────────────────────
// page.tsx — Product listing / B2B sourcing directory (route: /products)
// ──────────────────────────────────────────────────────
"use client";

import React from "react";
import LandingFooter from "../../components/landing/LandingFooter";
import ProductFilters from "../../components/products/ProductFilters";
import ProductCard from "../../components/products/ProductCard";
import { useProducts } from "../../hooks/useProducts";

/** Products listing page — renders filtered grid or empty-state fallback */
export default function ProductsPage() {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    clearFilters,
    filteredProducts,
    categories,
    loading,
  } = useProducts();

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-[#d4af37] selection:text-black">

      {/* ── Main container: title + filters + results ── */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">

        {/* Page header with gold-accent title and descriptive sub-text */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-display text-white">
            B2B Sourcing <span className="text-[#d4af37]">Directory</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base max-w-xl">
            Browse customizable products with volume pricing calculated in real time.
          </p>
        </div>

        {/* Dynamic filter bar: category, search, sort */}
        <ProductFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        {/* Empty state vs. product grid */}
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d4af37] mb-3"></div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* ── No results — search-icon placeholder with clear-filters action ── */
          <div className="py-24 text-center">
            <svg
              className="h-12 w-12 text-zinc-700 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-zinc-500 font-medium">No products match your search.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-[#d4af37] hover:underline font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* ── Product grid — 1/2/4 column responsive layout ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={i}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reusable landing footer */}
      <LandingFooter />
    </main>
  );
}
