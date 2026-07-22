// Sports desks. Every price here is read live from Polymarket in the browser —
// Polymarket permits that, so these desks need no server refresh at all.
//
// The reusable idea: a one-dimensional field (which team / who wins) where the
// interesting content is not the favourite but the MOVEMENT. A board that only
// shows today's price hides the story; the story is what changed and why.

import { FieldMarket } from "./polymarket";

export interface SportsDesk {
  key: string;
  slug: string;          // Polymarket event slug
  title: string;
  dek: string;
  question: string;
  resolves: string;
  /** Plain-English note on how the market settles, incl. any default outcome. */
  settlement: string;
}

export const DESKS: SportsDesk[] = [
  {
    key: "lebron",
    slug: "nba-lebron-james-next-team",
    title: "LeBron's next team",
    dek: "the biggest free agency board on the market",
    question: "Which team does LeBron James sign with?",
    resolves: "Oct 31, 2026",
    settlement:
      "Resolves to the next team he officially joins by Oct 31, 2026. If he never signs, it resolves to “Los Angeles Lakers” — so that outcome doubles as the no-move default. Retirement resolves to “Other”.",
  },
];

// Colour per outcome. Stable by name, never ember or green — those two mean
// loss and gain everywhere else on the site and must not label a team.
const PALETTE = [
  "#c9564a", "#52b7c4", "#7d9fd4", "#d0a54e", "#b07fd6",
  "#6ab3a8", "#c98f6a", "#8fb36a", "#b98fd6", "#9aa79e",
  "#d68fa8", "#8f9fd6", "#c4b752", "#7fc4a0", "#d6a87f",
];
export function teamColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

// "Miami Heat" → "Miami"; "Los Angeles Lakers" → "LA Lakers"
export function shortTeam(name: string): string {
  const n = name.replace(/^Will /, "").trim();
  if (/^Los Angeles /.test(n)) return "LA " + n.replace(/^Los Angeles /, "");
  const parts = n.split(" ");
  return parts.length > 1 ? parts.slice(0, -1).join(" ") : n;
}

export interface FieldStats {
  overround: number;   // sum of all prices; >1 means the book is charging vig
  top: FieldMarket | null;
  runnerUp: FieldMarket | null;
  /** Biggest 7-day movers, largest absolute move first. */
  movers: FieldMarket[];
  totalVol: number;
}

export function fieldStats(rows: FieldMarket[]): FieldStats {
  const sorted = [...rows].sort((a, b) => b.px - a.px);
  const movers = [...rows]
    .filter((r) => Math.abs(r.w1) >= 0.01)
    .sort((a, b) => Math.abs(b.w1) - Math.abs(a.w1));
  return {
    overround: rows.reduce((s, r) => s + r.px, 0),
    top: sorted[0] ?? null,
    runnerUp: sorted[1] ?? null,
    movers,
    totalVol: rows.reduce((s, r) => s + r.vol, 0),
  };
}

// "about 1 in 4" — a price is easier to feel as odds than as cents.
export function oddsPhrase(p: number): string {
  if (p <= 0) return "—";
  if (p >= 0.995) return "a lock";
  const n = 1 / p;
  return n < 2 ? `better than even` : `about 1 in ${n.toFixed(n < 10 ? 1 : 0)}`;
}

// What $100 returns if it hits, after nothing — gross payout multiple.
export function payout(p: number): number {
  return p > 0 ? 1 / p : 0;
}
