import { useEffect, useState } from "react";
import { fetchMarket, fetchHistory } from "../engine/polymarket";
import { Series } from "./components/LineChart";

export interface HSpec { slug: string; name: string; color: string; }

// Fetch price history for a set of Polymarket markets and shape into LineChart series.
export function useHistory(specs: HSpec[], interval = "1m", fidelity = "360"): { series: Series[]; loading: boolean } {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const dep = specs.map((s) => s.slug).join("|");
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const out: Series[] = [];
      for (const sp of specs) {
        const m = await fetchMarket(sp.slug);
        if (!m.tok) continue;
        const h = await fetchHistory(m.tok, interval, fidelity);
        if (h.length) out.push({ key: sp.slug, name: sp.name, color: sp.color, pts: h.map((x) => ({ t: x.t * 1000, v: x.p * 100 })) });
      }
      if (alive) { setSeries(out); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [dep, interval, fidelity]);
  return { series, loading };
}
