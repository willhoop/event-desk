import { Wrap, Header, Section, Footer } from "../components/Shell";
import { Lead, List, Item, Note } from "../components/ui";
import { useMidterms } from "../useMidterms";
import { Link } from "react-router-dom";

function Gauge({ title, dem, rep }: { title: string; dem: number | null; rep: number | null }) {
  const has = dem != null && rep != null;
  const d = has ? dem! : 0.5, r = has ? rep! : 0.5;
  const lead = d >= r ? "Democrats" : "Republicans";
  const leadPx = Math.max(d, r);
  return (
    <div className="bg-paper2 border border-rule rounded-md p-4">
      <div className="flex justify-between items-baseline mb-2">
        <h3 className="serif text-[19px] font-bold">{title}</h3>
        <span className="mono text-[11px] text-faint">{has ? `${lead} favored` : "connecting…"}</span>
      </div>
      <div className="flex h-9 rounded overflow-hidden mono text-[13px] font-bold">
        <div className="flex items-center justify-center text-[#16181c]" style={{ background: "#5b8fd6", width: `${d * 100}%` }}>{has ? `D ${(d * 100).toFixed(0)}¢` : ""}</div>
        <div className="flex items-center justify-center text-[#16181c]" style={{ background: "#d0564a", width: `${r * 100}%` }}>{has ? `R ${(r * 100).toFixed(0)}¢` : ""}</div>
      </div>
      <div className="mono text-[10px] text-faint uppercase tracking-[0.06em] mt-2">
        {has ? `market gives ${lead.toLowerCase()} a ${(leadPx * 100).toFixed(0)}% chance · Polymarket, live` : "live prices load momentarily"}
      </div>
    </div>
  );
}

// Election-night countdown — the whole reason this desk exists is the short clock.
function Countdown() {
  const days = Math.max(0, Math.ceil((Date.UTC(2026, 10, 3) - Date.now()) / 864e5));
  const weeks = Math.floor(days / 7);
  const pctYear = Math.min(100, Math.max(0, ((365 - days) / 365) * 100));
  return (
    <div className="bg-paper2 border border-rule rounded-md p-4 my-3">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.08em] text-faint">Until polls close</div>
          <div className="serif text-[40px] leading-none text-ember">{days}<span className="text-[18px] text-ink2"> days</span></div>
        </div>
        <div className="mono text-[11px] text-faint text-right">
          <div>{weeks} weeks out · 3 Nov 2026</div>
          <div className="text-green">convergence window open</div>
        </div>
      </div>
      <div className="h-2 rounded bg-chip overflow-hidden mt-3">
        <div className="h-full bg-ember transition-all" style={{ width: `${pctYear}%` }} />
      </div>
    </div>
  );
}

// Inverse standard normal (Peter Acklam's rational approximation) + pdf.
function invNorm(p: number): number {
  if (p <= 0) return -6; if (p >= 1) return 6;
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const pl = 0.02425;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1-p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  const q = p - 0.5, r = q*q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
const pdf = (x: number) => Math.exp(-x * x / 2);

// Seat distribution calibrated so P(Dem seats >= control) matches the live price.
function SeatCurve({ label, total, control, pDem, sd }: { label: string; total: number; control: number; pDem: number | null; sd: number }) {
  if (pDem == null) return (
    <div className="bg-paper2 border border-rule rounded-md p-4"><h3 className="serif text-[19px] font-bold mb-1">{label}</h3><div className="mono text-[11px] text-faint">connecting…</div></div>
  );
  const mean = control - sd * invNorm(1 - pDem); // so P(D >= control) = pDem
  const demWins = pDem >= 0.5;
  const W = 360, H = 96, lo = mean - 3.2 * sd, hi = mean + 3.2 * sd;
  const N = 90;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) { const s = lo + (i / N) * (hi - lo); pts.push([s, pdf((s - mean) / sd)]); }
  const X = (s: number) => ((s - lo) / (hi - lo)) * W;
  const Y = (y: number) => H - y * (H - 6) - 2;
  const line = pts.map(([s, y], i) => `${i ? "L" : "M"}${X(s).toFixed(1)},${Y(y).toFixed(1)}`).join("");
  // shaded winning tails (Dem side >= control, Rep side < control)
  const demTail = pts.filter(([s]) => s >= control);
  const repTail = pts.filter(([s]) => s <= control);
  const areaOf = (seg: [number, number][], edge: number) => seg.length
    ? `M${X(seg[0][0]).toFixed(1)},${H} ` + seg.map(([s, y]) => `L${X(s).toFixed(1)},${Y(y).toFixed(1)}`).join(" ") + ` L${X(seg[seg.length-1][0]).toFixed(1)},${H} Z` : "";
  const demSeats = Math.round(mean), repSeats = total - demSeats;
  return (
    <div className="bg-paper2 border border-rule rounded-md p-4">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="serif text-[19px] font-bold">{label}</h3>
        <span className="mono text-[11px]" style={{ color: demWins ? "#5b8fd6" : "#d0564a" }}>{demWins ? "Democrats" : "Republicans"} favored · {((demWins ? pDem : 1 - pDem) * 100).toFixed(0)}%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block">
        <path d={areaOf(repTail, control)} fill="rgba(208,86,74,0.22)" />
        <path d={areaOf(demTail, control)} fill="rgba(91,143,214,0.22)" />
        <line x1={X(control)} y1={2} x2={X(control)} y2={H} stroke="#eef1f4" strokeWidth={1} strokeDasharray="3 3" />
        <path d={line} fill="none" stroke="#c9cdd4" strokeWidth={1.75} />
        <text x={X(control) + 4} y={12} fontSize={9} fill="#8a9099" className="mono">{control} = control</text>
      </svg>
      <div className="flex justify-between mono text-[11px] mt-1">
        <span style={{ color: "#5b8fd6" }}>D ~{demSeats}</span>
        <span className="text-faint">most likely split</span>
        <span style={{ color: "#d0564a" }}>R ~{repSeats}</span>
      </div>
    </div>
  );
}

export default function MidtermsDesk() {
  const m = useMidterms();
  return (
    <Wrap>
      <Header title="Midterms Desk" sub={<>2026 House &amp; Senate control · <Link to="/electoral" className="text-ember no-underline">ELECTORAL DESK</Link> · {m.loading ? "connecting…" : <span className="text-green">LIVE</span>}</>} />

      <Section n="01" title="Who wins the chambers" dek="live, both parties">
        <Countdown />
        <div className="grid md:grid-cols-2 gap-3.5 my-3">
          <Gauge title="The House" dem={m.house.dem} rep={m.house.rep} />
          <Gauge title="The Senate" dem={m.senate.dem} rep={m.senate.rep} />
        </div>
      </Section>

      <Section n="02" title="Why the desk cares" dek="short clocks, real convergence">
        <List>
          <Item><b>The clock is short.</b> These resolve in November 2026 — months, not years. Your capital isn't frozen until 2028, so the return-vs-T-bills math actually favors a locked edge here.</Item>
          <Item><b>Convergence is real.</b> As election night nears, prices snap to the outcome. That's a genuine timing trade the presidential markets can't offer yet.</Item>
          <Item><b>Two chambers, one night.</b> House and Senate resolve together, so a view on national mood is a two-legged bet — and the Electoral Desk's mood slider is the same lever.</Item>
        </List>
        <Note>Same house rules apply: certified results, named source, hard deadline. This desk passes the investability checklist on every count.</Note>
      </Section>

      <Section n="03" title="The seat spread" dek="where control lands">
        <Lead>The market prices the <em>chance</em> of control; this turns that into a distribution of seats. The curve is centered so its winning tail matches the live price — shaded where each party takes the chamber.</Lead>
        <div className="grid md:grid-cols-2 gap-3.5 my-3">
          <SeatCurve label="House" total={435} control={218} pDem={m.house.dem} sd={16} />
          <SeatCurve label="Senate" total={100} control={51} pDem={m.senate.dem} sd={3.5} />
        </div>
        <Note>Illustrative: a normal seat model calibrated so P(party ≥ control) equals the live Polymarket price. Not a precinct-level forecast.</Note>
      </Section>

      <Footer desk="Midterms Desk" />
    </Wrap>
  );
}
