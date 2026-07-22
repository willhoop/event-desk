import { useMemo } from "react";
import { Wrap, Header, Section, Footer } from "../components/Shell";
import { LineChart, Series } from "../components/LineChart";
import { computeAll, avgAsOf } from "../../engine/pollAvg";
import { usePolls } from "../usePolls";
import { impliedPrices } from "../../engine/pollModel";
import { NAMES, SNAP_MKT } from "../../data/polls";
import { colorFor, SHORT } from "../../engine/colors";
import { useLive } from "../useLive";
import { pct, cents } from "../../engine/format";
import { Link } from "react-router-dom";
import { Portrait } from "../components/Portrait";

export default function PollingDesk() {
  const live = useLive();
  const { polls } = usePolls();
  const { avg, E4 } = useMemo(() => computeAll(polls), [polls]);
  const order = useMemo(() => Object.keys(NAMES).sort((a, b) => (avg[b] || 0) - (avg[a] || 0)), [avg]);
  const top4 = order.slice(0, 4);

  // live market prices, dropping to snapshot
  const mkt: Record<string, number> = {};
  order.forEach((k) => {
    const nm = NAMES[k];
    const kv = live.kalshi.nomination[nm];
    mkt[k] = kv != null ? kv * 100 : SNAP_MKT[k] ?? NaN;
  });
  if (live.polyNom != null) mkt["ossoff"] = live.polyNom * 100;
  const implied = impliedPrices(avg);
  const maxAvg = Math.max(1, ...order.map((k) => avg[k] || 0));

  // trend series
  const series: Series[] = useMemo(() => {
    const months: number[] = [];
    for (let m = 0; m < 7; m++) months.push(Date.UTC(2026, m, 25));
    return order.map((k, i) => ({
      key: k, name: SHORT[k], color: colorFor(k, i),
      pts: months.map((t) => ({ t, v: avgAsOf(t, E4, polls)[k] || 0 })).filter((p) => p.v > 0),
    })).filter((s) => s.pts.length > 0);
  }, [order, E4, polls]);

  const sboard = Object.keys(E4).sort((a, b) => E4[b].score - E4[a].score);

  return (
    <Wrap>
      <Header title="Polling Desk" sub={<>2028 Democratic nomination · <Link to="/ossoff" className="text-ember no-underline">OSSOFF DESK</Link></>} />

      <Section n="01" title="The race, live" dek="hover, click, explore">
        <p className="text-ink2 text-[15px] mb-2">Hover anywhere for the exact standings. Every candidate is in the legend below — click to add or drop anyone, down to the longshots.</p>
        <LineChart series={series} unit="%" defaultVisible={4} />
      </Section>

      <Section n="02" title="Polls vs the market" dek="the money chart">
        <p className="text-ink2 text-[15px] mb-2">A model fitted on 90 candidacies since 1972 turns each poll share into a fair price, then compares it to the market. Edge = market minus fair, cents against cents.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] border-collapse">
            <thead><tr className="mono text-[12px] uppercase text-faint text-left border-b border-rule">
              <th className="py-2 pr-2">Candidate</th><th className="py-2 px-2 text-right">Poll avg</th><th className="py-2 px-2 text-right">Implied</th><th className="py-2 px-2 text-right">Market</th><th className="py-2 px-2 text-right">Edge</th></tr></thead>
            <tbody>
              {order.map((k) => {
                const gap = implied[k] != null && !isNaN(mkt[k]) ? mkt[k] - implied[k] : null;
                const big = gap != null && Math.abs(gap) >= 8;
                return (
                  <tr key={k} className="border-b border-rule">
                    <td className="py-2 pr-2">
                      <span className="flex items-center gap-2.5">
                        <Portrait name={NAMES[k]} size={34} />
                        <span className="min-w-0 flex-1">
                          <b className="serif block truncate" style={{ color: colorFor(k, order.indexOf(k)) }}>{NAMES[k]}</b>
                          <span className="block h-1.5 rounded mt-1" style={{ width: `${Math.max(6, ((avg[k] || 0) / maxAvg) * 100)}%`, background: colorFor(k, order.indexOf(k)), opacity: 0.8 }} />
                        </span>
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">{pct(avg[k] / 100, 1)}</td>
                    <td className="py-2 px-2 text-right">{implied[k] != null ? implied[k].toFixed(1) + "¢" : "—"}</td>
                    <td className="py-2 px-2 text-right">{!isNaN(mkt[k]) ? mkt[k].toFixed(1) + "¢" : "—"}</td>
                    <td className={"py-2 px-2 text-right " + (gap == null ? "" : gap > 0 ? "text-green" : "text-ember") + (big ? " font-bold text-[15px]" : "")}>
                      {gap != null ? (gap > 0 ? "+" : "") + gap.toFixed(1) + "¢" : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="03" title="The pollster scoreboard" dek="scored by our engine">
        <p className="text-ink2 text-[15px] mb-2">Our own score, not 538’s (which shut down in 2025): how far a firm sits from consensus, its sample discipline, likely-voter share, and partisan ties.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead><tr className="mono text-[11px] uppercase text-faint text-left border-b border-rule">
              <th className="py-2 pr-2">Pollster</th><th className="py-2 px-2 text-right">Polls</th><th className="py-2 px-2 text-right">Avg n</th><th className="py-2 px-2 text-right">LV%</th><th className="py-2 px-2 text-right">Dist.</th><th className="py-2 px-2 text-right">E4 wt</th></tr></thead>
            <tbody>
              {sboard.map((p) => {
                const e = E4[p];
                return (
                  <tr key={p} className="border-b border-rule">
                    <td className="py-2 pr-2"><b className="serif">{p}</b>{e.part ? <span className="mono text-[9px] text-ember ml-1">partisan</span> : null}</td>
                    <td className="py-2 px-2 text-right">{e.count}</td>
                    <td className="py-2 px-2 text-right">{e.nAvg.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">{Math.round(e.lv * 100)}%</td>
                    <td className="py-2 px-2 text-right">{e.dev.toFixed(1)}</td>
                    <td className="py-2 px-2 text-right">
                      <span className="mono text-[12px] font-bold rounded px-2 py-0.5 inline-block"
                        style={{ background: (e.score >= 0.75 ? "#4a9e7f" : e.score >= 0.6 ? "#d0a54e" : "#e2572b") + "22", color: e.score >= 0.75 ? "#4a9e7f" : e.score >= 0.6 ? "#d0a54e" : "#e2572b" }}>
                        {e.score.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Footer desk="Polling Desk" />
    </Wrap>
  );
}
