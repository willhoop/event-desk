import { useEffect, useState } from "react";
import { POLLS, Poll } from "../data/polls";

// Reads polls.json (committed same-origin by the build-polls GitHub Action, like
// kalshi.json) and falls back to the dataset bundled at build time. This lets the
// poll set refresh daily without a code change, while never showing a broken page.
export interface PollsState { polls: Poll[]; source: "live" | "bundled"; updated: string | null; }

function valid(x: unknown): x is Poll[] {
  return Array.isArray(x) && x.length >= 5 && x.every((p) =>
    p && typeof (p as Poll).p === "string" && typeof (p as Poll).d === "string" &&
    typeof (p as Poll).n === "number" && (p as Poll).s && typeof (p as Poll).s === "object");
}

export function usePolls(): PollsState {
  const [state, setState] = useState<PollsState>({ polls: POLLS, source: "bundled", updated: null });
  useEffect(() => {
    let alive = true;
    fetch("./polls.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        const rows = Array.isArray(j) ? j : j?.polls;
        if (alive && valid(rows)) setState({ polls: rows, source: "live", updated: j?.updated ?? null });
      })
      .catch(() => { /* keep bundled fallback */ });
    return () => { alive = false; };
  }, []);
  return state;
}
