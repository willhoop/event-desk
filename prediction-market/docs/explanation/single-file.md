# Explanation: why the build is one file

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

## The decision

The build makes one file. The file is `dist/index.html`. The file holds the HTML, the CSS,
the JavaScript, and the bundled data.

The plugin is `vite-plugin-singlefile`.

## The size

| Measure | Value |
|---|---|
| The file on disk | About 550 kB |
| The bytes over the network | About 180 kB |

The server compresses the file. The compressed size is the size that matters. A median web
page in 2026 is about 2 MB. This site is under a tenth of that.

## Why one file is fast

A normal site loads an HTML file. The HTML asks for a CSS file. The CSS asks for a font.
The HTML asks for a JavaScript file. The JavaScript asks for more JavaScript. Each request
waits for the request before it. This is a waterfall.

One file has no waterfall. One request returns everything. The page draws as soon as the
file arrives.

## Why one file suits this project

- **The deployment is a file copy.** You upload one file to the repository root. Cloudflare
  Pages deploys the commit. There is no build step on the server.
- **The routing is client-side.** The site uses hash routing. The server always returns the
  same file. Therefore the site works from any path.
- **The data is separate.** `kalshi.json` and `polls.json` stay in the repository root. The
  site reads them from the same origin. A price update does not need a rebuild.

## The costs

Be honest about these:

- **No code splitting.** A reader who wants one desk downloads every desk. At 180 kB this
  is acceptable. At 1 MB it would not be.
- **No browser caching of parts.** A one-line change invalidates the whole file. The reader
  downloads 180 kB again.
- **The file will grow.** Each new desk adds to every page load.

## When to change this decision

Change it when the compressed size passes about 400 kB, or when a single desk carries a
large dataset that other desks do not need.

The replacement is a normal Vite build with route-level code splitting. The cost is a
build step and a more complex deployment.

## The related failure

On 2026-07-20 a build produced a file of 494 kB instead of 514 kB. The build reported
success. The site rendered with no styles at all.

The cause: the build ran in a scratch directory without `tailwind.config.js` and
`postcss.config.js`. Tailwind never ran. Vite emitted an empty stylesheet and did not
error.

The lesson: a one-file build hides a missing part, because the file still exists and the
build still passes. Therefore the deployment procedure now checks the content of the file:

```
grep -c 'bg-paper{' dist/index.html
```

The result must be 1. See [How to deploy a change](../how-to/deploy.md).

## Sources

- `vite-plugin-singlefile`, https://github.com/richardtallent/vite-plugin-singlefile
- HTTP Archive, Web Almanac page weight report, https://httparchive.org/reports/page-weight
