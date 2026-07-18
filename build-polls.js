// build-polls.js — refreshes polls.json from a maintained CSV, run by a GitHub
// Action on a schedule. The site reads polls.json same-origin (like kalshi.json)
// and falls back to its bundled dataset if the file is missing or invalid.
//
// SOURCE: set the repo/Action secret or variable POLLS_CSV_URL to a published CSV
// (e.g. File → Share → Publish to web → CSV, from a Google Sheet you maintain).
// Columns (header row, case-insensitive):
//   pollster,date,n,pop,q,harris,newsom,buttigieg,aoc,shapiro,kelly,booker,beshear,pritzker,ossoff
//   - date = YYYY-MM-DD   - pop = LV | RV | A   - q = error/quality score (lower better)
//   - candidate cells = percent (blank = not offered in that poll)
//
// Safety: if the source is unreachable or yields too few valid rows, the script
// exits 0 WITHOUT touching polls.json, so a bad fetch never breaks the live site.

const fs = require("fs");

const URL = process.env.POLLS_CSV_URL || "";
const OUT = "polls.json";
const CANDS = ["harris", "newsom", "buttigieg", "aoc", "shapiro", "kelly", "booker", "beshear", "pritzker", "ossoff"];
const POPS = new Set(["LV", "RV", "A"]);

function parseCSV(text) {
  // minimal CSV: no embedded commas in our fields; trims quotes/whitespace
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  if (!lines.length) return [];
  const head = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (name) => head.indexOf(name);
  const out = [];
  for (const line of lines.slice(1)) {
    const c = line.split(",").map((x) => x.trim().replace(/^"|"$/g, ""));
    const p = c[idx("pollster")], d = c[idx("date")];
    const n = +c[idx("n")], q = +c[idx("q")];
    let pop = (c[idx("pop")] || "").toUpperCase();
    if (!p || !/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(n) || n <= 0) continue;
    if (!POPS.has(pop)) pop = "RV";
    const s = {};
    for (const k of CANDS) {
      const i = idx(k);
      if (i < 0) continue;
      const v = c[i];
      if (v !== undefined && v !== "" && Number.isFinite(+v)) s[k] = +v;
    }
    if (Object.keys(s).length < 2) continue; // need at least a couple of candidates
    out.push({ p, d, n, pop, q: Number.isFinite(q) ? q : 2.0, s });
  }
  // newest first
  out.sort((a, b) => (a.d < b.d ? 1 : -1));
  return out;
}

(async () => {
  if (!URL) {
    console.log("POLLS_CSV_URL not set — leaving polls.json unchanged (seed data stays live).");
    process.exit(0);
  }
  let text;
  try {
    const r = await fetch(URL, { redirect: "follow" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    text = await r.text();
  } catch (e) {
    console.log("Fetch failed (" + e.message + ") — keeping existing polls.json.");
    process.exit(0);
  }
  const polls = parseCSV(text);
  if (polls.length < 5) {
    console.log("Only " + polls.length + " valid rows parsed — refusing to overwrite. Check the sheet's columns.");
    process.exit(0);
  }
  const payload = { updated: new Date().toISOString().slice(0, 10), source: "sheet", polls };
  // only write if changed, so the Action doesn't create empty commits
  let prev = "";
  try { prev = fs.readFileSync(OUT, "utf8"); } catch { /* first run */ }
  const next = JSON.stringify(payload);
  if (prev && JSON.parse(prev).polls && JSON.stringify(JSON.parse(prev).polls) === JSON.stringify(polls)) {
    console.log("No poll changes — polls.json already current (" + polls.length + " polls).");
    process.exit(0);
  }
  fs.writeFileSync(OUT, next);
  console.log("Wrote polls.json with " + polls.length + " polls.");
})();
