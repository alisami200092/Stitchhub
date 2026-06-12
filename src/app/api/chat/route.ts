import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  // 1. Auth Guard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Access Denied. Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messages, threadId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid or empty conversation messages." }, { status: 400 });
    }

    let isOverridden = false;
    if (threadId) {
      const logs = await db
        .select({ agentOverride: emailLogs.agentOverride })
        .from(emailLogs)
        .where(
          and(
            eq(emailLogs.id, threadId),
            eq(emailLogs.userId, user.id)
          )
        )
        .limit(1);
      if (logs.length > 0 && logs[0].agentOverride) {
        isOverridden = true;
      }
    }

    let replyContent = "";

    if (isOverridden) {
      replyContent = "[Human Agent Takeover] An operations manager has taken over this thread and will reply shortly.";
    } else {
      // 2. Call local Ollama chat model
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "stitchhub_v5", // Fine-tuned GGUF
          messages: messages,
          stream: false, 
        }),
      });

      if (!response.ok) {
        throw new Error("Local Ollama chat response generation failed.");
      }

      const data = await response.json();
      replyContent = data.message.content;
    }

    // 3. Append the assistant reply and update database record atomically
    if (threadId) {
      const finalMessages = [...messages, { role: "assistant" as const, content: replyContent, isHuman: false }];
      
      await db
        .update(emailLogs)
        .set({
          aiResponseDraft: JSON.stringify(finalMessages)
        })
        .where(
          and(
            eq(emailLogs.id, threadId),
            eq(emailLogs.userId, user.id)
          )
        );
    }

    // Send the reply back to the React frontend
    return NextResponse.json({ reply: replyContent });
    
  } catch (error) {
    console.error("Chat API Core Error:", error);
    return NextResponse.json(
      { error: "Internal chat agent reasoning failure." },
      { status: 500 }
    );
  }
}