import { getStore } from "@netlify/blobs";

/**
 * get-stats — single self-refreshing stats endpoint
 * Serves cached stats; refreshes from CollegeFootballData when stale/empty.
 * Requires CFBD_API_KEY in Netlify environment variables.
 */

const CFBD_BASE = "https://api.collegefootballdata.com";
const TEAM = "San Diego State";
const PLAYER = "Christian Washington";
const STORE = "athlete-stats";
const KEY = "christian-washington";
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // refresh at most every 6 hours

// Optional: set to his CFBD numeric playerId for exact matching.
const PLAYER_ID = null;

function currentSeason(d = new Date()) {
  return d.getUTCMonth() >= 7 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
}

async function cfbd(path, params, key) {
  const url = new URL(CFBD_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`CFBD ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

function pick(rows, category, statType) {
  const row = rows.find((x) => {
    const cat = String(x.category ?? "").toLowerCase();
    const type = String(x.statType ?? x.stat_type ?? "").toUpperCase();
    return cat === category.toLowerCase() && type === statType.toUpperCase();
  });
  return row ? Number(row.stat) : null;
}

function val(g, camel, snake) {
  return g[camel] ?? g[snake];
}

async function fetchFresh(key) {
  const season = currentSeason();

  const allStats = await cfbd("/stats/player/season", { year: season, team: TEAM }, key);
  // One-time field check: console.log("sample row:", JSON.stringify(allStats[0]));
  const rows = allStats.filter((s) =>
    PLAYER_ID ? String(s.playerId) === String(PLAYER_ID) : s.player === PLAYER
  );

  const rushYds = pick(rows, "rushing", "YDS");
  const rushTd = pick(rows, "rushing", "TD");
  const car = pick(rows, "rushing", "CAR");
  const rec = pick(rows, "receiving", "REC");
  const krYds = pick(rows, "kickReturns", "YDS");
  const ypc = rushYds != null && car ? (rushYds / car).toFixed(1) : null;

  const fmt = (v) => (v == null ? "—" : String(v));
  const line = [
    { label: "RUSH YDS", value: fmt(rushYds) },
    { label: "RUSH TD", value: fmt(rushTd) },
    { label: "YDS / CARRY", value: fmt(ypc) },
    { label: "CARRIES", value: fmt(car) },
    { label: "RECEPTIONS", value: fmt(rec) },
    { label: "KR YDS", value: fmt(krYds) },
  ];

  const games = await cfbd("/games", { year: season, team: TEAM, seasonType: "both" }, key);
  const completed = games
    .filter((g) => val(g, "completed", "completed"))
    .sort((a, b) => new Date(val(b, "startDate", "start_date")) - new Date(val(a, "startDate", "start_date")));

  let lastGame = null;
  if (completed.length) {
    const g = completed[0];
    const home = val(g, "homeTeam", "home_team") === TEAM;
    const us = home ? val(g, "homePoints", "home_points") : val(g, "awayPoints", "away_points");
    const them = home ? val(g, "awayPoints", "away_points") : val(g, "homePoints", "home_points");
    const opp = home ? val(g, "awayTeam", "away_team") : val(g, "homeTeam", "home_team");
    lastGame = {
      result: us > them ? "W" : us < them ? "L" : "T",
      score: `${TEAM} ${us} — ${opp} ${them}`,
      date: new Date(val(g, "startDate", "start_date")).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  }

  return { updatedAt: new Date().toISOString(), season, scope: `${season} season`, line, lastGame };
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, s-maxage=300",
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
  if (cached && isFresh) return json(cached);

  const key = process.env.CFBD_API_KEY;
  if (!key) {
    return json(cached ?? { scope: "Stats unavailable", line: [], lastGame: null });
  }

  try {
    const payload = await fetchFresh(key);
    await store.setJSON(KEY, payload);
    return json(payload);
  } catch (err) {
    console.error("Stats refresh failed:", err.message);
    return json(cached ?? { scope: "Stats updating…", line: [], lastGame: null });
  }
}
