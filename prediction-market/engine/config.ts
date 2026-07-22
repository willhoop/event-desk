// ONE CONFIG BLOCK.
//
// Anything that changes over time lives here so an update is a single edit.
// If you are changing a number that will be stale next month, it belongs in
// this file — not inline in a component.
//
// Version: 1.0.0
// Last updated: 2026-07-22

/** Site identity. */
export const SITE = {
  brand: "Elite Four Capital",
  name: "Event Desks",
  origin: "https://elitefourcapital.com",
  repo: "https://github.com/willhoop/event-desk",
} as const;

/** Live-data refresh intervals, in milliseconds. */
export const REFRESH = {
  /** Polymarket price polling, in the browser. */
  prices: 60_000,
  /** Sports board polling. */
  board: 60_000,
} as const;

/**
 * Venue economics.
 * Taker fee = coeff * price * (1 - price) of stake.
 * Kalshi credits interest on held cash; Polymarket does not.
 */
export const VENUE_ECON = {
  polyFeeCoeff: 0.04,
  kalshiFeeCoeff: 0.07,
  /** Annual interest Kalshi pays on posted collateral. */
  kalshiInterest: 0.0325,
  /** Polymarket conversion and withdrawal drag, as a share of notional. */
  polyFrictionPct: 0.05,
} as const;

/** The risk-free benchmark a locked trade has to beat. Update with the market. */
export const TBILL_RATE = 0.043;

/**
 * Liquidity floors for the conversion board.
 *
 * A 4c nomination against a 3c presidency "converts at 75%", but one tick of
 * movement swings that by twenty points. Runners below these floors are shown
 * and marked THIN; they are never selected as the house pick and never counted
 * toward the median.
 */
export const LIQUIDITY = {
  /** Minimum nomination price for a conversion ratio to be displayed at all. */
  minShow: 0.03,
  /** Minimum nomination price to be eligible for the pick or the median. */
  minPickNom: 0.08,
  /** Minimum presidency price for the same. */
  minPickPres: 0.04,
  /** Above this, presidency-over-nomination is incoherent rather than bullish. */
  maxConv: 1.6,
} as const;

/**
 * Kalshi feed freshness.
 *
 * The workflow cron asks for every 10 minutes. GitHub does not obey this on a
 * low-activity repository; the true interval runs 1-2 hours. These thresholds
 * drive the honest age label rather than a claim of live-to-the-minute.
 */
export const FRESHNESS = {
  /** Under this many minutes, the feed is labelled live. */
  liveMins: 90,
  /** Over this, the admin page calls it stale. */
  staleMins: 90,
} as const;

/** Electoral model defaults. */
export const ELECTORAL = {
  /** Simulated elections per adjustment. */
  runs: 20_000,
  /** Default per-state standard deviation, in margin points. */
  sigma: 4,
  /** Electoral votes needed to win. */
  toWin: 270,
  /** Total electoral votes. */
  total: 538,
} as const;

/** Bet-sizing policy. */
export const SIZING = {
  /** We stake a quarter of full Kelly, because every input is an estimate. */
  kellyFraction: 0.25,
} as const;
