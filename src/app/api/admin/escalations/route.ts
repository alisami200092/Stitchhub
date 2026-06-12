import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { isAdmin } from "@/utils/admin";
import { emailLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";


export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Secondary security check on the API route
  if (!user || !user.email || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Access Denied." }, { status: 403 });
  }

  try {
    const escalations = await db
      .select()
      .from(emailLogs)
      .orderBy(desc(emailLogs.createdAt));

    return NextResponse.json({ escalations });
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json({ error: "Database failure." }, { status: 500 });
  }
}