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

    // Self-healing database logic for historical escalations
    for (const log of logs) {
      let isEscalated = false;
      if (log.aiResponseDraft) {
        try {
          const parsed = JSON.parse(log.aiResponseDraft);
          if (Array.isArray(parsed)) {
            isEscalated = parsed.some(
              (msg) =>
                msg.role === "assistant" &&
                !msg.isHuman &&
                (msg.content.toLowerCase().includes("escalat") ||
                  msg.content.toLowerCase().includes("stitchhub team") ||
                  msg.content.toLowerCase().includes("admin team") ||
                  msg.content.toLowerCase().includes("human admin") ||
                  msg.content.toLowerCase().includes("operations manager") ||
                  msg.content.toLowerCase().includes("custom mill team"))
            );
          } else {
            const content = String(log.aiResponseDraft).toLowerCase();
            isEscalated =
              content.includes("escalat") ||
              content.includes("stitchhub team") ||
              content.includes("admin team") ||
              content.includes("human admin") ||
              content.includes("operations manager") ||
              content.includes("custom mill team");
          }
        } catch {
          const content = String(log.aiResponseDraft).toLowerCase();
          isEscalated =
            content.includes("escalat") ||
            content.includes("stitchhub team") ||
            content.includes("admin team") ||
            content.includes("human admin") ||
            content.includes("operations manager") ||
            content.includes("custom mill team");
        }
      }

      if (isEscalated && 
          log.status !== "review_required" && 
          log.status !== "review required" && 
          log.status !== "escalate_to_admin" && 
          log.status !== "approved" && 
          log.status !== "processing" && 
          log.status !== "shipping" && 
          log.status !== "delivered") {
        const hasEscalateToAdminKeyword = String(log.aiResponseDraft).includes("escalate_to_admin");
        const healStatus = hasEscalateToAdminKeyword ? "escalate_to_admin" : "review required";
        log.status = healStatus;
        await db
          .update(emailLogs)
          .set({ status: healStatus })
          .where(eq(emailLogs.id, log.id));
      }
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Inbox data mapping sync break failure:", error);
    return NextResponse.json({ error: "Failed to map database feeds." }, { status: 500 });
  }
}