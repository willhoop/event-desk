// The field engine. Turns the raw Kalshi board into a ranked set of runners and
// derives the house pick from the data — no candidate is hard-coded anywhere.
//
// The one number that matters: CONVERSION = presidency ÷ nomination.
// It reads as "the market says: if this person is nominated, this is their
// chance of winning it all." A high conversion is the market being confident
// about a general election that is still two years away, and that confidence is
// what the Wedge sells.

import { KalshiData } from "./kalshi";
import { wedge } from "./pricing";
import { LIQUIDITY } from "./config";

export type Party = "D" | "R";

export interface Runner {
  name: string;      // full name as the venue lists it
  last: string;      // short display name
  party: Party;
  nom: number | null;   // party nomination price, 0-1
  pres: number | null;  // presidency price, 0-1
  conv: number | null;  // pres / nom
  atRisk: number | null;    // wedge cost per pair
  pays: number | null;      // wedge payout multiple
  color: string;
}

// Minimum nomination price for a conversion ratio to be worth showing at all.
export const MIN_LIQ = LIQUIDITY.minShow;

// Higher bar to be eligible for the house pick or to count toward the median.
// A 4¢ nomination against a 3¢ presidency "converts at 75%", but one tick of
// movement swings that by twenty points — it is division by noise. The pick has
// to come off a market with real size behind it.
export const PICK_MIN_NOM = LIQUIDITY.minPickNom;
export const PICK_MIN_PRES = LIQUIDITY.minPickPres;

// True when the ratio is real but the quotes behind it are too thin to lean on.
export function isThin(r: Runner): boolean {
  return (r.nom ?? 0) < PICK_MIN_NOM || (r.pres ?? 0) < PICK_MIN_PRES;
}

// Candidate palette. Deliberately excludes ember (#e2572b) and green (#4a9e7f),
// which carry loss/gain meaning everywhere else on the site.
const PALETTE = [
  "#b07fd6", "#52b7c4", "#7d9fd4", "#d0a54e", "#c9cdd4",
  "#9aa79e", "#c98f6a", "#8fb36a", "#b98fd6", "#6ab3a8",
  "#d68fa8", "#8f9fd6", "#c4b752", "#7fc4a0", "#d6a87f",
];

function hue(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

// "Alexandria Ocasio-Cortez" → "Ocasio-Cortez"; "Donald J. Trump Jr." → "Trump Jr."
export function shortName(name: string): string {
  const parts = name.replace(/\s+/g, " ").trim().split(" ");
  if (parts.length <= 1) return name;
  const tail = parts[parts.length - 1];
  if (/^(Jr\.?|Sr\.?|II|III|IV)$/i.test(tail) && parts.length >= 3) {
    return parts[parts.length - 2] + " " + tail;
  }
  return tail;
}

function mk(name: string, party: Party, nom: number | null, pres: number | null): Runner {
  const conv = nom != null && pres != null && nom > 0 ? pres / nom : null;
  let atRisk: number | null = null, pays: number | null = null;
  if (nom != null && pres != null) {
    const w = wedge(nom, pres);
    atRisk = w.atRisk;
    pays = isFinite(w.payoutMultiple) ? w.payoutMultiple : null;
  }
  return { name, last: shortName(name), party, nom, pres, conv, atRisk, pays, color: hue(name) };
}

// Build the full board from the Kalshi snapshot. A runner appears if either the
// party-nomination or the presidency market quotes them.
export function buildField(k: KalshiData): Runner[] {
  const out: Runner[] = [];
  const seen = new Set<string>();

  const add = (name: string, party: Party, nomMap: Record<string, number>) => {
    if (seen.has(name)) return;
    seen.add(name);
    const nom = nomMap[name] ?? null;
    const pres = k.presidency[name] ?? null;
    if (nom == null && pres == null) return;
    out.push(mk(name, party, nom, pres));
  };

  Object.keys(k.nomination || {}).forEach((n) => add(n, "D", k.nomination));
  Object.keys(k.gopnom || {}).forEach((n) => add(n, "R", k.gopnom));
  // Anyone quoted for the presidency but absent from both nomination boards.
  Object.keys(k.presidency || {}).forEach((n) => {
    if (seen.has(n)) return;
    seen.add(n);
    out.push(mk(n, "D", null, k.presidency[n]));
  });

  return out;
}

// Runners with both legs quoted and enough size to trust the ratio.
export function tradable(field: Runner[]): Runner[] {
  return field.filter((r) => r.nom != null && r.pres != null && r.nom >= MIN_LIQ && r.conv != null && r.conv > 0 && r.conv < LIQUIDITY.maxConv);
}

// Runners liquid enough to carry a claim — the pool the pick and median use.
export function liquid(field: Runner[], party?: Party): Runner[] {
  return tradable(field).filter((r) => !isThin(r) && (party ? r.party === party : true));
}

// The house pick: the runner the market is most confident about converting.
// Highest conversion = the market paying up for a general-election result that
// is still two years and one campaign away. That is the side worth fading.
// Thin markets are excluded — see PICK_MIN_NOM.
export function housePick(field: Runner[], party?: Party): Runner | null {
  const pool = liquid(field, party);
  if (!pool.length) return null;
  return pool.reduce((best, r) => (r.conv! > best.conv! ? r : best));
}

// Median conversion across the liquid board — the yardstick a single runner
// gets measured against, so "high" is defined by today's market, not a constant.
export function medianConv(field: Runner[], party?: Party): number | null {
  const v = liquid(field, party)
    .map((r) => r.conv!)
    .sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

// Polymarket slug for a runner's presidency market. The presidency slugs follow
// a stable pattern; the nomination slugs carry an unguessable numeric suffix, so
// only the ones we have confirmed are listed.
const KNOWN_NOM: Record<string, string> = {
  "Jon Ossoff": "will-jon-ossoff-win-the-2028-democratic-presidential-nomination-885",
};

export function presSlug(name: string): string {
  const s = name.toLowerCase().replace(/[.']/g, "").replace(/\s+/g, "-");
  return `will-${s}-win-the-2028-us-presidential-election`;
}
export function nomSlug(name: string): string | null {
  return KNOWN_NOM[name] ?? null;
}
