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
  reset: () => void;
}

/**
 * Form store — lives alongside the cart store so the contact/sourcing
 * form can be pre-filled with default values and reset after submit.
 */
export const useCheckoutFormStore = create<CheckoutFormState>()((set) => ({
  toEmail: "stitchhub@sourcing.com",
  subject: "Corporate Merchandise Request",
  message: `Hello StitchHub Operations Team,

We would like to initiate an official corporate merchandise procurement inquiry. Please evaluate custom catalog items adhering to your standard 4-week production schedule and 50-unit MOQ floor.

Best regards,
Corporate Procurement Sourcing Team`,
  isSubmitting: false,
  isSuccess: false,

  setToEmail: (toEmail) => set({ toEmail }),
  setSubject: (subject) => set({ subject }),
  setMessage: (message) => set({ message }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setIsSuccess: (isSuccess) => set({ isSuccess }),
  reset: () => set({
    toEmail: "stitchhub@sourcing.com",
    subject: "Corporate Merchandise Request",
    message: `Hello StitchHub Operations Team,

We would like to initiate an official corporate merchandise procurement inquiry. Please evaluate custom catalog items adhering to your standard 4-week production schedule and 50-unit MOQ floor.

Best regards,
Corporate Procurement Sourcing Team`,
    isSubmitting: false,
    isSuccess: false,
  }),
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
      .map((item) => {
        const sizeInfo = item.size && item.size !== "Standard" ? `, Size: ${item.size}` : "";
        const method = item.customNotes?.trim() || item.product.customization || "Standard Catalog Decoration";
        return `• Product: ${item.product.title}\n  Quantity: ${item.quantity} units${sizeInfo}\n  Approved Customization: ${method}\n  Production Timeline: Standard 5-week lead time (35 days)`;
      })
      .join("\n\n");

    return `Hello StitchHub Procurement & Operations Team,

We would like to formally request an official B2B wholesale production quote for our corporate merchandise program. Please find our order specifications detailed below:

ORDER REQUISITION MANIFEST:
${itemsList}

OPERATIONAL PARAMETERS:
• Production Standard: Official StitchHub catalog specifications and manufacturing tolerances approved.
• Artwork: High-fidelity corporate logo placement matching material constraints.
• Logistics: Standard single-destination bulk freight delivery.

Please evaluate this requisition against factory floor availability, calculate tiered volume costing, and initiate the formal purchase order review.

Best regards,
Corporate Procurement Sourcing Team`;
  }

  return `Hello StitchHub Operations Team,

We would like to initiate an official corporate merchandise procurement inquiry. We are looking to evaluate custom catalog items adhering to your standard 4-week production schedule and 50-unit MOQ floor.

Please provide available wholesale production slots, approved customization guidelines, and factory lead times.

Best regards,
Corporate Procurement Sourcing Team`;
}

/**
 * Build a dynamic subject line based on the cart contents.
 */
export function generateSubjectFromCart(cart: CartItem[]): string {
  if (cart.length === 0) {
    return "Corporate Merchandise Request";
  }

  const titles = cart.map((item) => item.product.title);
  
  if (titles.length === 1) {
    return `${titles[0]}`;
  }
  
  if (titles.length === 2) {
    return `${titles[0]} & ${titles[1]}`;
  }
  
  return `${titles[0]}, ${titles[1]} & ${titles.length - 2} other ${titles.length - 2 === 1 ? "item" : "items"}`;
}
