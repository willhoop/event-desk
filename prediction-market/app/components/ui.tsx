import { ReactNode } from "react";

// ---- Article primitives: the single source of truth every desk composes from. ----
// Documented live on the Style Guide. Change a token here → every desk updates.

export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-ink2 text-[15px] leading-[1.55] mb-3 max-w-[70ch]">{children}</p>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mono text-[11px] text-faint mt-2 leading-[1.5]">{children}</p>;
}

// Boxed list — bold serif lead-in, ≤2 sentences per row. Never an essay.
export function List({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper2 border border-rule rounded-md my-3 [&>div]:px-4 [&>div]:py-3 [&>div]:border-b [&>div]:border-rule [&>div:last-child]:border-b-0 [&_b]:text-ink [&_b]:font-serif">
      {children}
    </div>
  );
}
export function Item({ children }: { children: ReactNode }) {
  return <div className="text-[14px] leading-[1.55] text-ink2">{children}</div>;
}

// Fact cards — one number each, mono label above/below.
export function Facts({ children }: { children: ReactNode }) {
  return <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 my-3.5">{children}</div>;
}
export function Fact({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone?: "gain" | "loss" }) {
  const color = tone === "gain" ? "#4a9e7f" : tone === "loss" ? "#e2572b" : undefined;
  return (
    <div className="bg-paper2 border border-rule rounded-md p-4">
      <div className="mono text-[10px] uppercase text-faint tracking-[0.06em]">{label}</div>
      <div className="serif text-[26px] my-0.5" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="mono text-[10px] uppercase text-faint tracking-[0.06em]">{sub}</div>}
    </div>
  );
}

export function Badge({ children, kind = "neutral" }: { children: ReactNode; kind?: "pick" | "neutral" | "gain" | "loss" }) {
  const cls = kind === "pick" ? "bg-gold text-[#16181c]" : kind === "gain" ? "bg-[#1d2b26] text-green" : kind === "loss" ? "bg-[#332119] text-ember" : "bg-chip text-ink2";
  return <span className={"mono text-[9.5px] uppercase px-2 py-0.5 rounded-full " + cls}>{children}</span>;
}

// Verdict banner — green = go/gain, ember = wait/loss. Normal weight; numbers bold.
export function Verdict({ good, children }: { good: boolean; children: ReactNode }) {
  return (
    <div className={"rounded-md p-4 my-3 serif text-[16.5px] leading-[1.5] border [&_b]:font-bold " +
      (good ? "bg-[#1d2b26] text-green border-green" : "bg-[#332119] text-ember border-ember")}>
      {children}
    </div>
  );
}

// Responsive table wrapper — side-scrolls on mobile, never squishes.
export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full text-[13.5px] border-collapse min-w-[520px]">
        <thead><tr className="mono text-[12px] uppercase text-faint text-left border-b border-rule">{head}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// Bar row — visual magnitude instead of a dense cell.
export function BarRow({ title, badge, right, bar, foot }: { title: ReactNode; badge?: { text: string; kind?: "pick" | "neutral" }; right?: ReactNode; bar: number; foot?: ReactNode }) {
  return (
    <div className="bg-paper2 border border-rule rounded-md p-3.5">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <span className="serif font-bold text-[16px]">{title}{badge && <> <Badge kind={badge.kind}>{badge.text}</Badge></>}</span>
        {right && <span className="mono text-[13px] text-ink2">{right}</span>}
      </div>
      <div className="h-2 rounded bg-chip overflow-hidden"><div className="h-full bg-ember/70" style={{ width: `${Math.max(2, Math.min(100, bar))}%` }} /></div>
      {foot && <div className="text-[13px] text-ink2 mt-1.5">{foot}</div>}
    </div>
  );
}

// Loading / empty / error states — consistent, no layout shift.
export function Loading({ label = "loading…" }: { label?: string }) {
  return <div className="mono text-xs text-faint py-10 text-center">{label}</div>;
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="mono text-[12px] text-faint py-8 text-center border border-dashed border-rule rounded-md">{children}</div>;
}
