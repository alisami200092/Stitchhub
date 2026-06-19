import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCheckoutSession } from "@/lib/polar";
import { handleSuccessfulPayment } from "@/lib/polar-utils";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { checkoutId } = await req.json();
    if (!checkoutId) {
      return NextResponse.json({ error: "Missing checkoutId." }, { status: 400 });
    }

    const checkout = await getCheckoutSession(checkoutId);

    if (checkout.status !== "succeeded") {
      return NextResponse.json({ error: "Checkout has not been completed." }, { status: 400 });
    }

    if (String(checkout.metadata?.userId ?? "") !== user.id) {
      return NextResponse.json({ error: "Checkout does not belong to this user." }, { status: 403 });
    }

    await handleSuccessfulPayment(checkout);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json({ error: "Failed to confirm payment." }, { status: 500 });
  }
}
