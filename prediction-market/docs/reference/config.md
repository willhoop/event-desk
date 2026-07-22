# Reference: the configuration block

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

The file is `engine/config.ts`.

## Rule

Each value that changes over time lives in this file. An update is one edit.

If a number will be stale next month, put it here. Do not put it in a component.

## `SITE`

| Key | Value |
|---|---|
| `brand` | `"Elite Four Capital"` |
| `name` | `"Event Desks"` |
| `origin` | `"https://elitefourcapital.com"` |
| `repo` | `"https://github.com/willhoop/event-desk"` |

## `REFRESH`

Each value is in milliseconds.

| Key | Value | It controls |
|---|---|---|
| `prices` | 60000 | The Polymarket price polling. |
| `board` | 60000 | The sports board polling. |

## `VENUE_ECON`

| Key | Value | It means |
|---|---|---|
| `polyFeeCoeff` | 0.04 | The Polymarket taker fee coefficient. |
| `kalshiFeeCoeff` | 0.07 | The Kalshi taker fee coefficient. |
| `kalshiInterest` | 0.0325 | The yearly interest Kalshi pays on collateral. |
| `polyFrictionPct` | 0.05 | The Polymarket conversion and withdrawal drag. |

## `TBILL_RATE`

The value is 0.043. This is the risk-free yearly rate. A locked trade must beat this rate
after tax. Update this value when the market moves.

## `LIQUIDITY`

| Key | Value | It means |
|---|---|---|
| `minShow` | 0.03 | The floor to show a conversion ratio. |
| `minPickNom` | 0.08 | The nomination floor to be the house pick. |
| `minPickPres` | 0.04 | The presidency floor to be the house pick. |
| `maxConv` | 1.6 | Above this, the ratio is incoherent. |

## `FRESHNESS`

| Key | Value | It means |
|---|---|---|
| `liveMins` | 90 | Under this age, the feed reads as live. |
| `staleMins` | 90 | Over this age, the admin page reads stale. |

The Kalshi cron asks for 10 minutes. GitHub delays the run. The true interval is 1 to 2
hours. Therefore the threshold is 90 minutes and not 10.

See [Why the Kalshi prices are not live to the minute](../explanation/kalshi-delay.md).

## `ELECTORAL`

| Key | Value |
|---|---|
| `runs` | 20000 |
| `sigma` | 4 |
| `toWin` | 270 |
| `total` | 538 |

## `SIZING`

| Key | Value | It means |
|---|---|---|
| `kellyFraction` | 0.25 | We stake a quarter of full Kelly. |
