import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Wrap, Logo, Footer } from "../components/Shell";
import { Ticker } from "../components/Ticker";
import { useLive, kalMinsAgo } from "../useLive";
import { usePolls } from "../usePolls";
import { useField } from "../useField";
import { computeAll } from "../../engine/pollAvg";
import { cents } from "../../engine/format";
import { Sparkline } from "../components/Sparkline";
import { SLUGS } from "../useLive";
import { CAND_COLOR, SHORT } from "../../engine/colors";
import { NAMES } from "../../data/polls";
import { buildField, housePick, shortName } from "../../engine/field";
import { DESKS, shortTeam, teamColor } from "../../engine/sports";
import { VENUE } from "../../engine/venues";
import type { TickerSeg } from "../components/Ticker";

// full name → candidate color, for coloring names in the crawl
const NAME_TO_KEY: Record<string, string> = Object.fromEntries(Object.entries(NAMES).map(([k, v]) => [v.toUpperCase(), k]));
const tint = (name: string, color?: string) => {
  const key = NAME_TO_KEY[name.toUpperCase()];
  const c = color || (key ? CAND_COLOR[key] : "#c9cdd4");
  return `<span style="color:${c};font-weight:600">${name.toUpperCase()}</span>`;
};
// Prices/values always render pure white so they never blend with a candidate hue.
const val = (s: string) => `<b style="color:#ffffff">${s}</b>`;

export default function Home() {
  const live = useLive();
  const { polls } = usePolls();
  const sports = useField(DESKS[0].slug, 6);
  const n = live.polyNom, p = live.polyPres;

  // Poll average is computed from the live dataset — never written into the page.
  const { avg } = useMemo(() => computeAll(polls), [polls]);
  const topPolls = useMemo(
    () => Object.keys(NAMES).map((k) => ({ k, v: avg[k] || 0 })).sort((a, b) => b.v - a.v).slice(0, 4),
    [avg]
  );

  // The house pick comes off the same engine the Presidency desk uses, so the
  // front page can never disagree with the desk it links to.
  const field = useMemo(() => buildField(live.kalshi), [live.kalshi]);
  const pick = useMemo(() => housePick(field, "D"), [field]);

  // Each priced segment links out to the book it was read from.
  const segs: TickerSeg[] = [];
  const kNom = live.kalshi.nomination;
  const topKal = Object.entries(kNom).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topKal.length) segs.push({
    html: '<span class="text-faint">DEM NOMINEE</span>  ' + topKal.map(([nm, v]) => `${tint(nm)} ${val((v * 100).toFixed(0) + "¢")}`).join("   "),
    href: VENUE.demNomination,
  });
  if (sports.rows.length) segs.push({
    html: '<span class="text-faint">LEBRON NEXT TEAM</span>  ' + sports.rows.slice(0, 4)
      .map((r) => `${tint(shortTeam(r.name), teamColor(r.name))} ${val((r.px * 100).toFixed(0) + "¢")}`).join("   "),
    href: VENUE.lebron,
  });
  if (p != null) segs.push({
    html: `<span class="text-faint">OSSOFF PRESIDENCY</span> ${tint("Jon Ossoff")} ${val(cents(p, 1))}`,
    href: VENUE.presidency,
  });
  if (topPolls.length && topPolls[0].v > 0) segs.push({
    html: '<span class="text-faint">POLL AVERAGE</span>  ' + topPolls
      .map((t) => `${tint(NAMES[t.k])} ${val(t.v.toFixed(0) + "%")}`).join("   "),
  });
  if (pick) segs.push({
    html: `<span class="text-faint">HOUSE CALL</span> <span class="text-ember">THE WEDGE — ${shortName(pick.name).toUpperCase()} NOMINATED BUT LOSES</span>`,
  });
  const mins = kalMinsAgo(live.kalshi.updated);

  const lebron = sports.rows[0];

  return (
    <Wrap wide>
      <div className="sticky top-0 z-40 bg-paper">
        <div className="text-center border-b-[3px] border-double border-ink pt-3 pb-2">
          <div className="flex justify-center mb-1"><Logo size={38} /></div>
          <div className="mono text-[10px] tracking-[0.4em] uppercase text-ember">Elite Four Capital</div>
          <h1 className="serif text-[clamp(28px,4.5vw,44px)] leading-none my-0.5">Event Desks</h1>
          <div className="mono text-[10px] tracking-[0.06em] uppercase text-faint">Prediction markets, priced and explained — one desk per trade</div>
        </div>
        <Ticker segments={segs} />
      </div>

      <div className="mono text-[11px] tracking-[0.3em] uppercase text-faint mt-[18px] flex items-center gap-3.5">
        Open desks<span className="flex-1 border-t border-rule" />
      </div>

      <Link to="/presidency" className="grid md:grid-cols-[1.35fr_1fr] gap-8 items-center no-underline text-ink border-b border-rule py-8 group">
        <div>
          <span className="mono text-[10.5px] tracking-[0.2em] uppercase text-green">LIVE · THE HOUSE CALL</span>
          <h2 className="serif text-[clamp(29px,5vw,44px)] leading-[1.12] my-3 group-hover:text-ember">
            {pick && pick.conv != null
              ? <>The market says {shortName(pick.name)} wins it all {Math.round(pick.conv * 100)}% of the time he's nominated. History says take the other side.</>
              : <>The whole 2028 board, ranked by the one number that matters.</>}
          </h2>
          <p className="text-[15px] text-ink2 max-w-[70ch] leading-[1.55]">
            Every name the market quotes, ranked by conversion — the odds they finish the job once they
            have the party behind them. The pick is computed off live prices, so it moves when the money moves.
          </p>
          <div className="mono text-[13px] text-ink2 flex gap-6 flex-wrap mt-3">
            <span>NOMINEE <b className="text-ink">{cents(n, 0)}</b></span>
            <span>PRESIDENCY <b className="text-ink">{cents(p, 0)}</b></span>
            <span className={mins != null && mins < 90 ? "text-green" : "text-gold"}>
              {mins != null ? `KALSHI · ${mins <= 1 ? "JUST NOW" : mins + " MIN AGO"}` : "kalshi snapshot"}
            </span>
          </div>
        </div>
        <div><Sparkline slug={SLUGS.nom} color="#e2572b" label="Ossoff nomination" /></div>
      </Link>

      <Link to="/sports" className="grid md:grid-cols-[1fr_auto] gap-6 items-center no-underline text-ink border-b border-rule py-7 group">
        <div>
          <span className="mono text-[10.5px] tracking-[0.2em] uppercase text-gold">NEW · SPORTS DESK</span>
          <h2 className="serif text-[clamp(24px,4vw,36px)] leading-[1.15] my-2.5 group-hover:text-ember">
            {lebron
              ? <>LeBron's next team: {shortTeam(lebron.name)} at {(lebron.px * 100).toFixed(0)}¢ — and the reason is the cap, not the story.</>
              : <>LeBron's next team — the biggest free-agency board on the market.</>}
          </h2>
          <p className="text-[14.5px] text-ink2 max-w-[70ch] leading-[1.5]">
            The full board live from Polymarket, what moved this week, and what each suitor can actually
            pay him. Most of the field can only offer the veteran minimum.
          </p>
        </div>
        <div className="hidden md:flex gap-1.5 items-end h-[92px]">
          {sports.rows.slice(0, 6).map((r) => (
            <span key={r.name} className="w-7 rounded-t" title={r.name}
              style={{ height: `${Math.max(6, r.px * 170)}px`, background: teamColor(r.name) }} />
          ))}
        </div>
      </Link>

      <div className="grid md:grid-cols-3 border-b border-rule">
        <SecStory to="/polling" kicker="LIVE · POLLING DESK" title="The polls, the model, and the gap the money leaves open"
          dek="A FiveThirtyEight-style average with our own pollster scores, a model fitted on fifty years of primaries, and where polls and prices disagree." />
        <SecStory to="/electoral" kicker="LIVE · ELECTORAL DESK" title="Click the map, drag the mood, watch 270 move"
          dek="Every state from its 2024 result, 20,000 simulated elections per adjustment, and the tipping-point state that decides the close ones." />
        <SecStory to="/midterms" kicker="LIVE · MIDTERMS DESK" title="The 2026 midterms — the next markets to resolve"
          dek="House and Senate control, four months out. Shorter clocks, real convergence trades, and the first live test of the machinery." last />
      </div>

      <Link to="/polls-data" className="grid md:grid-cols-[1fr_auto] gap-5 items-center no-underline text-ink border-b border-rule py-7 group">
        <div>
          <span className="mono text-[10.5px] tracking-[0.2em] uppercase text-gold">POLL DATA DESK</span>
          <h2 className="serif text-[clamp(24px,4vw,36px)] leading-[1.15] my-2.5 group-hover:text-ember">
            {polls.length} polls, ten faces, one slider — see exactly where the money is mispriced.
          </h2>
          <p className="text-[14.5px] text-ink2 max-w-[70ch] leading-[1.5]">A visual leaderboard, six months of live movement, and a conviction meter you drag to watch every edge grow or vanish. The math lives in the white papers; this desk is the picture.</p>
        </div>
        <div className="hidden md:flex gap-1.5 items-end h-[92px]">
          {topPolls.map((t) => (
            <span key={t.k} className="w-7 rounded-t" title={SHORT[t.k] || ""}
              style={{ height: `${Math.max(6, t.v * 2.6)}px`, background: CAND_COLOR[t.k] || "#9aa79e" }} />
          ))}
        </div>
      </Link>
      <Footer desk="Front page" />
    </Wrap>
  );
}

function SecStory({ to, kicker, title, dek, last }: { to: string; kicker: string; title: string; dek: string; last?: boolean }) {
  return (
    <Link to={to} className={"no-underline text-ink pt-7 pb-6 md:px-6 first:md:pl-0 group " + (last ? "" : "md:border-r border-rule") + " border-b md:border-b-0 border-rule"}>
      <span className="mono text-[10px] tracking-[0.18em] uppercase text-green">{kicker}</span>
      <h3 className="serif text-[21px] leading-[1.25] mt-2.5 mb-2 group-hover:text-ember">{title}</h3>
      <p className="text-[13.5px] text-ink2 leading-[1.5]">{dek}</p>
    </Link>
  );
}
