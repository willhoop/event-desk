import { describe, it, expect } from "vitest";
import { allInCost, feeOfStake, wedge, lock, quarterKelly, FEE_COEFF, TBILL } from "../engine/pricing";

// These functions decide what a bet costs and whether it is worth taking.
// An error here is a wrong number in front of a reader, so each one is pinned
// to a value derived by hand rather than to whatever the code returns today.

describe("allInCost", () => {
  it("adds the taker fee to the price", () => {
    // 0.04 * 0.5 * 0.5 = 0.01 fee on top of a 50c share
    expect(allInCost(0.5, "poly")).toBeCloseTo(0.51, 10);
    // 0.07 * 0.5 * 0.5 = 0.0175
    expect(allInCost(0.5, "kalshi")).toBeCloseTo(0.5175, 10);
  });

  it("charges no fee at the boundaries, where p(1-p) is zero", () => {
    expect(allInCost(0, "poly")).toBe(0);
    expect(allInCost(1, "poly")).toBe(1);
  });

  it("peaks the fee at 50c, because p(1-p) is largest there", () => {
    const mid = allInCost(0.5, "poly") - 0.5;
    expect(mid).toBeGreaterThan(allInCost(0.2, "poly") - 0.2);
    expect(mid).toBeGreaterThan(allInCost(0.8, "poly") - 0.8);
  });

  it("makes Kalshi dearer than Polymarket at the same price", () => {
    expect(FEE_COEFF.kalshi).toBeGreaterThan(FEE_COEFF.poly);
    expect(allInCost(0.3, "kalshi")).toBeGreaterThan(allInCost(0.3, "poly"));
  });
});

describe("feeOfStake", () => {
  it("returns the fee as a fraction of stake", () => {
    expect(feeOfStake(0.5, "poly")).toBeCloseTo(0.02, 10);
  });
});

describe("wedge — long the nomination, short the presidency", () => {
  it("computes the cost and the payout of the live Ossoff shape", () => {
    // nom 15c, pres 10c: pair costs 0.15 + 0.90 = 1.05, so 5c is at risk
    const w = wedge(0.15, 0.10);
    expect(w.pairCost).toBeCloseTo(1.05, 10);
    expect(w.atRisk).toBeCloseTo(0.05, 10);
    // win 95c on 5c risked
    expect(w.payoutMultiple).toBeCloseTo(19, 6);
  });

  it("reports no risk and infinite payout when the pair costs under a dollar", () => {
    const w = wedge(0.10, 0.30); // 0.10 + 0.70 = 0.80
    expect(w.atRisk).toBe(0);
    expect(w.payoutMultiple).toBe(Infinity);
  });

  it("gets CHEAPER as the presidency price rises, because the short leg is the NO", () => {
    // The wedge is long nomination + short presidency. A dearer presidency YES
    // means a cheaper presidency NO, so the pair costs less to assemble.
    expect(wedge(0.15, 0.14).atRisk).toBeLessThan(wedge(0.15, 0.10).atRisk);
  });

  it("gets more expensive as the nomination price rises", () => {
    expect(wedge(0.20, 0.10).atRisk).toBeGreaterThan(wedge(0.15, 0.10).atRisk);
  });
});

describe("lock — the cross-venue arbitrage", () => {
  it("buys YES on the cheaper venue and NO on the dearer one", () => {
    const r = lock(8.1, 10.0, 1000, 28, 0.24);
    expect(r.buyYesOn).toBe("poly");
    expect(r.buyNoOn).toBe("kalshi");
    expect(r.yesPx).toBeCloseTo(8.1, 10);
    expect(r.noPx).toBeCloseTo(90.0, 10);
  });

  it("flips both legs when Kalshi is the cheaper side", () => {
    const r = lock(12.0, 9.0, 1000, 28, 0.24);
    expect(r.buyYesOn).toBe("kalshi");
    expect(r.buyNoOn).toBe("poly");
    expect(r.yesPx).toBeCloseTo(9.0, 10);
    expect(r.noPx).toBeCloseTo(88.0, 10);
  });

  it("calls it a loss when both books agree, because the fees still bite", () => {
    const r = lock(50, 50, 1000, 12, 0.24);
    expect(r.win).toBe(false);
    expect(r.lockCents).toBeLessThan(0);
    expect(r.profit).toBeLessThan(0);
  });

  it("cuts the profit by exactly the tax rate", () => {
    const r = lock(8.1, 10.0, 1000, 28, 0.24);
    expect(r.afterTaxProfit).toBeCloseTo(r.profit * 0.76, 8);
  });

  it("leaves the profit whole in a tax-free account", () => {
    const r = lock(8.1, 10.0, 1000, 28, 0);
    expect(r.afterTaxProfit).toBeCloseTo(r.profit, 10);
  });

  it("annualises a longer hold to a smaller yearly rate", () => {
    const short = lock(8.1, 10.0, 1000, 6, 0.24);
    const long = lock(8.1, 10.0, 1000, 28, 0.24);
    expect(short.afterTaxProfit).toBeCloseTo(long.afterTaxProfit, 8);
    expect(short.atAnnual).toBeGreaterThan(long.atAnnual);
  });

  it("keeps the pair count consistent with the cost", () => {
    const r = lock(8.1, 10.0, 1000, 28, 0.24);
    expect(r.pairs * (r.costPerPair / 100)).toBeCloseTo(1000, 6);
  });
});

describe("quarterKelly", () => {
  it("stakes nothing without an edge", () => {
    expect(quarterKelly(0.2, 0.2)).toBe(0);
    expect(quarterKelly(0.1, 0.2)).toBe(0);
  });

  it("stakes a quarter of the full Kelly fraction", () => {
    // edge = (0.30 - 0.20) / 0.80 = 0.125 full Kelly
    expect(quarterKelly(0.3, 0.2)).toBeCloseTo(0.03125, 10);
  });

  it("refuses impossible prices instead of dividing by zero", () => {
    expect(quarterKelly(0.5, 0)).toBe(0);
    expect(quarterKelly(0.5, 1)).toBe(0);
  });
});

describe("TBILL", () => {
  it("is the benchmark the lock is measured against", () => {
    expect(TBILL).toBeGreaterThan(0);
    expect(TBILL).toBeLessThan(0.2);
  });
});
