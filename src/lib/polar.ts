import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  server: "sandbox",
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
});

const POLAR_API = "https://sandbox-api.polar.sh/v1";

async function polarFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${POLAR_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Polar API error (${res.status}): ${err}`);
  }
  return res.json();
}

export async function createCheckoutSession(payload: Record<string, unknown>) {
  return polarFetch("/checkouts/", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<{ url: string; id: string; status: string; metadata?: Record<string, string | number | boolean | undefined> }>;
}

export async function getCheckoutSession(id: string) {
  return polarFetch(`/checkouts/${id}`) as Promise<{ id: string; status: string; metadata?: Record<string, string | number | boolean | undefined> }>;
}
