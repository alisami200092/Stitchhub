import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { ADMIN_EMAILS } from "@/utils/admin";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const isLoggedIn = !!user;
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Define our protected dashboard boundaries
  const isSecureRoute = 
    pathname.startsWith("/products/checkout") || 
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    (pathname === "/api/products" && method === "POST");

  // If trying to access a secure dashboard and aren't logged in, redirect to login
  if (isSecureRoute && !isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  // Restrict /admin and admin API routes to the hardcoded ADMIN_EMAILS list
  const isAdminOperation = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/api/admin") ||
    (pathname === "/api/products" && method === "POST");

  if (isAdminOperation && isLoggedIn) {
    const userEmail = user.email?.toLowerCase();
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
      }
      // Redirect unauthorized users to the homepage
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
  }

  return supabaseResponse;
}

// Tells Next.js exactly which paths to trigger the proxy gatekeeper on
export const config = {
  matcher: [
    "/products/checkout/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/products"
  ],
};