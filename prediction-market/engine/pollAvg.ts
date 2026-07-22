import { POLLS, PARTISAN, NAMES, Poll } from "../data/polls";

const KEYS = Object.keys(NAMES);
const days = (d: string) => (Date.now() - new Date(d + "T12:00:00Z").getTime()) / 864e5;

function baseW(pl: Poll): number {
  const rec = Math.pow(0.97, Math.max(0, days(pl.d)));
  const sz = Math.sqrt(Math.min(pl.n, 5000) / 600);
  const pop = pl.pop === "LV" ? 1 : pl.pop === "RV" ? 0.9 : 0.75;
  return rec * sz * pop;
}

// House effect: how far each firm habitually sits from the field average, per candidate.
function houseEffects(scoreW: (pl: Poll) => number, polls: Poll[]) {
  const base: Record<string, number> = {};
  for (const k of KEYS) {
    let num = 0, den = 0;
    for (const pl of polls) {
      const v = pl.s[k];
      if (v == null) continue;
      const w = scoreW(pl);
      num += w * v; den += w;
    }
    base[k] = den > 0 ? num / den : 0;
  }
  const byP: Record<string, Poll[]> = {};
  polls.forEach((pl) => { (byP[pl.p] ||= []).push(pl); });
  const he: Record<string, Record<string, number>> = {};
  for (const p in byP) {
    if (byP[p].length < 2) continue;
    const eff: Record<string, number> = {};
    for (const k of KEYS) {
      const ds: number[] = [];
      byP[p].forEach((pl) => { if (pl.s[k] != null && base[k] != null) ds.push((pl.s[k] as number) - base[k]); });
      if (ds.length) eff[k] = ds.reduce((a, b) => a + b, 0) / ds.length;
    }
    he[p] = eff;
  }
  return he;
}

export interface PollsterScore { score: number; dev: number; nAvg: number; lv: number; count: number; part: number; }

export function computeAll(polls: Poll[] = POLLS) {
  // Pass 1: house effects with base weights.
  let HE = houseEffects(baseW, polls);
  // Score each pollster from its measured behavior.
  const byP: Record<string, Poll[]> = {};
  polls.forEach((pl) => { (byP[pl.p] ||= []).push(pl); });
  const E4: Record<string, PollsterScore> = {};
  for (const p in byP) {
    const ps = byP[p];
    const devs: number[] = [];
    if (HE[p]) for (const k in HE[p]) devs.push(Math.abs(HE[p][k]));
    const dev = devs.length ? devs.reduce((a, b) => a + b, 0) / devs.length : 2.5;
    const devN = Math.min(dev / 6, 1);
    const nAvg = ps.reduce((a, b) => a + b.n, 0) / ps.length;
    const lv = ps.filter((x) => x.pop === "LV").length / ps.length;
    const e4 = 0.30 + 0.40 * (1 - devN) + 0.20 * Math.min(1, Math.sqrt(nAvg / 1200)) + 0.10 * lv - 0.30 * (PARTISAN[p] || 0);
    E4[p] = { score: Math.max(0.2, Math.min(1, e4)), dev, nAvg: Math.round(nAvg), lv, count: ps.length, part: PARTISAN[p] || 0 };
  }
  const scoreW = (pl: Poll) => baseW(pl) * (E4[pl.p] ? E4[pl.p].score : 0.5);
  // Pass 2: recompute house effects with scored weights, then the final average.
  HE = houseEffects(scoreW, polls);
  const avg: Record<string, number> = {};
  for (const k of KEYS) {
    let num = 0, den = 0;
    for (const pl of polls) {
      const v = pl.s[k];
      if (v == null) continue;
      const w = scoreW(pl);
      const adj = v - ((HE[pl.p]?.[k]) || 0) * 0.5;
      num += w * adj; den += w;
    }
    avg[k] = den > 0 ? num / den : 0;
  }
  return { avg, E4 };
}

// Trend: recompute the average as of a past timestamp for a rolling series.
export function avgAsOf(asOf: number, E4: Record<string, PollsterScore>, polls: Poll[] = POLLS): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of KEYS) {
    let num = 0, den = 0;
    for (const pl of polls) {
      const v = pl.s[k];
      if (v == null) continue;
      const age = (asOf - new Date(pl.d + "T12:00:00Z").getTime()) / 864e5;
      if (age < 0 || age > 90) continue;
      const rec = Math.pow(0.97, Math.max(0, age));
      const sz = Math.sqrt(Math.min(pl.n, 5000) / 600);
      const pop = pl.pop === "LV" ? 1 : pl.pop === "RV" ? 0.9 : 0.75;
      const e = E4[pl.p] ? E4[pl.p].score : 0.5;
      num += rec * sz * pop * e * v; den += rec * sz * pop * e;
    }
    out[k] = den > 0 ? num / den : 0;
  }
  return out;
}
