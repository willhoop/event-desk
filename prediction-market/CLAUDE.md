# Event Desks — Project Guide

**Version 1.0.1 · Last updated 2026-07-22**

*This guide uses ASD-STE100 Simplified Technical English: short sentences, active voice,
present tense, and one instruction per sentence.*

Event Desks is a prediction-market analysis website. The brand is Elite Four Capital.
The stack is React, Vite, TypeScript, and Tailwind. The build makes one self-contained
`index.html` file. Cloudflare Pages serves the site. The repository is `willhoop/event-desk`.
The address is https://elitefourcapital.com.

---

## Rule 1: the three documents are living

Every change ships with its documentation. Update these in the same pass as the code:

| Document | Path | It holds |
|---|---|---|
| White paper | `docs/white-paper.md` | The technical detail and the math. Each source has a citation. |
| Slide deck | `docs/deck.md` | The same content in plain words. It links the white paper on the final slide. |
| Technical docs | `docs/` | ASD-STE100, organised by Diátaxis. |
| Changelog | `CHANGELOG.md` | Each change, with the date and the reason. |

Obey these steps for each change:
1. Change the code.
2. Update the white paper if you changed a formula, a limit, or a data source.
3. Update the deck if you changed what the site does.
4. Update the technical documentation if you changed a procedure or a value.
5. Add a line to `CHANGELOG.md`.
6. Increase the version. Change the "last updated" date.

Do not let the documentation fall behind the build. Do not delete a prior conclusion. Add
the new information. Write what changed. Write why.

Length is never capped. Completeness beats brevity.

---

## Rule 2: the folder structure is fixed

| Folder | It holds | Rule |
|---|---|---|
| `docs/` | The documentation. | Four Diátaxis groups. |
| `engine/` | The typed logic. | No React. No JSX. Each file is testable. |
| `app/` | The user interface. | React only. |
| `data/` | The datasets. | A snapshot carries a source and a date. |
| `build/` | The build and feed scripts. | Node scripts the Actions run. |
| `tests/` | The tests. | Vitest. Tests `engine/`. |
| `assets/` | The static files. | Images and fonts. |

Do not put a scratch file in the root. Delete a superseded file.

---

## Rule 3: one configuration block

Each value that changes over time lives in `engine/config.ts`. An update is one edit.

If a number will be stale next month, put it there. Do not put it in a component.

---

## Rule 4: the style guide is the source of truth

All shared user-interface parts are in `app/components/ui.tsx`. These parts are Lead, Note,
List, Item, Facts, Fact, Verdict, Badge, BarRow, Table, Loading, and Empty. Each desk uses
these parts. Do not add an inline style. The `/style` page shows the parts. If you change
one part, all desks change. To make a new article, use these parts inside `<Section>` from
`app/components/Shell.tsx`.

---

## Design rules

Obey these rules for each change. The full list is in `docs/reference/design-rules.md`.

- **Colors.** Use slate (`#16181c` and `#1f2226`) for surfaces. Use ember (`#e2572b`) for
  the brand, a loss, and WAIT. Use green (`#4a9e7f`) for a gain, LIVE, and BUY. The
  candidate colors are in `engine/colors.ts`. Do not use ember or green for a candidate or
  a team. A price renders pure white.
- **Charts.** Use smooth curves. Put a label at the end of each line on a wide screen. Put
  the controls below the chart. Put the hover card beside the points it describes. On a
  narrow screen put the values above the chart, because a finger covers the middle. Never
  set `preserveAspectRatio="none"`.
- **Verdict banners.** Use green for go. Use ember for wait. Make the numbers bold. Keep
  the text at normal weight. Put the answer first and largest.
- **Measure.** `Wrap` sets the article width to 800px. Keep the eye travel short. Do not
  make a desk wider than `Wrap`. To make one element wider, use `Wide` from `Shell.tsx`.
- **Mobile.** Support mobile for each change. Use one column below 720px. Make each tap
  target 36px or more. Let the tables scroll sideways. Use 16px inputs. Give a small target
  a large alternative.
- **Data.** Compute each number, or read it live. Do not write a number in the code. If a
  value is a snapshot, label it as a snapshot. Verify each value against an authoritative
  source. Do not assume a value.
- **Look.** The site must not look machine-made. Do not use an emoji. Do not use filler. Do
  not use an accent stripe or a decorative gradient. Show, do not tell: use a picture and a
  colour before a paragraph. One job per screen. Rank by real-world importance, never
  alphabetically.

---

## Honesty rules

- Verify before you say a task is done. Run it. Test it.
- Never claim a success you cannot verify. Say what the user must check.
- State a blocker immediately. Give the real reason. Do not loop on a workaround.
- No dead code. Wire a feature up, or delete it.
- When the user finds an error, treat it as a defect. Reproduce it. Fix it. Test it. Log it
  in `CHANGELOG.md`.

---

## How to run and build

1. Run `npm install`. Do this one time.
2. Run `npm run dev`. This starts the local server at http://localhost:5173.
3. Run `npm test`. This runs the 42 engine tests. They must pass.
4. Run `npm run build`. This checks the types and makes `dist/index.html`.

## How to deploy

1. Run `npm test`. Then run `npm run build`.
2. Check the output: `grep -c 'bg-paper{' dist/index.html` must return `1`. A `0` means
   Tailwind did not run and the site will have no styles.
3. Upload `dist/index.html` to the repository root. Name the file `index.html`.
4. Cloudflare Pages sees the commit. It deploys the site automatically.
5. Open the live site. Press Ctrl+Shift+R. Verify the change with your eyes.

The site uses hash routing and relative assets. Therefore the site works from any path.
The data files (`kalshi.json`, `polls.json`, and `futuresearch.json`) stay in the
repository root. The site reads these files from the same origin.

---

## Architecture

- `engine/` holds the typed logic. `config.ts` holds each value that changes. `pricing.ts`
  computes the fees, the wedge, the lock, and quarter-Kelly. `field.ts` computes the
  conversion board and the house pick. `sports.ts` holds the sports desks. `pollModel.ts`
  is the fitted 1972–2024 logistic model. `pollAvg.ts` computes the E4 pollster scores and
  the house effects. `polymarket.ts` and `kalshi.ts` are the API clients. `venues.ts` holds
  the outbound venue addresses.
- `app/` holds the interface. The hooks are `useLive`, `useHistory`, `useBets`,
  `useMidterms`, `usePolls`, `useFutureSearch`, `useField`, and `usePolyRunner`.
  `router.tsx` holds the routes. The router uses hash routing. A root layout resets the
  scroll position on each navigation.
- `data/` holds the data. `polls.ts` holds the bundled poll dataset. `states.ts` holds the
  electoral map. `usGeo.ts` holds the projected state shapes. `elections.ts` holds the
  historical results. `lebron.ts` holds the cap-space snapshot.
- `tests/` holds the Vitest tests. Each expected value is derived by hand.

---

## Live data

- **Polymarket.** The browser gets the Polymarket prices directly. Polymarket permits this.
- **Kalshi.** Kalshi blocks the browser. Therefore a GitHub Action gets the prices. The
  workflow is `.github/workflows/kalshi.yml`. It runs `build/build-kalshi.js`. It writes
  `kalshi.json` and commits the file. Do not get the Kalshi prices from the browser.

  The cron asks for every 10 minutes. GitHub does not obey this. GitHub delays a scheduled
  workflow on a repository with low activity. The true interval is 1 hour to 2 hours.
  Therefore the Kalshi prices can be one hour old. The admin page shows the true age. Do
  not claim that the Kalshi prices are live to the minute.

  To make the Kalshi prices true live data, move the fetch to a Cloudflare Pages Function
  at `functions/kalshi.json.js`. See `docs/explanation/kalshi-delay.md`.
- **Polls.** A GitHub Action can refresh the poll data. It reads a CSV from the
  `POLLS_CSV_URL` variable. If the file is absent, the site uses the bundled dataset.
- **FutureSearch.** A GitHub Action gets the AI forecast. It reads the
  `FUTURESEARCH_API_KEY` secret. This workflow runs manually only. Each run has a cost.

Each Action runs `git pull --rebase` before `git push`. This prevents a push race.

---

## Admin

The `/admin` route shows the Mission Control page. This page shows the data-feed status,
the true age of each feed, a link to run each Action, the model internals, and the pollster
scores. This route is not in the public menu.

## Hosting

Cloudflare Pages serves the site. The project is `event-desk`. Each commit to `main` starts
a deployment.

Two custom domains point to the project. `elitefourcapital.com` is the main address.
`www.elitefourcapital.com` is an alias. Each domain uses a proxied CNAME record. The target
is `event-desk.pages.dev`. Some mobile carriers block `github.io`. The custom domain removes
that block.

## Traffic

Cloudflare Web Analytics counts the visitors. Use **Analytics → Web analytics**. Do not use
the HTTP Traffic page; it counts bots. See `docs/how-to/measure-traffic.md`.

---

## Open work

- Move the Kalshi fetch to a Cloudflare Pages Function. This makes the prices true live
  data and removes the GitHub Action.
- Label the Electoral desk clearly as a 2024 baseline, not a 2028 forecast.
- Add the multi-bet correlation sizer. Add the seat-count distributions to the Midterms
  desk.
- Add tests for `pollAvg.ts` and `pollModel.ts`.
