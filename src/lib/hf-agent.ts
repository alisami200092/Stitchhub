import { Client } from "@gradio/client";

const HF_SPACE_ID = process.env.HF_SPACE_ID || "alisami2000/stitchhub";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "stitchhub-v5";
const LLM_PREFERENCE = (process.env.LLM_PREFERENCE || process.env.LLM_PROVIDER || "auto").toLowerCase();

export interface LLMResponseMeta {
  text: string;
  engine: string;
  provider: "local" | "huggingface" | "gemini";
}

/**
 * Checks if local Ollama instance is alive with a fast heartbeat ping.
 */
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(1000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 1. Query Local Ollama LLM
 */
async function tryLocalOllama(
  prompt: string,
  systemPrompt: string,
  temperature: number = 0.1
): Promise<string | null> {
  try {
    console.log(`🤖 [Local LLM] Querying Ollama (${OLLAMA_MODEL}) at ${OLLAMA_HOST}...`);
    const ollamaRes = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\n${prompt}`,
        stream: false,
        options: { temperature },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      if (data.response && data.response.trim().length > 0) {
        console.log("✅ [Local LLM] Response generated from local Ollama!");
        return data.response;
      }
    }
  } catch (err) {
    console.warn("⚠️ [Local LLM] Local Ollama call failed or timed out:", err);
  }
  return null;
}

/**
 * 2. Query Hugging Face Cloud Space (Gradio)
 */
async function tryHuggingFaceSpace(
  prompt: string,
  systemPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 512
): Promise<string | null> {
  try {
    console.log(`🌐 [Cloud LLM] Querying Hugging Face Space: ${HF_SPACE_ID}...`);
    const client = await Client.connect(HF_SPACE_ID);
    const result = await client.predict("/generate_text", {
      prompt,
      system_prompt: systemPrompt,
      temperature,
      max_tokens: maxTokens,
    });

    if (result && result.data) {
      const responseText = Array.isArray(result.data) ? String(result.data[0]) : String(result.data);
      if (responseText.trim().length > 0) {
        console.log("✅ [Cloud LLM] Successfully generated response from Hugging Face Space!");
        return responseText;
      }
    }
  } catch (hfError) {
    console.warn("⚠️ [Cloud LLM] Hugging Face Space request failed or warming up:", hfError);
  }
  return null;
}

/**
 * 3. Query Google Gemini
 */
async function tryGemini(
  prompt: string,
  systemPrompt: string
): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    console.log(`🌐 [Gemini Fallback] Querying Google Gemini (${geminiModel})...`);
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (geminiRes.ok) {
      const geminiData = await geminiRes.json();
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        console.log("✅ [Gemini Fallback] Generated response from Gemini!");
        return text;
      }
    }
  } catch (geminiErr) {
    console.error("❌ [Gemini Fallback] Gemini query failed:", geminiErr);
  }
  return null;
}

/**
 * Queries the agent LLM with automated multi-tier failover & prioritization:
 * - Localhost Ollama (when running locally)
 * - Hugging Face Cloud Space (hosted model)
 * - Google Gemini (cloud fallback)
 */
export async function queryCustomLLMWithMeta(
  prompt: string,
  systemPrompt: string = "You are the autonomous StitchHub Procurement Agent.",
  temperature: number = 0.7,
  maxTokens: number = 512
): Promise<LLMResponseMeta> {
  // Determine execution order based on LLM_PREFERENCE or environment
  let providers: Array<"local" | "huggingface" | "gemini"> = [];

  if (LLM_PREFERENCE === "local") {
    providers = ["local", "huggingface", "gemini"];
  } else if (LLM_PREFERENCE === "huggingface") {
    providers = ["huggingface", "local", "gemini"];
  } else if (LLM_PREFERENCE === "gemini") {
    providers = ["gemini", "huggingface", "local"];
  } else {
    // "auto" mode: Check if local Ollama is active; if so, prioritize local, else HF Space
    const isLocalAlive = await isOllamaAvailable();
    if (isLocalAlive) {
      console.log("⚡ [LLM Router] Local Ollama detected alive -> prioritizing Localhost LLM.");
      providers = ["local", "huggingface", "gemini"];
    } else {
      console.log("⚡ [LLM Router] Local Ollama not detected -> prioritizing Hugging Face Cloud Space.");
      providers = ["huggingface", "local", "gemini"];
    }
  }

  for (const provider of providers) {
    if (provider === "local") {
      const text = await tryLocalOllama(prompt, systemPrompt, temperature);
      if (text) {
        return {
          text,
          engine: `local-ollama-${OLLAMA_MODEL}`,
          provider: "local",
        };
      }
    } else if (provider === "huggingface") {
      const text = await tryHuggingFaceSpace(prompt, systemPrompt, temperature, maxTokens);
      if (text) {
        return {
          text,
          engine: `huggingface-space-${HF_SPACE_ID}`,
          provider: "huggingface",
        };
      }
    } else if (provider === "gemini") {
      const text = await tryGemini(prompt, systemPrompt);
      if (text) {
        return {
          text,
          engine: `google-gemini-${process.env.GEMINI_MODEL || "gemini-1.5-flash"}`,
          provider: "gemini",
        };
      }
    }
  }

  throw new Error("All LLM providers (Local Ollama, Hugging Face Cloud Space, Google Gemini) failed to respond.");
}

/**
 * Standard convenience wrapper returning the string response directly.
 */
export async function queryCustomLLM(
  prompt: string,
  systemPrompt: string = "You are the autonomous StitchHub Procurement Agent.",
  temperature: number = 0.7,
  maxTokens: number = 512
): Promise<string> {
  const result = await queryCustomLLMWithMeta(prompt, systemPrompt, temperature, maxTokens);
  return result.text;
}
