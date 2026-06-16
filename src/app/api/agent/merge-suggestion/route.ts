import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/agent/merge-suggestion
 * Accepts a message (draft) and a suggestion, then uses AI to contextually merge
 * the suggestion into the draft, returning the final complete message.
 */
export async function POST(req: Request) {
  // Auth guard: reject unauthenticated requests
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    const { message, suggestion } = await req.json();

    if (!message || !suggestion) {
      return NextResponse.json({ error: "Missing message or suggestion parameter." }, { status: 400 });
    }

    const mergePrompt = `
You are the StitchHub Sourcing AI. The user has a draft sourcing request email/message. They clicked a suggestion to add to the email/message.
Your task is to merge the suggestion into the draft message at the most appropriate and natural place.

Draft message:
"""
${message}
"""

Suggestion to insert:
"""
${suggestion}
"""

Instructions:
1. Identify the most suitable place in the draft message to insert the suggestion (e.g., under the item lists, in the specifications, or details request, but NOT after the signature/name/company block).
2. Insert/merge the suggestion naturally, ensuring the tone and formatting remain consistent.
3. Keep the greeting (e.g., "Hi Stitch Hub Team,") and the signature (e.g., "Best regards, [Enter Your Name], [Enter Company Name]") intact. The suggestion MUST be inserted BEFORE the signature / closing block.
4. Do not include any tags, notes, explanations, markdown formatting (other than standard list bullets if appropriate), or comments.
5. Return ONLY the final complete merged message. Do not include markdown code block wraps.
`;

    let mergedResponse = "";

    // 1. Try Ollama (with fast timeout)
    try {
      const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "stitchhub_v5",
          prompt: mergePrompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (!ollamaResponse.ok) {
        throw new Error("Ollama suggestions merge failed.");
      }

      const ollamaData = await ollamaResponse.json();
      mergedResponse = ollamaData.response;
    } catch (ollamaError) {
      console.warn("Ollama suggestion merge failed, trying Gemini fallback...", ollamaError);
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Ollama inference failed and no GEMINI_API_KEY is configured.");
      }

      const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: mergePrompt }] }],
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini suggestions merge fallback failed: ${geminiResponse.statusText}`);
      }

      const geminiData = await geminiResponse.json();
      mergedResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // Strip any potential markdown wrappers if returned
    let cleanMergedResponse = mergedResponse.trim();
    if (cleanMergedResponse.startsWith("```")) {
      cleanMergedResponse = cleanMergedResponse.replace(/^```(?:markdown)?\n?/i, "").replace(/\n?```$/i, "").trim();
    }

    return NextResponse.json({
      success: true,
      mergedMessage: cleanMergedResponse || message,
    });

  } catch (error) {
    console.error("Critical merge suggestion failure:", error);
    return NextResponse.json({ error: "Internal merge suggestions reasoning failure." }, { status: 500 });
  }
}
