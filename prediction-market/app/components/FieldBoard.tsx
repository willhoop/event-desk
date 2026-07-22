import { useState } from "react";
import { Runner, Party, isThin } from "../../engine/field";
import { cents } from "../../engine/format";

const SHOW = 8;

// The board. One row per runner: a track showing the nomination price with the
// presidency price filled inside it. The empty part of the bar IS the wedge —
// the world where they win the nomination and lose in November.
export function FieldBoard({
  runners, selected, onSelect, pick, party, onParty,
}: {
  runners: Runner[];
  selected: string | null;
  onSelect: (name: string) => void;
  pick: string | null;
  party: Party | "ALL";
  onParty: (p: Party | "ALL") => void;
}) {
  const [all, setAll] = useState(false);
  const shown = runners.filter((r) => (party === "ALL" ? true : r.party === party));
  const list = all ? shown : shown.slice(0, SHOW);
  const maxNom = Math.max(...shown.map((r) => r.nom ?? 0), 0.05);

  return (
    <div>
      <div className="flex gap-1.5 mb-2.5">
        {([["ALL", "All"], ["D", "Dem"], ["R", "GOP"]] as const).map(([p, l]) => (
          <button key={p} onClick={() => { onParty(p as Party | "ALL"); setAll(false); }}
            className={"mono text-[11px] uppercase tracking-[0.08em] rounded-full px-3 py-1.5 min-h-[36px] border transition-colors " +
              (party === p ? "border-ember bg-[#332119] text-ember" : "border-rule text-ink2 hover:border-ink2")}>
            {l}
          </button>
        ))}
        <span className="ml-auto mono text-[10px] uppercase tracking-[0.06em] text-faint self-center">
          {shown.length} quoted
        </span>
      </div>

      <div className="divide-y divide-rule border-y border-rule">
        {list.map((r) => {
          const on = r.name === selected;
          const isPick = r.name === pick;
          const thin = r.conv != null && isThin(r);
          const nomW = ((r.nom ?? 0) / maxNom) * 100;
          const presW = ((r.pres ?? 0) / maxNom) * 100;
          return (
            <button key={r.name} onClick={() => onSelect(r.name)}
              className={"w-full text-left px-2 py-2 transition-colors relative " +
                (on ? "bg-[#26292e]" : "hover:bg-[#212429]")}>
              {on && <span className="absolute left-0 inset-y-0 w-[3px] bg-ember" />}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="serif text-[15px] text-ink shrink-0">{r.last}</span>
                {isPick && <span className="mono text-[8px] uppercase bg-gold text-[#16181c] px-1.5 rounded-full shrink-0">pick</span>}
                {thin && <span className="mono text-[8px] uppercase text-faint border border-rule px-1.5 rounded-full shrink-0">thin</span>}

                {/* Bar takes the slack so the number never drifts far from the name. */}
                <span className="flex-1 min-w-[40px] h-1.5 rounded-full bg-chip overflow-hidden relative mx-1">
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${nomW}%`, background: r.color, opacity: 0.3 }} />
                  <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${presW}%`, background: r.color }} />
                </span>

                <span className="mono text-[10px] text-faint shrink-0 hidden sm:inline tabular-nums">
                  {cents(r.nom, 0)}→{cents(r.pres, 0)}
                </span>
                <b className="serif text-[15px] shrink-0 w-[42px] text-right tabular-nums"
                  style={{ color: r.conv == null ? "#8a9099" : thin ? "#8a9099" : r.color }}>
                  {r.conv != null ? Math.round(r.conv * 100) + "%" : "—"}
                </b>
              </div>
            </button>
          );
        })}
      </div>

      {shown.length > SHOW && (
        <button onClick={() => setAll((a) => !a)}
          className="mono text-[10.5px] uppercase tracking-[0.12em] text-ember hover:text-ink mt-2 min-h-[36px]">
          {all ? "▴ show top 8" : `▾ show all ${shown.length}`}
        </button>
      )}

      <p className="mono text-[10px] text-faint mt-2 leading-[1.65]">
        Bar: faded = nomination price, solid = presidency price. The gap is the nominated-but-loses
        world — that gap is the bet. The % is presidency ÷ nomination.
        <span className="text-faint/75"> THIN = both quotes are only a few cents, so one tick moves
        the ratio twenty points; shown, but never picked and never in the median.</span>
      </p>
    </div>
  );
}
