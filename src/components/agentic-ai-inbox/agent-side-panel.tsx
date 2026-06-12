"use client";

// ──────────────────────────────────────────────
// agent-side-panel.tsx — Side panel for agent inbox with submit, suggestions, cart & files
// ──────────────────────────────────────────────

import React from "react";
import type { CartItem } from "../../types";
import GoldButton from "../ui/GoldButton";
import DancingDots from "../ui/DancingDots";

// Props for the side panel — cart, submission state, escalation context, and attachments
interface CheckoutSidebarProps {
  cart: CartItem[];
  isSubmitting: boolean;
  isSuccess: boolean;
  handleSubmit: () => void;
  message: string; // Message text used to detect escalation patterns
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
}

// Side panel — handles form submission, displays sourcing cart, attached files, and AI suggestions
export default function CheckoutSidebar({
  cart,
  isSubmitting,
  isSuccess,
  handleSubmit,
  message,
  attachedFiles,
  setAttachedFiles,
}: CheckoutSidebarProps) {
  
  // Detect escalation from AI response — checks for PAUSE action tag or admin escalation keyword
  const isEscalated = message.includes("<action>PAUSE</action>") || message.includes("escalate_to_admin");

  return (
    <div className="space-y-6">
      {/* AI-suggested actions card — prepopulated follow-ups the agent can click */}
      <div className="bg-[#121418] border border-zinc-900 rounded-xl p-5 space-y-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Suggestions
        </h4>
        <ul className="space-y-2 text-sm">
          <li className="text-[#d4af37] font-medium hover:underline cursor-pointer flex items-center gap-2">
            <span>✦</span> Draft custom follow-up worksheet
          </li>
          <li className="text-[#d4af37] font-medium hover:underline cursor-pointer flex items-center gap-2">
            <span>✦</span> Upsell suggestions (insulated flasks, minimal wallets)
          </li>
        </ul>
      </div>

      {/* Sourcing specifications summary — cart items with scroll, client company, and status badge */}
      <div className="bg-[#121418] border border-zinc-900 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Cart Items
        </h4>
        {cart.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No products added yet.</p>
        ) : (
          <div className="space-y-3 max-h-55 overflow-y-auto pr-1">
            {/* Scrollable cart item list — each row shows product, size, and quantity */}
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm border-b border-zinc-900 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-bold text-white text-xs">{item.product.title}</p>
                  <p className="text-[10px] text-zinc-500">Size: {item.size || "Standard"}</p>
                </div>
                <span className="text-xs font-semibold text-zinc-300">{item.quantity} units</span>
              </div>
            ))}
          </div>
        )}
        <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-xs text-zinc-400">
          <span>Client Company</span>
          <span className="font-semibold text-white">Stitch Hub Corporate Inc.</span>
        </div>
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span>Sourcing Status</span>
          
          {/* Dynamic status badge — shows "Escalated to Admin" (red/pulse) or "Draft Sourcing" (green/ping) */}
          {isEscalated ? (
            <span className="font-bold text-red-400 flex items-center gap-1.5 uppercase text-[10px] tracking-wider bg-red-950/30 border border-red-900/40 px-2 py-0.5 rounded">
              <DancingDots color="red" />
              Escalated to Admin
            </span>
          ) : (
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <DancingDots color="emerald" />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Submit button — red glow when escalated, gold glow otherwise. Disabled while submitting or cart empty */}
      <GoldButton
        disabled={isSubmitting || isSuccess || cart.length === 0}
        onClick={handleSubmit}
        loading={isSubmitting}
        className={`w-full ${isEscalated ? "shadow-[0_0_35px_rgba(239,68,68,0.2)]" : "shadow-[0_0_35px_rgba(212,175,55,0.4)]"}`}
      >
        {isSubmitting ? "Analyzing..." : "Request Quote"}
      </GoldButton>

      {/* Attached files section — type detection for image/sheet/PDF, with remove button per file */}
      {attachedFiles.length > 0 && (
        <div className="bg-[#121418] border border-zinc-900 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Attached Files
          </h4>
          <div className="space-y-2.5">
            {attachedFiles.map((file, i) => {
              // Detect file type by MIME or extension — currently supports Image, Sheet, PDF, and generic File
              const isImage = file.type.startsWith("image/") || file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".webp");
              const isSheet = file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv");
              let typeLabel = "File";
              if (isImage) typeLabel = "Image";
              else if (isSheet) typeLabel = "Sheet";
              else if (file.name.endsWith(".pdf")) typeLabel = "PDF";
              
              return (
                <div key={i} className="flex items-center justify-between p-2.5 bg-[#0e0f12] rounded-lg border border-zinc-900 text-xs animate-scaleIn">
                  <div className="flex items-center gap-2 max-w-[65%]">
                    <svg className="h-4 w-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-zinc-300 font-medium truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-600 uppercase font-bold">{typeLabel}</span>
                    {/* Remove file from attachment list by filtering out this index */}
                    <button
                      onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer rounded hover:bg-zinc-900"
                      title="Remove file"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}