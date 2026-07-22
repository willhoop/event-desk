import { useEffect, useState } from "react";

const GAMMA = "https://gamma-api.polymarket.com";
interface Control { dem: number | null; rep: number | null; }
export interface Midterms { house: Control; senate: Control; loading: boolean; }

async function fetchControl(slug: string): Promise<Control> {
  try {
    const j = await fetch(`${GAMMA}/events?slug=${slug}`).then((r) => r.json());
    const ev = j && j[0];
    if (!ev || !ev.markets) return { dem: null, rep: null };
    let dem: number | null = null, rep: number | null = null;
    for (const m of ev.markets) {
      let p: number | null = null;
      try { const op = typeof m.outcomePrices === "string" ? JSON.parse(m.outcomePrices) : m.outcomePrices; if (op && op.length) p = parseFloat(op[0]); } catch { /* */ }
      const name = (m.groupItemTitle || m.question || "").toLowerCase();
      if (name.includes("democratic")) dem = p;
      else if (name.includes("republican")) rep = p;
    }
    return { dem, rep };
  } catch { return { dem: null, rep: null }; }
}

export function useMidterms(): Midterms {
  const [m, setM] = useState<Midterms>({ house: { dem: null, rep: null }, senate: { dem: null, rep: null }, loading: true });
  useEffect(() => {
    let alive = true;
    const run = async () => {
      const [house, senate] = await Promise.all([
        fetchControl("which-party-will-win-the-house-in-2026"),
        fetchControl("which-party-will-win-the-senate-in-2026"),
      ]);
      if (alive) setM({ house, senate, loading: false });
    };
    run();
    const id = setInterval(run, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return m;
}
