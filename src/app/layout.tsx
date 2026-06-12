// ──────────────────────────────────────────────────────
// layout.tsx — Root layout wrapping all pages (route: /)
// ──────────────────────────────────────────────────────
import type { Metadata } from "next";
import SupabaseProvider from "@/providers/SupabaseProvider";
import QueryProvider from "@/providers/QueryProvider";
import Navbar from "@/components/Navbar";
import CartDrawerWrapper from "../components/CartDrawerWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "StitchHub - Bulk Apparel Manufacturing & Sourcing",
  description: "A premium operational command center and sourcing platform for high-volume custom garment runs.",
};

/** Root layout — wraps every page with auth provider, global nav, and cart drawer */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-black text-white antialiased">
        {/* Provider layer: Supabase auth context broadcast to entire tree */}
        <SupabaseProvider>
          <QueryProvider>
            {/* Global dark-luxury navigation bar */}
            <Navbar />
            
            {/* Page-specific content rendered by the router */}
            <main>{children}</main>
            
            {/* Slide-out cart drawer accessible from any page */}
            <CartDrawerWrapper />
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}