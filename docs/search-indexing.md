# Search indexing setup

## Published by this change

- https://nvarsakis.gr/robots.txt permits crawling and advertises the sitemap.
- https://nvarsakis.gr/sitemap.xml lists the homepage and CareVisit demo with canonical HTTPS URLs. Update `indexablePaths` in `src/lib/seo.ts` when adding public pages.
- Each public page has its own title, description, canonical URL, social metadata and structured data. The homepage describes the actual person and featured projects. The demo describes the browser adaptation accurately.
- A custom 404 page is marked noindex and excluded from the sitemap.
- A 1200 × 630 PNG is used for social sharing previews. The source generator is `scripts/generate-social-card.py` (Pillow + DejaVu Sans); the generated PNG is committed, so deployment needs no Python image libraries.

Run `python scripts/check-seo.py` after the Astro production build to validate the generated crawler endpoints, metadata, structured data and social image.

## Favicon

The favicon uses the owner's transparent logo from https://transfer.nvarsakis.gr/img/logo.png. Its transparent canvas is centred while retaining all artwork, and the logo fills the available width. The primary icon is a square 96×96 PNG at `/favicon.png`; `/favicon-96x96.png` remains as a compatible copy. `/favicon.ico` contains multiple sizes including 96×96, and `/apple-touch-icon.png` is 180×180. Keep these URLs stable. The browser controls the tab icon's display size. Google refreshes the cached favicon separately from page indexing.

Google's requirements: https://developers.google.com/search/docs/appearance/favicon-in-search

## Google Search Console (owner action)

1. Open https://search.google.com/search-console/ and add the Domain property `nvarsakis.gr`.
2. Copy the verification TXT value Google provides into Cloudflare DNS. The value is account-specific; do not invent it or publish account credentials.
3. Verify ownership in Search Console.
4. Submit `https://nvarsakis.gr/sitemap.xml` in Sitemaps.
5. Inspect `https://nvarsakis.gr/`, run Test live URL and select Request indexing. Repeat for the demo if desired.
6. Monitor Page indexing and Performance. Submission does not guarantee indexing or rankings; crawling may take days to weeks.

If the property already exists and is verified, use it instead of creating a duplicate. A URL-prefix property with a Google-provided HTML verification file is another supported route; the exact file can be added to `public/` without changing DNS.

## Cloudflare geography rules

If the site is proxied and a geography rule blocks non-Greek visitors, it must allow verified search-engine crawlers to access the homepage, robots, sitemap and page assets. Do not trust a user-agent string claiming to be Googlebot.

Inspect the existing geography rule before changing it. A verified-bot exclusion limited to the main domain can be appended to that existing rule:

```
(<existing geographic-block condition>)
and not (http.host eq "nvarsakis.gr" and cf.client.bot)
```

This only exempts Cloudflare-verified bots on the main domain from that geographic rule; it does not exempt requests from other security rules or change subdomain rules. `cf.client.bot` includes other verified good bots as well as search crawlers. If the domain is DNS-only, Cloudflare WAF rules do not apply to it.

Use Search Console's live URL test and Cloudflare Security Events to verify actual Google access. A successful curl request, including one using a Googlebot user-agent, is not proof that Google's crawlers are allowed.

## Reference documentation

- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/appearance/structured-data/profile-page
- https://developers.cloudflare.com/waf/custom-rules/use-cases/allow-traffic-from-verified-bots/
