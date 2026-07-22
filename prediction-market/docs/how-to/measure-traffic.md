# How to measure the site traffic

**Version 1.0.0 · Last updated 2026-07-22**

*This document uses ASD-STE100 Simplified Technical English.*

Cloudflare Web Analytics counts the visitors. The setup is automatic.

## See the numbers

1. Open https://dash.cloudflare.com.
2. Go to **Analytics → Web analytics**.
3. Click `elitefourcapital.com`.

The page shows the page views, the visits, the top pages, and the referrers.

## Rule: use Web Analytics, not HTTP Traffic

The dashboard has two traffic pages. They show different numbers.

| Page | It counts | Use it |
|---|---|---|
| **Web analytics** | A browser that runs JavaScript. | Yes. |
| HTTP Traffic | Each HTTP request. | No. |

Web Analytics uses a JavaScript beacon. A crawler does not run the beacon. Therefore
Web Analytics removes most bots.

On 2026-07-20 the two pages disagreed. Web Analytics showed 43 visits. HTTP Traffic
showed more than 2,000 requests. The difference was bot traffic from data centres.

## Remove your own visits

Cloudflare does not store an IP address. Therefore you cannot exclude your own device.

Use a tag instead. Obey these steps:

1. Add a tag to the address you send to a person:

   ```
   https://elitefourcapital.com/?from=text
   ```

2. Open Web Analytics. Add a filter. Set the **Path** filter to `from=text`.

The result shows only the people who used your tagged address. You open the plain
address. Therefore the filter removes you.

Use a different tag for each channel. Then you can compare the channels.

| Channel | Address |
|---|---|
| A text message | `https://elitefourcapital.com/?from=text` |
| A social post | `https://elitefourcapital.com/?from=social` |
| An email | `https://elitefourcapital.com/?from=email` |

## Limits

- The data starts on 2026-07-20. That is the day the domain went live.
- Early numbers include the development tests.
- A visitor who blocks JavaScript does not appear.
