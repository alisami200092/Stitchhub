import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/agent/suggestions
 * Auth-guarded endpoint that:
 * 1. Validates the user session via Supabase
 * 2. Formulates a prompt asking for 3 brief sourcing recommendations based on cart & message
 * 3. Calls Ollama (stitchhub_v5) with AbortSignal timeout
 * 4. Falls back to Gemini if Ollama fails or is offline
 * 5. Parses and validates the returned suggestions array
 */
export async function POST(req: Request) {
  // Auth guard: reject unauthenticated requests
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized access blocked." }, { status: 401 });
  }

  try {
    const { cart, message } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cannot suggest follow-up items with an empty cart." }, { status: 400 });
    }

    // Context instructions detailing how to suggest upsales or adjustments
    const suggestionsPrompt = `
You are the StitchHub Sourcing AI. Based on the client's current cart items and message draft, generate 4 to 6 highly contextual, brief follow-up suggestions (e.g. specific customization methods, relevant product upsells, packaging/labeling options) that would help the user optimize their wholesale order.

CART REQUISITION MANIFEST:
${JSON.stringify(cart, null, 2)}

CUSTOMER SPECIFICATIONS & CONSTRAINTS:
"${message || "No specific instructions declared."}"

INSTRUCTIONS:
- Generate between 4 and 6 suggestions.
- Keep each suggestion short and action-oriented (1 sentence max).
- Return ONLY a JSON array of strings. Do not include markdown code block wraps, explanations, or conversation.

EXAMPLE OUTPUT:
[
  "Request matching custom embroidered tech pouches for accessory bundling",
  "Inquire about custom color dye-to-match drawcords for hoodies",
  "Ask for premium wooden gift boxes for the insulated tumblers",
  "Inquire about bulk discount tiers for larger volume orders",
  "Request physical pre-production sample mockups before running the batch"
]
`;

    let generatedResponse = "";

    // 1. Try Ollama (with fast timeout)
    try {
      const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "stitchhub_v5",
          prompt: suggestionsPrompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (!ollamaResponse.ok) {
        throw new Error("Ollama suggestions failed.");
      }

      const ollamaData = await ollamaResponse.json();
      generatedResponse = ollamaData.response;
    } catch (ollamaError) {
      console.warn("Ollama suggestions failed, trying Gemini fallback...", ollamaError);
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
            contents: [{ parts: [{ text: suggestionsPrompt }] }],
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini suggestions fallback failed: ${geminiResponse.statusText}`);
      }

      const geminiData = await geminiResponse.json();
      generatedResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // Parse suggestions safely
    let suggestionsList: string[] = [];
    try {
      // Clean JSON string from potential markdown wrapper fences
      let cleanJsonString = generatedResponse.trim();
      if (cleanJsonString.startsWith("```")) {
        // Strip leading ```json or ```
        cleanJsonString = cleanJsonString.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
      }

      // Try finding the array inside brackets if there is outer text
      const arrayMatch = cleanJsonString.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleanJsonString = arrayMatch[0];
      }

      suggestionsList = JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.warn("Failed to parse AI suggestions JSON, falling back to regex splitting...", parseError, generatedResponse);
      // Fallback: Split by bullet points or numbering if JSON parse failed
      const lines = generatedResponse
        .split("\n")
        .map(l => l.replace(/^[-*+\d.]\s*/, "").trim())
        .filter(l => l.length > 5);
      
      suggestionsList = lines.slice(0, 6);
    }

    // Fail-safe default suggestions if we still have nothing
    if (!Array.isArray(suggestionsList) || suggestionsList.length === 0) {
      suggestionsList = [
        "Inquire about bulk discount tiers for larger volume orders",
        "Request physical pre-production sample mockups before running the batch",
        "Ask for custom woven labels or branded tags for standard products",
        "Inquire about expedited shipping options and production lead times",
        "Request custom packaging box design options for retail display"
      ];
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestionsList.slice(0, 6)
    });

  } catch (error) {
    console.error("Critical suggestions generator failure:", error);
    return NextResponse.json({ error: "Internal suggestions reasoning failure." }, { status: 500 });
  }
}
