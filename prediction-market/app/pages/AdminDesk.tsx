import { useMemo } from "react";
import { Wrap, Header, Section, Footer } from "../components/Shell";
import { useLive, kalMinsAgo } from "../useLive";
import { usePolls } from "../usePolls";
import { useFutureSearch } from "../useFutureSearch";
import { computeAll } from "../../engine/pollAvg";
import { impliedPrices } from "../../engine/pollModel";
import { NAMES } from "../../data/polls";
import { SHORT } from "../../engine/colors";
import { Link } from "react-router-dom";

const REPO = "https://github.com/willhoop/event-desk";
const SITE = "https://elitefourcapital.com/";
const CF = "https://dash.cloudflare.com/?to=/:account/pages/view/event-desk";

function Dot({ ok, warn }: { ok?: boolean; warn?: boolean }) {
  const c = ok ? "#4a9e7f" : warn ? "#d0a54e" : "#e2572b";
  return <span className="inline-block w-2.5 h-2.5 rounded-full align-middle" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />;
}

function FeedRow({ name, status, tone, detail, updated, action }: {
  name: string; status: string; tone: "ok" | "warn" | "bad"; detail: string; updated: string; action?: { label: string; href: string };
}) {
  return (
    <tr className="border-b border-rule">
      <td className="py-2.5 pr-2"><Dot ok={tone === "ok"} warn={tone === "warn"} /> <b className="serif ml-1.5">{name}</b></td>
      <td className="py-2.5 px-2 mono text-[12px]" style={{ color: tone === "ok" ? "#4a9e7f" : tone === "warn" ? "#d0a54e" : "#e2572b" }}>{status}</td>
      <td className="py-2.5 px-2 text-[13px] text-ink2">{detail}</td>
      <td className="py-2.5 px-2 mono text-[11px] text-faint">{updated}</td>
      <td className="py-2.5 pl-2 text-right">{action && <a href={action.href} target="_blank" rel="noreferrer" className="mono text-[10.5px] uppercase border border-rule rounded px-2.5 py-1 text-ink2 hover:border-ember hover:text-ember whitespace-nowrap">{action.label}</a>}</td>
    </tr>
  );
}

export default function AdminDesk() {
  const live = useLive();
  const { polls, source, updated } = usePolls();
  const fs = useFutureSearch();
  const { avg, E4 } = useMemo(() => computeAll(polls), [polls]);
  const implied = useMemo(() => impliedPrices(avg), [avg]);
  const order = useMemo(() => Object.keys(NAMES).sort((a, b) => (avg[b] || 0) - (avg[a] || 0)), [avg]);
  const kMins = kalMinsAgo(live.kalshi.updated);
  const kNomCount = Object.keys(live.kalshi.nomination || {}).length;
  const scoreboard = Object.entries(E4).sort((a, b) => b[1].score - a[1].score);

  return (
    <Wrap>
      <Header title="Mission Control" sub={<>admin · not linked publicly · <Link to="/" className="text-ember no-underline">FRONT PAGE</Link></>} />

      <Section n="01" title="Data feeds" dek="what's live right now">
        <p className="text-ink2 text-[15px] mb-3">Every source the site runs on, with freshness and a one-click link to its refresh. The "run" links open GitHub — only you can actually trigger them.</p>
        <div className="bg-paper2 border border-rule rounded-md p-4 overflow-x-auto">
          <table className="w-full text-[13.5px] border-collapse min-w-[640px]">
            <thead><tr className="mono text-[11px] uppercase text-faint border-b border-rule">
              <th className="text-left py-2 pr-2">Feed</th><th className="text-left py-2 px-2">Status</th><th className="text-left py-2 px-2">Detail</th><th className="text-left py-2 px-2">Updated</th><th className="text-right py-2 pl-2">Action</th>
            </tr></thead>
            <tbody>
              <FeedRow name="Polymarket" tone={live.polyNom != null ? "ok" : "warn"} status={live.polyNom != null ? "LIVE" : "connecting"}
                detail={live.polyNom != null ? `Ossoff nom ${(live.polyNom * 100).toFixed(1)}¢ · pres ${live.polyPres != null ? (live.polyPres * 100).toFixed(1) + "¢" : "—"}` : "in-browser fetch"}
                updated="on page load" />
              <FeedRow name="Kalshi" tone={kMins == null ? "bad" : kMins < 30 ? "ok" : "warn"} status={kMins == null ? "no data" : kMins < 30 ? "LIVE" : "stale"}
                detail={`${kNomCount} nomination markets · server-refreshed`} updated={kMins == null ? "—" : kMins <= 1 ? "just now" : kMins + " min ago"}
                action={{ label: "run", href: `${REPO}/actions/workflows/kalshi.yml` }} />
              <FeedRow name="Polls" tone={source === "live" ? "ok" : "warn"} status={source === "live" ? "LIVE (polls.json)" : "BUNDLED"}
                detail={`${polls.length} polls in the model`} updated={updated || "build-time"}
                action={{ label: "run", href: `${REPO}/actions/workflows/polls.yml` }} />
              <FeedRow name="FutureSearch (AI)" tone={fs ? "ok" : "warn"} status={fs ? "LIVE" : "not run yet"}
                detail={fs ? `${Object.keys(fs.probs).length} candidate probabilities` : "add secret + run to populate"} updated={fs?.updated || "—"}
                action={{ label: "run", href: `${REPO}/actions/workflows/futuresearch.yml` }} />
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="02" title="Controls" dek="the levers">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {[
            ["Actions — all runs", `${REPO}/actions`],
            ["Run Kalshi refresh", `${REPO}/actions/workflows/kalshi.yml`],
            ["Run poll refresh", `${REPO}/actions/workflows/polls.yml`],
            ["Run AI forecast", `${REPO}/actions/workflows/futuresearch.yml`],
            ["Secrets & variables", `${REPO}/settings/secrets/actions`],
            ["Cloudflare deployments", CF],
            ["Repo code", REPO],
            ["Live site", SITE],
            ["Style guide", "#/style"],
          ].map(([label, href]) => (
            <a key={label} href={href} target={href.startsWith("#") ? undefined : "_blank"} rel="noreferrer"
              className="bg-paper2 border border-rule rounded-md px-3.5 py-3 mono text-[12px] text-ink2 hover:border-ember hover:text-ember flex items-center justify-between gap-2">
              {label}<span className="text-faint">↗</span>
            </a>
          ))}
        </div>
        <p className="mono text-[11px] text-faint mt-3">Deploy = upload <b className="text-ink2">dist/index.html</b> to the repo root. Cloudflare Pages redeploys <b className="text-ink2">elitefourcapital.com</b> on every commit. Kalshi auto-refreshes every 10 min; polls daily; AI is manual (bills ~$1.20/run).</p>
      </Section>

      <Section n="03" title="Model internals" dek="the engine, exposed">
        <div className="bg-paper2 border border-rule rounded-md p-4 overflow-x-auto">
          <table className="w-full text-[13px] border-collapse min-w-[520px]">
            <thead><tr className="mono text-[11px] uppercase text-faint border-b border-rule">
              <th className="text-left py-2 pr-2">Candidate</th><th className="py-2 px-2 text-right">Weighted %</th><th className="py-2 px-2 text-right">Model ¢</th><th className="py-2 px-2 text-right">Market ¢</th><th className="py-2 px-2 text-right">AI ¢</th>
            </tr></thead>
            <tbody>
              {order.map((k) => {
                const mk = live.kalshi.nomination[NAMES[k]] != null ? live.kalshi.nomination[NAMES[k]] * 100 : (k === "ossoff" && live.polyNom != null ? live.polyNom * 100 : NaN);
                return (
                  <tr key={k} className="border-b border-rule">
                    <td className="py-2 pr-2 serif">{SHORT[k]}</td>
                    <td className="py-2 px-2 text-right">{(avg[k] || 0).toFixed(1)}</td>
                    <td className="py-2 px-2 text-right">{implied[k] != null ? implied[k].toFixed(1) : "—"}</td>
                    <td className="py-2 px-2 text-right">{!isNaN(mk) ? mk.toFixed(1) : "—"}</td>
                    <td className="py-2 px-2 text-right" style={{ color: "#d0a54e" }}>{fs?.probs[k] != null ? fs.probs[k].toFixed(1) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="04" title="Pollster scores" dek="E4 weights">
        <div className="bg-paper2 border border-rule rounded-md p-4 overflow-x-auto">
          <table className="w-full text-[13px] border-collapse min-w-[520px]">
            <thead><tr className="mono text-[11px] uppercase text-faint border-b border-rule">
              <th className="text-left py-2 pr-2">Pollster</th><th className="py-2 px-2 text-right">E4</th><th className="py-2 px-2 text-right">Polls</th><th className="py-2 px-2 text-right">Avg n</th><th className="py-2 px-2 text-right">LV%</th><th className="py-2 px-2 text-right">Dev</th><th className="py-2 px-2 text-right">Partisan</th>
            </tr></thead>
            <tbody>
              {scoreboard.map(([p, s]) => (
                <tr key={p} className="border-b border-rule">
                  <td className="py-2 pr-2 serif">{p}</td>
                  <td className="py-2 px-2 text-right"><b>{s.score.toFixed(2)}</b></td>
                  <td className="py-2 px-2 text-right">{s.count}</td>
                  <td className="py-2 px-2 text-right">{s.nAvg.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{Math.round(s.lv * 100)}%</td>
                  <td className="py-2 px-2 text-right">{s.dev.toFixed(1)}</td>
                  <td className="py-2 px-2 text-right">{s.part ? <span className="text-ember">−{s.part}</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Footer desk="Mission Control" />
    </Wrap>
  );
}
