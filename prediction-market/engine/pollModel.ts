// Fitted logistic model: early national primary poll share -> nomination probability.
// b0/b1 fitted on 90 candidacies across 20 contested primaries, 1972-2024.
export const FIT_B0 = 0.1794;
export const FIT_B1 = 0.8572;

// Convert a map of candidate -> weighted poll share (%) into implied prices (cents),
// scaled so the listed field sums to 95% (5% reserved for an unpolled nominee).
export function impliedPrices(avg: Record<string, number>): Record<string, number> {
  const keys = Object.keys(avg);
  const tot = keys.reduce((s, k) => s + avg[k], 0);
  if (tot <= 0) return {};
  const raw: Record<string, number> = {};
  let S = 0;
  for (const k of keys) {
    const share = Math.max(avg[k], 0.5) / tot;
    const z = FIT_B0 + FIT_B1 * Math.log(share);
    raw[k] = 1 / (1 + Math.exp(-z));
    S += raw[k];
  }
  const scale = S > 0 ? 0.95 / S : 0;
  const out: Record<string, number> = {};
  for (const k of keys) out[k] = raw[k] * scale * 100;
  return out;
}
