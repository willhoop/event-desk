import { useEffect, useState } from "react";
import { fetchMarket } from "../engine/polymarket";
import { fetchKalshi, KalshiData } from "../engine/kalshi";

export const SLUGS = {
  nom: "will-jon-ossoff-win-the-2028-democratic-presidential-nomination-885",
  pres: "will-jon-ossoff-win-the-2028-us-presidential-election",
};

export interface LiveState {
  polyNom: number | null;
  polyPres: number | null;
  kalshi: KalshiData;
  loading: boolean;
  stamp: number;
}

export function useLive(): LiveState {
  const [s, setS] = useState<LiveState>({
    polyNom: null, polyPres: null,
    kalshi: { updated: null, nomination: {}, presidency: {}, gopnom: {}, live: false },
    loading: true, stamp: 0,
  });
  useEffect(() => {
    let alive = true;
    const run = async () => {
      const [nom, pres, kalshi] = await Promise.all([
        fetchMarket(SLUGS.nom), fetchMarket(SLUGS.pres), fetchKalshi(),
      ]);
      if (!alive) return;
      setS({ polyNom: nom.yes, polyPres: pres.yes, kalshi, loading: false, stamp: Date.now() });
    };
    run();
    const id = setInterval(run, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return s;
}

export function kalMinsAgo(updated: string | null): number | null {
  return updated ? Math.round((Date.now() - new Date(updated).getTime()) / 60000) : null;
}
