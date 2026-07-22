# Explanation: why we exclude thin markets

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

## What happened

The conversion board shipped on 2026-07-20. The first live load named Andy Beshear the
house pick at 75%.

Beshear was quoted at 4c for the nomination and 3c for the presidency.

```
3 ÷ 4 = 0.75
```

The arithmetic was correct. The conclusion was wrong.

## Why the number was noise

Kalshi quotes in whole cents. One tick is one cent.

Move the presidency quote by one tick:

| Presidency | Conversion |
|---|---|
| 2c | 50% |
| 3c | 75% |
| 4c | 100% |

One tick moves the headline by 25 points. The tick is the smallest change the venue
allows. The number carries no information at that size. It measures the tick, not the
market.

Compare Ossoff at 15c and 10c:

| Presidency | Conversion |
|---|---|
| 9c | 60% |
| 10c | 67% |
| 11c | 73% |

One tick moves the headline by about 6 points. The ratio survives a tick. The number
means something.

## The rule

A runner must clear two floors to be the house pick:

| Floor | Value |
|---|---|
| Nomination | 8c |
| Presidency | 4c |

The floors are `PICK_MIN_NOM` and `PICK_MIN_PRES` in `engine/config.ts`.

## Why we show the thin runners anyway

We do not hide them. Hiding a number is its own kind of dishonesty.

A thin runner appears on the board with a THIN label. The percentage renders in grey, not
in the runner's colour. The footnote states the reason in plain words.

The runner cannot be the house pick. The runner does not count toward the median. A thin
runner therefore cannot drag the yardstick.

## Why the median moved

Before the rule, the median conversion was 62%. After the rule, the median was 61%.

The change is small because most thin runners sat near the middle. The change matters
because the median is now computed only from prices that can carry a claim.

## The general lesson

A ratio inherits the error of both inputs. When the denominator is small, the ratio
amplifies the noise instead of the signal.

Check the size of the inputs before you trust a ratio. The site now does this in code, and
the test in `tests/field.test.ts` locks the behaviour so it cannot regress.

## Sources

- Kalshi contract terms, series `KXPRESNOMD` and `KXPRESPERSON`. The price level structure
  is `linear_cent`, so the minimum tick is one cent.
- Live Kalshi board, read 2026-07-20. Beshear 4c/3c. Ossoff 15c/10c.
