# Event Desks — the deck

### Prediction markets, priced and explained

**Version 1.0.1 · Last updated 2026-07-22**
**Elite Four Capital**

> This is a living document. It is updated in the same pass as any change to the site.
> Plain words only. The math lives in the [white paper](white-paper.md).

---

## Slide 1 — What this is

**A site that reads prediction markets and tells you where they look wrong.**

Prediction markets let people bet on real events: who wins an election, where a player
signs. The prices are odds.

Event Desks watches two of these markets — Polymarket and Kalshi — and does three things:

1. Shows you the prices, live.
2. Works out what a bet actually costs after fees and tax.
3. Points at the places where the market looks too confident.

**elitefourcapital.com**

---

## Slide 2 — The one idea

**Divide one price by another and you learn something neither price tells you.**

Every serious candidate has two markets:

- Will their party pick them? → say **15¢**
- Will they win the whole thing? → say **10¢**

Divide: 10 ÷ 15 = **67%**.

That reads as one sentence:

> **"If this person gets nominated, the market thinks they win two times out of three."**

We call it **conversion**.

---

## Slide 3 — Why conversion matters

The election is more than two years away.

- Neither party has a nominee.
- Nobody knows who runs against whom.
- No poll can test a matchup that doesn't exist yet.

And yet the market says *two out of three.*

**That is a very confident claim about something nobody can see.**

Confidence like that is what you sell.

---

## Slide 4 — The bet: "The Wedge"

One trade captures it. Two tickets:

| Ticket | What it says |
|---|---|
| Buy | "They get nominated." |
| Buy | "They do **not** win the election." |

Three things can happen:

| What happens | You get |
|---|---|
| Not nominated | Your money back |
| Nominated, then loses | **A big win** |
| Nominated, and wins | Your money back |

You only lose a little, and only in one narrow case. You win big in the middle row.

**Live example:** risk about **$100** to win about **$1,900**.

---

## Slide 5 — The site picks the candidate, not us

The site ranks everyone the market quotes and picks the highest conversion.

**No name is written into the code.**

If the money moves to someone else tomorrow, the pick changes tomorrow. The site can't go
stale, and it can't disagree with itself.

Today it picks **Ossoff at 67%**, against a field median of 61%.

---

## Slide 6 — A mistake we caught

The very first time the board went live, it picked **Beshear at 75%** — the highest number
on the screen.

It was junk.

Beshear was quoted at **4¢ and 3¢**. The smallest move the exchange allows is 1¢. So:

| If the price ticks to | The "75%" becomes |
|---|---|
| 2¢ | 50% |
| 3¢ | **75%** |
| 4¢ | 100% |

**One tick swings the headline 25 points.** The number was measuring the tick, not the
market.

**The fix:** a runner needs real money on both sides to be picked. Thin markets still
appear — labelled THIN and greyed out — because hiding a number is its own kind of lying.

---

## Slide 7 — "Free money" usually isn't

Sometimes the same bet is cheaper on one site than the other. Buy low on one, sell high on
the other, and you can lock a profit before you know the result.

The site checks this live. Today's answer:

> **+$7.86 locked** on $1,000.
> That's **0.3% a year** over 28 months.
> A Treasury bill pays **3.3%**.
> **Skip it.**

**The lesson:** a guaranteed profit can still be a bad trade. Your money is stuck for
two and a half years. The site always compares against just leaving it in cash.

---

## Slide 8 — Fees eat the gap

Both sites charge a fee, and the fee is **biggest on a coin-flip bet**.

- A bet at 50¢ carries the most fee.
- A bet at 5¢ or 95¢ carries almost none.

That's why a "3¢ gap" between two sites often isn't a gap at all — the fees ate it.

The site does this arithmetic for you before it says the word "profit."

---

## Slide 9 — How much to bet

There's a formula for the biggest bet the math justifies. It's called Kelly.

**We use a quarter of it.**

Why: Kelly assumes you *know* the odds. You don't — you estimated them. And betting too
much loses money much faster than betting too little forfeits it.

A quarter keeps most of the upside and takes out most of the risk of being wrong.

---

## Slide 10 — The sports desk

Same machinery, different question: **where does LeBron sign?**

| Team | Price |
|---|---|
| Miami | **49¢** |
| Cleveland | 26¢ |
| Philadelphia | 14¢ |
| Golden State | 9.5¢ |

The story everyone tells is about legacy and homecoming.

**The actual answer is the salary cap:**

| Team | Most they can pay |
|---|---|
| **Miami** | **~$7.0m** |
| Cleveland | $3.9m (maybe $6.1m) |
| Everyone else | $3.9m — the league minimum |

Miami is the only team that can meaningfully outbid the field. That's the 49¢.

**Betting against Miami is betting that a few million dollars doesn't matter to a
41-year-old chasing a fifth ring.** That's a real argument — it's just the argument you're
actually making.

---

## Slide 11 — The map

Click any state to flip it. The count updates instantly. 20,000 elections are simulated
every time you move a slider.

**Be careful what it means.**

It starts from the **2024 result**, not from 2028 polling — because 2028 general-election
polling doesn't exist yet.

So "Republicans 287" means:

> *"If 2028 looks like 2024, adjusted by whatever assumptions you dial in."*

It is **not** a forecast. The site says so on the page.

---

## Slide 12 — What we promise

**Every number is live or computed.** Nothing is typed in and left to rot.

**Snapshots are labelled.** The only fixed numbers on the site are the NBA cap figures, and
they carry a source and a date.

**We report the true age of the data.** The Kalshi feed actually lags 1–2 hours, so the
site says so instead of claiming "live."

**We publish our mistakes.** The Beshear pick and a bad Lakers price are both written up
in the white paper.

---

## Slide 13 — Read more

**The white paper** — every formula, every derivation, every source:

**[docs/white-paper.md](white-paper.md)**

Covers: the fee model, the arbitrage condition, the wedge algebra, the conversion proof,
Kelly sizing, the electoral simulation, all known limitations, and the full reference list.

**The technical documentation** — how to run, deploy, and extend the site:

**[docs/README.md](README.md)**

**The changelog** — what changed, when, and why:

**[CHANGELOG.md](../CHANGELOG.md)**

---

*Educational, not investment advice. Elite Four Capital · elitefourcapital.com*
