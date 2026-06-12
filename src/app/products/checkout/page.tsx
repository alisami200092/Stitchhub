// ──────────────────────────────────────────────────────
// page.tsx — Checkout / sourcing-quote inbox (route: /products/checkout)
// ──────────────────────────────────────────────────────
"use client";

import React from "react";
import Link from "next/link";
import LandingFooter from "../../../components/landing/LandingFooter";
import CheckoutForm from "../../../components/agentic-ai-inbox/agent-response-form";
import CheckoutSidebar from "../../../components/agentic-ai-inbox/agent-side-panel";
import { useCheckoutForm } from "../../../hooks/useCheckoutForm";

/** Checkout page — split-panel email composer + AI-powered quote sidebar */
export default function CheckoutPage() {
  const {
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
  } = useCheckoutForm();

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-[#d4af37] selection:text-black pt-12">

      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">

        {/* ── Breadcrumb navigation: Home / Products / Checkout ── */}
        <div className="mb-8 flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-widest font-bold">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-[#d4af37]">Quote Request</span>
        </div>

        {/* ── Split-panel layout: email form (left) + AI sidebar (right) ── */}
        <div className="bg-[#0b0c0e] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 max-w-6xl mx-auto min-h-170">

          {/* Left panel: email editor with to, subject, message body, and file attachments */}
          <div className="lg:col-span-7 p-6 md:p-8 border-r border-zinc-900 flex flex-col justify-between">
            <CheckoutForm
              toEmail={toEmail}
              setToEmail={setToEmail}
              subject={subject}
              setSubject={setSubject}
              message={message}
              setMessage={setMessage}
              isSuccess={isSuccess}
              attachedFiles={attachedFiles}
              setAttachedFiles={setAttachedFiles}
            />
          </div>

          {/* Right panel: cart summary, AI-generated quote preview, and submit action */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-[#0e0f12] flex flex-col justify-between">
            <CheckoutSidebar
              cart={cart}
              isSubmitting={isSubmitting}
              isSuccess={isSuccess}
              handleSubmit={handleSubmit}
              message={message}
              attachedFiles={attachedFiles}
              setAttachedFiles={setAttachedFiles}
            />
          </div>

        </div>
      </section>

      {/* Reusable landing footer */}
      <LandingFooter />
    </main>
  );
}