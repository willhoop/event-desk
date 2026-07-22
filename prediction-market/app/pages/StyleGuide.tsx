import { Wrap, Header, Section, Footer } from "../components/Shell";
import { CAND_COLOR } from "../../engine/colors";
import { NAMES } from "../../data/polls";
import { Lead, List, Item, Facts, Fact, Verdict, Badge, BarRow, Note } from "../components/ui";
import { Link } from "react-router-dom";

export default function StyleGuide() {
  const desks = [
    ["/", "Front page", "the newspaper — ticker, lead story, desk directory"],
    ["/ossoff", "Ossoff Desk", "the flagship — tape, lock calculator, venue compare, tracker, fee/tax/checklist"],
    ["/polling", "Polling Desk", "fitted poll model, edge table, pollster scoreboard"],
    ["/polls-data", "Poll Data Desk", "visual leaderboard, conviction slider, house-effects heatmap"],
    ["/electoral", "Electoral Desk", "clickable map, 20k-run simulation"],
    ["/midterms", "Midterms Desk", "live 2026 House & Senate control"],
    ["/sizing", "Sizing Desk", "quarter-Kelly stake calculator"],
  ];
  const swatches = [["Page slate", "#16181c"], ["Card slate", "#1f2226"], ["Ember — brand · loss · WAIT", "#e2572b"], ["Green — gain · LIVE · BUY", "#4a9e7f"], ["Ink", "#eef1f4"]];
  return (
    <Wrap>
      <Header title="Style Guide" sub="The single source of truth · every desk composes from this" />

      <Section n="01" title="The desks" dek="one directory">
        <Lead>Every article is built from the same primitives below, so a new desk is pure composition. The live desks:</Lead>
        <div className="grid sm:grid-cols-2 gap-3 my-3">
          {desks.map(([to, t, d]) => (
            <Link key={to} to={to} className="bg-paper2 border border-rule rounded-md p-4 no-underline text-ink hover:border-ember">
              <div className="serif text-[17px] font-bold">{t}</div>
              <div className="text-[13px] text-ink2 mt-1">{d}</div>
            </Link>
          ))}
        </div>
      </Section>

      <Section n="02" title="Color" dek="slate + ember, never mixed meanings">
        <div className="bg-paper2 border border-rule rounded-md">
          {swatches.map(([n, hex]) => (
            <div key={n} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-rule last:border-b-0 text-[13.5px] text-ink2">
              <span className="w-11 h-[26px] rounded border border-rule" style={{ background: hex }} />{n}
              <code className="mono text-[11.5px] text-faint ml-auto">{hex}</code>
            </div>
          ))}
        </div>
        <Lead><b className="text-ink font-serif">Candidate colors never borrow a semantic color</b> — never ember (loss) or green (gain):</Lead>
        <div className="bg-paper2 border border-rule rounded-md">
          {Object.keys(CAND_COLOR).filter((k) => NAMES[k]).map((k) => (
            <div key={k} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-rule last:border-b-0 text-[13.5px] text-ink2">
              <span className="w-11 h-[26px] rounded" style={{ background: CAND_COLOR[k] }} />{NAMES[k]}
              <code className="mono text-[11.5px] text-faint ml-auto">{CAND_COLOR[k].toUpperCase()}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section n="03" title="The primitives" dek="import, don't restyle">
        <Lead>These live in <code className="mono text-[12px]">components/ui.tsx</code>. Change one here → every desk updates. This is what makes new articles fast.</Lead>

        <Note>Fact cards — one number each:</Note>
        <Facts>
          <Fact label="A number" value="30.0%" sub="with a caption" />
          <Fact label="A gain" value="+7¢" sub="always green" tone="gain" />
          <Fact label="A loss" value="−3¢" sub="always ember" tone="loss" />
        </Facts>

        <Note>Verdict banner — green = go, ember = wait:</Note>
        <Verdict good><b>Locked profit that beats T-bills.</b> Numbers bold, everything else normal weight.</Verdict>
        <Verdict good={false}><b>Cash wins — skip it.</b> Same shape, opposite meaning.</Verdict>

        <Note>Bar row — magnitude, not a dense cell:</Note>
        <div className="space-y-2">
          <BarRow title="The Wedge" badge={{ text: "house pick", kind: "pick" }} right={<>costs 7¢ · pays ≈13×</>} bar={7} foot={<>You win when <b className="text-ink">he's nominated but loses</b>.</>} />
          <BarRow title="He is NOT the nominee" badge={{ text: "contrarian" }} right={<>costs 85¢ · pays 1.17×</>} bar={85} foot={<>You win when <b className="text-ink">someone else is picked</b>.</>} />
        </div>

        <Note>Boxed list — bold serif lead-in, ≤2 sentences, with a badge <Badge>like this</Badge>:</Note>
        <List>
          <Item><b>One point.</b> Kept short — longer than two sentences and it becomes prose or its own section.</Item>
          <Item><b>Another point.</b> Same discipline everywhere.</Item>
        </List>
      </Section>

      <Section n="04" title="The rules" dek="every desk follows these">
        <List>
          <Item><b>Charts, never PowerPoint.</b> Smoothed weekly curves, direct end-labels, controls below the plot, hover everywhere.</Item>
          <Item><b>Open with the best interactive visual.</b> Section 01 is something to touch. The money chart goes high.</Item>
          <Item><b>Verdict colors.</b> BUY/gains green; WAIT/losses ember. Bet names bold serif, never colored.</Item>
          <Item><b>Every number computed, never hardcoded.</b> Live when data allows; labeled a snapshot when not.</Item>
          <Item><b>Mobile ships with every change.</b> Single-column under 720px, side-scrolling tables, 16px inputs. Desktop-only is half a feature.</Item>
          <Item><b>Kalshi is genuinely live.</b> A GitHub Action refreshes prices every 10 minutes into kalshi.json, read same-origin.</Item>
        </List>
      </Section>

      <Footer desk="Style guide" />
    </Wrap>
  );
}
