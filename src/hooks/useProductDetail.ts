"use client";

// ─────────────────────────────────────────────────────────────
// useProductDetail — Quantity / size / price logic for a single product
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import type { Product } from "../types";
import { useCartStore } from "../stores/cart-store";
import { useRouter } from "next/navigation";

import { calculateTieredPricing } from "../utils/pricing";

/**
 * Returns quantity, size, notes, computed price (with volume discounts), MOQ clamping,
 * and a handleAddToCart that dispatches to the cart store and calls onClose.
 */
export function useProductDetail(product: Product | null, onClose: () => void) {
  const addToCart = useCartStore((s) => s.addToCart);
  const cart = useCartStore((s) => s.cart);
  const router = useRouter();
  const [quantity, setQuantity] = useState(50);
  const [size, setSize] = useState("M");
  const [customNotes, setCustomNotes] = useState("");

  // Check if current product and size combination is already in the cart
  const isInCart = product
    ? cart.some((item) => item.product.title === product.title && item.size === size)
    : false;

  // Clamp input quantity to at least the product's MOQ (default 25)
  const minQty = product?.moq ?? 25;
  const currentQty = Math.max(quantity, minQty);

  const currentPrice = product
    ? calculateTieredPricing(product.id, currentQty, product.price).unitPrice
    : 0;

  const handleAddToCart = () => {
    if (!product || isInCart) return;
    const finalProduct = { ...product, price: currentPrice };
    addToCart(finalProduct, currentQty, size, customNotes);
    onClose();
  };

  const handleCheckout = () => {
    if (!product) return;
    const finalProduct = { ...product, price: currentPrice };
    addToCart(finalProduct, currentQty, size, customNotes, true);
    router.push("/products/checkout");
  };

  const isApparel =
    product?.cat === "Apparel (Hoodie, Polo)";

  return {
    quantity,
    size,
    customNotes,
    minQty,
    currentQty,
    currentPrice,
    isApparel,
    isInCart,
    setQuantity,
    setSize,
    setCustomNotes,
    handleAddToCart,
    handleCheckout,
  };
}
