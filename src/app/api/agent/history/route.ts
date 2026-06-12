import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Access Denied." }, { status: 401 });
  }

  try {
    // Query Drizzle to pull database records matching ONLY this current user's unique metadata ID identifier
    const logs = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.userId, user.id))
      .orderBy(desc(emailLogs.createdAt)); // Sort so freshest transactions display at top

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Inbox data mapping sync break failure:", error);
    return NextResponse.json({ error: "Failed to map database feeds." }, { status: 500 });
  }
}