export const cents = (v: number | null | undefined, dp = 1): string =>
  v == null || isNaN(v) ? "—" : (v * 100).toFixed(dp) + "¢";

export const pct = (v: number | null | undefined, dp = 0): string =>
  v == null || isNaN(v) ? "—" : (v * 100).toFixed(dp) + "%";

export const money = (v: number): string =>
  (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

export const oneIn = (p: number): string =>
  p > 0 ? "about 1 in " + Math.round(1 / p) : "—";
