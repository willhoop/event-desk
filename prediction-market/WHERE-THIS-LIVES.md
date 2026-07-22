# Where this project lives

**Version 1.0.1 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

This folder holds a complete copy of the Prediction Market project. The copy was verified
on 2026-07-22: 84 files, byte-identical to the source, 42 tests passed, the types checked,
and the build succeeded from this folder alone.

## The three locations

| Location | It holds | Status |
|---|---|---|
| `Projects/prediction-market/` | This folder. The full source and documentation. | A copy. |
| `event-desk-app/prediction-market/` | The same source and documentation. | The working copy. |
| `github.com/willhoop/event-desk` | Only the built `index.html` and the data files. | The deployed site. |

## Rule: pick one working copy

Two identical folders will drift apart. Work in one folder only.

Today the working copy is `event-desk-app/prediction-market/`. Each deployment came from
that folder.

Obey one of these two options:
1. Keep working in `event-desk-app/prediction-market/`. Copy to this folder after a
   change. Or,
2. Move the work here. Delete the other folder.

Option 2 is better. One copy cannot drift.

## The source is not in the repository yet

The GitHub repository holds the built `index.html`, the data files, and the workflows. The
repository does not hold `docs/`, `engine/`, `app/`, `tests/`, or `data/`.

Therefore:
- The three living documents are not under version control.
- A second person cannot build the site from the repository.
- A lost folder loses the source.

**The fix.** Push the full source tree to the repository. The built `index.html` stays in
the root, because Cloudflare Pages serves the root and expects the file there.

## How to verify a copy

Run these commands in the copy. All three must pass.

```
npm install
npm test          # 42 tests
npm run build     # writes dist/index.html
```

Then check the build output:

```
grep -c 'bg-paper{' dist/index.html
```

The result must be `1`. A `0` means Tailwind did not run and the site has no styles.

## Start here

Read [README.md](README.md). Then read [docs/README.md](docs/README.md).
