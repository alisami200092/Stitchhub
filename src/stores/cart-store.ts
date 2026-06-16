// ──────────────────────────────────────────────
// cart-store.ts — Persistent shopping cart state
// ──────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "../types";

/**
 * Manages the shopping cart items and drawer visibility.
 * Persisted to localStorage so cart survives page reloads.
 */
interface CartState {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity: number, size: string, customNotes: string, skipOpen?: boolean) => void;
  removeFromCart: (title: string, size: string) => void;
  updateQuantity: (title: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

/**
 * Shopping cart store — items, drawer state, add/remove/update logic.
 * Wrapped in persist() so the cart outlives a page refresh.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,

      setIsOpen: (open) => set({ isOpen: open }),

      addToCart: (product, quantity, size, customNotes, skipOpen) => {
        const { cart } = get();
        // If the same product+size already exists, bump the quantity
        // instead of creating a duplicate line item.
        const existingIndex = cart.findIndex(
          (item) => item.product.title === product.title && item.size === size
        );

        let newCart: CartItem[];
        if (existingIndex > -1) {
          newCart = cart;
        } else {
          newCart = [...cart, { product, quantity, size, customNotes }];
        }

        // Open the cart drawer so the user sees the item was added, unless skipOpen is true.
        set({ cart: newCart, isOpen: skipOpen ? false : true });
      },

      removeFromCart: (title, size) => {
        const { cart } = get();
        set({ cart: cart.filter((item) => !(item.product.title === title && item.size === size)) });
      },

      updateQuantity: (title, size, quantity) => {
        const { cart } = get();
        const item = cart.find(
          (i) => i.product.title === title && i.size === size
        );
        if (!item) return;

        // Clamp to MOQ so the user can't go below the minimum order quantity.
        const clamped = Math.max(quantity, item.product.moq);
        if (clamped <= 0) {
          const { removeFromCart } = get();
          removeFromCart(title, size);
          return;
        }
        set({
          cart: cart.map((i) =>
            i.product.title === title && i.size === size
              ? { ...i, quantity: clamped }
              : i
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "stitchhub_cart", // localStorage key
    }
  )
);
