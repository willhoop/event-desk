import { FieldMarket } from "../../engine/polymarket";
import { teamColor, shortTeam, payout } from "../../engine/sports";

// A one-dimensional field board. Price is the bar; the week's move is the
// number beside it, because on a board like this the move is the story.
export function OddsBoard({
  rows, selected, onSelect, max,
}: {
  rows: FieldMarket[];
  selected: string | null;
  onSelect: (name: string) => void;
  max?: number;
}) {
  const shown = max ? rows.slice(0, max) : rows;
  const peak = Math.max(...shown.map((r) => r.px), 0.05);

  return (
    <div className="divide-y divide-rule border-y border-rule">
      {shown.map((r) => {
        const on = r.name === selected;
        const c = teamColor(r.name);
        const mv = r.w1;
        const up = mv > 0;
        return (
          <button key={r.name} onClick={() => onSelect(r.name)}
            className={"w-full text-left px-2 py-2.5 relative transition-colors " + (on ? "bg-[#26292e]" : "hover:bg-[#212429]")}>
            {on && <span className="absolute left-0 inset-y-0 w-[3px] bg-ember" />}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
              <span className="serif text-[15px] text-ink shrink-0 max-w-[38%] truncate">{shortTeam(r.name)}</span>

              <span className="flex-1 min-w-[30px] h-1.5 rounded-full bg-chip overflow-hidden relative mx-1">
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(r.px / peak) * 100}%`, background: c }} />
              </span>

              {Math.abs(mv) >= 0.005 && (
                <span className={"mono text-[10.5px] shrink-0 tabular-nums " + (up ? "text-green" : "text-ember")}>
                  {up ? "▲" : "▼"}{Math.abs(mv * 100).toFixed(0)}
                </span>
              )}
              {/* Price renders pure white so it can never be read as a team hue. */}
              <b className="serif text-[15px] text-ink shrink-0 w-[46px] text-right tabular-nums">
                {(r.px * 100).toFixed(r.px < 0.1 ? 1 : 0)}¢
              </b>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// The movers strip — a diverging bar chart of the week's price changes. This is
// the "what happened" view: one glance tells you where the money went.
export function Movers({ rows }: { rows: FieldMarket[] }) {
  const top = rows.slice(0, 6);
  if (!top.length) {
    return <p className="mono text-[11.5px] text-faint py-6 text-center">nothing moved more than a cent this week.</p>;
  }
  const peak = Math.max(...top.map((r) => Math.abs(r.w1)), 0.02);

  return (
    <div className="space-y-2">
      {top.map((r) => {
        const up = r.w1 > 0;
        const w = (Math.abs(r.w1) / peak) * 50; // half-width each side of centre
        return (
          <div key={r.name} className="flex items-center gap-2">
            <span className="serif text-[13.5px] text-ink2 w-[86px] shrink-0 truncate text-right">{shortTeam(r.name)}</span>
            <div className="flex-1 h-6 relative bg-chip/40 rounded">
              <span className="absolute inset-y-0 left-1/2 w-px bg-rule" />
              <span
                className="absolute inset-y-[5px] rounded-sm"
                style={{
                  background: up ? "#4a9e7f" : "#e2572b",
                  left: up ? "50%" : `${50 - w}%`,
                  width: `${w}%`,
                }}
              />
            </div>
            <span className={"mono text-[12px] w-[52px] shrink-0 tabular-nums " + (up ? "text-green" : "text-ember")}>
              {up ? "+" : "−"}{Math.abs(r.w1 * 100).toFixed(0)}¢
            </span>
          </div>
        );
      })}
      <p className="mono text-[10px] text-faint pt-1">Change over the last 7 days. Green = money coming in, ember = money leaving.</p>
    </div>
  );
}

// A single focused outcome: price, what it pays, and how far it has travelled.
export function FocusCard({ row }: { row: FieldMarket }) {
  const c = teamColor(row.name);
  const mult = payout(row.px);
  const Stat = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
    <div>
      <div className="mono text-[9.5px] uppercase tracking-[0.08em] text-faint">{label}</div>
      <div className="serif text-[20px] leading-tight" style={tone ? { color: tone } : undefined}>{value}</div>
    </div>
  );
  const chg = (v: number, label: string) => (
    <Stat label={label} value={`${v >= 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(0)}¢`} tone={v >= 0 ? "#4a9e7f" : "#e2572b"} />
  );

  return (
    <div className="bg-paper2 border border-rule rounded-md p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
        <span className="serif text-[21px] text-ink">{row.name}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Price" value={`${(row.px * 100).toFixed(1)}¢`} />
        <Stat label="$100 returns" value={`$${(100 * mult).toFixed(0)}`} />
        {chg(row.w1, "7 days")}
        {chg(row.m1, "30 days")}
      </div>
    </div>
  );
}
