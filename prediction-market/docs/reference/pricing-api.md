# Reference: the pricing functions

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

The file is `engine/pricing.ts`. The tests are in `tests/pricing.test.ts`.

Each price is a probability between 0 and 1, unless the text says cents.

## `FEE_COEFF`

```ts
const FEE_COEFF: Record<Venue, number>
```

The taker fee coefficient for each venue. `Venue` is `"poly"` or `"kalshi"`.

| Venue | Coefficient |
|---|---|
| `poly` | 0.04 |
| `kalshi` | 0.07 |

The values come from `VENUE_ECON` in `engine/config.ts`.

## `allInCost(p, venue)`

Returns the full cost of one YES share.

```
allInCost = p + coeff × p × (1 − p)
```

The fee term is largest at 50c. The fee term is zero at 0c and at 100c.

| Input | Output |
|---|---|
| `allInCost(0.5, "poly")` | 0.51 |
| `allInCost(0.5, "kalshi")` | 0.5175 |
| `allInCost(0, "poly")` | 0 |
| `allInCost(1, "poly")` | 1 |

## `feeOfStake(p, venue)`

Returns the fee as a share of the stake.

```
feeOfStake = coeff × (1 − p)
```

## `wedge(nomAsk, presAsk)`

The wedge is long the nomination and short the presidency. It wins when a candidate takes
the nomination and then loses the general election.

```
pairCost       = nomAsk + (1 − presAsk)
atRisk         = max(0, pairCost − 1)
payoutMultiple = (1 − atRisk) ÷ atRisk
```

Returns `{ pairCost, atRisk, payoutMultiple }`.

**Direction.** A higher presidency price makes the wedge **cheaper**. The short leg is the
presidency NO. A dearer YES means a cheaper NO.

A higher nomination price makes the wedge **dearer**.

If `pairCost` is below 1, then `atRisk` is 0 and `payoutMultiple` is `Infinity`.

| Input | pairCost | atRisk | payoutMultiple |
|---|---|---|---|
| `wedge(0.15, 0.10)` | 1.05 | 0.05 | 19 |
| `wedge(0.15, 0.14)` | 1.01 | 0.01 | 99 |
| `wedge(0.10, 0.30)` | 0.80 | 0 | `Infinity` |

## `lock(polyYes, kalYes, stake, months, taxRate)`

The cross-venue arbitrage. You buy YES where YES is cheaper. You buy NO where YES is
dearer. One leg always pays $1.

**The prices are in cents here.** The range is 0 to 100.

```
buyYesOn    = the venue with the lower YES price
yesPx       = min(polyYes, kalYes)
noPx        = 100 − max(polyYes, kalYes)
costPerPair = yesPx + noPx + yesFee + noFee
lockCents   = 100 − costPerPair
pairs       = stake ÷ (costPerPair ÷ 100)
profit      = pairs × (lockCents ÷ 100)
afterTax    = profit × (1 − taxRate)
atAnnual    = (1 + afterTax ÷ stake) ^ (12 ÷ months) − 1
win         = lockCents > 0
```

Returns each value above, and `buyNoOn`, `yesFeeC`, `noFeeC`, `totRet`, and `annual`.

**Read `atAnnual`, not `profit`.** A locked profit over 28 months can be a worse result
than a Treasury bill. Compare `atAnnual` against `TBILL × (1 − taxRate)`.

## `TBILL`

The risk-free yearly rate. The value is 0.043. The value comes from `TBILL_RATE` in
`engine/config.ts`. Update this value when the market moves.

## `quarterKelly(p, q)`

Returns the share of the bankroll to stake.

```
edge         = (p − q) ÷ (1 − q)
quarterKelly = max(0, edge) × 0.25
```

`p` is your probability. `q` is the market price.

We use a quarter of full Kelly because each input is an estimate. Full Kelly assumes a
perfect probability. See [Why we use quarter-Kelly](../explanation/conversion.md).

Returns 0 when there is no edge. Returns 0 when `q` is 0 or 1.

| Input | Output |
|---|---|
| `quarterKelly(0.3, 0.2)` | 0.03125 |
| `quarterKelly(0.2, 0.2)` | 0 |
| `quarterKelly(0.1, 0.2)` | 0 |
