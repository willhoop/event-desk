# How to refresh the data feeds

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

The site has four data sources. Two are live in the browser. Two use a GitHub Action.

| Source | Method | Refresh | You can force it |
|---|---|---|---|
| Polymarket prices | Browser fetch | 60 seconds | Reload the page. |
| Polymarket board | Browser fetch | 60 seconds | Reload the page. |
| Kalshi prices | GitHub Action | 1 to 2 hours | Yes. See below. |
| Poll data | GitHub Action | Daily | Yes. See below. |
| AI forecast | GitHub Action | Manual only | Yes. Each run has a cost. |

## Force a Kalshi refresh

1. Open https://github.com/willhoop/event-desk/actions/workflows/kalshi.yml.
2. Click **Run workflow**.
3. Select the `main` branch. Click **Run workflow**.
4. Wait about 30 seconds.

The Action runs `build/build-kalshi.js`. The script writes `kalshi.json`. The script
commits the file.

## Force a poll refresh

1. Open https://github.com/willhoop/event-desk/actions/workflows/polls.yml.
2. Click **Run workflow**.

The Action reads a CSV. The CSV address is in the `POLLS_CSV_URL` repository variable.
If the variable is absent, the site uses the bundled dataset in `data/polls.ts`.

## Run the AI forecast

Each run has a cost of about $1.20.

1. Set the `FUTURESEARCH_API_KEY` secret. Open
   https://github.com/willhoop/event-desk/settings/secrets/actions.
   Enter the key with your own hands. Do not paste the key into a chat.
2. Open https://github.com/willhoop/event-desk/actions/workflows/futuresearch.yml.
3. Click **Run workflow**.

The Action needs Python 3.12 or higher. The `futuresearch` package refuses an earlier
version.

## Check the feed status

Open https://elitefourcapital.com/#/admin. The Mission Control page shows each feed. The
page shows the true age of each feed. The page is not in the public menu.

## If a workflow fails with a push error

The error text is `! [rejected] main -> main (fetch first)`. Two commits raced.

Each workflow runs `git pull --rebase --autostash` before `git push`. The workflow retries
five times. If the error continues, run the workflow again.
