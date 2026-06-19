"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const [status, setStatus] = useState<"confirming" | "confirmed" | "error">("confirming");

  useEffect(() => {
    if (!checkoutId) {
      setStatus("error");
      return;
    }

    fetch("/api/agent/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("confirmed");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [checkoutId]);

  return (
    <div className="min-h-screen w-full bg-[#090a0f] text-zinc-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "confirming" && (
          <div className="space-y-4">
            <span className="h-12 w-12 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin inline-block" />
            <p className="text-sm text-zinc-400 font-mono">Confirming your payment...</p>
          </div>
        )}

        {status === "confirmed" && (
          <>
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white font-mono">Payment Confirmed</h1>
              <p className="text-sm text-zinc-400 font-mono leading-relaxed">
                Your deposit payment has been verified. The Supplier AI Procurement Agent is now sourcing materials for your production run.
              </p>
            </div>

            {checkoutId && (
              <p className="text-[10px] text-zinc-600 font-mono truncate">
                Ref: {checkoutId}
              </p>
            )}

            <Link
              href="/profile"
              className="inline-block w-full py-2.5 bg-[#d4af37] hover:bg-[#bfa032] text-[#090a0f] rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] text-center"
            >
              Return to Dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white font-mono">Payment Pending</h1>
              <p className="text-sm text-zinc-400 font-mono leading-relaxed">
                We're still waiting for confirmation. If you completed the payment, your sourcing agent will activate shortly. Return to your dashboard to check the status.
              </p>
            </div>

            <Link
              href="/profile"
              className="inline-block w-full py-2.5 bg-[#d4af37] hover:bg-[#bfa032] text-[#090a0f] rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] text-center"
            >
              Return to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#090a0f] flex items-center justify-center text-zinc-400 font-mono text-xs">
        <span className="h-4 w-4 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mr-3" />
        Loading...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
