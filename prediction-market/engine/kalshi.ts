export interface KalshiData {
  updated: string | null;
  nomination: Record<string, number>;
  presidency: Record<string, number>;
  gopnom: Record<string, number>;
  live: boolean;
}

const EMPTY: KalshiData = { updated: null, nomination: {}, presidency: {}, gopnom: {}, live: false };

// Snapshot fallback if the same-origin file is missing (e.g. local dev before deploy).
const SNAP: KalshiData = {
  updated: null, live: false,
  nomination: { "Jon Ossoff": 0.15, "Gavin Newsom": 0.2, "Alexandria Ocasio-Cortez": 0.16, "Pete Buttigieg": 0.051, "Kamala Harris": 0.081, "Andy Beshear": 0.038 },
  presidency: { "Jon Ossoff": 0.1 },
  gopnom: {},
};

export async function fetchKalshi(): Promise<KalshiData> {
  try {
    const r = await fetch("kalshi.json?t=" + Date.now());
    if (!r.ok) throw new Error("no file");
    const j = await r.json();
    return {
      updated: j.updated ?? null,
      nomination: j.nomination ?? {},
      presidency: j.presidency ?? {},
      gopnom: j.gopnom ?? {},
      live: true,
    };
  } catch {
    return SNAP;
  }
}

export { EMPTY as EMPTY_KALSHI };
