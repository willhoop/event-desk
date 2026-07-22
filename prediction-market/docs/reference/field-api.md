# Reference: the field engine

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

The file is `engine/field.ts`. The tests are in `tests/field.test.ts`.

The field engine turns the Kalshi board into a ranked list. The engine computes the house
pick. No candidate name is written into the code.

## `Runner`

```ts
interface Runner {
  name: string;          // the full name, as the venue writes it
  last: string;          // the short display name
  party: "D" | "R";
  nom: number | null;    // the party nomination price, 0 to 1
  pres: number | null;   // the presidency price, 0 to 1
  conv: number | null;   // pres ÷ nom
  atRisk: number | null; // the wedge cost per pair
  pays: number | null;   // the wedge payout multiple
  color: string;         // stable per name. Never ember. Never green.
}
```

## `buildField(kalshi)`

Returns a `Runner[]`. A runner appears if the nomination board or the presidency board
quotes the name.

The engine reads the Democratic board, then the Republican board, then any name quoted
only for the presidency. The engine adds each name one time.

## `conv` — the conversion

```
conv = pres ÷ nom
```

Read it as: "The market says this person wins the election in this share of the worlds
where the party nominates them."

A high conversion means the market is confident about a general election that is still
years away. The wedge sells that confidence.

## The liquidity floors

Each value comes from `LIQUIDITY` in `engine/config.ts`.

| Constant | Value | It means |
|---|---|---|
| `MIN_LIQ` | 0.03 | Below this, the engine does not show a ratio. |
| `PICK_MIN_NOM` | 0.08 | Below this, the runner cannot be the pick. |
| `PICK_MIN_PRES` | 0.04 | Below this, the runner cannot be the pick. |
| `LIQUIDITY.maxConv` | 1.6 | Above this, the ratio is incoherent. |

## `isThin(runner)`

Returns `true` when the ratio is real but the quotes are too small to carry it.

```
isThin = nom < PICK_MIN_NOM  OR  pres < PICK_MIN_PRES
```

A 4c nomination against a 3c presidency reads as 75%. One tick moves that by twenty
points. The board marks the runner THIN. The engine never picks the runner. The engine
never counts the runner in the median.

See [Why we exclude thin markets](../explanation/thin-markets.md).

## `tradable(field)`

Returns each runner with both legs quoted, a nomination at or above `MIN_LIQ`, and a
conversion between 0 and `maxConv`.

## `liquid(field, party?)`

Returns each tradable runner that is not thin. This is the pool for the pick and for the
median.

## `housePick(field, party?)`

Returns the liquid runner with the highest conversion. Returns `null` when the pool is
empty.

The house pick is computed. The pick moves when the prices move.

## `medianConv(field, party?)`

Returns the median conversion across the liquid pool. This is the yardstick. "High" means
high against today's board, not against a fixed number.

## `shortName(name)`

Returns the surname. Keeps a generational suffix.

| Input | Output |
|---|---|
| `"Jon Ossoff"` | `"Ossoff"` |
| `"Alexandria Ocasio-Cortez"` | `"Ocasio-Cortez"` |
| `"Donald J. Trump Jr."` | `"Trump Jr."` |

## `presSlug(name)` and `nomSlug(name)`

`presSlug` builds the Polymarket address for a presidency market. The pattern is stable.

`nomSlug` returns a confirmed address, or `null`. The nomination addresses carry a numeric
suffix that you cannot guess. Only confirmed addresses are listed.
