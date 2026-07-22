import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wrap, Header, Section, Footer, Wide } from "../components/Shell";
import { VenueCompare } from "../components/VenueCompare";
import { LockVerdict } from "../components/LockVerdict";
import { LineChart } from "../components/LineChart";
import { FieldBoard } from "../components/FieldBoard";
import { Portrait } from "../components/Portrait";
import { BetTracker } from "../components/BetTracker";
import { FeeTable, TaxTable, InvestabilityChecklist } from "../components/Explainers";
import { Lead, BarRow, Loading } from "../components/ui";
import { useLive, kalMinsAgo } from "../useLive";
import { useHistory } from "../useHistory";
import { cents } from "../../engine/format";
import { usePolyRunner } from "../usePolyRunner";
import { VENUE } from "../../engine/venues";
import type { TickerSeg } from "../components/Ticker";
import { buildField, housePick, medianConv, tradable, presSlug, nomSlug, Party, Runner } from "../../engine/field";

export default function PresidencyDesk() {
  const live = useLive();
  const [party, setParty] = useState<Party | "ALL">("D");
  const [chosen, setChosen] = useState<string | null>(null);

  const field = useMemo(() => buildField(live.kalshi), [live.kalshi]);
  const ranked = useMemo(() => {
    const t = tradable(field).sort((a, b) => b.conv! - a.conv!);
    const rest = field.filter((r) => !t.includes(r)).sort((a, b) => (b.nom ?? 0) - (a.nom ?? 0));
    return [...t, ...rest];
  }, [field]);

  const partyFilter = party === "ALL" ? undefined : party;
  const pick = useMemo(() => housePick(field, partyFilter), [field, partyFilter]);
  const med = useMemo(() => medianConv(field, partyFilter), [field, partyFilter]);

  // Default to the computed pick, and follow it if the pick changes — until the
  // reader chooses someone, at which point their choice sticks.
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (!touched && pick) setChosen(pick.name); }, [pick, touched]);
  const sel: Runner | null = useMemo(
    () => field.find((r) => r.name === chosen) ?? pick ?? null,
    [field, chosen, pick]
  );

  const poly = usePolyRunner(sel?.name ?? null);
  const mins = kalMinsAgo(live.kalshi.updated);
  const isPick = !!sel && !!pick && sel.name === pick.name;
  const vsMed = sel?.conv != null && med != null ? sel.conv - med : null;

  // The tape. Presidency slugs follow a stable pattern so any runner can be
  // charted; the nomination slug only exists for markets we have confirmed.
  const specs = useMemo(() => {
    if (!sel) return [];
    const out = [{ slug: presSlug(sel.name), name: "Presidency", color: "#7d9fd4" }];
    const ns = nomSlug(sel.name);
    if (ns) out.unshift({ slug: ns, name: "Nomination", color: "#e2572b" });
    return out;
  }, [sel]);
  const { series, loading: tapeLoading } = useHistory(specs);

  const segs: TickerSeg[] = sel ? [
    {
      html: `<span style="color:${sel.color};font-weight:600">${sel.last.toUpperCase()}</span> <span class="text-faint">NOM</span> <b style="color:#fff">${cents(sel.nom, 1)}</b> <span class="text-faint">PRES</span> <b style="color:#fff">${cents(sel.pres, 1)}</b>`,
      href: sel.party === "D" ? VENUE.demNomination : VENUE.gopNomination,
    },
    { html: `<span class="text-faint">CONVERTS AT</span> <b style="color:#fff">${sel.conv != null ? Math.round(sel.conv * 100) + "%" : "—"}</b> <span class="text-faint">FIELD MEDIAN</span> <b style="color:#fff">${med != null ? Math.round(med * 100) + "%" : "—"}</b>` },
    { html: `<span class="text-faint">PRESIDENCY BOOK</span> <span class="text-gold">POLYMARKET</span>`, href: VENUE.presidency },
    { html: mins != null ? `<span class="text-faint">KALSHI ·</span> ${mins <= 1 ? "JUST NOW" : mins + " MIN AGO"}` : "KALSHI SNAPSHOT" },
  ] : [{ html: "LOADING THE BOARD…" }];

  const bets = sel && sel.nom != null && sel.pres != null ? [
    { name: "The Wedge — nominated, then loses", badge: isPick ? "house pick" : "the spread", cost: sel.atRisk ?? 0, pays: sel.pays ? "≈" + sel.pays.toFixed(0) + "×" : "—", when: `${sel.last} wins the nomination but loses in November` },
    { name: `${sel.last} wins the White House`, badge: "longshot", cost: sel.pres, pays: (1 / sel.pres).toFixed(1) + "×", when: `${sel.last} wins the presidency outright` },
    { name: `${sel.last} gets nominated`, badge: "simple", cost: sel.nom, pays: (1 / sel.nom).toFixed(1) + "×", when: `${sel.last} is the ${sel.party === "D" ? "Democratic" : "Republican"} nominee` },
    { name: `${sel.last} is NOT the nominee`, badge: "contrarian", cost: 1 - sel.nom, pays: (1 / (1 - sel.nom)).toFixed(2) + "×", when: "the party picks somebody else" },
  ] : [];
  const maxCost = Math.max(...bets.map((b) => b.cost), 0.01);

  // Kalshi gives the whole board; Polymarket is fetched per runner so the
  // two-venue math compares two real books instead of one number twice.
  const lockOptions = sel ? [
    { slug: "pres", label: `${sel.last} wins the presidency`, poly: poly.pres, kal: sel.pres },
    { slug: "nom", label: `${sel.last} wins the nomination`, poly: poly.nom, kal: sel.nom },
  ] : [];
  const trackerOptions = sel ? [
    { slug: "nom", label: `${sel.last} wins the nomination` },
    { slug: "pres", label: `${sel.last} wins the presidency` },
  ] : [];
  const priceFor = (slug: string, venue: "Polymarket" | "Kalshi"): number | null => {
    if (venue === "Kalshi") return slug === "nom" ? sel?.nom ?? null : sel?.pres ?? null;
    return slug === "nom" ? poly.nom : poly.pres;
  };

  return (
    <Wrap>
      <Header
        title="The Presidency"
        sub={<>2028 · <Link to="/polling" className="text-ember no-underline">POLLING</Link> · <Link to="/sizing" className="text-ember no-underline">SIZING</Link> · {live.loading ? "connecting…" : <span className="text-green">LIVE</span>}</>}
        ticker={segs}
      />

      <Section n="01" title="The board" dek="tap anyone">
        <Lead>
          Every name the market quotes for 2028, ranked by the number that matters: <b className="text-ink">conversion</b> —
          what the market says their odds are <i>once they have the nomination</i>. Tap a runner and the whole
          article below re-prices around them.
        </Lead>
        {ranked.length ? (
          <div className="bg-paper2 border border-rule rounded-md p-3 sm:p-4">
            <FieldBoard
              runners={ranked}
              selected={sel?.name ?? null}
              onSelect={(n) => { setChosen(n); setTouched(true); }}
              pick={pick?.name ?? null}
              party={party}
              onParty={(p) => { setParty(p); setTouched(false); }}
            />
          </div>
        ) : <Loading label="loading the board…" />}
      </Section>

      <Section n="02" title="Today's call" dek="computed, not chosen">
        {!sel ? <Loading /> : (
          <div className="bg-paper2 border border-rule rounded-md p-4 sm:p-5">
            <div className="flex gap-4 sm:gap-5 items-start">
              <Portrait name={sel.name} size={72} />
              <div className="min-w-0">
                <span className="mono text-[10.5px] tracking-[0.2em] uppercase" style={{ color: isPick ? "#d0a54e" : "#8a9099" }}>
                  {isPick ? "The house pick" : "You picked"}
                </span>
                <h2 className="serif font-bold my-1.5 leading-[1.15]" style={{ fontSize: "clamp(22px,5vw,32px)" }}>
                  {sel.conv != null
                    ? <>The market says {sel.last} wins it all <span style={{ color: sel.color }}>{Math.round(sel.conv * 100)}%</span> of the time they're nominated.</>
                    : <>{sel.last} isn't quoted on both legs yet.</>}
                </h2>
              </div>
            </div>

            {sel.conv != null && (
              <>
                <p className="text-ink2 text-[15px] leading-[1.55] mt-1">
                  {vsMed != null && vsMed > 0.02 ? (
                    <>That's <b className="text-ink">{Math.round(vsMed * 100)} points above</b> the field median of {Math.round(med! * 100)}% — the market is unusually sure about a general election that is still two years and one campaign away. The Wedge sells that certainty.</>
                  ) : vsMed != null && vsMed < -0.02 ? (
                    <>That's <b className="text-ink">{Math.round(-vsMed * 100)} points below</b> the field median of {Math.round(med! * 100)}% — the market doubts {sel.last} closes. The Wedge is cheap here for a reason; the outright is the more interesting side.</>
                  ) : (
                    <>That sits right on the field median of {Math.round(med! * 100)}%. No strong edge either way — this one is priced about where the rest of the board is.</>
                  )}
                </p>
                {sel.atRisk != null && sel.pays != null && (
                  <p className="mono text-[13px] text-faint mt-3 leading-[1.6]">
                    Bet $100 on the Wedge → win about <b className="text-green">${(100 * sel.pays).toFixed(0)}</b> if {sel.last} is nominated and loses.
                    Worst case out <b className="text-ember">${(100 * sel.atRisk).toFixed(0)}</b> — the small fixed risk.
                  </p>
                )}
              </>
            )}
          </div>
        )}
        {pick && sel && !isPick && (
          <p className="mono text-[11px] text-faint mt-2">
            The house pick right now is <button onClick={() => { setChosen(pick.name); setTouched(false); }} className="text-ember underline underline-offset-2">{pick.last} at {Math.round(pick.conv! * 100)}%</button> — the most confident conversion on the board.
          </p>
        )}
      </Section>

      <Section n="03" title="The tape" dek="live price history">
        <Lead>{sel ? <>Polymarket's running price for {sel.last}. Drag across it to read any day.</> : "Loading."}</Lead>
        <Wide>
          <div className="bg-paper2 border border-rule rounded-md p-3 sm:p-4">
            {series.length ? <LineChart series={series} unit="¢" />
              : tapeLoading ? <Loading label="loading the tape…" />
              : <div className="mono text-[11.5px] text-faint py-10 text-center leading-[1.7]">
                  No Polymarket tape for {sel?.last ?? "this runner"}.<br />
                  Kalshi quotes them, but only a snapshot — there's no price history to draw.
                </div>}
          </div>
        </Wide>
      </Section>

      <Section n="04" title="The lock" dek="is there free money">
        <Lead>Buy YES on one store and NO on the other. Does that lock a guaranteed profit that still beats a T-bill after fees and tax? Nudge a price to test it.</Lead>
        <LockVerdict options={lockOptions} />
      </Section>

      <Section n="05" title="Same bet, two stores" dek="who's cheaper">
        <Lead>After fees and Kalshi's interest, the cheaper store wins:</Lead>
        {poly.pres != null
          ? <VenueCompare polyYes={poly.pres} kalYes={sel?.pres ?? null} />
          : <p className="mono text-[11.5px] text-faint py-6 leading-[1.7]">
              {poly.loading ? "checking Polymarket…" : <>Polymarket doesn't list a presidency market for {sel?.last ?? "this runner"} — only Kalshi quotes them, so there's nothing to compare.</>}
            </p>}
      </Section>

      <Section n="06" title="Every way to bet it" dek="cheapest first">
        <Lead>Longer bar = costs more. Pick the row that matches what you actually believe.</Lead>
        <div className="space-y-2.5">
          {bets.length ? bets.map((b) => (
            <BarRow key={b.name}
              title={b.name}
              badge={{ text: b.badge, kind: b.badge === "house pick" ? "pick" : "neutral" }}
              right={<>costs <b className="text-ink serif">{cents(b.cost, 0)}</b> · pays <b className="text-ink serif">{b.pays}</b></>}
              bar={(b.cost / maxCost) * 100}
              foot={<>You win when <b className="text-ink">{b.when}</b>.</>}
            />
          )) : <Loading />}
        </div>
      </Section>

      <Section n="07" title="The fee, at every price" dek="what you actually pay"><FeeTable /></Section>
      <Section n="08" title="The tax math" dek="what you keep"><TaxTable /></Section>
      <Section n="09" title="Is it even investable?" dek="the house rule"><InvestabilityChecklist /></Section>

      <Section n="10" title="My bets" dek="tracker, not a broker">
        <Lead>Log what you did on the real venue and watch it live. Stored only in your browser; export the CSV at tax time.</Lead>
        <BetTracker options={trackerOptions} priceFor={priceFor} />
      </Section>

      <Footer desk="The Presidency" />
    </Wrap>
  );
}
