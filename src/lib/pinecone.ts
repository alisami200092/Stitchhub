import { catalog } from "@/data/products";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "stitchhub-catalog";

export interface RetrievedSpec {
  name: string;
  content: string;
  score?: number;
}

/**
 * Generates vector embeddings for a query using local Ollama (all-minilm, 384 dimensions)
 */
async function getOllamaEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "all-minilm",
        prompt: text,
      }),
      signal: AbortSignal.timeout(2500),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.embedding || null;
  } catch (err) {
    console.warn("Local Ollama embedding failed, falling back to keyword lookup:", err);
    return null;
  }
}

/**
 * Retrieves vector specifications and operational guardrails from Pinecone index.
 * Falls back to local catalog if Pinecone or embedding model is unreachable.
 */
export async function retrieveCatalogSpecs(query: string, topK: number = 3): Promise<string> {
  if (!query || query.trim().length === 0) {
    return "";
  }

  // 1. Try Vector Retrieval via Pinecone
  try {
    const embedding = await getOllamaEmbedding(query);
    
    if (embedding && PINECONE_API_KEY) {
      // Query Pinecone Index via Data Plane REST endpoint
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
              topK: topK,
              includeMetadata: true,
            }),
            signal: AbortSignal.timeout(3000),
          });

          if (queryRes.ok) {
            const queryData = await queryRes.json();
            const matches = queryData.matches || [];
            
            if (matches.length > 0) {
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
    console.warn("Pinecone query error, falling back to structured catalog matching:", pineconeErr);
  }

  // 2. Structured Fallback: Search local catalog in memory with smart ranking
  const lowerQuery = query.toLowerCase();
  const scored = catalog.map((p) => {
    let score = 0;
    const titleLower = p.title.toLowerCase();
    
    // Direct exact or substring match in title (Highest weight)
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

    const descWords = (p.description || "").toLowerCase().split(/[\s,().-]+/).filter((w) => w.length > 3);
    for (const w of descWords) {
      if (lowerQuery.includes(w)) {
        score += 2;
      }
    }

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.filter((s) => s.score > 0).slice(0, topK);
  const finalProducts = selected.length > 0 ? selected.map((s) => s.product) : catalog.slice(0, topK);

  return finalProducts
    .map(
      (p) =>
        `- Product: ${p.title}. Category: ${p.cat}. Approved Methods: ${p.customization || "Standard"}. Operational Notes: ${p.description}. MOQ: ${p.moq} units. Standard Production Lead Time: 28 days.`
    )
    .join("\n\n");
}
