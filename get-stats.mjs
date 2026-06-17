import { getStore } from "@netlify/blobs";

/**
 * get-stats — read-only Netlify function
 * ---------------------------------------------------------------------------
 * Serves the cached stats written by update-stats. This is the only stats
 * endpoint the website calls. No API key here — it just reads the Blob.
 * Frontend usage:  fetch("/.netlify/functions/get-stats").then(r => r.json())
 * ---------------------------------------------------------------------------
 */

const STORE = "athlete-stats";
const KEY = "christian-washington";

export default async function handler() {
  let data = null;
  try {
    const store = getStore(STORE);
    data = await store.get(KEY, { type: "json" });
  } catch (err) {
    console.error("Blob read failed:", err.message);
  }

  // Fallback shape if the cache hasn't been populated yet.
  const body = data ?? { scope: "Stats updating…", line: [], lastGame: null };

  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      // Let the CDN/browser cache for 5 min so repeat visits don't re-invoke.
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
