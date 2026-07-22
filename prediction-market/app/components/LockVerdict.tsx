import { useState } from "react";
import { lock, TBILL } from "../../engine/pricing";
import { money } from "../../engine/format";

export interface BetOption { slug: string; label: string; poly: number | null; kal: number | null; }

const STAKES = [100, 1000, 10000];
const HORIZONS = [{ m: 6, l: "6 mo" }, { m: 12, l: "1 yr" }, { m: 28, l: "Nov '28" }];
const TAXES = [{ t: 0, l: "0%" }, { t: 15, l: "15%" }, { t: 24, l: "24%" }, { t: 37, l: "37%" }];

// Verdict-first arbitrage panel. The answer is the biggest thing on screen and
// is visible before you touch a control; every input is a chip or a slider, so
// there is no form to fill in.
export function LockVerdict({ options }: { options: BetOption[] }) {
  const [sel, setSel] = useState(0);
  const [dPoly, setDPoly] = useState(0);   // nudge off the live price, in cents
  const [dKal, setDKal] = useState(0);
  const [stake, setStake] = useState(1000);
  const [months, setMonths] = useState(28);
  const [tax, setTax] = useState(24);
  const [open, setOpen] = useState(false);

  const opt = options[sel] || options[0];
  const livePoly = opt?.poly != null ? opt.poly * 100 : NaN;
  const liveKal = opt?.kal != null ? opt.kal * 100 : NaN;
  const pA = livePoly + dPoly, pK = liveKal + dKal;
  const valid = !isNaN(pA) && !isNaN(pK) && pA > 0 && pK > 0 && pA < 100 && pK < 100;
  const r = valid ? lock(pA, pK, stake, months, tax / 100) : null;
  const tbillAT = TBILL * (1 - tax / 100);
  const beats = r ? r.atAnnual > tbillAT : false;
  const good = !!r && r.win && beats;
  const touched = dPoly !== 0 || dKal !== 0;

  const pick = (i: number) => { setSel(i); setDPoly(0); setDKal(0); };

  return (
    <div>
      {/* Which bet — segmented, not a dropdown */}
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map((o, i) => (
          <button key={o.slug} onClick={() => pick(i)}
            className={"text-left rounded-full px-3.5 py-2 min-h-[40px] text-[13.5px] serif border transition-colors " +
              (i === sel ? "border-ember bg-[#332119] text-ink" : "border-rule bg-paper2 text-ink2 hover:border-ink2")}>
            {o.label}
          </button>
        ))}
      </div>

      {/* The answer, first and biggest */}
      {!r ? (
        <div className="rounded-md border border-rule bg-paper2 p-5 mono text-[12px] text-faint text-center">
          waiting on a live quote from both venues…
        </div>
      ) : (
        <div className={"rounded-md p-5 border " + (good ? "bg-[#1d2b26] border-green" : "bg-[#332119] border-ember")}>
          <div className={"mono text-[10.5px] uppercase tracking-[0.2em] " + (good ? "text-green" : "text-ember")}>
            {!r.win ? "No lock" : good ? "Locked — beats cash" : "Real lock, cash still wins"}
          </div>
          <div className={"serif leading-[1.05] my-2 " + (good ? "text-green" : "text-ember")} style={{ fontSize: "clamp(34px,9vw,58px)" }}>
            {r.win ? "+" : ""}{money(r.afterTaxProfit)}
          </div>
          <div className="serif text-[16px] leading-[1.5] text-ink2 [&_b]:text-ink">
            {!r.win ? (
              <>Both sides cost <b>{r.costPerPair.toFixed(2)}¢</b> to get back 100¢ — you'd lose <b>{(-r.lockCents).toFixed(2)}¢</b> a pair. The two stores agree too closely.</>
            ) : (
              <>guaranteed on {money(stake)} — <b>{(r.atAnnual * 100).toFixed(1)}%/yr</b> after tax {beats ? "against" : "versus"} the <b>{(tbillAT * 100).toFixed(1)}%</b> a T-bill nets you. {beats ? "Worth doing." : "Skip it."}</>
            )}
          </div>
        </div>
      )}

      {/* Controls as chips — prices, stake, horizon, tax */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-[13px]">
        <PriceChip label="Polymarket" px={pA} live={livePoly} onNudge={(d) => setDPoly((v) => v + d)} />
        <PriceChip label="Kalshi" px={pK} live={liveKal} onNudge={(d) => setDKal((v) => v + d)} />
        {STAKES.map((s) => (
          <Chip key={s} on={stake === s} onClick={() => setStake(s)}>{money(s)}</Chip>
        ))}
        {HORIZONS.map((h) => (
          <Chip key={h.m} on={months === h.m} onClick={() => setMonths(h.m)}>{h.l}</Chip>
        ))}
        {TAXES.map((t) => (
          <Chip key={t.t} on={tax === t.t} onClick={() => setTax(t.t)}>{t.l} tax</Chip>
        ))}
        {touched && (
          <button onClick={() => { setDPoly(0); setDKal(0); }}
            className="mono text-[10.5px] uppercase tracking-[0.06em] text-ember underline underline-offset-2 px-1 min-h-[40px]">
            reset to live
          </button>
        )}
      </div>

      <input type="range" min={100} max={25000} step={100} value={stake}
        onChange={(e) => setStake(+e.target.value)} aria-label="Stake"
        className="w-full mt-3 accent-[#e2572b] h-6" />

      {r && (
        <>
          <button onClick={() => setOpen((o) => !o)}
            className="mono text-[10.5px] uppercase tracking-[0.14em] text-faint hover:text-ink2 mt-1 min-h-[40px]">
            {open ? "▾ hide the trade" : "▸ show the trade"}
          </button>
          {open && (
            <div className="bg-paper2 border border-rule rounded-md [&>div]:px-4 [&>div]:py-3 [&>div]:border-b [&>div]:border-rule [&>div:last-child]:border-b-0 [&_b]:text-ink [&_b]:font-serif text-[14px] leading-[1.55] text-ink2">
              <div><b>The trade</b> — buy YES on {r.buyYesOn === "poly" ? "Polymarket" : "Kalshi"} at {r.yesPx.toFixed(1)}¢, NO on {r.buyNoOn === "poly" ? "Polymarket" : "Kalshi"} at {r.noPx.toFixed(1)}¢. One leg always pays $1.</div>
              <div><b>The cost</b> — {r.costPerPair.toFixed(2)}¢ per pair in, 100¢ out, so {money(stake)} {r.win ? "locks" : "loses"} <b>{r.profit >= 0 ? "+" : ""}{money(r.profit)}</b> before tax.</div>
              <div><b>The catch</b> — needs cash on both venues and stays frozen {months} months. Verify Kalshi's live book before you send it.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={"mono text-[11.5px] rounded-full px-3 py-2 min-h-[40px] border transition-colors " +
        (on ? "border-ember bg-[#332119] text-ember" : "border-rule bg-paper2 text-ink2 hover:border-ink2")}>
      {children}
    </button>
  );
}

// A price you can nudge without typing. Shows live by default and says so when
// you have moved it off the market.
function PriceChip({ label, px, live, onNudge }: { label: string; px: number; live: number; onNudge: (d: number) => void }) {
  const off = !isNaN(px) && !isNaN(live) && Math.abs(px - live) > 0.001;
  return (
    <span className={"inline-flex items-center rounded-full border overflow-hidden " + (off ? "border-gold" : "border-rule")}>
      <button onClick={() => onNudge(-0.5)} aria-label={label + " down"}
        className="px-2.5 min-h-[40px] text-ink2 hover:text-ember hover:bg-chip mono text-[15px] leading-none">−</button>
      <span className="px-2 py-2 text-center leading-tight">
        <span className="block mono text-[9px] uppercase tracking-[0.08em] text-faint">{label}{off && " ·"}</span>
        <span className="block serif text-[15px] text-ink">{isNaN(px) ? "—" : px.toFixed(1)}¢</span>
      </span>
      <button onClick={() => onNudge(0.5)} aria-label={label + " up"}
        className="px-2.5 min-h-[40px] text-ink2 hover:text-green hover:bg-chip mono text-[15px] leading-none">+</button>
    </span>
  );
}
