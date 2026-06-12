import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/utils/admin";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT /api/products/[id]
 * Admin-only route to update a product catalog entry.
 */
export async function PUT(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, cat, img, price, priceRange, description, moq, customization } = body;

    // Validation
    if (!title || !cat || !img || typeof price !== "number" || !priceRange || !description || typeof moq !== "number" || !customization) {
      return NextResponse.json({ error: "Missing or invalid required fields." }, { status: 400 });
    }

    await db
      .update(products)
      .set({
        title,
        cat,
        img,
        price,
        priceRange,
        description,
        moq,
        customization,
      })
      .where(eq(products.id, id));

    return NextResponse.json({ success: true, message: "Product updated successfully." });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]
 * Admin-only route to delete a product from the database.
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    await db
      .delete(products)
      .where(eq(products.id, id));

    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
