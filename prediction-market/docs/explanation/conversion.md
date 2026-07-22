# Explanation: why conversion is the key number

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

## The problem

A prediction market shows a price. A price alone does not tell you where the market is
wrong.

The Presidency desk once covered one candidate. That desk answered one question: "Is Jon
Ossoff cheap?" A reader could not compare Ossoff against the field. The desk also fixed
the candidate in the code. The desk went stale when the market moved.

## The idea

Each serious candidate has two markets:

1. Will the party nominate them?
2. Will they win the election?

Divide the second by the first.

```
conversion = presidency ÷ nomination
```

The result reads as one sentence: **"If the party nominates this person, this is the
market's chance that they win it all."**

## Why the ratio carries information

The two markets share the nomination. When you divide, the nomination cancels. What is
left is the general election alone.

A candidate at 15c for the nomination and 10c for the presidency converts at 67%. The
market says: nominate Ossoff and he wins two elections out of three.

That is a strong claim. The election is more than two years away. No party has a nominee.
No poll tests the matchup. The market is confident about a result nobody can see.

## Why a high conversion is a selling opportunity

The wedge is long the nomination and short the presidency. The wedge wins in one world:
the party nominates the candidate, and the candidate loses in November.

A high conversion makes that world cheap. The market has priced it as unlikely. If you
think a first-term senator is not a two-in-three favourite against an unknown opponent,
the wedge pays you to say so.

The desk therefore ranks by conversion, not by price. The highest conversion is the house
pick.

## Why the pick is computed

The pick falls out of the data. No name is in the code.

This has two results:
1. The pick moves when the money moves. The desk cannot go stale.
2. The desk cannot argue with itself. The front page and the desk read the same engine.

## The yardstick moves too

A conversion of 67% means nothing alone. The desk compares it against the median of the
liquid board.

The median is computed today from today's prices. "High" therefore means high against
this market, not against a number somebody chose.

## Why quarter-Kelly

The Kelly criterion gives the stake that maximises long-run growth. Kelly assumes you know
the true probability.

You do not know it. You estimated it. An error in the estimate is punished hard: full
Kelly on a wrong probability loses money faster than a flat stake.

We stake a quarter of Kelly. A quarter keeps most of the growth and cuts the variance by
a large factor. A quarter also survives an estimate that is wrong.

## The limits

- The ratio needs two liquid markets. See
  [Why we exclude thin markets](thin-markets.md).
- A conversion above 1.0 is incoherent. A candidate cannot win without the nomination.
  The engine rejects a ratio above 1.6 as a quoting error.
- The ratio says nothing about *why* the market is confident. That is the analyst's job.

## Sources

- Kelly, J. L. (1956). "A New Interpretation of Information Rate." *Bell System Technical
  Journal* 35(4), 917–926.
- Thorp, E. O. (2006). "The Kelly Criterion in Blackjack, Sports Betting, and the Stock
  Market." *Handbook of Asset and Liability Management*, Vol. 1.
- Kalshi market data, event tickers `KXPRESNOMD-28`, `KXPRESNOMR-28`, `KXPRESPERSON-28`.
- Polymarket event `presidential-election-winner-2028`.
