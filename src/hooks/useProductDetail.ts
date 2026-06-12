"use client";

// ─────────────────────────────────────────────────────────────
// useProductDetail — Quantity / size / price logic for a single product
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import type { Product } from "../types";
import { useCartStore } from "../stores/cart-store";

/**
 * Returns quantity, size, notes, computed price (with volume discounts), MOQ clamping,
 * and a handleAddToCart that dispatches to the cart store and calls onClose.
 */
export function useProductDetail(product: Product | null, onClose: () => void) {
  const addToCart = useCartStore((s) => s.addToCart);
  const [quantity, setQuantity] = useState(50);
  const [size, setSize] = useState("M");
  const [customNotes, setCustomNotes] = useState("");

  // Clamp input quantity to at least the product's MOQ (default 25)
  const minQty = product?.moq ?? 25;
  const currentQty = Math.max(quantity, minQty);

  // Volume discount tiers: 100+ units → 10% off, 250+ units → 15% off
  const getDiscountedPrice = (qty: number) => {
    if (qty >= 250) return product!.price * 0.85;
    if (qty >= 100) return product!.price * 0.9;
    return product!.price;
  };

  const currentPrice = product ? getDiscountedPrice(currentQty) : 0;

  const handleAddToCart = () => {
    if (!product) return;
    const finalProduct = { ...product, price: currentPrice };
    addToCart(finalProduct, currentQty, size, customNotes);
    onClose();
  };

  const isApparel =
    product?.cat === "Apparel" || product?.cat === "Performance";

  return {
    quantity,
    size,
    customNotes,
    minQty,
    currentQty,
    currentPrice,
    isApparel,
    setQuantity,
    setSize,
    setCustomNotes,
    handleAddToCart,
  };
}
