# Event Desks — Elite Four Capital

*This document uses ASD-STE100 Simplified Technical English.*

Event Desks is a prediction-market analysis website. The desks are Ossoff, Polling, Poll Data,
Electoral, Midterms, and Sizing. The stack is React, Vite, and TypeScript. The build makes one
self-contained `index.html` file.

## Run the site on your computer
1. Run `npm install`. Do this one time.
2. Run `npm run dev`. This starts the server at http://localhost:5173.
3. Open the address. The browser gets the Polymarket prices directly. The site reads the Kalshi
   prices from `kalshi.json`.

## Build the site
1. Run `npm run build`. This checks the types and makes `dist/index.html`.
2. Run `npm run preview`. This serves the built file. Use it to check the build.

## Deploy the site
1. Run `npm run build`.
2. Upload `dist/index.html` to the `willhoop/event-desk` repository root. Name the file
   `index.html`.
3. Keep the GitHub Actions active. They refresh `kalshi.json`, `polls.json`, and
   `futuresearch.json`. The workflows are in `.github/workflows`.

The site uses hash routing and relative assets. Therefore the site works from any path.

## Structure
- `src/lib/` holds the typed logic. It holds the pricing math, the API clients, the fitted poll
  model, and the E4 pollster-scoring engine.
- `src/data/` holds the poll dataset, the electoral map, the state shapes, and the historical
  results.
- `src/components/` holds the shared parts. The parts include Shell, Ticker, LineChart,
  LockCalculator, and VenueCompare.
- `src/pages/` holds the desks: Home, OssoffDesk, PollingDesk, PollDataDesk, ElectoralDesk,
  MidtermsDesk, PortfolioDesk, StyleGuide, and AdminDesk.

## Live data
The GitHub Actions keep the data current:
- `kalshi.yml` runs every 10 minutes. It writes `kalshi.json`.
- `polls.yml` runs daily. It writes `polls.json` from a CSV source.
- `futuresearch.yml` runs manually. It writes `futuresearch.json`. Each run has a cost.
