import { useEffect, useState } from "react";
import { fetchMarket } from "../engine/polymarket";
import { presSlug, nomSlug } from "../engine/field";

export interface PolyRunner { nom: number | null; pres: number | null; loading: boolean }

// Polymarket's own quote for a named runner, so the cross-venue comparisons are
// comparing two real books instead of the same number twice. Returns nulls when
// Polymarket doesn't list them — the callers all degrade to "one venue only".
export function usePolyRunner(name: string | null): PolyRunner {
  const [s, setS] = useState<PolyRunner>({ nom: null, pres: null, loading: false });

  useEffect(() => {
    if (!name) { setS({ nom: null, pres: null, loading: false }); return; }
    let alive = true;
    setS({ nom: null, pres: null, loading: true });
    (async () => {
      const ns = nomSlug(name);
      const [pres, nom] = await Promise.all([
        fetchMarket(presSlug(name)),
        ns ? fetchMarket(ns) : Promise.resolve({ yes: null } as { yes: number | null }),
      ]);
      if (!alive) return;
      setS({ nom: nom.yes, pres: pres.yes, loading: false });
    })();
    return () => { alive = false; };
  }, [name]);

  return s;
}
