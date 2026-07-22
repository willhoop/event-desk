# Pricing the Gap Between Two Prediction Markets

### A technical description of the Event Desks engine

**Version 1.0.1 · Last updated 2026-07-22**
**Elite Four Capital · https://elitefourcapital.com**

> This is a living document. It is updated in the same pass as any change to the code.
> New information is appended. A prior conclusion is not silently rewritten; what changed
> and why is recorded in [`CHANGELOG.md`](../CHANGELOG.md).

---

## Abstract

Event Desks prices event contracts on Polymarket and Kalshi. This paper describes the
mathematics the site runs: the venue fee model, the cross-venue arbitrage condition, the
"wedge" spread, the conversion ratio that ranks a candidate field, and the bet-sizing
rule. Each formula is stated, derived where non-obvious, and pinned to a unit test. The
paper also records the model's limits and the failures found during development.

---

## 1. The instrument

An event contract pays $1 if a stated event occurs, and $0 otherwise. The price is
therefore an implied probability, subject to fees and to the cost of capital.

Write **p** for the price of a YES contract, in dollars, `0 < p < 1`.

Both venues studied here run binary contracts on a `linear_cent` tick, so the minimum
price movement is $0.01.

---

## 2. Venue fees

Both venues charge the taker. Both use a fee that is proportional to `p(1 − p)`. The
function is largest at `p = 0.5` and vanishes at both boundaries.

Let `k` be the venue coefficient.

**Fee per contract:**

```
f(p) = k · p · (1 − p)
```

**All-in cost of one YES contract:**

```
C(p) = p + k · p · (1 − p)                                     (1)
```

| Venue | k |
|---|---|
| Polymarket | 0.04 |
| Kalshi | 0.07 |

The coefficients live in `VENUE_ECON` in `engine/config.ts`.

**Why the fee vanishes at the boundaries.** A contract at 1c or 99c is nearly settled. The
venue takes little risk and the spread is tight, so a proportional fee would over-charge
a near-certain trade. The `p(1 − p)` form makes the fee track the uncertainty.

**Worked value.** At `p = 0.5` on Polymarket:

```
C(0.5) = 0.5 + 0.04 × 0.5 × 0.5 = 0.51
```

Kalshi credits interest on posted collateral at an annual rate of 3.25%. Over a hold of
`m` months this returns `p · 0.0325 · m/12` per contract, which offsets part of the fee.
Polymarket pays no interest and carries an estimated 5% conversion and withdrawal drag.
Both figures are in `VENUE_ECON`.

*Sources: Kalshi fee schedule and contract terms, series `KXPRESNOMD` / `KXPRESPERSON`;
Polymarket market objects (`feeSchedule`: `rate: 0.05`, `takerOnly: true` on sports
markets; `rate: 0.04` on politics markets), read from the Gamma API 2026-07-20.*

---

## 3. The cross-venue lock

### 3.1 The condition

The same event trades on both venues. Suppose Polymarket quotes YES at `a` and Kalshi
quotes YES at `b`, both in cents, with `a < b`.

Buy YES on the cheaper venue. Buy NO on the dearer venue. NO costs `100 − b`. Exactly one
leg settles at 100.

**Cost per matched pair, in cents:**

```
K = a + (100 − b) + f_yes + f_no                                (2)
```

where the fee terms are equation (1) applied to each leg on its own venue.

**Locked profit per pair:**

```
L = 100 − K                                                     (3)
```

The trade is an arbitrage when `L > 0`.

### 3.2 Why the gross gap is not the profit

Both fees are charged on entry. The naive gap `b − a` overstates the edge by
`f_yes + f_no`. Because the fee peaks at 50c, a mid-priced market can consume a gap of
several cents entirely.

### 3.3 The time value

The capital is locked until settlement. For a stake `S` held `m` months at tax rate `t`:

```
pairs      = S / (K/100)
profit     = pairs · (L/100)
after-tax  = profit · (1 − t)
annualised = (1 + after-tax/S)^(12/m) − 1                        (4)
```

**The decision rule.** Compare (4) against the after-tax risk-free rate:

```
take the trade  ⟺  annualised > TBILL · (1 − t)                  (5)
```

`TBILL = 0.043`, in `engine/config.ts`.

**A worked case, from the live book on 2026-07-20.** Ossoff presidency: Polymarket 8.1c,
Kalshi 10.0c, stake $1,000, 28 months to settlement, 24% tax.

The trade locks a real profit, but it annualises to **0.3% a year after tax**, against
**3.3%** for a Treasury bill on the same money. The gap exists and is not worth taking.
The site prints this verdict as "Real lock, cash still wins."

This is the paper's central practical point: **a positive `L` is not a reason to trade.**
Most cross-venue gaps on long-dated contracts are a worse use of capital than cash.

---

## 4. The wedge

### 4.1 Construction

For a candidate with a nomination price `n` and a presidency price `s`, both in dollars:

- Long one nomination YES contract, cost `n`.
- Long one presidency NO contract, cost `1 − s`.

**Cost of the pair:**

```
W = n + (1 − s)                                                  (6)
```

**Capital at risk:**

```
R = max(0, W − 1)                                                (7)
```

**Payout multiple on the risked capital:**

```
M = (1 − R) / R                                                  (8)
```

### 4.2 The payoff

| World | Nomination leg | Presidency NO leg | Total |
|---|---|---|---|
| Not nominated | 0 | 1 | 1 |
| Nominated, loses | 1 | 1 | 2 |
| Nominated, wins | 1 | 0 | 1 |

The pair returns 1 in two of three worlds and 2 in the third. Paying `W ≈ 1` for it means
the entire cost is a bet on the middle row: **nominated, then beaten.**

### 4.3 Direction — a result that inverts naive intuition

From (6) and (7):

```
∂R/∂s = −1        ∂R/∂n = +1
```

**A higher presidency price makes the wedge cheaper.** The short leg is the presidency NO;
a dearer YES is a cheaper NO. A higher nomination price makes it dearer.

This inverts the naive reading and was initially asserted backwards during development.
The unit test in `tests/pricing.test.ts` now pins the true direction.

**Worked value.** `n = 0.15`, `s = 0.10`:

```
W = 0.15 + 0.90 = 1.05
R = 0.05
M = 0.95 / 0.05 = 19×
```

$100 at risk returns about $1,900 in the nominated-but-loses world.

---

## 5. The conversion ratio

### 5.1 Definition

```
c = s / n                                                        (9)
```

Under the market's own measure, `s = P(nominated ∧ wins)` and `n = P(nominated)`. Since
winning without the nomination is impossible, the events nest, and (9) is the conditional
probability:

```
c = P(wins | nominated)                                          (10)
```

The nomination cancels. What remains is a clean read on the general election alone.

### 5.2 Why a high `c` is a sell

A high `c` means the market is confident about a general election more than two years
away, with no nominee in either party and no meaningful head-to-head polling. That
confidence is what the wedge sells.

Ranking the field by `c` therefore surfaces the most confident claim on the board. The
site names it the house pick. **No candidate is written into the code**; the pick is
recomputed from live prices, so it moves when the money moves.

### 5.3 Liquidity floors — a necessary correction

Equation (9) amplifies noise when `n` is small. With a one-cent tick, a runner quoted 4c/3c
reads `c = 0.75`, but a single tick on the numerator moves the headline across
{50%, 75%, 100%}. The ratio measures the tick, not the market.

A runner must clear both floors to be eligible for the pick or the median:

```
n ≥ 0.08        s ≥ 0.04                                        (11)
```

Runners below the floors are displayed and labelled THIN, greyed rather than hidden.

**Effect on the live board (2026-07-20).** Before the floors, the engine named Beshear
(4c/3c, `c = 0.75`) the pick. After, it named Ossoff (15c/10c, `c = 0.67`). The field
median moved 62% → 61%.

### 5.4 The yardstick

`c` alone is not interpretable. The site compares it against the median `c` of the liquid
board, recomputed from today's prices. "High" means high against this market, not against
a chosen constant.

A ratio above 1.6 is treated as a quoting error, not a signal: winning without the
nomination is impossible, so `c > 1` is incoherent.

---

## 6. Bet sizing

The Kelly criterion gives the growth-optimal fraction of a bankroll. For a binary contract
at price `q` with subjective probability `p`:

```
kelly = (p − q) / (1 − q)                                       (12)
```

We stake a quarter of it:

```
stake fraction = max(0, kelly) × 0.25                            (13)
```

**Why a fraction.** Kelly assumes `p` is known. Here `p` is an estimate. The Kelly growth
curve is asymmetric: overbetting past the optimum destroys capital far faster than
underbetting forfeits growth, and a Kelly bet on an overestimated `p` is an overbet.
Fractional Kelly retains most of the growth at a large reduction in variance and is robust
to an estimation error.

*Sources: Kelly (1956), "A New Interpretation of Information Rate," Bell System Technical
Journal 35(4), 917–926. Thorp (2006), "The Kelly Criterion in Blackjack, Sports Betting,
and the Stock Market," Handbook of Asset and Liability Management Vol. 1. MacLean, Thorp
& Ziemba (2011), The Kelly Capital Growth Investment Criterion.*

---

## 7. The electoral model

The map is **not a forecast.** The baseline is the 2024 result by state. A single national
swing parameter shifts every margin:

```
margin_i(swing) = margin_i(2024) + swing                        (14)
```

The simulation draws 20,000 elections. Each state gets an independent normal shock:

```
m_i = margin_i(2024) + swing + N(0, σ²)                         (15)
```

with `σ = 4` margin points by default. A state is won by the party with `m_i > 0`;
electoral votes are summed and compared against 270.

**The limits, stated plainly:**

1. **This is not 2028 polling.** No general-election polling for 2028 exists in the
   dataset. The poll data on the site is *Democratic primary* polling — nomination share,
   not head-to-head.
2. **The shocks are independent.** Real state errors are strongly correlated; a national
   polling miss moves every state together. Independent shocks therefore understate the
   variance of the electoral-vote total. The single `swing` parameter is a crude proxy for
   the correlated component.
3. **At rest the map reproduces 2024.** R 287 + 25 toss-up = 312, which is the 2024
   result with Wisconsin (−0.9) and Michigan (−1.4) inside the toss-up band.

The correct reading is: *"if 2028 resembles 2024, adjusted by my assumptions."*

**Interface note (v1.0.1).** The desk previously carried a "2028 · LIVE" label, which
invited the reader to treat the electoral-vote total as a projection. The label was wrong;
the model was not. The desk now reads "2024 baseline, your assumptions" and prints the
caveat directly beneath the electoral-vote bar.

---

## 8. Data sources and freshness

| Source | Method | True latency | Live? |
|---|---|---|---|
| Polymarket prices | Browser fetch, Gamma API | Seconds | Yes |
| Polymarket history | Browser fetch, CLOB API | Seconds | Yes |
| Kalshi board | GitHub Action → `kalshi.json` | 1–2 hours | No |
| Poll dataset | GitHub Action → `polls.json` | Daily | No |
| Cap-space figures | Manual snapshot, `data/lebron.ts` | Static | No |

**On Kalshi latency.** The cron requests 10 minutes. GitHub delays scheduled workflows on
low-activity repositories; observed run times on 2026-07-20 were 13:04, 15:05, 16:39,
17:49 — a true interval of 1–2 hours. The site therefore reports the true age and sets its
"live" threshold at 90 minutes. It does not claim minute-level freshness.

The fix is a Cloudflare Pages Function at `functions/kalshi.json.js` that fetches on each
request. Not yet implemented.

*Sources: GitHub Actions documentation, "Events that trigger workflows — schedule."
Observed run history, `willhoop/event-desk`, runs 44–47.*

---

## 9. The sports desk

The LeBron James free-agency board applies the same machinery to a one-dimensional field.
There is no conversion ratio here — there is only one question — so the desk ranks by
price and surfaces **movement**, which is where the information sits.

**The overround.** The sum of all outcome prices exceeds 1. On 2026-07-20 the Kalshi board
summed to 123c across 30 outcomes; Polymarket's was tighter. The excess over 100c is the
book's edge and must be subtracted before any outcome is called "cheap."

**The cap-space thesis.** Reported first-apron room, not narrative, explains the favourite:

| Team | Can pay | Market (2026-07-20) |
|---|---|---|
| Miami | ~$7.0m | 46–49c |
| Cleveland | $3.9m, or $6.1m conditional | 24–26c |
| Philadelphia | $3.9m | 14c |
| Golden State | $3.9m, or ~$6m conditional | 9.5–12c |
| Denver | $3.9m | 0.8c |
| Minnesota | $3.9m | 1.4c |

Miami is the only finalist able to meaningfully outbid the field. The desk computes
whether the favourite is also the highest bidder and states the verdict either way.

**A data-integrity note.** An early parse of the Polymarket payload was truncated and
produced a fabricated 80.5c for the Lakers. The correct value is 0.3c — James informed the
Lakers on 2026-06-30 that he would play elsewhere, and the Lakers bucket doubles as the
no-move default, so 0.3c means the market is ~99.7% certain he signs somewhere new. The
error was caught by re-reading the raw API rather than trusting the truncated file. Note
also that Polymarket's own AI summary on that event is stale (last regenerated
2026-06-18) and still asserts a 79.5% Lakers consensus; it is wrong by 79 points.

*Sources: Marks, B. & Windhorst, B., "LeBron James' free agency market: What six teams can
offer him," ESPN, 2026-07-10. ESPN, "LeBron James informs Lakers he plans to play
elsewhere in 2026-27," 2026-06-30. Kalshi event `KXNEXTTEAMNBA-26LJAM`. Polymarket event
`nba-lebron-james-next-team`.*

---

## 10. Verification

42 unit tests cover the engine. Each expected value is derived by hand, not captured from
current output.

| Suite | Tests | Covers |
|---|---|---|
| `tests/pricing.test.ts` | 20 | Fees, wedge, lock, Kelly |
| `tests/field.test.ts` | 22 | Conversion, thin-market guard, pick, median |

Run them with `npm test`.

The thin-market regression (§5.3) and the wedge direction (§4.3) are both pinned, because
both were wrong at some point in development.

---

## 11. Known limitations

1. Independent state shocks understate correlated polling error (§7).
2. The electoral baseline is 2024, not 2028 polling (§7).
3. Kalshi prices lag 1–2 hours (§8).
4. Cap-space figures are a manual snapshot and will go stale (§8).
5. Fee models are simplified; real books have depth, and a large order moves the price.
6. The lock assumes both legs fill at the quoted price. It does not model slippage.
7. Correlation between multiple simultaneous bets is not modelled. A multi-bet correlation
   sizer is open work.

---

## 12. References

1. Kelly, J. L. (1956). "A New Interpretation of Information Rate." *Bell System Technical
   Journal* 35(4), 917–926.
2. Thorp, E. O. (2006). "The Kelly Criterion in Blackjack, Sports Betting, and the Stock
   Market." *Handbook of Asset and Liability Management*, Vol. 1.
3. MacLean, L. C., Thorp, E. O. & Ziemba, W. T. (2011). *The Kelly Capital Growth
   Investment Criterion*. World Scientific.
4. Kalshi. Contract terms, series `KXPRESNOMD`, `KXPRESNOMR`, `KXPRESPERSON`,
   `KXNEXTTEAMNBA`. https://kalshi.com
5. Polymarket Gamma API. Event objects `presidential-election-winner-2028`,
   `nba-lebron-james-next-team`. https://gamma-api.polymarket.com
6. Marks, B. & Windhorst, B. (2026-07-10). "LeBron James' free agency market: What six
   teams can offer him." ESPN.
   https://www.espn.com/nba/story/_/id/49301354/
7. ESPN (2026-06-30). "LeBron James informs Lakers he plans to play elsewhere in 2026-27."
   https://www.espn.com/nba/story/_/id/49226472/
8. GitHub. "Events that trigger workflows — schedule."
   https://docs.github.com/en/actions/reference/events-that-trigger-workflows

---

**Companion documents.** [Slide deck](deck.md) · [Technical documentation](README.md) ·
[Changelog](../CHANGELOG.md)
