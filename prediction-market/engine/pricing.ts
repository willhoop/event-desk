// All prediction-market pricing math, typed and unit-tested.
// Rates and fees come from engine/config.ts — never hard-code them here.

import { VENUE_ECON, TBILL_RATE, SIZING } from "./config";

export type Venue = "poly" | "kalshi";

// Taker fee coefficient per venue: fee = coeff * price * (1 - price) of stake.
export const FEE_COEFF: Record<Venue, number> = {
  poly: VENUE_ECON.polyFeeCoeff,
  kalshi: VENUE_ECON.kalshiFeeCoeff,
};

// All-in cost of one YES share at price p on a venue (price + taker fee), in dollars.
export function allInCost(p: number, venue: Venue): number {
  return p + FEE_COEFF[venue] * p * (1 - p);
}

// Fee as a fraction of stake at price p.
export function feeOfStake(p: number, venue: Venue): number {
  return FEE_COEFF[venue] * (1 - p);
}

// The Wedge: long nomination YES, short presidency (buy presidency NO).
// Cash outlay per pair ≈ nomAsk + (1 - presAsk); money at risk ≈ pairCost - 1 if <1 else loss.
export function wedge(nomAsk: number, presAsk: number) {
  const pairCost = nomAsk + (1 - presAsk);
  const atRisk = Math.max(0, pairCost - 1); // if you're never nominated you lose this
  const payoutMultiple = atRisk > 0 ? (1 - atRisk) / atRisk : Infinity;
  return { pairCost, atRisk, payoutMultiple };
}

// Cross-venue lock: buy YES where YES is cheaper, NO where YES is dearer.
// Prices in cents (0-100). Returns the full economics.
export function lock(polyYes: number, kalYes: number, stake: number, months: number, taxRate: number) {
  const buyYesOn: Venue = polyYes <= kalYes ? "poly" : "kalshi";
  const yesPx = Math.min(polyYes, kalYes);
  const yesFeeC = FEE_COEFF[buyYesOn] * (yesPx / 100) * (1 - yesPx / 100) * 100;
  const buyNoOn: Venue = polyYes <= kalYes ? "kalshi" : "poly";
  const noYes = Math.max(polyYes, kalYes);
  const noPx = 100 - noYes;
  const noFeeC = FEE_COEFF[buyNoOn] * (noPx / 100) * (1 - noPx / 100) * 100;
  const costPerPair = yesPx + noPx + yesFeeC + noFeeC; // cents in
  const lockCents = 100 - costPerPair; // cents locked (may be negative)
  const pairs = stake / (costPerPair / 100);
  const profit = pairs * (lockCents / 100);
  const totRet = lockCents / costPerPair;
  const annual = Math.pow(1 + totRet, 12 / months) - 1;
  const afterTaxProfit = profit * (1 - taxRate);
  const atAnnual = stake > 0 ? Math.pow(1 + afterTaxProfit / stake, 12 / months) - 1 : 0;
  return {
    buyYesOn, yesPx, yesFeeC, buyNoOn, noPx, noFeeC,
    costPerPair, lockCents, pairs, profit, totRet, annual,
    afterTaxProfit, atAnnual, win: lockCents > 0,
  };
}

export const TBILL = TBILL_RATE;

// Quarter-Kelly stake fraction given your probability p and market price q.
export function quarterKelly(p: number, q: number): number {
  if (q <= 0 || q >= 1) return 0;
  const edge = (p - q) / (1 - q);
  return Math.max(0, edge) * SIZING.kellyFraction;
}
