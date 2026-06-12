// ──────────────────────────────────────────────
// checkout-form-store.ts — Checkout / inquiry form state & message builder
// ──────────────────────────────────────────────

import { create } from "zustand";
import type { CartItem } from "../types";

/**
 * Holds the raw form fields (to, subject, message) and submission
 * flags that back the "Contact Us" / sourcing-request form.
 */
interface CheckoutFormState {
  toEmail: string;
  subject: string;
  message: string;
  isSubmitting: boolean;
  isSuccess: boolean;
  setToEmail: (val: string) => void;
  setSubject: (val: string) => void;
  setMessage: (val: string) => void;
  setIsSubmitting: (val: boolean) => void;
  setIsSuccess: (val: boolean) => void;
}

/**
 * Form store — lives alongside the cart store so the contact/sourcing
 * form can be pre-filled with default values and reset after submit.
 */
export const useCheckoutFormStore = create<CheckoutFormState>()((set) => ({
  toEmail: "stitchhub@sourcing.com",
  subject: "Custom Corporate Merchandise Sourcing Request",
  message: `Hi Stitch Hub Team,

I would like to initiate a premium sourcing quote for custom merchandise. Please help us evaluate custom garment options, insulated drinkware, and tech organizing pouches.

Best regards,
[Enter Your Name]
[Enter Company Name]`,
  isSubmitting: false,
  isSuccess: false,

  setToEmail: (toEmail) => set({ toEmail }),
  setSubject: (subject) => set({ subject }),
  setMessage: (message) => set({ message }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setIsSuccess: (isSuccess) => set({ isSuccess }),
}));

/**
 * Build a human-readable email body from the current cart contents.
 * Used when the user navigates from cart → checkout so the message
 * field is pre-populated with a summary of every item, its quantity,
 * size, and any custom branding notes.
 */
export function generateMessageFromCart(cart: CartItem[]): string {
  if (cart.length > 0) {
    const itemsList = cart
      .map(
        (item) =>
          `- ${item.product.title} (Qty: ${item.quantity} units, Size: ${item.size || "Standard"})`
      )
      .join("\n");

    const specsList = cart
      .filter((item) => item.customNotes)
      .map((item) => `- ${item.product.title}: "${item.customNotes}"`)
      .join("\n");

    return `Hi Stitch Hub Team,

I would like to initiate a premium sourcing quote for our upcoming corporate brand launch. We are interested in ordering the following custom products:

${itemsList}

${
  specsList ? `Branding Specifications:\n${specsList}\n\n` : ""
}Please provide details regarding production timelines, bulk volume updates, and sample mockup approvals.

Best regards,
[Enter Your Name]
[Enter Company Name]`;
  }

  return `Hi Stitch Hub Team,

I would like to initiate a premium sourcing quote for custom merchandise. Please help us evaluate custom garment options, insulated drinkware, and tech organizing pouches.

Best regards,
[Enter Your Name]
[Enter Company Name]`;
}
