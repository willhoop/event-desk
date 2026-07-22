import { useState } from "react";

export interface TickerSeg { html: string; href?: string }
export type TickerInput = string | TickerSeg;

const norm = (s: TickerInput): TickerSeg => (typeof s === "string" ? { html: s } : s);

// The crawl. Segments can carry a link out to the venue the price came from.
// A moving target is hard to hit, so the animation pauses on hover and on touch
// — otherwise tapping a link on a phone is a coin flip.
export function Ticker({ segments }: { segments: TickerInput[] }) {
  const [held, setHeld] = useState(false);
  const content = segments.length ? segments.map(norm) : [{ html: "CONNECTING TO THE MARKETS…" }];
  const doubled = [...content, ...content];

  return (
    <div
      className="overflow-hidden border-b border-rule py-2.5 whitespace-nowrap mono text-[12px] tracking-[0.04em]"
      onTouchStart={() => setHeld(true)}
      onTouchEnd={() => setHeld(false)}
      onTouchCancel={() => setHeld(false)}
    >
      <div
        className="inline-block whitespace-nowrap animate-[crawl_60s_linear_infinite] hover:[animation-play-state:paused]"
        style={held ? { animationPlayState: "paused" } : undefined}
      >
        {doubled.map((s, i) => (
          <span key={i} className="whitespace-nowrap">
            <span className="text-ember/60 mx-7 align-middle">◆</span>
            {s.href ? (
              <a
                href={s.href} target="_blank" rel="noreferrer"
                title="Open this market on the venue"
                className="no-underline hover:underline underline-offset-[3px] decoration-ember/70 cursor-pointer"
                dangerouslySetInnerHTML={{ __html: s.html + ' <span style="color:#8a9099">↗</span>' }}
              />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: s.html }} />
            )}
          </span>
        ))}
      </div>
      <style>{`@keyframes crawl{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
