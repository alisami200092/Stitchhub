import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { desc } from "drizzle-orm";
import { isAdmin } from "@/utils/admin";

/**
 * GET /api/products
 * Fetch all products from the database, sorted by creation time (newest first).
 */
export async function GET() {
  try {
    const list = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    return NextResponse.json({ success: true, products: list });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products catalog." }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Admin-only endpoint to create/add a new product to the catalog.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, cat, img, price, priceRange, description, moq, customization } = body;

    // Validation
    if (!id || !title || !cat || !img || typeof price !== "number" || !priceRange || !description || typeof moq !== "number" || !customization) {
      return NextResponse.json({ error: "Missing or invalid required fields." }, { status: 400 });
    }

    // Insert new product
    await db.insert(products).values({
      id,
      title,
      cat,
      img,
      price,
      priceRange,
      description,
      moq,
      customization,
    });

    return NextResponse.json({ success: true, message: "Product created successfully." });
  } catch (error) {
    console.error("Failed to create product:", error);
    if (error && typeof error === "object" && "code" in error) {
      const pgError = error as { code: string };
      if (pgError.code === "23505") {
        return NextResponse.json({ error: "A product with this unique ID already exists." }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Failed to save product to catalog." }, { status: 500 });
  }
}
