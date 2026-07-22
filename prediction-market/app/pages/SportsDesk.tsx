import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wrap, Header, Section, Footer } from "../components/Shell";
import { OddsBoard, Movers, FocusCard } from "../components/OddsBoard";
import { LineChart, Series } from "../components/LineChart";
import { Lead, Note, Verdict, Loading, BarRow } from "../components/ui";
import { useField } from "../useField";
import { fetchHistory } from "../../engine/polymarket";
import { DESKS, fieldStats, teamColor, shortTeam, oddsPhrase, payout } from "../../engine/sports";
import { SUITORS, VET_MIN, CAP_AS_OF, CAP_SOURCE, CAP_URL } from "../../data/lebron";
import { money } from "../../engine/format";
import { VENUE } from "../../engine/venues";
import type { TickerSeg } from "../components/Ticker";

const DESK = DESKS[0];

export default function SportsDesk() {
  const { rows, meta, loading, error } = useField(DESK.slug, 30);
  const [chosen, setChosen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const stats = useMemo(() => fieldStats(rows), [rows]);
  const sel = useMemo(
    () => rows.find((r) => r.name === chosen) ?? stats.top ?? null,
    [rows, chosen, stats.top]
  );

  // The tape: price history for the top three, so the month's repricing is
  // visible rather than asserted.
  const [series, setSeries] = useState<Series[]>([]);
  const [tapeLoading, setTapeLoading] = useState(true);
  const topThree = useMemo(() => rows.slice(0, 3), [rows]);
  const tapeKey = topThree.map((r) => r.tok).join("|");

  useEffect(() => {
    if (!topThree.length) return;
    let alive = true;
    setTapeLoading(true);
    (async () => {
      const out: Series[] = [];
      for (const r of topThree) {
        if (!r.tok) continue;
        const h = await fetchHistory(r.tok, "1m", "360");
        if (h.length) {
          out.push({
            key: r.tok, name: shortTeam(r.name), color: teamColor(r.name),
            pts: h.map((x) => ({ t: x.t * 1000, v: x.p * 100 })),
          });
        }
      }
      if (alive) { setSeries(out); setTapeLoading(false); }
    })();
    return () => { alive = false; };
  }, [tapeKey]);

  const suitor = useMemo(() => SUITORS.find((s) => s.team === sel?.name) ?? null, [sel]);
  const favourite = stats.top;
  const favSuitor = useMemo(() => SUITORS.find((s) => s.team === favourite?.name) ?? null, [favourite]);
  // Does the favourite also have the most money to spend? That is the whole
  // thesis of this desk, so it is computed rather than asserted.
  const richest = useMemo(() => SUITORS.reduce((a, b) => (b.max > a.max ? b : a), SUITORS[0]), []);
  const moneyExplains = !!favSuitor && favSuitor.team === richest.team;

  const segs: TickerSeg[] = rows.length ? [
    ...rows.slice(0, 4).map((r) => ({
      html: `<span style="color:${teamColor(r.name)};font-weight:600">${shortTeam(r.name).toUpperCase()}</span> <b style="color:#fff">${(r.px * 100).toFixed(0)}¢</b>`,
      href: VENUE.lebron,
    })),
    { html: `<span class="text-faint">BOOK</span> <b style="color:#fff">${(stats.overround * 100).toFixed(0)}¢</b>` },
    { html: `<span class="text-green">POLYMARKET LIVE</span>`, href: VENUE.lebron },
    { html: `<span class="text-faint">SAME MARKET ON</span> <span class="text-gold">KALSHI</span>`, href: VENUE.lebronKalshi },
  ] : [{ html: "LOADING THE BOARD…" }];

  const capMax = Math.max(...SUITORS.map((s) => s.max));

  return (
    <Wrap>
      <Header
        title="Sports"
        sub={<>NBA free agency · <Link to="/" className="text-ember no-underline">FRONT PAGE</Link> · {loading ? "connecting…" : <span className="text-green">LIVE</span>}</>}
        ticker={segs}
      />

      <Section n="01" title={DESK.title} dek={DESK.dek}>
        <Lead>
          {DESK.question} Every price here is read live from Polymarket. Tap a team to re-price the
          desk around them.
        </Lead>

        {error && !loading ? (
          <p className="mono text-[11.5px] text-faint py-8 text-center border border-dashed border-rule rounded-md">
            Polymarket's board isn't responding right now. Nothing is cached — this desk only shows live prices.
          </p>
        ) : loading ? <Loading label="loading the board…" /> : (
          <>
            <div className="bg-paper2 border border-rule rounded-md p-3 sm:p-4">
              <OddsBoard
                rows={rows}
                selected={sel?.name ?? null}
                onSelect={setChosen}
                max={showAll ? undefined : 8}
              />
              {rows.length > 8 && (
                <button onClick={() => setShowAll((a) => !a)}
                  className="mono text-[10.5px] uppercase tracking-[0.12em] text-ember hover:text-ink mt-2 min-h-[36px]">
                  {showAll ? "▴ show top 8" : `▾ show all ${rows.length}`}
                </button>
              )}
            </div>
            <Note>
              Bar = the price. The ▲▼ number is the move over the last seven days. The book adds to{" "}
              <b className="text-ink2">{(stats.overround * 100).toFixed(0)}¢</b>
              {stats.overround > 1.02 ? " — the overround above 100¢ is the house's edge." : " — near 100¢, so the book is tight."}
              {" "}Total volume {money(stats.totalVol)}.
            </Note>
          </>
        )}
      </Section>

      {sel && (
        <Section n="02" title="The focus" dek="one team, priced">
          <FocusCard row={sel} />
          <p className="text-ink2 text-[15px] leading-[1.55] mt-3">
            At <b className="text-ink">{(sel.px * 100).toFixed(1)}¢</b> the market gives {shortTeam(sel.name)}{" "}
            {oddsPhrase(sel.px)}. A winning $100 returns{" "}
            <b className="text-ink">${(100 * payout(sel.px)).toFixed(0)}</b> gross.
            {Math.abs(sel.m1) >= 0.05 && (
              <> That price has moved <b className={sel.m1 > 0 ? "text-green" : "text-ember"}>
                {sel.m1 > 0 ? "up" : "down"} {Math.abs(sel.m1 * 100).toFixed(0)}¢
              </b> in a month — this is not a sleepy market.</>
            )}
          </p>
          {suitor && (
            <div className="bg-paper2 border border-rule rounded-md mt-3 [&>div]:px-4 [&>div]:py-3 [&>div]:border-b [&>div]:border-rule [&>div:last-child]:border-b-0 text-[14px] leading-[1.55] text-ink2 [&_b]:text-ink [&_b]:font-serif">
              <div><b>Can pay</b> — {suitor.max === VET_MIN ? "the veteran minimum only" : `about $${suitor.max}m`}{suitor.conditional ? ", but only if another move happens first" : ""}. {suitor.note}</div>
              <div><b>The pitch</b> — {suitor.pitch}</div>
              <div><b>The problem</b> — {suitor.against}</div>
            </div>
          )}
        </Section>
      )}

      <Section n="03" title="What moved" dek="follow the money">
        <Lead>Where the money went over the past seven days. This is the part of a free-agency board that actually carries information.</Lead>
        {loading ? <Loading /> : <Movers rows={stats.movers} />}
      </Section>

      <Section n="04" title="The tape" dek="live price history">
        <Lead>The top three, month to date. Drag across the chart to read any day.</Lead>
        <div className="bg-paper2 border border-rule rounded-md p-3 sm:p-4">
          {series.length ? <LineChart series={series} unit="¢" />
            : tapeLoading ? <Loading label="loading the tape…" />
            : <p className="mono text-[11.5px] text-faint py-10 text-center">No price history available for these outcomes.</p>}
        </div>
      </Section>

      <Section n="05" title="The money" dek="who can actually pay">
        <Lead>
          Free agency reads like a story about legacy. It is mostly a story about the cap. Here is what
          each suitor can realistically offer — longer bar, more money.
        </Lead>
        <div className="space-y-2.5">
          {SUITORS.map((s) => {
            const live = rows.find((r) => r.name === s.team);
            return (
              <BarRow key={s.team}
                title={shortTeam(s.team)}
                badge={s.max === capMax ? { text: "most money", kind: "pick" } : undefined}
                right={<>{live ? <>market <b className="text-ink serif">{(live.px * 100).toFixed(0)}¢</b> · </> : null}
                  can pay <b className="text-ink serif">${s.max}m</b>{s.conditional ? "*" : ""}</>}
                bar={(s.max / capMax) * 100}
                foot={s.note}
              />
            );
          })}
        </div>
        <Note>
          * conditional on another move landing first. Figures reported by {CAP_SOURCE} on {CAP_AS_OF} —
          a <b className="text-ink2">snapshot</b>, not live data, and the only numbers on this desk that aren't.{" "}
          <a href={CAP_URL} target="_blank" rel="noreferrer" className="text-ember no-underline">source ↗</a>
        </Note>

        {favourite && favSuitor && (
          <Verdict good={moneyExplains}>
            {moneyExplains ? (
              <>The favourite is also the only team with real money. {shortTeam(favourite.name)} trades at{" "}
                <b>{(favourite.px * 100).toFixed(0)}¢</b> and can pay <b>${favSuitor.max}m</b> — against a{" "}
                <b>${VET_MIN}m</b> veteran minimum almost everywhere else. Buying the favourite here is
                buying the view that the money matters.</>
            ) : (
              <>The favourite is not the highest bidder. {shortTeam(favourite.name)} trades at{" "}
                <b>{(favourite.px * 100).toFixed(0)}¢</b> but can only pay <b>${favSuitor.max}m</b>, while{" "}
                <b>{shortTeam(richest.team)}</b> can go to <b>${richest.max}m</b>. The market is pricing
                something other than the cheque.</>
            )}
          </Verdict>
        )}
      </Section>

      {favourite && stats.runnerUp && (
        <Section n="06" title="The other side" dek="what has to be true">
          <Lead>
            {shortTeam(favourite.name)} at {(favourite.px * 100).toFixed(0)}¢ against the whole rest of the
            board at {((1 - favourite.px) * 100).toFixed(0)}¢. Fading the favourite is one specific claim:
          </Lead>
          <div className="bg-paper2 border border-rule rounded-md [&>div]:px-4 [&>div]:py-3 [&>div]:border-b [&>div]:border-rule [&>div:last-child]:border-b-0 text-[14px] leading-[1.55] text-ink2 [&_b]:text-ink [&_b]:font-serif">
            <div><b>The claim</b> — that a few million dollars does not move a 41-year-old with four titles and a career of earnings behind him. If the cheque is irrelevant, the money edge is worth nothing and this is a pure fit-and-legacy call.</div>
            <div><b>The price of being right</b> — the field pays{" "}
              <b>{(1 / (1 - favourite.px)).toFixed(2)}×</b> on "not {shortTeam(favourite.name)}", or{" "}
              <b>{(1 / stats.runnerUp.px).toFixed(1)}×</b> on {shortTeam(stats.runnerUp.name)} outright at{" "}
              <b>{(stats.runnerUp.px * 100).toFixed(0)}¢</b>.</div>
            <div><b>The catch</b> — reporting says there is no timetable and no clear lean. A {(favourite.px * 100).toFixed(0)}¢ favourite in a market whose subject has reportedly not decided is pricing momentum, not information. That cuts both ways.</div>
          </div>
        </Section>
      )}

      <Section n="07" title="How it settles" dek="read this first">
        <Lead>{DESK.settlement}</Lead>
        <Note>
          Market closes {DESK.resolves}.{meta?.volume ? <> Event volume {money(meta.volume)}.</> : null}{" "}
          Educational, not investment advice.
        </Note>
      </Section>

      <Footer desk="Sports" />
    </Wrap>
  );
}
