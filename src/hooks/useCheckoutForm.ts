"use client";

// ─────────────────────────────────────────────────────────────
// useCheckoutForm — Cart review, message generation, and agent submission
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../stores/cart-store";
import { useCheckoutFormStore, generateMessageFromCart, generateSubjectFromCart } from "../stores/checkout-form-store";

/**
 * Returns cart data, form fields, a file-attachment array, and a handleSubmit that POSTs
 * to /api/agent. On success, it displays the AI response inside the Active Sourcing Inbox.
 */
export function useCheckoutForm() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const {
    toEmail,
    subject,
    message,
    isSubmitting,
    isSuccess,
    setToEmail,
    setSubject,
    setMessage,
    setIsSubmitting,
    setIsSuccess,
    reset: resetCheckoutForm,
  } = useCheckoutFormStore();

  // Sync the message text area and subject line with a cart-derived template whenever the cart changes
  useEffect(() => {
    setMessage(generateMessageFromCart(cart));
    setSubject(generateSubjectFromCart(cart));
  }, [cart, setMessage, setSubject]);

  // POST cart + message to /api/agent and transition to live Active Inbox view
  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert("Your sourcing manifest is currently empty. Add catalog styles before requesting optimization.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          message,
          toEmail,
          subject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An integration failure occurred during agent processing.");
      }

      // Overwrite state context message parameter with the pure AI response payload
      setMessage(data.generatedMessage);
      setIsSuccess(true);

      // 🎯 FIXED: Clear out item states and cache attachments so the workflow logs reset,
      // but DO NOT push back to home ("/") or drop success visibility flags.
      clearCart();
      setAttachedFiles([]);
      resetCheckoutForm();

      // Route immediately to profile page inbox section
      router.push("/profile");

    } catch (err) {
      console.error("Agent communication failure:", err);
      const message = err instanceof Error ? err.message : "Network Timeout";
      alert(`AI Operations Node Exception: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false);
  const [isMergingSuggestion, setIsMergingSuggestion] = useState(false);

  // Reset suggestions when the cart changes (e.g. on new checkout session or cart updates)
  useEffect(() => {
    setSuggestions([]);
    setHasFetchedSuggestions(false);
  }, [cart]);

  const fetchAiSuggestions = async () => {
    if (cart.length === 0 || hasFetchedSuggestions) return;
    setIsFetchingSuggestions(true);
    try {
      const response = await fetch("/api/agent/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, message }),
      });
      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setHasFetchedSuggestions(true);
      } else {
        alert(data.error || "Failed to fetch AI suggestions.");
      }
    } catch (err) {
      console.error("AI suggestions request failed:", err);
      alert("Failed to communicate with AI suggestions generator.");
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const mergeSuggestion = async (suggestionText: string) => {
    setIsMergingSuggestion(true);
    try {
      const response = await fetch("/api/agent/merge-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, suggestion: suggestionText }),
      });
      const data = await response.json();
      if (response.ok && data.success && data.mergedMessage) {
        setMessage(data.mergedMessage);
      } else {
        // Fallback: append at the end
        setMessage(message + (message.endsWith("\n") ? "" : "\n") + suggestionText);
      }
    } catch (err) {
      console.error("AI suggestion merge failed, falling back to appending:", err);
      setMessage(message + (message.endsWith("\n") ? "" : "\n") + suggestionText);
    } finally {
      setIsMergingSuggestion(false);
    }
  };

  return {
    cart,
    toEmail,
    setToEmail,
    subject,
    setSubject,
    isSubmitting,
    isSuccess,
    message,
    setMessage,
    handleSubmit,
    attachedFiles,
    setAttachedFiles,
    suggestions,
    isFetchingSuggestions,
    fetchAiSuggestions,
    hasFetchedSuggestions,
    isMergingSuggestion,
    mergeSuggestion,
  };
}