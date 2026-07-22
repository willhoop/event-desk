import { useEffect, useState } from "react";

export interface Bet {
  id: string;
  market: string;      // human label
  slug: string;        // polymarket slug (for live valuation) or ""
  side: "Yes" | "No";
  venue: "Polymarket" | "Kalshi";
  entry: number;       // cents paid, 0-100
  size: number;        // dollars staked
  at: number;          // timestamp
  shot?: string;       // optional data-URL screenshot from the platform
}

const KEY = "ef4_bets_v1";

function load(): Bet[] {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export function useBets() {
  const [bets, setBets] = useState<Bet[]>(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(bets)); } catch { /* */ } }, [bets]);
  const add = (b: Omit<Bet, "id" | "at">) => setBets((xs) => [...xs, { ...b, id: Math.random().toString(36).slice(2), at: Date.now() }]);
  const remove = (id: string) => setBets((xs) => xs.filter((x) => x.id !== id));
  const clear = () => setBets([]);
  return { bets, add, remove, clear };
}

export function toCSV(bets: Bet[]): string {
  const head = "date,market,side,venue,entry_cents,size_usd";
  const rows = bets.map((b) =>
    [new Date(b.at).toISOString().slice(0, 10), '"' + b.market.replace(/"/g, "'") + '"', b.side, b.venue, (b.entry).toFixed(1), b.size].join(",")
  );
  return [head, ...rows].join("\n");
}
