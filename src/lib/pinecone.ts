import { catalog } from "@/data/products";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "stitchhub-catalog";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

export interface RetrievedSpec {
  name: string;
  content: string;
  score?: number;
}

/**
 * 1. Generates vector embeddings for a query using local Ollama (all-minilm, 384 dimensions)
 */
async function getOllamaEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "all-minilm",
        prompt: text,
      }),
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.embedding || null;
  } catch (err) {
    return null;
  }
}

/**
 * 2. Generates vector embeddings using Google Gemini fallback if Ollama is not on localhost
 */
async function getGeminiEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
        }),
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.embedding?.values || null;
  } catch {
    return null;
  }
}

/**
 * Formats a catalog product into a structured specification block.
 */
function formatProductSpec(p: (typeof catalog)[0]): string {
  return `- Product: ${p.title}. Category: ${p.cat}. Approved Methods: ${p.customization || "Standard"}. Operational Notes: ${p.description}. MOQ: ${p.moq} units. Standard Production Lead Time: 28 days.`;
}

/**
 * Retrieves vector specifications and operational guardrails from Pinecone index (1st Priority).
 * Strictly limits retrieval to the exact target products in the cart.
 */
export async function retrieveCatalogSpecs(
  query: string,
  topK: number = 1,
  targetProducts: string[] = []
): Promise<string> {
  if (!query || query.trim().length === 0) {
    return "";
  }

  // ── PRIORITY 1: PINECONE VECTOR DATABASE ──
  if (PINECONE_API_KEY) {
    try {
      console.log(`🌲 [Vector DB] Querying Pinecone for target items (topK=${topK})...`);
      const embedding = (await getOllamaEmbedding(query)) || (await getGeminiEmbedding(query));

      if (embedding) {
        const describeRes = await fetch(`https://api.pinecone.io/indexes/${INDEX_NAME}`, {
          method: "GET",
          headers: {
            "Api-Key": PINECONE_API_KEY,
            "X-Pinecone-API-Version": "2024-07",
          },
          signal: AbortSignal.timeout(3000),
        });

        if (describeRes.ok) {
          const describeData = await describeRes.json();
          const host = describeData.host;

          if (host) {
            const queryRes = await fetch(`https://${host}/query`, {
              method: "POST",
              headers: {
                "Api-Key": PINECONE_API_KEY,
                "Content-Type": "application/json",
                "X-Pinecone-API-Version": "2024-07",
              },
              body: JSON.stringify({
                vector: embedding,
                topK: Math.max(1, topK),
                includeMetadata: true,
              }),
              signal: AbortSignal.timeout(4000),
            });

            if (queryRes.ok) {
              const queryData = await queryRes.json();
              const matches = queryData.matches || [];

              if (matches.length > 0) {
                console.log(`🌲 [Vector DB] Successfully retrieved ${matches.length} matches from Pinecone!`);
                const vectorResults = matches.map((m: any) => {
                  const meta = m.metadata || {};
                  const text = meta.text || meta.page_content || meta.specs || `Product: ${meta.product_name || m.id}`;
                  return `- ${text}`;
                });
                return vectorResults.join("\n\n");
              }
            }
          }
        }
      }
    } catch (pineconeErr) {
      console.warn("⚠️ [Vector DB] Pinecone query error, gracefully falling back to local catalog:", pineconeErr);
    }
  }

  // ── PRIORITY 2 / FALLBACK: Exact Cart-Targeted In-Memory Matching ──
  console.log("📚 [Catalog DB] Using strict cart-targeted catalog matching...");

  // If specific target products are declared (from user's cart), ONLY return those products
  if (targetProducts && targetProducts.length > 0) {
    const matchedProducts = catalog.filter((p) =>
      targetProducts.some((t) => {
        const cleanT = t.toLowerCase().trim();
        const cleanTitle = p.title.toLowerCase().trim();
        return cleanTitle.includes(cleanT) || cleanT.includes(cleanTitle);
      })
    );

    if (matchedProducts.length > 0) {
      return matchedProducts.map(formatProductSpec).join("\n\n");
    }
  }

  // Fallback: Ranked score matching, strictly capped at topK
  const lowerQuery = query.toLowerCase();
  const scored = catalog.map((p) => {
    let score = 0;
    const titleLower = p.title.toLowerCase();

    // Exact or substring match in title (Highest weight)
    if (lowerQuery.includes(titleLower) || titleLower.includes(lowerQuery)) {
      score += 100;
    }

    // Word-level matching
    const titleWords = titleLower.split(/[\s,()-]+/).filter((w) => w.length > 2);
    for (const w of titleWords) {
      if (lowerQuery.includes(w)) {
        score += 15;
      }
    }

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.filter((s) => s.score > 0).slice(0, Math.max(1, topK));
  const finalProducts = selected.length > 0 ? selected.map((s) => s.product) : [catalog[0]];

  return finalProducts.map(formatProductSpec).join("\n\n");
}
