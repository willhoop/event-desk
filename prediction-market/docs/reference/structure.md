# Reference: folder structure

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

## The folders

| Folder | It holds | Rule |
|---|---|---|
| `docs/` | The documentation. | Four Diátaxis groups. |
| `engine/` | The typed logic. | No React. No JSX. Each file is testable. |
| `app/` | The user interface. | React only. |
| `data/` | The datasets. | A snapshot carries a source and a date. |
| `build/` | The build and feed scripts. | Node scripts the Actions run. |
| `tests/` | The tests. | Vitest. Tests `engine/`. |
| `assets/` | The static files. | Images and fonts. |
| `dist/` | The build output. | Generated. Do not edit. |

## The root files

| File | It holds |
|---|---|
| `README.md` | The start page. |
| `CHANGELOG.md` | Each change, with a date and a version. |
| `CLAUDE.md` | The project rules. |
| `index.html` | The HTML shell. It loads `app/main.tsx`. |
| `package.json` | The packages and the commands. |
| `vite.config.ts` | The build configuration. |
| `tailwind.config.js` | The colour and font tokens. |
| `tsconfig.json` | The TypeScript configuration. |

Do not put a scratch file in the root. Delete a superseded file.

## `engine/` — the logic

| File | It computes |
|---|---|
| `config.ts` | Each value that changes over time. One block. |
| `pricing.ts` | The fees, the wedge, the lock, and quarter-Kelly. |
| `field.ts` | The conversion board and the house pick. |
| `sports.ts` | The sports desk definitions and the field statistics. |
| `pollModel.ts` | The 1972 to 2024 logistic model. |
| `pollAvg.ts` | The E4 pollster scores and the house effects. |
| `polymarket.ts` | The Polymarket API client. |
| `kalshi.ts` | The Kalshi data reader. |
| `venues.ts` | The outbound venue addresses. |
| `format.ts` | The number formats. |
| `colors.ts` | The candidate colours. |
| `portraits.ts` | The portrait lookup. |

## `app/` — the interface

| Path | It holds |
|---|---|
| `app/main.tsx` | The entry point. |
| `app/router.tsx` | The routes. Hash routing. |
| `app/index.css` | The Tailwind import. |
| `app/use*.ts` | The React hooks. Each hook wraps one feed. |
| `app/components/` | The shared parts. |
| `app/pages/` | One file per desk. |

## The routes

| Path | Page | In the menu |
|---|---|---|
| `/` | Home | Yes |
| `/presidency` | PresidencyDesk | Yes |
| `/sports` | SportsDesk | Yes |
| `/polling` | PollingDesk | Yes |
| `/polls-data` | PollDataDesk | Yes |
| `/electoral` | ElectoralDesk | Yes |
| `/midterms` | MidtermsDesk | Yes |
| `/sizing` | PortfolioDesk | Yes |
| `/style` | StyleGuide | No |
| `/admin` | AdminDesk | No |
| `/ossoff` | Redirects to `/presidency` | No |

## Rule: the style guide is the source of truth

Each shared part is in `app/components/ui.tsx`. The parts are Lead, Note, List, Item,
Facts, Fact, Verdict, Badge, BarRow, Table, Loading, and Empty.

Each desk uses these parts. Do not add an inline style. If you change one part, each desk
changes. The `/style` page shows each part.
