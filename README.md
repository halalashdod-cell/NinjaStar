# Ninja Star website demo

Hebrew RTL Next.js website for Ninja Star. Built for Vercel, with the retained production URL paths and local copies of the existing website's photographs and logo.

## Development

Use Node.js 22 or later (Node.js 24 recommended).

```sh
npm ci
npm run dev
```

Production checks:

```sh
npm run build
npm run start
npm run verify
npm run verify:browser
```

`npm run verify` runs against `http://127.0.0.1:3000`. Set `VERIFY_ORIGIN` to test a different origin. Browser QA covers desktop/mobile layouts, navigation, filtering, pricing selection and demo enquiry submission. It uses the installed Windows Chrome by default; set `BROWSER_PATH` to use a different Chromium executable. Screenshots are written to ignored `test-results/`.

## Content

- Edit `src/lib/content.ts` for branch details, attractions, prices and FAQs.
- Photos and logo come from the existing `ninja-star.co.il`; source URLs are listed in `public/images/sources.json`.
- Branch imagery is illustrative from the Ninja Star network. Confirm branch-specific photographs before production.
- The local Rubik variable font is downloaded from Google Fonts by `scripts/download-assets.mjs`.
- The demo omits gifts, shopping carts, checkout, account pages, author archives and other unused WordPress pages.
- The participation page remains at `/enter/` and is linked from pricing, not the main navigation. It is explicitly a demonstration and creates no legal participation record.

## Demo behavior

All pages emit `noindex, nofollow` metadata and an `X-Robots-Tag` header. Keep these enabled on the demo, including any preview domain.

`POST /api/leads/` validates the request and returns an explicit demo acknowledgement. It does not persist data, send email, contact a CRM, or log personal information. Form data stays in memory only for request validation. No database credentials are required.

When connecting Supabase later, replace the demo boundary in `src/app/api/leads/route.ts`, use server-only credentials, least-privilege grants and RLS where applicable, add abuse protection and consent handling, and confirm delivery before reporting real submission success.

## Production launch work

1. Confirm branch details, hours, prices, facilities and birthday-package terms with the owner.
2. Complete an SEO URL inventory using Search Console, analytics, backlinks and a crawl. Public sitemaps are a starting point, not a complete index.
3. Preserve the retained routes and useful content. Decide which removed routes need a relevant permanent redirect and which should return 404/410. Do not blanket-redirect everything to the homepage.
4. Migrate relevant image/download URLs or add appropriate redirects, and preserve verification files and useful query parameters.
5. Replace demo enquiries with tested delivery/storage. Integrate the approved participation process and policies.
6. Finalize accessibility and privacy content, analytics/conversions and branch structured data.
7. Remove demo `noindex` from production only after the launch checks. Keep it on previews. Check canonical URLs, sitemap, status codes, and crawler access.
8. Back up the old site, preserve mail DNS records, plan the DNS cutover and rollback, and monitor Search Console and errors after launch.

## GitHub and Vercel

The intended repository owner is `halalashdod-cell`. Use the dedicated local SSH key `~/.ssh/id_ed25519_halal` for this repository; never commit SSH keys or tokens.

Vercel account verified during setup: `lastav5-1548`, team `stavdigital`. The production domain is not attached to this demo. Repository creation and the GitHub App's repository authorization are separate from SSH authentication.
