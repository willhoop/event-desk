# Explanation: why the Kalshi prices are not live to the minute

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

## The constraint

Kalshi blocks a request from a browser. The API sends no CORS header. Therefore the site
cannot read Kalshi prices the way it reads Polymarket prices.

Polymarket permits a browser request. Polymarket prices are live in the page.

## The current method

A GitHub Action reads Kalshi on a schedule. The workflow is
`.github/workflows/kalshi.yml`. The workflow runs `build/build-kalshi.js`. The script
writes `kalshi.json` and commits the file. The site reads `kalshi.json` from the same
origin.

## The delay

The cron asks for every 10 minutes:

```yaml
schedule:
  - cron: "*/10 * * * *"
```

GitHub does not obey this. GitHub delays a scheduled workflow on a repository with low
activity. GitHub documents this behaviour.

The observed run times on 2026-07-20 were 13:04, 15:05, 16:39, and 17:49. The true
interval was 1 hour to 2 hours.

## What we do about it

We do not claim the prices are live to the minute.

- The admin page shows the true age in minutes.
- The threshold for the "live" label is 90 minutes, not 10. The value is
  `FRESHNESS.liveMins` in `engine/config.ts`.
- Over the threshold, the page reads "stale" and the light turns gold.

A number that is an hour old is fine for a market that resolves in 2028. A label that
lies about the age is not fine at any horizon.

## The proper fix

Move the fetch to a Cloudflare Pages Function.

1. Put a file at `functions/kalshi.json.js`.
2. The Function fetches Kalshi on each request. The Function runs on the server, so CORS
   does not apply.
3. The Function replaces the GitHub Action.

The prices then become true live data. The Action can be deleted.

This is not done yet. Two things must be checked first:
- The Function shadows the static `kalshi.json`. Test the failure path.
- Confirm Kalshi does not block requests from Cloudflare's network.

## The related failure

Run 18 of the workflow failed with `! [rejected] main -> main (fetch first)`. Two commits
raced: the Action pushed `kalshi.json` while a deployment pushed `index.html`.

The fix: each Action runs `git pull --rebase --autostash origin main` inside a five-attempt
retry loop, with a concurrency guard on the workflow.

## Sources

- GitHub Actions documentation, "Events that trigger workflows — schedule": a scheduled
  workflow can be delayed during periods of high load, and workflows on repositories with
  low activity are disabled or delayed.
  https://docs.github.com/en/actions/reference/events-that-trigger-workflows
- Observed run history, `willhoop/event-desk`, workflow `kalshi.yml`, runs 44 to 47,
  read 2026-07-20.
