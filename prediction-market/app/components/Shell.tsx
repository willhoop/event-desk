import { Link } from "react-router-dom";
import { Ticker, TickerInput } from "./Ticker";
import { ReactNode } from "react";

export function Logo({ size = 52, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" aria-hidden="true" className={className} style={{ flex: "none" }}>
      <rect x="42" y="14" width="26" height="26" fill="#2a2e34" transform="rotate(45 55 27)" />
      <rect x="14" y="42" width="26" height="26" fill="#2a2e34" transform="rotate(45 27 55)" />
      <rect x="70" y="42" width="26" height="26" fill="#2a2e34" transform="rotate(45 83 55)" />
      <rect x="42" y="70" width="26" height="26" fill="#e2572b" transform="rotate(45 55 83)" />
    </svg>
  );
}

// The masthead is sticky, so its height is a permanent tax on the screen. On a
// phone that budget is small: one line of title, the rail underneath it, and no
// 40px type wrapping "The Presidency" onto two lines.
export function Mast({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="border-b-[3px] border-double border-ink pt-3 pb-2 sm:pt-6 sm:pb-4">
      <div className="flex items-center gap-2.5 sm:gap-4">
        <Link to="/" title="Elite Four Capital — home" className="shrink-0 leading-[0]">
          <Logo size={52} className="w-[30px] h-[30px] sm:w-[52px] sm:h-[52px]" />
        </Link>
        <Link to="/" className="no-underline text-ink min-w-0">
          <div className="mono text-[9px] sm:text-[10.5px] tracking-[0.3em] uppercase text-ember">Elite Four Capital</div>
          <h1 className="serif text-[clamp(21px,6.2vw,34px)] leading-[1.1] my-0 sm:my-[2px] whitespace-nowrap">{title}</h1>
        </Link>
        <div className="mono text-[11px] uppercase tracking-[0.06em] text-faint self-end pb-1 ml-3 hidden sm:block">{sub}</div>
      </div>
      {/* Below the title on a phone, where it gets a full line instead of a
          four-line column squeezed against the right edge. */}
      <div className="mono text-[10px] uppercase tracking-[0.06em] text-faint mt-1.5 sm:hidden truncate">{sub}</div>
    </div>
  );
}

export function Header({ title, sub, ticker }: { title: string; sub: ReactNode; ticker?: TickerInput[] }) {
  return (
    <div className="sticky top-0 z-40">
      {/* Full-bleed opaque backdrop. The masthead sits inside the 800px measure,
          but `Wide` content is wider than that — without this it slides past the
          header on both sides and the masthead reads as a floating box. */}
      <span aria-hidden className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen bg-paper" />
      <div className="relative">
        <Mast title={title} sub={sub} />
        {ticker && <Ticker segments={ticker} />}
      </div>
    </div>
  );
}

// Breakout: let a genuinely wide element (chart, heatmap) escape the 800px
// measure without widening the prose around it. Centers on the viewport.
export function Wide({ children }: { children: ReactNode }) {
  return <div className="relative left-1/2 -translate-x-1/2 w-[min(1080px,94vw)]">{children}</div>;
}

export function Section({ n, title, dek, children }: { n: string; title: string; dek: string; children: ReactNode }) {
  return (
    <section className="pb-2">
      <div className="flex items-baseline gap-3.5 border-t-[3px] border-double border-ink pt-4 mt-6 mb-3">
        <span className="mono text-[11px] text-ember tracking-[0.28em]">{n}</span>
        <span className="serif text-[27px] font-bold">{title}</span>
        <span className="mono text-[10.5px] text-faint uppercase tracking-[0.08em] ml-auto hidden sm:block">{dek}</span>
      </div>
      {children}
    </section>
  );
}

// Measured newspaper column: ~800px keeps the eye's travel short (NYT-style),
// with the page breathing into whitespace on both sides. Change here → every desk.
// `wide` opts into the full 1100px directory width — used by the front page,
// which is a grid of desks, not a single article to read straight down.
export function Wrap({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={(wide ? "max-w-[1100px]" : "max-w-[800px]") + " mx-auto px-4 sm:px-[22px] pb-20"}>{children}</div>;
}

export function Footer({ desk }: { desk: string }) {
  return (
    <footer className="border-t-[3px] border-double border-ink mt-[52px] pt-[18px] pb-14 mono text-[11px] text-faint uppercase tracking-[0.04em]">
      Elite Four Capital · {desk} · Polymarket live · Kalshi via server refresh · Educational, not investment advice · Built to the{" "}
      <Link to="/style" className="text-ember no-underline">style guide</Link>
    </footer>
  );
}
