# Event Desks — Elite Four Capital

**Version 1.0.1 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

Event Desks is a prediction-market analysis website. The site reads Polymarket and Kalshi.
The site prices each bet after the fees and the tax. The site shows where a market looks
too confident.

The address is **https://elitefourcapital.com**.

## The desks

| Desk | Path | It answers |
|---|---|---|
| The Presidency | `/presidency` | Which 2028 candidate does the market over-rate? |
| Sports | `/sports` | Which team signs LeBron James? |
| Polling | `/polling` | What do the primary polls say? |
| Poll Data | `/polls-data` | Where do the polls and the money disagree? |
| Electoral | `/electoral` | What does the map do if you change one state? |
| Midterms | `/midterms` | Who controls the House and the Senate? |
| Sizing | `/sizing` | How much should you bet? |

## Start here

| You want to | Read |
|---|---|
| Run the site | [docs/tutorial/get-started.md](docs/tutorial/get-started.md) |
| Deploy a change | [docs/how-to/deploy.md](docs/how-to/deploy.md) |
| Understand the math | [docs/white-paper.md](docs/white-paper.md) |
| Explain it to a person | [docs/deck.md](docs/deck.md) |
| Find a fact | [docs/reference/](docs/reference/) |
| Know why | [docs/explanation/](docs/explanation/) |
| See what changed | [CHANGELOG.md](CHANGELOG.md) |

## The commands

```
npm install     # get the packages. Do this one time.
npm run dev     # start the local server at http://localhost:5173
npm test        # run the 42 engine tests
npm run build   # check the types and write dist/index.html
```

## The structure

| Folder | It holds |
|---|---|
| `docs/` | The documentation. Four Diátaxis groups. |
| `engine/` | The typed logic. No React. Each file is testable. |
| `app/` | The user interface. React only. |
| `data/` | The datasets. A snapshot carries a source and a date. |
| `build/` | The scripts the GitHub Actions run. |
| `tests/` | The Vitest tests. |
| `assets/` | The static files. |

Do not put a scratch file in the root. Delete a superseded file.

See [docs/reference/structure.md](docs/reference/structure.md) for each file.

## The stack

React 18, Vite 5, TypeScript, and Tailwind. The `vite-plugin-singlefile` plugin makes one
self-contained `index.html`. The file is about 550 kB, and about 180 kB over the network.

Cloudflare Pages serves the site. Each commit to `main` starts a deployment.

## The data

| Source | Method | True latency |
|---|---|---|
| Polymarket prices | The browser reads the API. | Seconds. |
| Kalshi prices | A GitHub Action writes `kalshi.json`. | 1 to 2 hours. |
| Poll data | A GitHub Action writes `polls.json`. | Daily. |
| AI forecast | A GitHub Action writes `futuresearch.json`. | Manual. Each run has a cost. |

Kalshi blocks the browser. Therefore the site cannot read Kalshi prices directly.

The Kalshi cron asks for 10 minutes. GitHub delays the run. The true interval is 1 to 2
hours. The site shows the true age. Do not claim the Kalshi prices are live to the minute.
See [docs/explanation/kalshi-delay.md](docs/explanation/kalshi-delay.md).

## The rules

Read [CLAUDE.md](CLAUDE.md) before you change the code. The important rules are:

- Compute each number, or read it live. Do not write a number in the code.
- Label a snapshot as a snapshot. Give the source and the date.
- Put each value that changes over time in `engine/config.ts`.
- Update the white paper, the deck, the documentation, and `CHANGELOG.md` in the same pass
  as the code change.
- Verify a change on the live site before you report success.

## Admin

The `/admin` route shows the Mission Control page. The page shows each feed, the true age,
the model internals, and the pollster scores. This route is not in the public menu.

---

Educational, not investment advice.
