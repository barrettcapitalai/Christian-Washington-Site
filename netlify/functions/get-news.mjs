import { getStore } from "@netlify/blobs";

/**
 * get-news — self-refreshing news endpoint (no API key needed)
 * ---------------------------------------------------------------------------
 * Pulls the latest headlines about the athlete from Google News (free, keyless)
 * and caches them in Netlify Blobs. The website reads only from the cache.
 * Same pattern as get-stats. Does NOT touch your CFBD quota.
 *
 * To reuse for another athlete: change PLAYER and TEAM below (and KEY so each
 * athlete caches separately).
 * ---------------------------------------------------------------------------
 */

const PLAYER = "Christian Washington";
const TEAM = "San Diego State";
const STORE = "athlete-news";
const KEY = "christian-washington";
const MAX_AGE_MS = 3 * 60 * 60 * 1000; // refresh at most every 3 hours
const MAX_ITEMS = 5;

function googleNewsUrl(query) {
  const q = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
}

function decode(s) {
  return s
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parseItems(xml) {
  const blocks = xml.split("<item>").slice(1);
  return blocks.map((b) => {
    const grab = (tag) => {
      const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? decode(m[1]) : "";
    };
    let title = grab("title");
    const link = grab("link");
    const pubDate = grab("pubDate");
    const publisher = grab("source");
    // Google sometimes appends " - Publisher" to the title; trim it if so.
    if (publisher && title.endsWith(` - ${publisher}`)) {
      title = title.slice(0, -(publisher.length + 3));
    }
    return { title, link, pubDate, publisher };
  });
}

function fmtDate(pubDate) {
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function fetchFresh() {
  const url = googleNewsUrl(`"${PLAYER}" ${TEAM}`);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AthleteSite/1.0)" },
  });
  if (!res.ok) throw new Error(`Google News → ${res.status}`);
  const xml = await res.text();

  const items = parseItems(xml)
    .filter((it) => it.title && it.link)
    .slice(0, MAX_ITEMS)
    .map((it) => ({
      tag: "News",
      title: it.title,
      source: it.publisher || "News",
      date: fmtDate(it.pubDate),
      url: it.link,
    }));

  return { updatedAt: new Date().toISOString(), items };
}

function json(items) {
  return new Response(JSON.stringify(items), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=600, s-maxage=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export default async function handler() {
  const store = getStore(STORE);

  let cached = null;
  try {
    cached = await store.get(KEY, { type: "json" });
  } catch {
    /* cache empty */
  }

  const isFresh =
    cached?.updatedAt && Date.now() - new Date(cached.updatedAt).getTime() < MAX_AGE_MS;
  if (cached?.items?.length && isFresh) return json(cached.items);

  try {
    const payload = await fetchFresh();
    if (payload.items.length) {
      await store.setJSON(KEY, payload);
      return json(payload.items);
    }
    return json(cached?.items ?? []);
  } catch (err) {
    console.error("News refresh failed:", err.message);
    return json(cached?.items ?? []);
  }
}
