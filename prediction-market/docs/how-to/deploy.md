# How to deploy a change

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

This document tells you to put a change on https://elitefourcapital.com.

## Before you start

Complete the documentation first. The documentation is living. Obey these rules:
1. Update the white paper if you changed a formula or a data source.
2. Update the deck if you changed what the site does.
3. Update the technical documentation if you changed a procedure or a value.
4. Add a line to `CHANGELOG.md`.
5. Increase the version number. Change the "last updated" date.

## Step 1. Check the types and the tests

```
npm test
npm run build
```

Both commands must pass. `npm run build` runs `tsc -b` first. A type error stops the
build.

## Step 2. Check the build output

The build writes `dist/index.html`. Check the file:

```
grep -c 'bg-paper{' dist/index.html
```

The result must be `1`. A result of `0` means Tailwind did not run. The site will have no
styles. Do not deploy a file that fails this check.

## Step 3. Upload the file

1. Open https://github.com/willhoop/event-desk/upload/main.
2. Select `dist/index.html`.
3. Write a commit message. Describe the change.
4. Click **Commit changes**.

Name the file `index.html` in the repository root.

## Step 4. Wait for the deployment

Cloudflare Pages sees the commit. Cloudflare builds and deploys the site. This takes
about 60 seconds. Do not do a manual step.

## Step 5. Verify the live site

1. Open https://elitefourcapital.com.
2. Press Ctrl+Shift+R. This clears the cached copy.
3. Check your change on the screen.

Verify the change. Do not report success before you see the change.

## If the deployment fails

Open https://dash.cloudflare.com and go to **Workers & Pages → event-desk →
Deployments**. The failed deployment shows a log.

Cloudflare keeps each earlier deployment. To go back, open the earlier deployment and
click **Rollback**.
