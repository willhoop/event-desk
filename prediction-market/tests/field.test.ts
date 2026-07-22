import { describe, it, expect } from "vitest";
import {
  buildField, housePick, medianConv, tradable, liquid, isThin,
  shortName, presSlug, PICK_MIN_NOM, PICK_MIN_PRES,
} from "../engine/field";
import type { KalshiData } from "../engine/kalshi";

// The field engine decides which candidate the site calls its house pick.
// A thin two-cent market can imply any conversion rate at all, so the guard
// against picking one is the single most important behaviour here.

const K = (nomination: Record<string, number>, presidency: Record<string, number>, gopnom: Record<string, number> = {}): KalshiData =>
  ({ updated: "2026-07-20T00:00:00Z", nomination, presidency, gopnom, live: true });

describe("shortName", () => {
  it("takes the surname", () => {
    expect(shortName("Jon Ossoff")).toBe("Ossoff");
    expect(shortName("Alexandria Ocasio-Cortez")).toBe("Ocasio-Cortez");
  });
  it("keeps a generational suffix attached", () => {
    expect(shortName("Donald J. Trump Jr.")).toBe("Trump Jr.");
  });
  it("passes a single word through", () => {
    expect(shortName("Cher")).toBe("Cher");
  });
});

describe("buildField", () => {
  it("computes conversion as presidency over nomination", () => {
    const f = buildField(K({ "Jon Ossoff": 0.15 }, { "Jon Ossoff": 0.10 }));
    expect(f).toHaveLength(1);
    expect(f[0].conv).toBeCloseTo(0.6667, 4);
    expect(f[0].party).toBe("D");
  });

  it("labels the Republican board", () => {
    const f = buildField(K({}, { "J.D. Vance": 0.17 }, { "J.D. Vance": 0.40 }));
    expect(f[0].party).toBe("R");
    expect(f[0].conv).toBeCloseTo(0.425, 6);
  });

  it("leaves conversion null when a leg is missing", () => {
    const f = buildField(K({ "Nobody Quoted": 0.05 }, {}));
    expect(f[0].conv).toBeNull();
  });

  it("lists a runner quoted only for the presidency", () => {
    const f = buildField(K({}, { "Outside Name": 0.03 }));
    expect(f.map((r) => r.name)).toContain("Outside Name");
  });

  it("never repeats a runner", () => {
    const f = buildField(K({ A: 0.2 }, { A: 0.1 }, { A: 0.3 }));
    expect(f.filter((r) => r.name === "A")).toHaveLength(1);
  });

  it("gives every runner a colour that is not ember or green", () => {
    const f = buildField(K({ A: 0.2, B: 0.1, C: 0.3 }, { A: 0.1, B: 0.05, C: 0.2 }));
    for (const r of f) {
      expect(r.color.toLowerCase()).not.toBe("#e2572b");
      expect(r.color.toLowerCase()).not.toBe("#4a9e7f");
    }
  });
});

describe("isThin", () => {
  it("flags a market that is only a few cents on either leg", () => {
    const [beshear] = buildField(K({ X: 0.04 }, { X: 0.03 }));
    expect(beshear.conv).toBeCloseTo(0.75, 6);   // headline number looks strong
    expect(isThin(beshear)).toBe(true);          // but the quotes cannot carry it
  });

  it("passes a market with real size behind both legs", () => {
    const [ossoff] = buildField(K({ X: 0.15 }, { X: 0.10 }));
    expect(isThin(ossoff)).toBe(false);
  });

  it("uses the documented thresholds", () => {
    const [justUnder] = buildField(K({ X: PICK_MIN_NOM - 0.001 }, { X: PICK_MIN_PRES + 0.01 }));
    expect(isThin(justUnder)).toBe(true);
    const [justOver] = buildField(K({ X: PICK_MIN_NOM }, { X: PICK_MIN_PRES }));
    expect(isThin(justOver)).toBe(false);
  });
});

describe("housePick — the regression that mattered", () => {
  it("does not pick a thin market even when it tops the board", () => {
    // Beshear converts at 75% off 4c/3c; Ossoff at 67% off 15c/10c.
    const f = buildField(K(
      { "Andy Beshear": 0.04, "Jon Ossoff": 0.15, "Gavin Newsom": 0.19 },
      { "Andy Beshear": 0.03, "Jon Ossoff": 0.10, "Gavin Newsom": 0.12 },
    ));
    const pick = housePick(f, "D");
    expect(pick?.name).toBe("Jon Ossoff");
    expect(pick?.conv).toBeCloseTo(0.6667, 4);
  });

  it("picks the highest conversion among liquid runners", () => {
    const f = buildField(K({ A: 0.20, B: 0.20 }, { A: 0.16, B: 0.10 }));
    expect(housePick(f)?.name).toBe("A");
  });

  it("respects the party filter", () => {
    const f = buildField(K({ D1: 0.20 }, { D1: 0.10, R1: 0.30 }, { R1: 0.40 }));
    expect(housePick(f, "D")?.name).toBe("D1");
    expect(housePick(f, "R")?.name).toBe("R1");
  });

  it("returns null when nothing is liquid enough", () => {
    expect(housePick(buildField(K({ X: 0.02 }, { X: 0.01 })))).toBeNull();
  });
});

describe("medianConv", () => {
  it("ignores thin runners so the yardstick is not dragged around", () => {
    const withThin = buildField(K(
      { A: 0.20, B: 0.20, C: 0.04 },
      { A: 0.10, B: 0.14, C: 0.03 },
    ));
    // A = 50%, B = 70%, C = 75% but thin -> median of {50, 70} = 60%
    expect(medianConv(withThin, "D")).toBeCloseTo(0.6, 6);
  });

  it("returns null on an empty board", () => {
    expect(medianConv([])).toBeNull();
  });
});

describe("tradable and liquid", () => {
  it("rejects a conversion above the sanity ceiling", () => {
    // presidency above nomination is incoherent: you cannot win without the nod
    const f = buildField(K({ X: 0.10 }, { X: 0.30 }));
    expect(tradable(f)).toHaveLength(0);
  });

  it("keeps liquid a subset of tradable", () => {
    const f = buildField(K({ A: 0.20, B: 0.04 }, { A: 0.10, B: 0.03 }));
    expect(tradable(f).length).toBeGreaterThanOrEqual(liquid(f).length);
  });
});

describe("presSlug", () => {
  it("builds the Polymarket slug for a runner", () => {
    expect(presSlug("Jon Ossoff")).toBe("will-jon-ossoff-win-the-2028-us-presidential-election");
  });
  it("strips punctuation", () => {
    expect(presSlug("J.D. Vance")).toBe("will-jd-vance-win-the-2028-us-presidential-election");
  });
});
