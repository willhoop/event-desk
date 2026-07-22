import { useMemo, useState } from "react";
import { Wrap, Header, Section, Footer, Wide } from "../components/Shell";
import { STATES, STATE_NAMES } from "../../data/states";
import { US_GEO } from "../../data/usGeo";
import { CYCLES } from "../../data/elections";
import { Link } from "react-router-dom";

type Lock = Record<string, "D" | "R" | "T">;

function rampColor(m: number, spread: number, lk?: string): string {
  if (lk === "D") return "#1d4e89";
  if (lk === "R") return "#8f2c22";
  if (lk === "T") return "#b9a26b";
  const safe = 12 * spread, lean = 3.5 * spread;
  if (m >= safe) return "#1d4e89";
  if (m >= lean) return "#4a7fc0";
  if (m >= 1) return "#a9c3e6";
  if (m > -1) return "#b9a26b";
  if (m > -lean) return "#e08b83";
  if (m > -safe) return "#d0564a";
  return "#8f2c22";
}
function solidColor(m: number, lk?: string): string {
  if (lk === "D") return "#1d4e89";
  if (lk === "R") return "#8f2c22";
  if (lk === "T") return "#b9a26b";
  return m >= 8 ? "#1d4e89" : m >= 1.5 ? "#4a7fc0" : m > -1.5 ? "#b9a26b" : m > -8 ? "#d0564a" : "#8f2c22";
}
function gauss(): number {
  let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const CALLOUT = ["VT", "NH", "MA", "RI", "CT", "NJ", "DE", "MD", "DC"];
const EV0 = Object.fromEntries(STATES.map((s) => [s[0], s[1]])) as Record<string, number>;
const MARGIN0 = Object.fromEntries(STATES.map((s) => [s[0], s[2]])) as Record<string, number>;
const YEARS = ["2028", ...CYCLES.map((c) => String(c.year))];

export default function ElectoralDesk() {
  const [view, setView] = useState("2028");
  const [swing, setSwing] = useState(0);
  const [sigma, setSigma] = useState(4);
  const [lock, setLock] = useState<Lock>({});
  const [palette, setPalette] = useState<"gradient" | "solid">("gradient");
  const [spread, setSpread] = useState(1);
  const [hover, setHover] = useState<string | null>(null);

  const HIST = view === "2028" ? null : CYCLES.find((c) => String(c.year) === view)!;
  const aEV = (ab: string) => (HIST ? HIST.ev[ab] ?? 0 : EV0[ab] ?? 0);
  const aMargin = (ab: string) => (HIST ? HIST.margin[ab] ?? 0 : (MARGIN0[ab] ?? 0) + swing);
  const color = (ab: string) => {
    const m = aMargin(ab), lk = HIST ? undefined : lock[ab];
    return palette === "gradient" ? rampColor(m, spread, lk) : solidColor(m, lk);
  };

  const sim = useMemo(() => {
    const N = 20000; let wins = 0, rwins = 0; const evs: number[] = [];
    for (let it = 0; it < N; it++) {
      const nat = gauss() * sigma; let d = 0;
      for (const s of STATES) {
        const lk = lock[s[0]]; let mm: number;
        if (lk === "D") mm = 99; else if (lk === "R") mm = -99; else if (lk === "T") mm = Math.random() < 0.5 ? 1 : -1;
        else mm = s[2] + swing + nat + gauss() * 3.5;
        if (mm > 0) d += s[1];
      }
      evs.push(d); if (d >= 270) wins++; else if (538 - d >= 270) rwins++;
    }
    evs.sort((a, b) => a - b);
    return { pD: wins / N, pR: rwins / N, med: evs[Math.floor(N / 2)], ties: (N - wins - rwins) / N };
  }, [swing, sigma, lock]);

  const evNow = useMemo(() => {
    let dEV = 0, rEV = 0, tEV = 0;
    STATES.forEach((s) => {
      const lk = lock[s[0]], m = s[2] + swing;
      if (lk === "D" || (!lk && m >= 1.5)) dEV += s[1];
      else if (lk === "R" || (!lk && m <= -1.5)) rEV += s[1];
      else tEV += s[1];
    });
    return { dEV, rEV, tEV };
  }, [swing, lock]);

  const bar = HIST ? { d: HIST.dEV, r: HIST.rEV, t: 0 } : { d: evNow.dEV, r: evNow.rEV, t: evNow.tEV };

  const cycle = (ab: string) => {
    if (HIST) return;
    setLock((L) => {
      const nx = { ...L }; const cur = L[ab];
      if (cur === "D") nx[ab] = "R"; else if (cur === "R") nx[ab] = "T"; else if (cur === "T") delete nx[ab]; else nx[ab] = "D";
      return nx;
    });
  };

  const tip = hover ? { ab: hover, name: STATE_NAMES[hover], ev: aEV(hover), m: aMargin(hover) } : null;

  return (
    <Wrap>
      <Header title="Electoral Desk" sub={<>2024 baseline, your assumptions · <Link to="/polling" className="text-ember no-underline">POLLING DESK</Link></>} />

      <Section n="01" title="The map" dek={HIST ? "a look back" : "tap a state to flip it"}>
        <p className="text-ink2 text-[15px] mb-3">
          {HIST
            ? "Browse the real electoral maps of past elections — era-correct electoral votes, shaded by margin. Switch back to 2028 to run the live model."
            : "Every state starts at its 2024 result. Tap a state to cycle it Democrat, Republican, toss-up, then back. Drag the sliders for national mood and uncertainty — 20,000 simulated elections recompute instantly."}
        </p>

        {/* year selector */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {YEARS.map((y) => (
            <button key={y} onClick={() => setView(y)}
              className={"mono text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded border transition-colors " +
                (view === y ? "border-ember bg-ember text-paper" : "border-rule text-ink2 hover:border-ink2")}>
              {y === "2028" ? "2024 base" : y}
            </button>
          ))}
        </div>

        <Wide><div className="bg-paper2 border border-rule rounded-md p-4">
          {/* Control strip. The map has always been clickable, but nothing on the
              map said so — this puts the affordance where the eye already is. */}
          {!HIST && (
            <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-rule">
              <span className="mono text-[10px] uppercase tracking-[0.1em] text-faint">Tap a state →</span>
              {([["D", "#1d4e89", "Democrat"], ["R", "#8f2c22", "Republican"], ["T", "#b9a26b", "Toss-up"]] as const).map(([k, c, label]) => (
                <span key={k} className="mono text-[10px] uppercase inline-flex items-center gap-1.5 border border-rule rounded-full pl-1.5 pr-2.5 py-1">
                  <span className="w-3 h-3 rounded-sm" style={{ background: c }} />{label}
                </span>
              ))}
              <span className="mono text-[10px] uppercase text-faint">→ back to model</span>
              {Object.keys(lock).length > 0 && (
                <span className="ml-auto flex items-center gap-2">
                  <span className="mono text-[10.5px] text-ember">
                    {Object.keys(lock).length} state{Object.keys(lock).length > 1 ? "s" : ""} set by you
                  </span>
                  <button onClick={() => setLock({})}
                    className="mono text-[10px] uppercase border border-ember text-ember rounded-full px-2.5 py-1 min-h-[30px] hover:bg-[#332119]">
                    clear
                  </button>
                </span>
              )}
            </div>
          )}
          <div className="flex h-[34px] rounded overflow-hidden mono text-[13px] font-bold mb-1.5">
            <div className="flex items-center justify-start pl-2.5 text-white" style={{ background: "#1d4e89", width: `${bar.d / 538 * 100}%` }}>{bar.d}</div>
            {bar.t > 0 && <div className="flex items-center justify-center text-[#16181c]" style={{ background: "#b9a26b", width: `${bar.t / 538 * 100}%` }}>{bar.t}</div>}
            <div className="flex items-center justify-end pr-2.5 text-white" style={{ background: "#8f2c22", width: `${bar.r / 538 * 100}%` }}>{bar.r}</div>
          </div>
          <div className="flex justify-between mono text-[10px] text-faint mb-1.5">
            <span>DEMOCRAT</span>
            <span>{HIST ? HIST.label.toUpperCase() : "270 TO WIN"}</span>
            <span>REPUBLICAN</span>
          </div>
          {/* The bar is the number people screenshot. It must not read as a
              2028 forecast: no 2028 general-election polling exists yet. */}
          {!HIST && (
            <div className="mono text-[10px] text-faint mb-3 leading-[1.6] border-t border-rule pt-2">
              NOT A FORECAST — this is the 2024 result, moved by your settings. There is no
              2028 general-election polling to forecast from.
            </div>
          )}

          <div className="relative">
            <svg viewBox="0 0 1150 620" width="100%" style={{ display: "block" }}>
              {STATES.map((s) => {
                const ab = s[0]; const g = US_GEO[ab]; if (!g) return null;
                const isCallout = CALLOUT.includes(ab);
                const lk = HIST ? undefined : lock[ab];
                return (
                  <g key={ab} onClick={() => cycle(ab)} onMouseEnter={() => setHover(ab)} onMouseLeave={() => setHover(null)} style={{ cursor: HIST ? "default" : "pointer" }}>
                    <path d={g.d} fill={color(ab)} stroke={lk ? "#e2572b" : hover === ab ? "#eef1f4" : "#16181c"} strokeWidth={lk ? 2 : hover === ab ? 1.6 : 0.6} />
                    {!isCallout && g.area > 500 && (
                      <>
                        <text x={g.cx} y={g.cy - 1} textAnchor="middle" fontSize={g.area > 6000 ? 15 : g.area > 2600 ? 12 : 10} fontWeight="bold" fill="#fff" className="serif" style={{ pointerEvents: "none" }}>{ab}</text>
                        <text x={g.cx} y={g.cy + (g.area > 6000 ? 13 : 11)} textAnchor="middle" fontSize={g.area > 6000 ? 11 : 8.5} fill="#fff" opacity={0.88} className="mono" style={{ pointerEvents: "none" }}>{aEV(ab)}</text>
                      </>
                    )}
                  </g>
                );
              })}
              {CALLOUT.map((ab, i) => {
                const y = 132 + i * 46, x = 992, w = 150, h = 40;
                const g = US_GEO[ab]; const lk = HIST ? undefined : lock[ab];
                return (
                  <g key={"c" + ab} onClick={() => cycle(ab)} onMouseEnter={() => setHover(ab)} onMouseLeave={() => setHover(null)} style={{ cursor: HIST ? "default" : "pointer" }}>
                    {g && <line x1={g.cx} y1={g.cy} x2={x} y2={y + h / 2} stroke="#3a4048" strokeWidth={0.75} />}
                    <rect x={x} y={y} width={w} height={h} rx={5} fill={color(ab)} stroke={lk ? "#e2572b" : hover === ab ? "#eef1f4" : "#16181c"} strokeWidth={lk ? 2 : 1} />
                    <text x={x + 12} y={y + 25} fontSize={15} fontWeight="bold" fill="#fff" className="serif" style={{ pointerEvents: "none" }}>{ab}</text>
                    <text x={x + w - 12} y={y + 25} textAnchor="end" fontSize={12} fill="#fff" opacity={0.9} className="mono" style={{ pointerEvents: "none" }}>{aEV(ab)}</text>
                  </g>
                );
              })}
            </svg>
            {tip && (
              <div className="absolute top-2 left-2 bg-[#0d0f12] border border-rule rounded-md px-3 py-2 pointer-events-none z-10">
                <div className="serif text-[15px]">{tip.name} <span className="mono text-[11px] text-faint">{tip.ev} EV</span></div>
                <div className="mono text-[11px]" style={{ color: tip.m >= 0 ? "#4a7fc0" : "#d0564a" }}>
                  {!HIST && lock[tip.ab] ? `locked ${lock[tip.ab] === "T" ? "toss-up" : lock[tip.ab]}` : `${view} ${tip.m >= 0 ? "D" : "R"}+${Math.abs(tip.m).toFixed(1)}${!HIST && swing !== 0 ? " · w/ mood" : ""}`}
                </div>
              </div>
            )}
          </div>

          {/* Battleground strip. On a phone the map is ~360px wide and a state
              like Delaware is a few pixels — unhittable by thumb. These are the
              same toggles as the map, sized for a finger. */}
          {!HIST && (
            <div className="mt-3 pt-3 border-t border-rule">
              <div className="mono text-[10px] uppercase tracking-[0.1em] text-faint mb-2">The states that decide it — tap to flip</div>
              <div className="flex flex-wrap gap-1.5">
                {[...STATES].map((s) => s[0])
                  .filter((ab) => US_GEO[ab])
                  .map((ab) => ({ ab, m: aMargin(ab), ev: aEV(ab) }))
                  .sort((a, b) => Math.abs(a.m) - Math.abs(b.m))
                  .slice(0, 10)
                  .map(({ ab, ev }) => {
                    const lk = lock[ab];
                    return (
                      <button key={ab} onClick={() => cycle(ab)}
                        onMouseEnter={() => setHover(ab)} onMouseLeave={() => setHover(null)}
                        className="mono text-[11px] uppercase rounded-full pl-2 pr-2.5 py-1.5 min-h-[36px] border flex items-center gap-1.5 transition-colors"
                        style={{ borderColor: lk ? "#e2572b" : "#343941", background: color(ab), color: "#fff" }}>
                        <b className="serif text-[13px]">{ab}</b>
                        <span className="opacity-85">{ev}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* palette controls (always available) */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pt-3 border-t border-rule">
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] uppercase text-faint">Palette</span>
              <button onClick={() => setPalette("gradient")} className={"mono text-[10px] uppercase px-2.5 py-1 rounded border " + (palette === "gradient" ? "border-ember text-ember" : "border-rule text-ink2")}>Safe · Likely · Leans</button>
              <button onClick={() => setPalette("solid")} className={"mono text-[10px] uppercase px-2.5 py-1 rounded border " + (palette === "solid" ? "border-ember text-ember" : "border-rule text-ink2")}>Solid</button>
            </div>
            {palette === "gradient" && (
              <div className="flex items-center gap-1.5">
                <span className="mono text-[10px] uppercase text-faint">Spread</span>
                <button aria-label="Narrow the spread" onClick={() => setSpread((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))} className="mono text-[15px] border border-rule rounded w-9 h-9 min-h-[36px] leading-none text-ink2 hover:border-ink2">−</button>
                <span className="mono text-[11px] min-w-[38px] text-center">{spread.toFixed(2)}×</span>
                <button aria-label="Widen the spread" onClick={() => setSpread((s) => Math.min(2, +(s + 0.25).toFixed(2)))} className="mono text-[15px] border border-rule rounded w-9 h-9 min-h-[36px] leading-none text-ink2 hover:border-ink2">+</button>
              </div>
            )}
          </div>

          {/* sliders — only for the live 2028 model */}
          {!HIST ? (
            <div className="flex gap-4 sm:gap-6 flex-wrap items-center mt-3 text-[13.5px] text-ink2">
              <label className="flex items-center gap-2.5 w-full sm:w-auto">National mood
                <input type="range" min={-8} max={8} step={0.5} value={swing} onChange={(e) => setSwing(+e.target.value)} className="flex-1 sm:w-44 accent-ember" />
                <b className="mono min-w-[52px]">{swing === 0 ? "even" : (swing > 0 ? "D+" : "R+") + Math.abs(swing).toFixed(1)}</b></label>
              <label className="flex items-center gap-2.5 w-full sm:w-auto">Uncertainty
                <input type="range" min={1} max={7} step={0.5} value={sigma} onChange={(e) => setSigma(+e.target.value)} className="flex-1 sm:w-44 accent-ember" />
                <b className="mono min-w-[52px]">±{sigma.toFixed(1)}</b></label>
              <button onClick={() => { setLock({}); setSwing(0); setSigma(4); }} className="mono text-[11px] border border-rule rounded px-3.5 py-1.5 text-ink2 hover:border-ink2">RESET MAP</button>
            </div>
          ) : (
            <div className="mono text-[12px] text-faint mt-3">{view} result · <b className="text-ink">{HIST.label}</b>, {HIST.dEV}–{HIST.rEV}. Maine and Nebraska split their votes by district; totals shown are the official elector counts.</div>
          )}
        </div></Wide>
      </Section>

      {!HIST ? (
        <Section n="02" title="The odds" dek="20,000 simulations">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 my-3.5">
            <Stat label="Democrat wins" val={(sim.pD * 100).toFixed(0) + "%"} color="#4a7fc0" sub={sim.ties > 0 ? (sim.ties * 100).toFixed(1) + "% tie" : "of simulations"} />
            <Stat label="Republican wins" val={(sim.pR * 100).toFixed(0) + "%"} color="#d0564a" sub="of simulations" />
            <Stat label="Most likely D total" val={String(sim.med)} sub="median electoral votes" />
            <Stat label="270 to win" val="270" sub="the number that ends it" />
          </div>
        </Section>
      ) : (
        <Section n="02" title="The result" dek={String(view)}>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 my-3.5">
            <Stat label="Democrat" val={String(HIST.dEV)} color="#4a7fc0" sub="electoral votes" />
            <Stat label="Republican" val={String(HIST.rEV)} color="#d0564a" sub="electoral votes" />
            <Stat label="Margin" val={`${Math.abs(HIST.dEV - HIST.rEV)}`} sub="electoral-vote gap" />
            <Stat label="Outcome" val={HIST.dEV > HIST.rEV ? "D" : "R"} color={HIST.dEV > HIST.rEV ? "#4a7fc0" : "#d0564a"} sub={HIST.label} />
          </div>
        </Section>
      )}

      <Footer desk="Electoral Desk" />
    </Wrap>
  );
}

const Stat = ({ label, val, color, sub }: { label: string; val: string; color?: string; sub: string }) => (
  <div className="bg-paper2 border border-rule rounded-md p-4">
    <div className="mono text-[10px] uppercase text-faint tracking-[0.06em]">{label}</div>
    <div className="serif text-[29px] my-0.5" style={color ? { color } : undefined}>{val}</div>
    <div className="mono text-[10px] uppercase text-faint tracking-[0.06em]">{sub}</div>
  </div>
);
