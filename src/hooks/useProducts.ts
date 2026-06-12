"use client";

import { useQuery } from "@tanstack/react-query";
import { useProductFilterStore, getFilteredProducts, CATEGORIES } from "../stores/product-filter-store";
import { Product } from "../types";

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch products");
  }
  return data.products;
}

/**
 * Wires individual store selectors for category, search query, and sort order,
 * derives filteredProducts from the database using TanStack Query caching, and returns everything a product grid needs.
 */
export function useProducts() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const selectedCategory = useProductFilterStore((s) => s.selectedCategory);
  const setSelectedCategory = useProductFilterStore((s) => s.setSelectedCategory);
  const searchQuery = useProductFilterStore((s) => s.searchQuery);
  const setSearchQuery = useProductFilterStore((s) => s.setSearchQuery);
  const sortBy = useProductFilterStore((s) => s.sortBy);
  const setSortBy = useProductFilterStore((s) => s.setSortBy);
  const clearFilters = useProductFilterStore((s) => s.clearFilters);

  // Derive the filtered/sorted list from dynamic products and current filter state
  const filteredProducts = getFilteredProducts(products, selectedCategory, searchQuery, sortBy);

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    clearFilters,
    filteredProducts,
    categories: CATEGORIES,
    loading: isLoading,
  };
}
