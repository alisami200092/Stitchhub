// ──────────────────────────────────────────────────────
// page.tsx — Product listing / B2B sourcing directory (route: /products)
// ──────────────────────────────────────────────────────
"use client";

import React from "react";
import LandingFooter from "../../components/landing/LandingFooter";
import ProductFilters from "../../components/products/ProductFilters";
import ProductCard from "../../components/products/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { getBaseTitle, getProductColor, getColorOrder } from "../../utils/colors";

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

  // Group products by base title
  const groupsMap: Record<string, typeof filteredProducts> = {};
  for (const product of filteredProducts) {
    const base = getBaseTitle(product.title);
    if (!groupsMap[base]) {
      groupsMap[base] = [];
    }
    groupsMap[base].push(product);
  }

  const baseTitlePriority: Record<string, number> = {
    "Gildan 18500 Hoodie": 1,
    "Minimalist Corporate Polo": 2,
    "Insulated Matte Tumbler": 3,
    "EDC Tech Organizer Pouch": 4,
    "Framed Acoustic Art Panel": 5,
    "Cordura Ballistic Tech Briefcase": 6,
    "Natural Merino Wool Desk Mat": 7,
    "Rugged Waxed Canvas Weekend Duffel": 8,
    "Minimalist MagSafe Matte Aluminum Wallet": 9,
    "Full-Grain Leather Hardware Loop Keychain": 10,
  };

  const allBaseTitlesInFiltered = Object.keys(groupsMap);
  const activeBaseTitles = allBaseTitlesInFiltered.sort((a, b) => {
    const prioA = baseTitlePriority[a] ?? 999;
    const prioB = baseTitlePriority[b] ?? 999;
    if (prioA !== prioB) return prioA - prioB;
    return a.localeCompare(b);
  });

  const columnsData = activeBaseTitles.map((base) => {
    return groupsMap[base].sort((a, b) => {
      return getColorOrder(getProductColor(a)) - getColorOrder(getProductColor(b));
    });
  });

  // Pad the columnsData with empty columns on the right to keep card sizes uniform (1/5 of grid)
  while (columnsData.length < 5) {
    columnsData.push([]);
  }

  const maxRows = columnsData.reduce((max, col) => Math.max(max, col.length), 0);

  // Build the flat array in column-major order to align vertically in the CSS grid
  const gridItems: (typeof filteredProducts[0] | null)[] = [];
  for (let r = 0; r < maxRows; r++) {
    for (let c = 0; c < columnsData.length; c++) {
      const col = columnsData[c];
      if (r < col.length) {
        gridItems.push(col[r]);
      } else {
        gridItems.push(null);
      }
    }
  }

  const isAllTab = selectedCategory.toLowerCase() === "all";

  // Build the flat array to render depending on the current selected tab
  let displayItems: (typeof filteredProducts[0] | null)[] = [];
  if (isAllTab) {
    displayItems = gridItems;
  } else {
    displayItems = [...filteredProducts].sort((a, b) => {
      const prioA = baseTitlePriority[getBaseTitle(a.title)] ?? 999;
      const prioB = baseTitlePriority[getBaseTitle(b.title)] ?? 999;
      if (prioA !== prioB) return prioA - prioB;
      return getColorOrder(getProductColor(a)) - getColorOrder(getProductColor(b));
    });
  }

  const gridClass = "lg:grid-cols-5";

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
          /* ── Product grid ── */
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${gridClass} gap-8`}>
            {displayItems.map((item, idx) => {
              if (item === null) {
                // Invisible placeholder to keep columns aligned on desktop, hidden on collapsed mobile/tablet grid
                return <div key={`placeholder-${idx}`} className="hidden lg:block aspect-4/5" />;
              }
              return (
                <ProductCard
                  key={item.id}
                  product={item}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Reusable landing footer */}
      <LandingFooter />
    </main>
  );
}
