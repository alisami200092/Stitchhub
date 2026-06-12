// ──────────────────────────────────────────────
// product-filter-store.ts — Catalog filter / sort state & pure filtering fn
// ──────────────────────────────────────────────

import { create } from "zustand";
import type { Product } from "../types";

/** The category tabs displayed in the product grid. */
export const CATEGORIES = ["All", "Apparel", "Drinkware", "Performance", "Accessories"];

/**
 * Holds the current filter / sort selection and the product
 * the user has clicked to inspect in the detail overlay.
 */
interface ProductFilterState {
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
  selectedProduct: Product | null;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  clearFilters: () => void;
}

/**
 * Filter / sort store — pure filter controls without side effects.
 * The actual filtering is done by the standalone getFilteredProducts()
 * function so it stays testable and reusable outside React.
 */
export const useProductFilterStore = create<ProductFilterState>()((set) => ({
  selectedCategory: "All",
  searchQuery: "",
  sortBy: "price-asc",
  selectedProduct: null,

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),

  clearFilters: () => set({ searchQuery: "", selectedCategory: "All" }),
}));

/**
 * Pure filter/sort pipeline — takes the full catalog and the current
 * filter selections, returns the filtered + sorted result.
 * @param catalog  Full product list from data/API
 * @param selectedCategory  Active category tab ("All" shows everything)
 * @param searchQuery       Case-insensitive title search
 * @param sortBy            Sort key: price-asc | price-desc | name-asc
 * @returns Filtered & sorted copy of catalog
 */
export function getFilteredProducts(
  catalog: Product[],
  selectedCategory: string,
  searchQuery: string,
  sortBy: string
): Product[] {
  return catalog
    .filter((product) => {
      const matchCat = selectedCategory === "All" || product.cat === selectedCategory;
      const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      return 0;
    });
}
