export interface MarketPrice { slug: string; yes: number | null; tok: string | null; ok: boolean; }
export interface FieldMarket {
  name: string; px: number; tok: string | null;
  d1: number;   // price change over 24h, in probability points
  w1: number;   // price change over 7d
  m1: number;   // price change over 30d
  vol: number;  // dollar volume on this outcome
}

const GAMMA = "https://gamma-api.polymarket.com";
const TIMEOUT = 9000;

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), TIMEOUT))]);
}

function tokenOf(m: any): string | null {
  try { const tk = typeof m.clobTokenIds === "string" ? JSON.parse(m.clobTokenIds) : m.clobTokenIds; if (tk && tk.length) return tk[0]; } catch { /* */ }
  return null;
}
function yesOf(m: any): number | null {
  let yes: number | null = null;
  try { const op = typeof m.outcomePrices === "string" ? JSON.parse(m.outcomePrices) : m.outcomePrices; if (op && op.length) yes = parseFloat(op[0]); } catch { /* */ }
  if (yes == null && m.lastTradePrice != null) yes = parseFloat(m.lastTradePrice);
  return yes != null && !isNaN(yes) ? yes : null;
}

export async function fetchMarket(slug: string): Promise<MarketPrice> {
  try {
    const r = await withTimeout(fetch(`${GAMMA}/markets?slug=${slug}`));
    const j = await r.json();
    const m = Array.isArray(j) ? j[0] : j;
    const yes = yesOf(m);
    return { slug, yes, tok: tokenOf(m), ok: yes != null };
  } catch { return { slug, yes: null, tok: null, ok: false }; }
}

export async function fetchField(slug: string, limit = 8): Promise<FieldMarket[]> {
  try {
    const r = await withTimeout(fetch(`${GAMMA}/events?slug=${slug}`));
    const j = await r.json();
    const ev = j && j[0];
    if (!ev || !ev.markets) return [];
    const best: Record<string, FieldMarket> = {};
    for (const m of ev.markets) {
      const px = yesOf(m); const tok = tokenOf(m);
      if (px == null || !tok) continue;
      const name = (m.groupItemTitle || m.question || "?").replace(/^Will /, "").replace(/ win.*$/, "");
      const vol = parseFloat(m.volumeNum || m.volume || 0) || 0;
      const num = (v: unknown) => { const n = parseFloat(String(v)); return isNaN(n) ? 0 : n; };
      const row: FieldMarket = {
        name, px, tok, vol,
        d1: num(m.oneDayPriceChange), w1: num(m.oneWeekPriceChange), m1: num(m.oneMonthPriceChange),
      };
      if (!best[name] || vol > best[name].vol) best[name] = row;
    }
    return Object.values(best).sort((a, b) => b.px - a.px).slice(0, limit);
  } catch { return []; }
}

export interface EventMeta { title: string; endDate: string | null; volume: number; liquidity: number; }
export async function fetchEventMeta(slug: string): Promise<EventMeta | null> {
  try {
    const r = await withTimeout(fetch(`${GAMMA}/events?slug=${slug}`));
    const j = await r.json();
    const ev = j && j[0];
    if (!ev) return null;
    return {
      title: ev.title || slug,
      endDate: ev.endDate || null,
      volume: parseFloat(ev.volume) || 0,
      liquidity: parseFloat(ev.liquidity) || 0,
    };
  } catch { return null; }
}

export interface HistPoint { t: number; p: number; }
export async function fetchHistory(tok: string, interval = "1m", fidelity = "360"): Promise<HistPoint[]> {
  try {
    const r = await withTimeout(fetch(`https://clob.polymarket.com/prices-history?market=${tok}&interval=${interval}&fidelity=${fidelity}`));
    const j = await r.json();
    return j && j.history && j.history.length > 3 ? j.history : [];
  } catch { return []; }
}
