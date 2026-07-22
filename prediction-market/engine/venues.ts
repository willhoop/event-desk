// Outbound links to the venue a price came from, so the crawl and the boards
// can hand you off to the actual order book.
//
// Every URL here is built from a value confirmed against the venue's own API —
// the Kalshi series titles and the Polymarket event slugs were read back, not
// guessed, because a dead link is worse than no link.

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** kalshi.com/markets/<series>/<series-title>/<event-ticker> */
export function kalshiUrl(series: string, title: string, eventTicker?: string): string {
  const base = `https://kalshi.com/markets/${series.toLowerCase()}/${slugify(title)}`;
  return eventTicker ? `${base}/${eventTicker.toLowerCase()}` : base;
}

export function polymarketUrl(eventSlug: string): string {
  return `https://polymarket.com/event/${eventSlug}`;
}

// Confirmed against api.elections.kalshi.com/trade-api/v2/series/* and
// gamma-api.polymarket.com/events?slug=* on 2026-07-20.
export const VENUE = {
  demNomination: kalshiUrl("KXPRESNOMD", "Democratic Primary winner", "KXPRESNOMD-28"),
  gopNomination: kalshiUrl("KXPRESNOMR", "Republican Primary winner", "KXPRESNOMR-28"),
  presidency: polymarketUrl("presidential-election-winner-2028"),
  lebron: polymarketUrl("nba-lebron-james-next-team"),
  lebronKalshi: "https://kalshi.com/markets/kxnextteamnba/next-nba-team/kxnextteamnba-26ljam",
};
