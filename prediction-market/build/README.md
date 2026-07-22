# build/
**Version 1.0.0 · Last updated 2026-07-22**

Scripts the GitHub Actions run. These are Node and Python scripts, not part of the site
bundle.

| Script | Workflow | It writes |
|---|---|---|
| `build-kalshi.js` | `.github/workflows/kalshi.yml` | `kalshi.json` |
| `build-polls.js` | `.github/workflows/polls.yml` | `polls.json` |
| `build-futuresearch.py` | `.github/workflows/futuresearch.yml` | `futuresearch.json` |

The scripts live in the `willhoop/event-desk` repository root today. Move them here when
the source tree is pushed to the repository.

See [../docs/how-to/refresh-data.md](../docs/how-to/refresh-data.md).
