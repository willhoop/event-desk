import { useEffect, useState } from "react";

// Reads futuresearch.json (written server-side by the FutureSearch GitHub Action,
// so the API key never touches the client bundle). Returns null until/unless the
// file exists and is valid — the AI-forecast UI stays hidden rather than showing
// a placeholder, so nothing looks broken before the key is configured.
export interface FSData { updated: string; probs: Record<string, number>; rationale?: string; }

export function useFutureSearch(): FSData | null {
  const [data, setData] = useState<FSData | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("./futuresearch.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (alive && j && j.probs && typeof j.probs === "object" && Object.keys(j.probs).length >= 3) {
          setData({ updated: j.updated, probs: j.probs, rationale: j.rationale });
        }
      })
      .catch(() => { /* not configured yet — stay hidden */ });
    return () => { alive = false; };
  }, []);
  return data;
}
