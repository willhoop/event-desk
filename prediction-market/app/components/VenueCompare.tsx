import { allInCost, FEE_COEFF } from "../../engine/pricing";
import { cents } from "../../engine/format";

export function VenueCompare({ polyYes, kalYes, months = 3, discount = 0.05 }: { polyYes: number | null; kalYes: number | null; months?: number; discount?: number }) {
  if (polyYes == null || kalYes == null) return <div className="mono text-xs text-faint py-6">loading prices…</div>;
  const feeP = allInCost(polyYes, "poly") - polyYes;
  const penAmt = allInCost(polyYes, "poly") * discount;
  const aP = allInCost(polyYes, "poly") + penAmt;
  const feeK = allInCost(kalYes, "kalshi") - kalYes;
  const interest = kalYes * 0.0325 * months / 12;
  const aK = allInCost(kalYes, "kalshi") - interest;
  const polyWins = aP < aK;
  return (
    <div className="grid md:grid-cols-2 gap-3.5 my-3">
      <Card name="Polymarket" win={polyWins}>
        <Line label="live price" val={cents(polyYes, 1)} />
        <Line label="trading fee" val={"+" + cents(feeP, 2)} />
        <Line label="your risk discount" val={"+" + cents(penAmt, 2)} />
        <Tot label="true cost" val={cents(aP, 2)} />
        <Tot label="pays if right" val={(1 / aP).toFixed(2) + "×"} faint />
      </Card>
      <Card name="Kalshi" win={!polyWins}>
        <Line label="price (from their site)" val={cents(kalYes, 1)} />
        <Line label="trading fee" val={"+" + cents(feeK, 2)} />
        <Line label={`interest credit (${months}mo @3.25%)`} val={"−" + cents(interest, 2)} />
        <Tot label="true cost" val={cents(aK, 2)} />
        <Tot label="pays if right" val={(1 / aK).toFixed(2) + "×"} faint />
      </Card>
    </div>
  );
}
const Card = ({ name, win, children }: { name: string; win: boolean; children: React.ReactNode }) => (
  <div className={"bg-paper2 border rounded-md p-4 " + (win ? "border-green" : "border-rule")}>
    <h4 className="serif text-[18px] mb-2.5 flex justify-between items-center">{name}
      {win && <span className="mono text-[10px] text-green uppercase tracking-[0.08em]">cheaper — buy here</span>}</h4>
    {children}
  </div>
);
const Line = ({ label, val }: { label: string; val: string }) => (
  <div className="flex justify-between text-[13px] py-[7px] border-t border-rule text-ink2"><span>{label}</span><b>{val}</b></div>
);
const Tot = ({ label, val, faint }: { label: string; val: string; faint?: boolean }) => (
  <div className={"flex justify-between pt-2.5 serif " + (faint ? "text-[13px] text-faint pt-1" : "text-[14.5px]")}><span>{label}</span><b>{val}</b></div>
);
