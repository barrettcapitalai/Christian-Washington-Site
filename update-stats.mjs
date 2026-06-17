import { getStore } from "@netlify/blobs";

/**
 * update-stats — scheduled Netlify function
 * ---------------------------------------------------------------------------
 * Runs on a cron, pulls Christian Washington's season stats + last game from
 * the CollegeFootballData (CFBD) v2 API, and writes the result to a Netlify
 * Blobs store. The website never calls CFBD directly — it reads the cache via
 * get-stats. This keeps the API key secret and the site fast.
 *
 * SETUP: set CFBD_API_KEY in Netlify (Site settings → Environment variables).
 * Free CFBD tier = 1,000 calls/month; this makes 2 calls per run.
 * ---------------------------------------------------------------------------
 */

const CFBD_BASE = "https://api.collegefootballdata.com";
const TEAM = "San Diego State";
const PLAYER = "Christian Washington";
const STORE = "athlete-stats";
const KEY = "christian-washington";

// Optional: set to his CFBD numeric playerId for exact matching (avoids any
// name collisions). Leave null to match by name. Find it once via:
//   GET /player/search?searchTerm=Washington&team=San Diego State
const PLAYER_ID = null;

// College season spans Aug–Jan; Jan–Jul still belongs to the prior year's season.
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
  if (!res.ok) {
    throw new Error(`CFBD ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// CFBD season-stat rows look like: { player, category, statType, stat, ... }.
// Field casing can vary between API versions, so we read defensively.
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

export default async function handler() {
  const key = process.env.CFBD_API_KEY;
  if (!key) {
    console.error("CFBD_API_KEY is not set");
    return new Response("Missing CFBD_API_KEY", { status: 500 });
  }

  const season = currentSeason();

  try {
    // 1) Season player stats for the whole team, filtered to our player.
    const allStats = await cfbd("/stats/player/season", { year: season, team: TEAM }, key);

    // One-time helper: uncomment to inspect the exact field names in the logs.
    // console.log("sample row:", JSON.stringify(allStats[0]));

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

    // 2) Most recent completed game for the team.
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

    const payload = {
      updatedAt: new Date().toISOString(),
      season,
      scope: `${season} season`,
      line,
      lastGame,
    };

    const store = getStore(STORE);
    await store.setJSON(KEY, payload);

    console.log("Stats updated:", JSON.stringify(payload));
    return new Response("ok");
  } catch (err) {
    // On failure we deliberately do NOT overwrite the cache, so the site keeps
    // showing the last good numbers instead of blanks.
    console.error("Update failed:", err.message);
    return new Response(`Update failed: ${err.message}`, { status: 502 });
  }
}

// Cron is in UTC. Daily 09:00 UTC ≈ 1–2am Pacific — after games finalize.
// To save calls, narrow to game days, e.g. "0 9 * * 0,1" (Sun & Mon mornings).
export const config = { schedule: "0 9 * * *" };
