// ──────────────────────────────────────────────
// ProductFilters — Category tabs, search input with clear button, and sort dropdown
// ──────────────────────────────────────────────

"use client";

import React from "react";

interface ProductFiltersProps {
  /** Currently active category filter */
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  /** Current search query text */
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  /** Current sort key (e.g. "price-asc", "price-desc", "name-asc") */
  sortBy: string;
  setSortBy: (sort: string) => void;
  /** Array of all available category labels */
  categories: string[];
}

export default function ProductFilters({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-900 pb-8 mb-12 animate-scaleIn">
      {/* ── Category Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#d4af37] text-black font-black shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Search & Sort Panel ── */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        {/* Search Input with clear button */}
        <div className="relative flex-1 sm:w-64">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-5 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
          />
          {/* Clear icon appears only when query is non-empty */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-zinc-900 border border-zinc-800 rounded-full px-5 py-2.5 pr-10 text-sm text-zinc-200 focus:border-[#d4af37] focus:outline-none cursor-pointer"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
          {/* Custom chevron indicator */}
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
