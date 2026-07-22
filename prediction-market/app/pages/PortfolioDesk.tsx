import { useState } from "react";
import { Wrap, Header, Section, Footer } from "../components/Shell";
import { Lead, List, Item, Note, Fact, Facts } from "../components/ui";
import { quarterKelly } from "../../engine/pricing";
import { money } from "../../engine/format";
import { Link } from "react-router-dom";

export default function PortfolioDesk() {
  const [belief, setBelief] = useState(20);   // your probability %
  const [price, setPrice] = useState(14);      // market price ¢
  const [bankroll, setBankroll] = useState(1000);

  const p = belief / 100, q = price / 100;
  const f = quarterKelly(p, q);                // quarter-Kelly fraction
  const stake = f * bankroll;
  const edge = p - q;
  const hasEdge = edge > 0;

  return (
    <Wrap>
      <Header title="Sizing Desk" sub={<>How much to bet · <Link to="/ossoff" className="text-ember no-underline">OSSOFF DESK</Link></>} />

      <Section n="01" title="How much should you bet?" dek="quarter-Kelly, live">
        <Lead>There's a formula (Kelly) for the biggest bet the math justifies. We use a quarter of it, because every input is a guess. Set your numbers:</Lead>
        <div className="bg-paper2 border border-rule rounded-md p-4 space-y-4">
          <Slider label="What YOU think the real chance is" value={belief} set={setBelief} min={1} max={99} suffix="%" />
          <Slider label="What the market charges" value={price} set={setPrice} min={1} max={99} suffix="¢" />
          <div className="flex items-center justify-between gap-3 text-[14px]">
            <span className="text-ink2">Your bankroll for this theme</span>
            <span className="mono">$ <input type="number" value={bankroll} onChange={(e) => setBankroll(+e.target.value)} className="w-24 text-right bg-paper2 border border-rule rounded px-2 py-1.5" /></span>
          </div>
        </div>

        <Facts>
          <Fact label="Your edge" value={hasEdge ? "+" + (edge * 100).toFixed(0) + "¢" : (edge * 100).toFixed(0) + "¢"} sub="belief minus price" tone={hasEdge ? "gain" : "loss"} />
          <Fact label="Quarter-Kelly stake" value={hasEdge ? money(stake) : "$0"} sub={hasEdge ? (f * 100).toFixed(1) + "% of bankroll" : "no edge — no bet"} />
          <Fact label="Full-Kelly would say" value={hasEdge ? money(stake * 4) : "$0"} sub="4× more — we don't" />
        </Facts>

        {!hasEdge && <div className="mono text-[12px] px-3 py-2 rounded bg-[#332119] text-ember">No edge: you think it's less likely than the price implies. Bet the other side, or skip it.</div>}
      </Section>

      <Section n="02" title="Why a quarter" dek="not full Kelly">
        <List>
          <Item><b>Full Kelly is the theoretical max</b> — the bet that grows your bankroll fastest if every number is exactly right.</Item>
          <Item><b>Your numbers are never exactly right.</b> Betting full Kelly on a wrong estimate is how bankrolls blow up. A quarter keeps the growth, cuts the ruin risk.</Item>
          <Item><b>In practice:</b> if a bet feels big, halve it, then halve it again. That's roughly quarter-Kelly by feel.</Item>
        </List>
      </Section>

      <Section n="03" title="Hedging, plainly" dek="the wedge is a portfolio">
        <List>
          <Item><b>The Wedge is already a hedge</b> — two opposing legs that cancel except in one world. That's portfolio construction, not a single bet.</Item>
          <Item><b>Sizing across correlated bets</b> is the next layer: two bets that move together aren't twice the diversification, they're almost one bet. Treat them as such.</Item>
          <Item><b>Coming next:</b> a multi-bet sizer that accounts for correlation between the Ossoff, polling, and midterm positions.</Item>
        </List>
        <Note>The Ossoff desk applies a theme cap; this desk is the math behind it.</Note>
      </Section>

      <Footer desk="Sizing Desk" />
    </Wrap>
  );
}

function Slider({ label, value, set, min, max, suffix }: { label: string; value: number; set: (n: number) => void; min: number; max: number; suffix: string }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[14px] text-ink2 flex-1 min-w-[160px]">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => set(+e.target.value)} className="flex-1 sm:flex-none sm:w-48 accent-ember" />
      <b className="mono text-[14px] min-w-[44px] text-right">{value}{suffix}</b>
    </div>
  );
}
