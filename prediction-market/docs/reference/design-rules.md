# Reference: the design rules

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

Obey each rule for each change.

## Colour

| Colour | Hex | Use it for |
|---|---|---|
| Slate | `#16181c` | The page surface. |
| Slate 2 | `#1f2226` | A raised card. |
| Ink | `#eef1f4` | The main text. A price. |
| Ink 2 | `#c9cdd4` | The body text. |
| Faint | `#8a9099` | A label. |
| Rule | `#343941` | A border. |
| Ember | `#e2572b` | The brand. A loss. WAIT. |
| Green | `#4a9e7f` | A gain. LIVE. BUY. |
| Gold | `#d0a54e` | The house pick. A caution. |

**Rule.** Ember means loss. Green means gain. Do not use either colour for a candidate or
a team. The candidate colours are in `engine/colors.ts`. The team colours are in
`engine/sports.ts`.

**Rule.** A price renders in pure white. A price must never take a candidate colour. A
reader must not confuse a value with an identity.

## Type

| Family | Use it for |
|---|---|
| Serif (Georgia) | A headline. A number the reader must read. |
| Mono | A label. A ticker. A small statistic. |
| Sans | Not used. |

## Layout

- `Wrap` sets the article width to 800px. Keep the eye travel short.
- Do not make a desk wider than `Wrap`.
- To make one element wider, use `Wide` from `app/components/Shell.tsx`.
- The front page uses `Wrap wide`. The front page is a directory, not an article.

## Charts

- Use a smooth curve.
- Put a label at the end of each line on a wide screen.
- Put the controls below the chart.
- Show the values on hover.
- Put the hover card beside the points it describes. Do not pin the card to the top.
- On a narrow screen, put the values above the chart. A finger covers the middle.
- Never set `preserveAspectRatio="none"`. It stretches the line and the text.

## Mobile

- Support mobile for each change.
- Use one column below 720px.
- Make each tap target 36px high or more.
- Let each table scroll sideways.
- Use a 16px input. A smaller input makes iOS zoom.
- Give a small target a large alternative. The electoral map has a battleground strip,
  because Delaware is a few pixels wide on a phone.

## Content

- Show, do not tell. Use a picture and a colour before a paragraph.
- One job per screen. Do that job well.
- Rank by real-world importance. Never rank alphabetically.
- Minimise the clicks. Minimise the typing.
- The site must not look machine-made. Do not use an emoji. Do not use filler. Do not use
  an accent stripe or a decorative gradient.
- A functional mark is allowed. `+` and `−` show a price direction. A disclosure triangle
  shows that a section opens.

## Data

- Compute each number, or read it live. Do not write a number in the code.
- If a value is a snapshot, label it as a snapshot. Give the source and the date.
- Verify each value against an authoritative source. Do not assume a value.
- Do not claim a feed is live when the feed is delayed. Show the true age.

## Verdict banners

- Use green for go. Use ember for wait.
- Make the number bold. Keep the text at normal weight.
- Put the answer first and largest. A reader must see the result before they read a word.
