import { useEffect, useState } from "react";
import { fetchField, fetchEventMeta, FieldMarket, EventMeta } from "../engine/polymarket";

export interface FieldState {
  rows: FieldMarket[];
  meta: EventMeta | null;
  loading: boolean;
  error: boolean;
  stamp: number;
}

// Live board for a Polymarket event, refreshed on an interval like the rest of
// the site. Errors resolve to an empty board rather than throwing, so a desk
// degrades to an honest "no live board" state instead of a blank screen.
export function useField(slug: string, limit = 30, ms = 60000): FieldState {
  const [s, setS] = useState<FieldState>({ rows: [], meta: null, loading: true, error: false, stamp: 0 });

  useEffect(() => {
    let alive = true;
    const run = async () => {
      const [rows, meta] = await Promise.all([fetchField(slug, limit), fetchEventMeta(slug)]);
      if (!alive) return;
      setS({ rows, meta, loading: false, error: rows.length === 0, stamp: Date.now() });
    };
    run();
    const id = setInterval(run, ms);
    return () => { alive = false; clearInterval(id); };
  }, [slug, limit, ms]);

  return s;
}
