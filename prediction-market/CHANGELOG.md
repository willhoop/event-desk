# Changelog

**Version 1.0.1 · Last updated 2026-07-22**

All notable changes to Event Desks are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Rule.** Every change to the code is logged here in the same pass, together with the
matching updates to the white paper, the deck, and the technical documentation. A prior
conclusion is never silently rewritten; what changed and why is stated.

---

## [1.0.2] — 2026-07-22

### Added
- **The source tree is now in version control.** 82 files pushed to
  `willhoop/event-desk` under `prediction-market/`, in 12 commits, one per folder. The
  three living documents, the engine, the tests, and the data are all tracked. Before
  this, only the built `index.html` was in the repository, so a lost folder lost the
  source.

### Note on the repository layout
The project sits in `prediction-market/` inside the repository, not at the repository
root. The reason is a filename collision: the repository root already holds the built
`index.html`, which is the live site that Cloudflare Pages serves. The source tree also
holds an `index.html` — the ten-line Vite shell. Pushing the source to the root would
overwrite the live site.

The repository root therefore keeps the deployment artefacts:
`index.html` (built), `kalshi.json`, `polls.json`, and `.github/workflows/`.

The proper fix is to set Cloudflare Pages to build from source: root directory
`prediction-market`, build command `npm run build`, output directory `dist`. The data
files must move to `prediction-market/public/` first, and the Actions must be updated to
write them there. This is open work. A failed Pages build does not take the site down,
because Pages keeps serving the last successful deployment.

### Changed
- **The project moved into `prediction-market/`.** The workspace folder now holds one
  folder per project. Every path inside the project is unchanged.
- **The Electoral desk no longer implies a 2028 forecast.** The desk reads the 2024 result
  by state and moves it with a national swing parameter. There is no 2028 general-election
  polling in the dataset, and none exists publicly this far out. The desk previously read
  "The 2028 map, simulated" with a "2028 · LIVE" chip, which invited the reader to treat
  the electoral-vote total as a projection.
  - The subtitle now reads "2024 baseline, your assumptions".
  - The year chip now reads "2024 base" instead of "2028 · live".
  - A caveat sits directly under the electoral-vote bar, because that bar is the number a
    reader screenshots: "NOT A FORECAST — this is the 2024 result, moved by your settings."
  - The prior conclusion is not withdrawn. The simulation is unchanged and correct. What
    changed is the label, which over-claimed. See white paper §7, which already stated the
    limitation.

### Fixed
- Version and date headers added to `CHANGELOG.md`, `build/README.md`, and
  `assets/README.md`. Every document in the project now carries both.

---

## [1.0.0] — 2026-07-22

The project is brought up to the project standards: fixed folder structure, tests, one
config block, and the three living documents.

### Added
- **Documentation set**, all versioned and dated.
  - `docs/white-paper.md` — every formula, derivation, worked value, limitation, and
    source. Sections cover venue fees, the cross-venue lock, the wedge, the conversion
    ratio, Kelly sizing, the electoral model, the sports desk, and verification.
  - `docs/deck.md` — the same content in plain words, 13 slides, linking the white paper
    on the final slide.
  - `docs/` — technical documentation in ASD-STE100 Simplified Technical English,
    organised by Diátaxis: 1 tutorial, 4 how-to guides, 5 reference documents,
    4 explanations.
  - This changelog.
- **`engine/config.ts`** — one configuration block. Every value that changes over time is
  now a single edit: site identity, refresh intervals, venue fee coefficients, the T-bill
  rate, liquidity floors, feed freshness thresholds, electoral parameters, and the Kelly
  fraction.
- **Test suite** — 42 tests under Vitest.
  - `tests/pricing.test.ts` (20) — fees, the wedge, the lock, quarter-Kelly.
  - `tests/field.test.ts` (22) — conversion, the thin-market guard, the pick, the median.
  - Every expected value is derived by hand, not captured from current output.
  - `npm test` and `npm run test:watch` added to `package.json`.

### Changed
- **Folder structure** now matches the project standard:
  `docs/ engine/ app/ data/ build/ tests/ assets/`.
  - `src/lib/*` split: pure logic to `engine/`, React hooks to `app/`.
  - `src/components/*` → `app/components/`, `src/pages/*` → `app/pages/`.
  - `src/data/*` → `data/`.
  - All imports rewritten. `tsconfig.json`, `tailwind.config.js`, and `index.html`
    updated to match.
- **`engine/pricing.ts`** now reads its fee coefficients, T-bill rate, and Kelly fraction
  from `engine/config.ts` instead of holding literals.
- **`engine/field.ts`** now reads its liquidity floors from `engine/config.ts`.

### Fixed
- **Wedge direction documented correctly.** A higher presidency price makes the wedge
  *cheaper*, not dearer, because the short leg is the presidency NO. This was asserted
  backwards in a draft test; the code was always right. The corrected direction is now
  pinned by two tests and written up in the white paper, §4.3.

### Removed
- **Dead code.** `pages/OssoffDesk.tsx` and `components/LockCalculator.tsx` were
  unreferenced after the Presidency desk rewrite. Deleted.
- **Scratch files at root.** `poll-data-desk.html`, `preview/`, `.probe`. Deleted.

### Design
- **Decorative glyphs removed** from the interface: check marks, crosses, the warning
  sign, and the pause bars are now words. Functional marks are kept — `+`/`−` for price
  direction, disclosure triangles, the external-link arrow.
- **Accent gradient removed** from the Midterms progress bar; it is now a flat brand fill.

---

## [0.9.0] — 2026-07-20

### Added
- **Sports desk** at `/sports`. The LeBron James free-agency board, read live from
  Polymarket in the browser: the full field, a 7-day movers strip, the price tape for the
  top three, and a cap-space section explaining the favourite.
  - `engine/sports.ts`, `app/useField.ts`, `app/components/OddsBoard.tsx`,
    `data/lebron.ts`.
  - Cap figures are a labelled snapshot with source and date (ESPN, 2026-07-10).
- **Clickable ticker.** Each priced segment links out to the venue it was read from. The
  crawl pauses on hover and on touch, because a moving target is hard to tap.
  - `engine/venues.ts`. Every URL was confirmed against the venue's own API before use.
- **Electoral map affordances.** A legend strip showing the tap cycle, a "N states set by
  you" badge with a clear control, and a thumb-sized battleground row of the ten closest
  states — Delaware is a few pixels wide on a phone.

### Changed
- **The Presidency desk replaced the Ossoff desk.** The article is now the whole 2028
  field ranked by conversion, and the house pick is computed from live prices rather than
  written into the code. `/ossoff` redirects to `/presidency`.
- **The lock calculator became a verdict panel.** Five labelled form rows replaced by one
  large answer, visible before any input is touched, with nudgeable price chips and stake
  presets.
- **Home page** now derives its poll figures and its house call from the live engines
  instead of hard-coded percentages.
- **Cross-venue comparisons now use two real books.** Polymarket is fetched per runner
  (`app/usePolyRunner.ts`); previously the same price was passed for both venues, which
  would have reported phantom arbitrage for any candidate other than Ossoff.

### Fixed
- **Thin markets excluded from the house pick.** On first live load the engine named
  Beshear at 75% conversion off a 4c/3c market, where one tick moves the ratio 25 points.
  Runners must now clear 8c nomination and 4c presidency to be eligible. Thin runners are
  still shown, labelled THIN and greyed. The field median moved 62% → 61%.
  Written up in `docs/explanation/thin-markets.md` and white paper §5.3.
- **Chart stretching on mobile.** `preserveAspectRatio="none"` was scaling every chart
  non-uniformly, distorting lines and text. Charts now measure their container and draw
  1:1 in CSS pixels.
- **Chart hover.** The tooltip was pinned to the top of the plot regardless of cursor
  position; it now anchors beside the points it describes. On a phone the card sat under
  the reader's thumb, so values now render in a readout bar above the chart.
- **Sticky header bleed.** The header was 800px wide while the board below it was 1080px,
  so content slid past it on both sides. The header backdrop is now full-bleed.
- **Mobile masthead.** 40px type wrapped "The Presidency" onto two lines and the sticky
  header consumed 191px of a phone screen. Now 103px, one line, with the subtitle beneath.
- **Tap targets.** The spread controls were 24px; raised to 36px.
- **Tailwind missing from a build.** A build run from a scratch directory without
  `tailwind.config.js` produced a styles-free site while reporting success. The deploy
  procedure now greps the output for a known rule before shipping.

---

## [0.8.0] — 2026-07-20

### Changed
- **Hosting moved to Cloudflare Pages** with the custom domain `elitefourcapital.com`
  (and `www` alias). Some mobile carriers block `github.io`, which made the previous
  address unreachable for the intended readers.
  - Both domains use a proxied CNAME to `event-desk.pages.dev`.
  - Every commit to `main` now deploys automatically.
- **Documentation rewritten** in ASD-STE100 Simplified Technical English.

### Fixed
- **Kalshi workflow push race.** Run 18 failed with `! [rejected] main -> main`. Each
  Action now runs `git pull --rebase --autostash` in a five-attempt retry loop with a
  concurrency guard.
- **Kalshi freshness claim corrected.** The cron requests 10 minutes; GitHub delays
  scheduled workflows on low-activity repositories and the true interval is 1–2 hours.
  The site now reports the true age and no longer claims minute-level freshness.
  Written up in `docs/explanation/kalshi-delay.md`.

---

## Earlier

Versions before 0.8.0 predate this changelog. The site began as a single-candidate Ossoff
desk and grew to cover polling, the electoral map, midterms, and bet sizing.

[1.0.0]: https://github.com/willhoop/event-desk
[0.9.0]: https://github.com/willhoop/event-desk
[0.8.0]: https://github.com/willhoop/event-desk
