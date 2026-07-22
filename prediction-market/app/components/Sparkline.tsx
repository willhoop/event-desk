import { useHistory } from "../useHistory";

// Smoothed (Catmull-Rom) path so the thin-market tape reads as a trend, not noise.
function smooth(P: [number, number][]): string {
  if (P.length < 3) return P.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  let d = "M" + P[0][0].toFixed(1) + "," + P[0][1].toFixed(1);
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function Sparkline({ slug, color = "#e2572b", label }: { slug: string; color?: string; label: string }) {
  const { series } = useHistory([{ slug, name: label, color }]);
  const pts = series[0]?.pts || [];
  if (pts.length < 3) return <div className="mono text-[10px] text-faint text-center py-10">loading the tape…</div>;
  const L = 40, R = 300, T = 16, B = 150;
  const vs = pts.map((p) => p.v);
  const rawMn = Math.min(...vs), rawMx = Math.max(...vs);
  const pad = (rawMx - rawMn) * 0.18 || 1;
  const mn = rawMn - pad, mx = rawMx + pad;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const X = (t: number) => L + ((t - t0) / ((t1 - t0) || 1)) * (R - L);
  const Y = (v: number) => T + (1 - (v - mn) / ((mx - mn) || 1)) * (B - T);
  const XY = pts.map((p) => [X(p.t), Y(p.v)] as [number, number]);
  const line = smooth(XY);
  const area = `${line} L${R},${B} L${L},${B} Z`;
  const first = pts[0].v, last = pts[pts.length - 1].v, delta = last - first;
  const days = Math.max(1, Math.round((t1 - t0) / 864e5));
  const up = delta >= 0;
  const gid = "spk-" + slug.replace(/[^a-z0-9]/gi, "");
  return (
    <div>
      <svg viewBox="0 0 340 178" width="100%">
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient></defs>
        {/* high / low reference lines with labels */}
        <line x1={L} y1={Y(rawMx)} x2={R} y2={Y(rawMx)} stroke="#343941" strokeWidth={0.75} strokeDasharray="2 3" />
        <line x1={L} y1={Y(rawMn)} x2={R} y2={Y(rawMn)} stroke="#343941" strokeWidth={0.75} strokeDasharray="2 3" />
        <text x={L - 6} y={Y(rawMx) + 3} textAnchor="end" fontSize={9} fill="#8a9099" className="mono">{rawMx.toFixed(0)}¢</text>
        <text x={L - 6} y={Y(rawMn) + 3} textAnchor="end" fontSize={9} fill="#8a9099" className="mono">{rawMn.toFixed(0)}¢</text>
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth={2.25} strokeLinecap="round" />
        {/* open marker + label */}
        <circle cx={L} cy={Y(first)} r={3} fill="#8a9099" />
        <text x={L} y={B + 16} fontSize={9.5} fill="#8a9099" className="mono">{days}D AGO · {first.toFixed(0)}¢</text>
        {/* current marker + value + change badge */}
        <circle cx={R} cy={Y(last)} r={4.5} fill={color} />
        <text x={R + 6} y={Y(last) - 6} fontSize={17} fontWeight="bold" fill={color} className="serif">{last.toFixed(1)}¢</text>
        <text x={R + 6} y={Y(last) + 11} fontSize={10} fill={up ? "#4a9e7f" : "#e2572b"} className="mono">{up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}¢</text>
        <text x={R} y={B + 16} textAnchor="end" fontSize={9.5} fill="#8a9099" className="mono">TODAY</text>
      </svg>
      <div className="mono text-[10px] text-faint uppercase tracking-[0.08em] text-center mt-1">{label} · live · Polymarket</div>
    </div>
  );
}
