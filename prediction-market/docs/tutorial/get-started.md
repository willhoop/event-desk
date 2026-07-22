# Tutorial: run the site on your computer

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

This tutorial teaches you to run Event Desks. At the end you will see the site in your
browser. You will make one change. You will see the change on the screen.

You need Node.js version 20 or higher. You need a terminal.

## Step 1. Install the packages

Open a terminal. Go to the project folder. Type this command:

```
npm install
```

Do this one time. The command reads `package.json`. It downloads the packages into
`node_modules/`.

## Step 2. Start the local server

Type this command:

```
npm run dev
```

The terminal shows an address. The address is `http://localhost:5173`.

## Step 3. Open the site

Open the address in your browser. You see the front page. The front page shows the open
desks.

The prices are live. The browser reads the Polymarket prices directly. The browser reads
the Kalshi prices from `kalshi.json`.

## Step 4. Make a change

Open `app/pages/Home.tsx` in an editor. Find this line:

```tsx
<div className="mono text-[10px] tracking-[0.06em] uppercase text-faint">Prediction markets, priced and explained — one desk per trade</div>
```

Change the text between the tags. Save the file.

Look at the browser. The text changes immediately. You do not reload the page. Vite
replaces the module while the page runs.

## Step 5. Run the tests

Open a second terminal. Type this command:

```
npm test
```

The command runs the tests in `tests/`. All tests must pass. The tests check the money
math. A failure here means a wrong number on the site.

## Step 6. Build the site

Type this command:

```
npm run build
```

The command does two things. First it checks the types. Then it builds the site.

The command writes one file. The file is `dist/index.html`. The file holds the HTML, the
CSS, the JavaScript, and the data. The file size is about 550 kB. The server sends about
180 kB, because the server compresses the file.

## What you learned

- `npm install` gets the packages.
- `npm run dev` starts the local server.
- `npm test` checks the math.
- `npm run build` makes one file.

## Next

Read [How to deploy a change](../how-to/deploy.md).
