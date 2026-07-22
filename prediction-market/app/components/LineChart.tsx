import { useState, useRef, useEffect } from "react";

export interface Series { key: string; name: string; color: string; pts: { t: number; v: number }[]; }

function smooth(P: [number, number][]): string {
  if (P.length < 3) return P.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  let d = "M" + P[0][0].toFixed(1) + "," + P[0][1].toFixed(1);
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

// Measure the real rendered width so the SVG can be drawn 1:1 in CSS pixels.
// The old chart used a fixed 1000-unit viewBox with preserveAspectRatio="none",
// which squashed every line, label and dot horizontally on a phone.
//
// Three independent signals feed this, because any one of them can be missing:
// a synchronous first measure (the only thing that matters on a cold phone
// load), a ResizeObserver, and a window resize/orientation listener.
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => {
      const next = el.getBoundingClientRect().width;
      setW((prev) => (Math.abs(prev - next) > 0.5 ? next : prev));
    };
    set();
    // A second pass after layout settles — fonts and the sticky masthead can
    // shift the measure between mount and first paint.
    const raf = requestAnimationFrame(set);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(set);
      ro.observe(el);
    }
    window.addEventListener("resize", set);
    window.addEventListener("orientationchange", set);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", set);
      window.removeEventListener("orientationchange", set);
    };
  }, []);
  return [ref, w] as const;
}

// Narrow is a viewport question, not a container question, so ask the viewport
// directly. matchMedia is reliable where ResizeObserver may not fire.
function useNarrow(px = 560) {
  const q = `(max-width: ${px}px)`;
  const [n, setN] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setN(m.matches);
    on();
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, [q]);
  return n;
}

export function LineChart({ series, unit = "%", defaultVisible }: { series: Series[]; unit?: string; defaultVisible?: number }) {
  const [box, W0] = useWidth();
  const narrow = useNarrow();
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Record<string, boolean>>(() => {
    if (defaultVisible == null) return {};
    const h: Record<string, boolean> = {};
    series.forEach((s, i) => { if (i >= defaultVisible) h[s.key] = true; });
    return h;
  });

  // Fall back to the viewport when the container measure is unavailable, so the
  // chart is never drawn at a width it isn't actually being shown at.
  const W = W0 || (typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 1046) : 720);
  const H = narrow ? 232 : 296;
  // On a phone there is no room for a label gutter, so end-of-line labels are
  // dropped and the live value is shown on the legend chip instead.
  const L = narrow ? 34 : 46;
  const R = W - (narrow ? 10 : 128);
  const T = 14, B = H - 30;

  const vis = series.filter((s) => !hidden[s.key]);
  const allV = vis.flatMap((s) => s.pts.map((p) => p.v));
  const allT = series.flatMap((s) => s.pts.map((p) => p.t));
  if (!allT.length) return <div ref={box} className="mono text-xs text-faint py-16 text-center">loading…</div>;

  let mn = allV.length ? Math.min(...allV) : 0, mx = allV.length ? Math.max(...allV) : 10;
  const pad = (mx - mn) * 0.15 || 1; mn = Math.max(0, mn - pad); mx += pad;
  const t0 = Math.min(...allT), t1 = Math.max(...allT);
  const X = (t: number) => L + ((t - t0) / ((t1 - t0) || 1)) * (R - L);
  const Y = (v: number) => B - ((v - mn) / ((mx - mn) || 1)) * (B - T);

  const lines = narrow ? 3 : 4;
  const step = Math.max(1, Math.ceil((mx - mn) / lines / 5) * 5);
  const grid: number[] = [];
  for (let g = Math.ceil(mn / step) * step; g <= mx; g += step) grid.push(g);

  const ref = vis[0]?.pts || series[0]?.pts || [];
  let hi = -1;
  if (hoverX != null && ref.length) {
    let bd = Infinity;
    ref.forEach((p, i) => { const d = Math.abs(X(p.t) - hoverX); if (d < bd) { bd = d; hi = i; } });
  }
  const hoverT = hi >= 0 ? ref[hi].t : null;
  const nearVal = (s: Series) => {
    if (hoverT == null || !s.pts.length) return null;
    let b = s.pts[0], bd = Infinity;
    for (const p of s.pts) { const d = Math.abs(p.t - hoverT); if (d < bd) { bd = d; b = p; } }
    return b;
  };

  const tipRows = hoverT != null ? vis.map((s) => ({ s, p: nearVal(s)! })).filter((r) => r.p) : [];
  const xx = hoverT != null ? X(hoverT) : 0;
  const tipW = 172, tipH = tipRows.length * 20 + 26;
  const tipX = Math.max(4, Math.min(xx > (L + R) / 2 ? xx - tipW - 14 : xx + 14, W - tipW - 4));
  // Anchor the card beside the points it describes instead of pinning it to the
  // top of the plot, so your eye never has to travel to read the value.
  const anchor = tipRows.length ? tipRows.reduce((a, r) => a + Y(r.p.v), 0) / tipRows.length : T;
  const tipY = Math.max(T, Math.min(anchor - tipH / 2, B - tipH));

  const track = (clientX: number, el: SVGSVGElement) => {
    const r = el.getBoundingClientRect();
    setHoverX(clientX - r.left);
  };
  const lastOf = (s: Series) => s.pts[s.pts.length - 1];
  const lastYs: number[] = [];

  return (
    <div ref={box}>
      {/* Phone scrub readout — sits above the plot so a finger never covers it.
          Holds its height whether or not you're scrubbing, so nothing jumps. */}
      {narrow && (
        <div className="flex items-center gap-3 flex-wrap min-h-[26px] mb-1.5">
          {hoverT != null ? (
            <>
              <span className="mono text-[10.5px] text-faint uppercase tracking-[0.06em]">
                {new Date(hoverT).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
              {tipRows.map((r) => (
                <span key={r.s.key} className="serif text-[15px]" style={{ color: r.s.color }}>
                  {r.s.name} <b>{r.p.v.toFixed(1)}{unit}</b>
                </span>
              ))}
            </>
          ) : (
            <span className="mono text-[10.5px] text-faint uppercase tracking-[0.06em]">Drag across the chart to read any day</span>
          )}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
        style={{ touchAction: "pan-y", display: "block" }}
        onMouseMove={(e) => track(e.clientX, e.currentTarget)}
        onMouseLeave={() => setHoverX(null)}
        onTouchStart={(e) => track(e.touches[0].clientX, e.currentTarget)}
        onTouchMove={(e) => track(e.touches[0].clientX, e.currentTarget)}
        onTouchEnd={() => setHoverX(null)}
      >
        {grid.map((g) => (
          <g key={g}>
            <line x1={L} y1={Y(g)} x2={R} y2={Y(g)} stroke="#343941" strokeWidth={1} opacity={0.55} />
            <text x={L - 7} y={Y(g) + 4} textAnchor="end" fontSize={narrow ? 10 : 11} fill="#8a9099" className="mono">{g}{unit}</text>
          </g>
        ))}

        {vis.map((s) => (
          <path key={s.key} d={smooth(s.pts.map((p) => [X(p.t), Y(p.v)]))}
            fill="none" stroke={s.color} strokeWidth={narrow ? 2 : 2.25} strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {vis.map((s) => {
          const last = lastOf(s); if (!last) return null;
          const y = Y(last.v);
          if (narrow) return <circle key={s.key + "e"} cx={X(last.t)} cy={y} r={3.5} fill={s.color} />;
          let sh = 0;
          lastYs.forEach((py) => { if (Math.abs(y + sh - py) < 18) sh += y + sh >= py ? 18 : -18; });
          lastYs.push(y + sh);
          return (
            <g key={s.key + "e"}>
              <circle cx={R} cy={y} r={4} fill={s.color} />
              <text x={R + 8} y={y + sh + 4} fontSize={13} fill={s.color} className="serif">{s.name} {last.v.toFixed(1)}{unit}</text>
            </g>
          );
        })}

        {hoverT != null && (
          <g pointerEvents="none">
            <line x1={xx} y1={T} x2={xx} y2={B} stroke="#8a9099" strokeWidth={1} strokeDasharray="3 4" />
            {tipRows.map((r) => (
              <circle key={r.s.key} cx={xx} cy={Y(r.p.v)} r={narrow ? 5.5 : 4.5} fill={r.s.color} stroke="#16181c" strokeWidth={2} />
            ))}
            {/* On a phone the floating card sits under your thumb, so the values
                go to the readout bar above the chart instead. */}
            {!narrow && (
              <>
                <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={6} fill="#1f2226" stroke="#343941" />
                <text x={tipX + 11} y={tipY + 18} fontSize={12} fill="#8a9099" className="mono">
                  {new Date(hoverT).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </text>
                {tipRows.map((r, i) => (
                  <text key={r.s.key} x={tipX + 11} y={tipY + 40 + i * 20} fontSize={13} fill={r.s.color} className="serif">
                    {r.s.name} <tspan fontWeight="bold">{r.p.v.toFixed(1)}{unit}</tspan>
                  </text>
                ))}
              </>
            )}
          </g>
        )}
      </svg>

      <div className="flex flex-wrap gap-2 mt-3">
        {series.map((s) => {
          const last = lastOf(s);
          const off = hidden[s.key];
          return (
            <button key={s.key} onClick={() => setHidden((h) => ({ ...h, [s.key]: !h[s.key] }))}
              className={"mono text-[10.5px] uppercase tracking-[0.06em] border rounded-full px-3 py-2 min-h-[38px] flex items-center gap-2 transition-colors " +
                (off ? "border-rule border-dashed opacity-45 text-faint" : "border-rule bg-paper2 text-ink2 hover:border-ink2")}>
              <span className="inline-block w-3.5 h-[3px] rounded-full" style={{ background: s.color, opacity: off ? 0.4 : 1 }} />
              {s.name}
              {last && !off && <b className="serif text-[13px] normal-case" style={{ color: s.color }}>{last.v.toFixed(1)}{unit}</b>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
