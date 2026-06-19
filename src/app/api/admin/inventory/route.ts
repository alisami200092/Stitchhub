import { NextResponse } from "next/server";
import { db } from "@/db";
import { materialsInventory } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/utils/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
    }

    const inventory = await db
      .select()
      .from(materialsInventory)
      .orderBy(asc(materialsInventory.productName));

    return NextResponse.json({ success: true, inventory });
  } catch (error) {
    console.error("Failed to fetch materials inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
    }

    const { id, stockQuantity, reorderLevel } = await req.json();

    if (id === undefined) {
      return NextResponse.json({ error: "Missing required id identifier." }, { status: 400 });
    }

    const updates: Partial<{ stockQuantity: number; reorderLevel: number }> = {};
    if (stockQuantity !== undefined) {
      updates.stockQuantity = typeof stockQuantity === "string" ? parseInt(stockQuantity, 10) : stockQuantity;
    }
    if (reorderLevel !== undefined) {
      updates.reorderLevel = typeof reorderLevel === "string" ? parseInt(reorderLevel, 10) : reorderLevel;
    }

    await db
      .update(materialsInventory)
      .set(updates)
      .where(eq(materialsInventory.id, id));

    return NextResponse.json({ success: true, message: "Inventory record successfully updated." });
  } catch (error) {
    console.error("Failed to update materials inventory:", error);
    return NextResponse.json({ error: "Failed to update inventory." }, { status: 500 });
  }
}
