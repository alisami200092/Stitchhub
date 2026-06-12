"use client";

import { useQuery } from "@tanstack/react-query";
import { Product } from "../types";
import { useCartStore } from "../stores/cart-store";
import { useProductDetail } from "./useProductDetail";

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch products");
  }
  return data.products;
}

/**
 * Looks up a product by id from the cached query, wraps useProductDetail with an
 * onClose that opens the cart, and returns both the product and the detail hook's return value.
 */
export function useProductDetailPage(id: string) {
  const setIsOpen = useCartStore((s) => s.setIsOpen);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const product = products.find((p) => p.id === id) || null;

  // Compose useProductDetail; on add-to-cart, open the cart slide-over instead of closing it
  const detail = useProductDetail(product, () => {
    setIsOpen(true);
  });

  return {
    product,
    detail,
    loading: isLoading,
  };
}
