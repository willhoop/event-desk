# Where this project lives

**Version 1.0.2 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

## The three locations

| Location | It holds | Status |
|---|---|---|
| `github.com/willhoop/event-desk` → `prediction-market/` | The full source and documentation. 82 files. | **The record of truth.** |
| `Projects/prediction-market/` | The same source and documentation. | The working copy. |
| `event-desk-app/prediction-market/` | An older copy. | Delete this. |

The source is in version control since 2026-07-22. A lost folder no longer loses the work.

## Rule: work in one folder

Two identical folders drift apart. Work in `Projects/prediction-market/` only.

Delete `event-desk-app/prediction-market/`. It is a duplicate. It will disagree with this
folder after the first change.

## Why the project is not at the repository root

The repository root holds the **built** `index.html`. That file is the live site.
Cloudflare Pages serves it.

This source tree also holds an `index.html`. That file is the Vite shell, and it is ten
lines long. Two different files cannot both be `index.html` at the root. Pushing the
source to the root would replace the live site with the shell, and the site would go down.

Therefore the repository holds two things:

| Path | It holds |
|---|---|
| repository root | `index.html` (built), `kalshi.json`, `polls.json`, `.github/workflows/` |
| `prediction-market/` | The full source and documentation |

## The proper fix (open work)

Set Cloudflare Pages to build from the source. Then the built file does not need a commit.

1. Move `kalshi.json` and `polls.json` to `prediction-market/public/`.
2. Update each GitHub Action to write to that folder.
3. In the Pages project, set:
   - Root directory: `prediction-market`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Push. Check the deployment.

A failed build does not take the site down. Cloudflare Pages continues to serve the last
successful deployment.

## How to deploy today

1. Run `npm test`. Then run `npm run build`.
2. Check the output: `grep -c 'bg-paper{' dist/index.html` must return `1`.
3. Upload `dist/index.html` to the **repository root**. Name it `index.html`.
4. Upload the changed source files to `prediction-market/`.
5. Open the live site. Press Ctrl+Shift+R. Verify the change with your eyes.

See [docs/how-to/deploy.md](docs/how-to/deploy.md).

## How to verify a copy

Run these commands in the copy. All three must pass.

```
npm install
npm test          # 42 tests
npm run build     # writes dist/index.html
```

## Start here

Read [README.md](README.md). Then read [docs/README.md](docs/README.md).
