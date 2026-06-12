// ──────────────────────────────────────────────
// CartDrawer.tsx — Slide-over cart drawer with inline quantity editing, MOQ clamping, and checkout
// ──────────────────────────────────────────────

"use client";

import React from "react";
import Image from "next/image";
import type { CartItem } from "../types";
import GoldButton from "./ui/GoldButton";

/** Props for the inline quantity input component */
interface QuantityInputProps {
  item: CartItem;
  updateQuantity: (title: string, size: string, quantity: number) => void;
}

/**
 * Inline quantity editor with editing mode pattern.
 * Switches to a draft input on focus, validates/clamps to MOQ on blur,
 * and supports Enter key to commit.
 */
function CartItemQuantityInput({ item, updateQuantity }: QuantityInputProps) {
  // editing mode pattern — local draft string while user types
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(item.quantity.toString());

  // Enter editing mode; sync draft from current quantity
  const handleFocus = () => {
    setDraft(item.quantity.toString());
    setEditing(true);
  };

  // blur validation with MOQ clamping — resets to MOQ if input is invalid or below minimum
  const handleBlur = () => {
    setEditing(false);
    let parsed = parseInt(draft, 10);
    const minVal = item.product.moq;
    if (isNaN(parsed) || parsed < minVal) {
      parsed = minVal;
    }
    const finalStr = parsed.toString();
    setDraft(finalStr);
    updateQuantity(item.product.title, item.size, parsed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
  };

  // Enter key submission — blurs the input to trigger commit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="number"
      min={item.product.moq}
      value={editing ? draft : item.quantity}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-16 bg-transparent text-center text-xs font-semibold text-white focus:outline-none border-x border-zinc-800 h-full py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

/** Props for the main slide-over cart drawer */
interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  updateQuantity: (title: string, size: string, quantity: number) => void;
  removeFromCart: (title: string, size: string) => void;
}

/**
 * Slide-over cart drawer panel.
 * Shows backdrop, empty state when no items, cart item rows with -5/+5
 * controls and inline quantity editor, remove button, and a footer with
 * quote status and checkout link.
 */
export default function CartDrawer({
  cart,
  isOpen,
  setIsOpen,
  updateQuantity,
  removeFromCart,
}: CartDrawerProps) {

  // Render nothing when closed (controlled by parent via isOpen)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* ── Backdrop — click to close ── */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md transform bg-zinc-950 border-l border-zinc-900 shadow-2xl flex flex-col">
          {/* ── Header — title + close button ── */}
          <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-6">
            <h2 className="text-xl font-bold font-display text-white">
              Cart
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* ── Body Content — empty state vs cart items list ── */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              // Empty state — illustration, message, and browse link
              <div className="h-full flex flex-col items-center justify-center text-center">
                <svg
                  className="h-12 w-12 text-zinc-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="text-zinc-500 font-medium">Your cart is empty.</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-sm font-semibold text-[#d4af37] hover:underline cursor-pointer"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              // ── Cart items list ──
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 border-b border-zinc-900 pb-6 last:border-b-0 animate-scaleIn"
                  >
                    {/* Product thumbnail */}
                    <div className="relative h-20 w-16 shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src={item.product.img}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item details and controls */}
                    <div className="flex-1 flex flex-col">
                      {/* Title and current quantity */}
                      <div className="flex justify-between">
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {item.product.title}
                        </h4>
                        <span className="text-sm font-semibold text-zinc-500">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Category: {item.product.cat}
                        {item.size && ` | Size: ${item.size}`}
                      </p>

                      {/* Custom notes from sourcing request */}
                      {item.customNotes && (
                        <p className="text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-900 px-2 py-1 rounded mt-1.5 line-clamp-1 italic">
                          &ldquo;{item.customNotes}&rdquo;
                        </p>
                      )}

                      {/* ── Quantity controls (-5/+5) and inline editor + remove button ── */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-zinc-800 rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.title,
                                item.size,
                                item.quantity - 5
                              )
                            }
                            disabled={item.quantity <= item.product.moq}
                            className="px-2 py-1 text-zinc-400 hover:text-white transition-colors disabled:text-zinc-700 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -5
                          </button>
                          {/* Inline quantity editor with editing mode */}
                          <CartItemQuantityInput
                            item={item}
                            updateQuantity={updateQuantity}
                          />
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.title,
                                item.size,
                                item.quantity + 5
                              )
                            }
                            className="px-2 py-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +5
                          </button>
                        </div>

                        {/* Remove button — deletes line item */}
                        <button
                          onClick={() =>
                            removeFromCart(item.product.title, item.size)
                          }
                          className="text-xs text-red-500 hover:text-red-400 transition-colors font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer controls — quote status and checkout link ── */}
          {cart.length > 0 && (
            <div className="border-t border-zinc-900 bg-zinc-950 p-6 space-y-4">
              <div className="flex justify-between items-center text-zinc-400">
                <span className="text-sm font-medium">Quote Status</span>
                <span className="text-sm font-bold text-[#d4af37] uppercase tracking-wider">
                  Pending
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Your final quote will be calculated based on product selection, quantities, and customization details.
              </p>

              <GoldButton href="/products/checkout" onClick={() => setIsOpen(false)} size="md">
                Request Quote
              </GoldButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
