import { useMemo, useState, useEffect, useRef } from "react";
import { Wrap, Header, Section, Footer, Wide } from "../components/Shell";
import { LineChart, Series } from "../components/LineChart";
import { Portrait } from "../components/Portrait";
import { computeAll, avgAsOf } from "../../engine/pollAvg";
import { usePolls } from "../usePolls";
import { impliedPrices } from "../../engine/pollModel";
import { NAMES, SNAP_MKT, Poll } from "../../data/polls";
import { colorFor, SHORT } from "../../engine/colors";
import { useLive } from "../useLive";
import { useFutureSearch } from "../useFutureSearch";
import { Link } from "react-router-dom";

const NOW = Date.UTC(2026, 6, 17);
const DAY = 864e5;
const START = Date.UTC(2026, 0, 15);
const ROW_H = 74; // fixed row pitch so rank changes glide instead of snapping
const PANEL_H = 168; // inline detail panel that opens under the tapped face

export default function PollDataDesk() {
  const live = useLive();
  const fs = useFutureSearch();
  const { polls } = usePolls();
  const { avg, E4 } = useMemo(() => computeAll(polls), [polls]);
  const [sel, setSel] = useState<string | null>(null);
  const [trust, setTrust] = useState(70);

  // ---- time machine: precompute the weekly timeline once ----
  const weeks = useMemo(() => {
    const w: number[] = [];
    for (let t = START; t <= NOW; t += 7 * DAY) w.push(t);
    if (w[w.length - 1] !== NOW) w.push(NOW);
    return w;
  }, []);
  const timeline = useMemo(() => weeks.map((t) => avgAsOf(t, E4, polls)), [weeks, E4, polls]);
  const [idx, setIdx] = useState(weeks.length - 1);
  const [playing, setPlaying] = useState(false);
  const atNow = idx >= weeks.length - 1;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setIdx((i) => {
        if (i >= weeks.length - 1) { setPlaying(false); return i; }
        return i + 1;
      });
    }, 260);
    return () => clearInterval(id);
  }, [playing, weeks.length]);

  const snap = timeline[Math.min(idx, timeline.length - 1)] || avg;
  const keys = useMemo(() => Object.keys(NAMES), []);
  const order = useMemo(() => [...keys].sort((a, b) => (snap[b] || 0) - (snap[a] || 0)), [keys, snap]);
  const rankNow = useMemo(() => {
    const o = [...keys].sort((a, b) => (avg[b] || 0) - (avg[a] || 0));
    const m: Record<string, number> = {}; o.forEach((k, i) => (m[k] = i)); return m;
  }, [keys, avg]);
  const maxShare = Math.max(1, ...keys.map((k) => snap[k] || 0));

  // momentum vs 6 weeks before the scrub point
  const priorIdx = Math.max(0, idx - 6);
  const mom: Record<string, number> = {};
  keys.forEach((k) => (mom[k] = (snap[k] || 0) - (timeline[priorIdx]?.[k] || 0)));

  // live market price (cents), fall back to a labelled snapshot when a feed is down
  const mkt: Record<string, number> = {};
  const mktLive: Record<string, boolean> = {};
  keys.forEach((k) => {
    const kv = live.kalshi.nomination[NAMES[k]];
    mkt[k] = kv != null ? kv * 100 : SNAP_MKT[k] ?? NaN;
    mktLive[k] = kv != null;
  });
  if (live.polyNom != null) { mkt["ossoff"] = live.polyNom * 100; mktLive["ossoff"] = true; }
  const anySnapshot = keys.some((k) => !mktLive[k] && !isNaN(mkt[k]));

  const implied = impliedPrices(avg);

  const series: Series[] = useMemo(() => {
    const o = [...keys].sort((a, b) => (avg[b] || 0) - (avg[a] || 0));
    return o
      .map((k, i) => ({
        key: k, name: SHORT[k], color: colorFor(k, i),
        pts: weeks.map((t, wi) => ({ t, v: timeline[wi][k] || 0 })).filter((p) => p.v > 0),
      }))
      .filter((s) => s.pts.length > 0);
  }, [keys, avg, weeks, timeline]);

  const t = trust / 100;
  const edge = (k: string) => {
    if (implied[k] == null || isNaN(mkt[k])) return null;
    return implied[k] * t + mkt[k] * (1 - t) - mkt[k];
  };
  const ranked = keys.map((k) => ({ k, e: edge(k) })).filter((r) => r.e != null).sort((a, b) => (b.e as number) - (a.e as number));
  const bestBuy = ranked[0], bestFade = ranked[ranked.length - 1];
  const eMax = Math.max(1, ...ranked.map((r) => Math.abs(r.e as number)));

  const cols = ["harris", "newsom", "buttigieg", "aoc", "shapiro"];
  const HE = useMemo(() => heatData(polls), [polls]);
  const heMax = Math.max(1, ...HE.flatMap((r) => cols.map((c) => Math.abs(r.eff[c] ?? 0))));

  const segs = ranked.map((r) => {
    const gap = implied[r.k] - mkt[r.k];
    return `${SHORT[r.k].toUpperCase()} <b>${implied[r.k]?.toFixed(0)}¢</b> fair vs <b>${mkt[r.k].toFixed(0)}¢</b> mkt <span class="${gap > 0 ? "text-green" : "text-ember"}">${gap > 0 ? "+" : ""}${gap.toFixed(1)}</span>`;
  });

  const when = new Date(weeks[Math.min(idx, weeks.length - 1)]).toLocaleDateString(undefined, { month: "long", day: "numeric" });

  return (
    <Wrap>
      <Header title="Poll Data Desk" sub={<>the raw numbers · <Link to="/polling" className="text-ember no-underline">POLLING DESK</Link></>} ticker={segs} />

      {/* 01 — THE RACE */}
      <Section n="01" title="The race" dek="press play · tap a face">
        <div className="flex items-center gap-3 flex-wrap mb-3 bg-paper2 border border-rule rounded-md p-3">
          <button onClick={() => { if (atNow) setIdx(0); setPlaying(!playing); }}
            className="mono text-[11px] uppercase tracking-[0.08em] border border-ember text-ember rounded px-3.5 py-2 hover:bg-ember hover:text-paper transition-colors shrink-0">
            {playing ? "Pause" : atNow ? "Replay 2026" : "Play"}
          </button>
          <input type="range" min={0} max={weeks.length - 1} value={idx}
            onChange={(e) => { setPlaying(false); setIdx(+e.target.value); }}
            className="flex-1 min-w-[160px] accent-ember cursor-pointer" />
          <span className="mono text-[13px] text-ink w-[104px] text-right shrink-0">{when}</span>
          {!atNow && <button onClick={() => { setPlaying(false); setIdx(weeks.length - 1); }}
            className="mono text-[10px] uppercase text-faint border border-rule rounded px-2 py-1.5 hover:text-ink hover:border-ink2">today</button>}
        </div>

        <div className="relative transition-[height] duration-500" style={{ height: keys.length * ROW_H + (sel ? PANEL_H : 0) }}>
          {sel && (
            <FocusPanel k={sel} top={(order.indexOf(sel) + 1) * ROW_H} color={colorFor(sel, rankNow[sel])}
              vals={timeline.map((s) => s[sel] || 0)} share={snap[sel] || 0} fair={implied[sel]} mk={mkt[sel]}
              polls={polls.filter((p) => p.s[sel] != null).length} mom={mom[sel] || 0} onClose={() => setSel(null)} />
          )}
          {keys.map((k) => {
            const i = rankNow[k];
            const m = mom[k] || 0;
            const on = sel === null || sel === k;
            const v = snap[k] || 0;
            const pos = order.indexOf(k);
            const shift = sel && pos > order.indexOf(sel) ? PANEL_H : 0;
            return (
              <button key={k} onClick={() => setSel(sel === k ? null : k)}
                style={{ transform: `translateY(${pos * ROW_H + shift}px)` }}
                className={"absolute inset-x-0 top-0 h-[66px] grid grid-cols-[22px_44px_1fr_auto] sm:grid-cols-[30px_46px_1fr_58px_auto] items-center gap-2 sm:gap-3 rounded-md border px-2.5 text-left will-change-transform " +
                  "transition-[transform,opacity,border-color] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] " +
                  (sel === k ? "border-ink bg-paper2 z-10" : "border-rule hover:border-ink2 bg-paper2/40") + (on ? "" : " opacity-30")}>
                <span className="serif text-[20px] text-faint text-center">{pos + 1}</span>
                <Portrait name={NAMES[k]} size={46} />
                <span className="min-w-0">
                  <span className="serif text-[18px] leading-none block truncate" style={{ color: colorFor(k, i) }}>{NAMES[k]}</span>
                  <span className="block h-2.5 rounded mt-1.5 transition-all duration-500" style={{ width: `${Math.max(3, (v / maxShare) * 100)}%`, background: colorFor(k, i), opacity: 0.85 }} />
                </span>
                <span className="hidden sm:block"><MiniSpark vals={timeline.map((s) => s[k] || 0)} upto={idx} color={colorFor(k, i)} /></span>
                <span className="text-right pr-1">
                  <span className="serif text-[22px] block leading-none">{v.toFixed(1)}<span className="text-[13px] text-faint">%</span></span>
                  <span className={"mono text-[11px] " + (m > 0.15 ? "text-green" : m < -0.15 ? "text-ember" : "text-faint")}>
                    {m > 0.15 ? "▲" : m < -0.15 ? "▼" : "▬"} {Math.abs(m).toFixed(1)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mono text-[11px] text-faint mt-2.5">
          {sel ? <>Focused on <b className="text-ink">{NAMES[sel]}</b> — every section below follows. <button onClick={() => setSel(null)} className="text-ember underline">clear</button></>
            : <>Bars = E4-weighted share on {when} · ▲▼ = 6-week move · method in the <a href="./EliteFour_Polling_WhitePaper.pdf" className="text-ember no-underline">white paper</a>.</>}
        </p>
      </Section>

      {/* 02 — TREND */}
      <Section n="02" title="Six months, live" dek="hover · click legend">
        <Wide><LineChart series={sel ? series.filter((s) => s.key === sel) : series} unit="%" defaultVisible={sel ? 1 : 5} key={sel || "all"} /></Wide>
      </Section>

      {/* 03 — MISPRICING METER */}
      <Section n="03" title="The mispricing meter" dek="drag it">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <FaceCard label="Biggest buy" k={bestBuy?.k} fair={implied[bestBuy?.k ?? ""]} mk={mkt[bestBuy?.k ?? ""]} good />
          <FaceCard label="Biggest fade" k={bestFade?.k} fair={implied[bestFade?.k ?? ""]} mk={mkt[bestFade?.k ?? ""]} />
        </div>
        <div className="bg-paper2 border border-rule rounded-md p-4">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <span className="mono text-[11px] uppercase tracking-[0.06em] text-faint">Conviction — trust the market ⟷ trust the polls</span>
            <span className="mono text-[13px]"><b className="text-ink">{trust}%</b> polls</span>
          </div>
          <input type="range" min={0} max={100} value={trust} onChange={(e) => setTrust(+e.target.value)} className="w-full accent-ember cursor-pointer" />
          <div className="mt-4 grid gap-1.5">
            {ranked.map(({ k, e }) => {
              const ev = e as number;
              const on = sel === null || sel === k;
              return (
                <div key={k} className={"grid grid-cols-[128px_1fr_54px] items-center gap-2.5 transition-opacity " + (on ? "" : "opacity-25")}>
                  <span className="flex items-center gap-2 justify-end">
                    <span className="serif text-[14px] truncate" style={{ color: colorFor(k, rankNow[k]) }}>{SHORT[k]}</span>
                    <Portrait name={NAMES[k]} size={24} />
                  </span>
                  <div className="relative h-5" style={{ background: "linear-gradient(90deg,transparent 49.4%,#343941 49.4%,#343941 50.6%,transparent 50.6%)" }}>
                    <div className="absolute top-[3px] h-3.5 rounded-sm transition-all duration-300"
                      style={ev >= 0 ? { left: "50%", width: `${(Math.abs(ev) / eMax) * 50}%`, background: "#4a9e7f" } : { right: "50%", width: `${(Math.abs(ev) / eMax) * 50}%`, background: "#e2572b" }} />
                  </div>
                  <span className={"mono text-[12px] text-right " + (ev >= 0 ? "text-green" : "text-ember")}>{ev >= 0 ? "+" : ""}{ev.toFixed(1)}¢</span>
                </div>
              );
            })}
          </div>
          <p className="mono text-[11px] text-faint mt-3">← market overpays · polls say cheap → · at 100% the bar is the full model edge; slide toward the market and every edge shrinks toward zero.</p>
          {anySnapshot && <p className="mono text-[11px] text-gold mt-1.5">Note: some market prices are a saved snapshot — a live feed is down, so those edges may be stale.</p>}
        </div>
      </Section>

      {/* AI FORECAST — only renders once FutureSearch data exists */}
      {fs && (
        <Section n="AI" title="The AI's read" dek={`FutureSearch · ${fs.updated}`}>
          <p className="text-ink2 text-[15px] mb-3">A frontier forecasting model researches the field and prices each candidate independently. Three columns, one race: our poll model, the market, and the AI.</p>
          <div className="bg-paper2 border border-rule rounded-md p-4 overflow-x-auto">
            <table className="w-full text-[13.5px] border-collapse min-w-[440px]">
              <thead><tr className="mono text-[11px] uppercase text-faint border-b border-rule">
                <th className="text-left py-2 pr-2">Candidate</th>
                <th className="py-2 px-2 text-right">Model</th>
                <th className="py-2 px-2 text-right">Market</th>
                <th className="py-2 px-2 text-right" style={{ color: "#d0a54e" }}>AI</th>
                <th className="py-2 px-2 text-right">AI − mkt</th>
              </tr></thead>
              <tbody>
                {keys.filter((k) => fs.probs[k] != null).sort((a, b) => (fs.probs[b] || 0) - (fs.probs[a] || 0)).map((k) => {
                  const ai = fs.probs[k], m = implied[k], mk = mkt[k];
                  const gap = !isNaN(mk) ? ai - mk : null;
                  return (
                    <tr key={k} className="border-b border-rule">
                      <td className="py-2 pr-2"><span className="flex items-center gap-2"><Portrait name={NAMES[k]} size={24} /><b className="serif" style={{ color: colorFor(k, rankNow[k]) }}>{SHORT[k]}</b></span></td>
                      <td className="py-2 px-2 text-right">{m != null ? m.toFixed(1) + "¢" : "—"}</td>
                      <td className="py-2 px-2 text-right">{!isNaN(mk) ? mk.toFixed(1) + "¢" : "—"}</td>
                      <td className="py-2 px-2 text-right font-bold" style={{ color: "#d0a54e" }}>{ai.toFixed(1)}¢</td>
                      <td className={"py-2 px-2 text-right " + (gap == null ? "" : gap > 0 ? "text-green" : "text-ember")}>{gap != null ? (gap > 0 ? "+" : "") + gap.toFixed(1) + "¢" : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {fs.rationale && <p className="mono text-[11px] text-faint mt-3 leading-[1.6]">{fs.rationale.slice(0, 320)}{fs.rationale.length > 320 ? "…" : ""}</p>}
          </div>
        </Section>
      )}

      {/* 04 — HOUSE EFFECTS */}
      <Section n="04" title="Everyone leans" dek="red high · blue low">
        <Wide><div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse min-w-[520px]">
            <thead><tr className="mono text-[11px] uppercase text-faint border-b border-rule">
              <th className="text-left py-2 pr-2">Pollster</th>
              {cols.map((c) => <th key={c} className={"py-2 px-1.5 text-center transition-opacity " + (sel && sel !== c ? "opacity-30" : "")} style={sel === c ? { color: colorFor(c, rankNow[c]) } : undefined}>{SHORT[c]}</th>)}
            </tr></thead>
            <tbody>
              {HE.map((r) => (
                <tr key={r.p} className="border-b border-rule">
                  <td className="py-1.5 pr-2 serif">{r.p}</td>
                  {cols.map((c) => {
                    const v = r.eff[c];
                    const dim = sel && sel !== c ? " opacity-25" : "";
                    if (v == null) return <td key={c} className={"text-center text-faint" + dim}>·</td>;
                    const a = (0.12 + Math.min(Math.abs(v) / heMax, 1) * 0.6).toFixed(2);
                    return <td key={c} className={"py-1.5 px-1.5 text-center transition-opacity" + dim}>
                      <span className="mono text-[12px] rounded px-1.5 py-0.5 inline-block min-w-[42px]" style={{ background: v > 0 ? `rgba(226,87,43,${a})` : `rgba(82,183,196,${a})` }}>{v > 0 ? "+" : ""}{v.toFixed(1)}</span>
                    </td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div></Wide>
        <p className="mono text-[11px] text-faint mt-2.5">Points vs. the field average, firms with 2+ polls. The engine corrects half of each lean — details in the <a href="./EliteFour_Polling_WhitePaper.pdf" className="text-ember no-underline">white paper</a>.</p>
      </Section>

      <Footer desk="Poll Data Desk" />
    </Wrap>
  );
}

// Inline detail panel — opens directly under the tapped face so the payoff is
// where the click was, not 800px down the page.
function FocusPanel({ k, top, color, vals, share, fair, mk, polls, mom, onClose }: {
  k: string; top: number; color: string; vals: number[]; share: number;
  fair: number; mk: number; polls: number; mom: number; onClose: () => void;
}) {
  const edge = fair != null && !isNaN(mk) ? fair - mk : null;
  const W = 600, H = 74;
  const mx = Math.max(...vals) * 1.15 || 1, mn = Math.min(...vals) * 0.85;
  const X = (i: number) => (i / Math.max(1, vals.length - 1)) * W;
  const Y = (v: number) => H - ((v - mn) / ((mx - mn) || 1)) * H;
  const line = vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("");
  const area = `${line}L${W},${H}L0,${H}Z`;
  return (
    <div className="absolute inset-x-0 rounded-md border bg-paper2 p-3.5 overflow-hidden transition-all duration-500"
      style={{ top, height: PANEL_H - 8, borderColor: color }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Portrait name={NAMES[k]} size={30} />
          <span className="serif text-[17px] truncate" style={{ color }}>{NAMES[k]}</span>
          <span className="mono text-[10px] text-faint hidden sm:inline">in {polls} of 41 polls</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="mono text-[10px] uppercase text-faint border border-rule rounded px-2 py-1 hover:text-ink hover:border-ink2 shrink-0">Close</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" className="hidden sm:block">
          <defs><linearGradient id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.34" /><stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient></defs>
          <path d={area} fill={`url(#g-${k})`} />
          <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="flex justify-between sm:justify-end gap-4 sm:gap-5 sm:shrink-0">
          <Stat label="share" value={share.toFixed(1) + "%"} sub={(mom > 0 ? "▲" : mom < 0 ? "▼" : "▬") + " " + Math.abs(mom).toFixed(1)} tone={mom > 0.15 ? "#4a9e7f" : mom < -0.15 ? "#e2572b" : undefined} />
          <Stat label="fair" value={fair != null ? fair.toFixed(1) + "¢" : "—"} />
          <Stat label="market" value={!isNaN(mk) ? mk.toFixed(1) + "¢" : "—"} />
          <Stat label="edge" value={edge != null ? (edge > 0 ? "+" : "") + edge.toFixed(1) + "¢" : "—"}
            tone={edge != null ? (edge > 0 ? "#4a9e7f" : "#e2572b") : undefined} big />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone, big }: { label: string; value: string; sub?: string; tone?: string; big?: boolean }) {
  return (
    <div className="text-right">
      <div className="mono text-[9px] uppercase tracking-[0.08em] text-faint">{label}</div>
      <div className={"serif leading-tight " + (big ? "text-[24px]" : "text-[19px]")} style={tone ? { color: tone } : undefined}>{value}</div>
      {sub && <div className="mono text-[10px]" style={tone ? { color: tone } : undefined}>{sub}</div>}
    </div>
  );
}

// Tiny inline sparkline that fills in as the race plays.
function MiniSpark({ vals, upto, color }: { vals: number[]; upto: number; color: string }) {
  const W = 54, H = 20;
  const mx = Math.max(1, ...vals);
  const shown = vals.slice(0, upto + 1);
  const pt = (v: number, i: number, n: number) => [(i / Math.max(1, n - 1)) * W, H - (v / mx) * (H - 3) - 1.5];
  const d = shown.map((v, i) => { const [x, y] = pt(v, i, vals.length); return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join("");
  const ghost = vals.map((v, i) => { const [x, y] = pt(v, i, vals.length); return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join("");
  const last = shown.length ? pt(shown[shown.length - 1], shown.length - 1, vals.length) : null;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <path d={ghost} fill="none" stroke="#343941" strokeWidth={1.25} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      {last && <circle cx={last[0]} cy={last[1]} r={1.9} fill={color} />}
    </svg>
  );
}

function FaceCard({ label, k, fair, mk, good }: { label: string; k?: string; fair: number; mk: number; good?: boolean }) {
  if (!k) return null;
  const c = good ? "#4a9e7f" : "#e2572b";
  const edge = fair - mk;
  return (
    <div className="bg-paper2 border rounded-md p-4 flex items-center gap-4" style={{ borderColor: c }}>
      <Portrait name={NAMES[k]} size={64} />
      <div className="min-w-0">
        <div className="mono text-[10px] uppercase tracking-[0.06em]" style={{ color: c }}>{label}</div>
        <div className="serif text-[22px] leading-tight truncate">{NAMES[k]}</div>
        <div className="mono text-[12px] text-faint">fair <b className="text-ink2">{fair?.toFixed(1)}¢</b> · market <b className="text-ink2">{mk?.toFixed(1)}¢</b></div>
        <div className="serif text-[20px]" style={{ color: c }}>{edge >= 0 ? "+" : ""}{edge?.toFixed(1)}¢ edge</div>
      </div>
    </div>
  );
}

function heatData(polls: Poll[]) {
  const KEYS = Object.keys(NAMES);
  const base: Record<string, number> = {};
  for (const k of KEYS) {
    let n = 0, d = 0;
    for (const pl of polls) { const v = pl.s[k]; if (v == null) continue; n += v; d++; }
    base[k] = d ? n / d : 0;
  }
  const byP: Record<string, Poll[]> = {};
  polls.forEach((pl) => (byP[pl.p] ||= []).push(pl));
  const rows: { p: string; eff: Record<string, number> }[] = [];
  for (const p in byP) {
    if (byP[p].length < 2) continue;
    const eff: Record<string, number> = {};
    for (const k of KEYS) {
      const ds: number[] = [];
      byP[p].forEach((pl) => { if (pl.s[k] != null) ds.push((pl.s[k] as number) - base[k]); });
      if (ds.length) eff[k] = ds.reduce((a, b) => a + b, 0) / ds.length;
    }
    rows.push({ p, eff });
  }
  return rows.sort((a, b) => Math.abs(b.eff.harris ?? 0) - Math.abs(a.eff.harris ?? 0));
}
