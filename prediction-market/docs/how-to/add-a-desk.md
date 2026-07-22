# How to add a new desk

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

A desk is one article about one market. This document tells you to add one.

## Step 1. Make the page file

Make a file in `app/pages/`. Name it `<Name>Desk.tsx`.

Use the shared parts. Do not write an inline style. The parts are in
`app/components/ui.tsx` and `app/components/Shell.tsx`.

```tsx
import { Wrap, Header, Section, Footer } from "../components/Shell";
import { Lead, Verdict, BarRow, Loading } from "../components/ui";

export default function NameDesk() {
  return (
    <Wrap>
      <Header title="Name" sub={<>a short subtitle</>} ticker={segs} />
      <Section n="01" title="The board" dek="tap anyone">
        <Lead>One sentence that says what the reader sees.</Lead>
        {/* content */}
      </Section>
      <Footer desk="Name" />
    </Wrap>
  );
}
```

## Step 2. Add the route

Open `app/router.tsx`. Import the page. Add the path:

```tsx
{ path: "name", element: <NameDesk /> },
```

The router uses hash routing. The address becomes `/#/name`.

## Step 3. Get the prices

Use a hook. Do not fetch inside a component.

| Source | Hook | Notes |
|---|---|---|
| Polymarket, one market | `usePolyRunner` | Live in the browser. |
| Polymarket, a whole board | `useField` | Live in the browser. |
| Polymarket, price history | `useHistory` | Feeds `LineChart`. |
| Kalshi | `useLive` | Reads `kalshi.json`. Server-refreshed. |

Do not fetch Kalshi from the browser. Kalshi blocks the browser.

## Step 4. Obey the data rule

Compute each number, or read it live. Do not write a number in the code.

If a value is a snapshot, label it as a snapshot on the screen. Give the source and the
date. Put the value in `data/` with a comment. See `data/lebron.ts` for the pattern.

## Step 5. Link the desk

Open `app/pages/Home.tsx`. Add a link. Rank the desks by real-world importance. Do not
rank them alphabetically.

## Step 6. Test the math

Add a test in `tests/`. Test each new function in `engine/`. Pin each result to a value
you calculated by hand. Do not pin a result to the current output of the code.

## Step 7. Update the documentation

1. Add the desk to the white paper.
2. Add the desk to the deck.
3. Add the desk to `docs/reference/structure.md`.
4. Add a line to `CHANGELOG.md`.

## Step 8. Check the desk on a phone

Support mobile. Use one column below 720px. Make each tap target 36px high or more. Let
each table scroll sideways.
