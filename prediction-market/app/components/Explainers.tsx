import { useState } from "react";
import { FEE_COEFF } from "../../engine/pricing";
import { Table, List, Item, Lead, Note } from "./ui";

// Fee as a share of stake at a given price, per venue — computed, not hardcoded.
export function FeeTable() {
  const prices = [0.03, 0.14, 0.5, 0.9];
  const labels = ["3¢ — deep longshot", "14¢ — Ossoff today", "50¢ — toss-up", "90¢ — favorite"];
  const feePct = (p: number, coeff: number) => (coeff * (1 - p) * 100).toFixed(1) + "%";
  return (
    <>
      <Lead>Both stores charge coefficient × price × (1 − price). As a share of your stake the fee bites hardest on cheap longshots. Resting limit orders pay zero.</Lead>
      <Table head={<><th className="py-2 pr-2">Contract price</th><th className="py-2 px-2 text-right">Kalshi fee</th><th className="py-2 px-2 text-right">Polymarket fee</th></>}>
        {prices.map((p, i) => (
          <tr key={p} className="border-b border-rule">
            <td className="py-2 pr-2"><b className="serif text-ink">{labels[i]}</b></td>
            <td className="py-2 px-2 text-right text-ember">{feePct(p, FEE_COEFF.kalshi)}</td>
            <td className="py-2 px-2 text-right text-green">{feePct(p, FEE_COEFF.poly)}</td>
          </tr>
        ))}
      </Table>
      <Note>When do fees kill a crossed trade? House rule: your estimated edge must be at least twice the fee. Longshots rarely clear that bar — rest a limit order instead.</Note>
    </>
  );
}

// Tax scenarios — $500 wins, $300 losses, $200 real profit.
export function TaxTable() {
  return (
    <>
      <Lead>Yes, losses offset — if you defend the right treatment. Say a year of trading makes $500 of wins and $300 of losses ($200 real profit):</Lead>
      <Table head={<><th className="py-2 pr-2">Treatment</th><th className="py-2 px-2 text-right">Taxable</th><th className="py-2 px-2 text-right">Tax (24%)</th><th className="py-2 px-2 text-right">You keep</th></>}>
        <tr className="border-b border-rule"><td className="py-2 pr-2"><b className="serif text-ink">Capital gains</b> — losses offset fully</td><td className="py-2 px-2 text-right">$200</td><td className="py-2 px-2 text-right">$48</td><td className="py-2 px-2 text-right text-green">$152</td></tr>
        <tr className="border-b border-rule"><td className="py-2 pr-2"><b className="serif text-ink">Gambling, itemizing</b> — 90% of losses deduct</td><td className="py-2 px-2 text-right">$230</td><td className="py-2 px-2 text-right">$55</td><td className="py-2 px-2 text-right">$145</td></tr>
        <tr className="border-b border-rule"><td className="py-2 pr-2"><b className="serif text-ink">Gambling, standard deduction</b> — losses deduct $0</td><td className="py-2 px-2 text-right">$500</td><td className="py-2 px-2 text-right">$120</td><td className="py-2 px-2 text-right text-ember">$80</td></tr>
      </Table>
      <List>
        <Item><b>The strategy:</b> defend capital treatment. Losses then offset gains dollar-for-dollar, plus $3,000/yr against ordinary income, carried forward.</Item>
        <Item><b>What defends it:</b> complete fill records (the tracker's CSV), consistent treatment every year, and selling early sometimes — traders sell, gamblers hold to the end.</Item>
        <Item><b>Not tax advice</b> — the IRS hasn't ruled on event contracts. Bring the records to a CPA.</Item>
      </List>
    </>
  );
}

const CHECKS = [
  ["The outcome is a hard fact, not an opinion.", "Someone wins the election or they don't — no judgment call by the venue."],
  ["The rules spell out ties, voids, cancellations, and dropouts, in writing.", "Uncovered endings usually resolve NO, not refund. Never assume."],
  ["Nobody trading can rig the result.", "Millions of voters decide an election. \"Will X tweet by Friday\" fails."],
  ["One official source decides, and the rules name it.", "Certified results or an official number — not two sources that could disagree."],
  ["There is a hard deadline.", "You know the worst-case date your money comes back."],
  ["You can get out early.", "Enough daily volume that selling before resolution is realistic."],
  ["The venue itself will still be standing.", "Regulation and counterparty risk — the last thing to check."],
];

// Interactive: tick each box; the verdict updates.
export function InvestabilityChecklist() {
  const [on, setOn] = useState<boolean[]>(CHECKS.map(() => false));
  const passed = on.filter(Boolean).length;
  const toggle = (i: number) => setOn((xs) => xs.map((v, j) => (j === i ? !v : v)));
  return (
    <>
      <Lead>Our house rule. A market has to pass all seven or it doesn't go on the board — no matter how good the price looks. Tick what it clears:</Lead>
      <div className="bg-paper2 border border-rule rounded-md my-3">
        {CHECKS.map(([t, d], i) => (
          <button key={i} onClick={() => toggle(i)} className="w-full text-left flex gap-3 px-4 py-3 border-b border-rule last:border-b-0 items-start hover:bg-white/[0.02]">
            <span className={"mt-0.5 w-5 h-5 rounded shrink-0 border flex items-center justify-center text-[12px] " + (on[i] ? "bg-green border-green text-[#16181c]" : "border-faint text-transparent")}>✓</span>
            <span className="text-[14px] leading-[1.5] text-ink2"><b className="text-ink font-serif">{t}</b> {d}</span>
          </button>
        ))}
      </div>
      <div className={"mono text-[12px] px-3 py-2 rounded " + (passed === 7 ? "bg-[#1d2b26] text-green" : "bg-chip text-ink2")}>
        {passed === 7 ? "All seven clear — investable." : `${passed}/7 clear — ${7 - passed} to go before it belongs on the board.`}
      </div>
    </>
  );
}
