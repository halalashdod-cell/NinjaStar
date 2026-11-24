# Ninja Star website

Hebrew RTL Next.js website for Ninja Star. Built for Vercel, with the retained production URL paths and local copies of the existing website's photographs and logo.

Demo: https://ninja-star-demo.vercel.app

Repository: https://github.com/halalashdod-cell/NinjaStar

## Development

Use Node.js 22 or later (Node.js 24 recommended).

```sh
npm ci
npm run dev
```

Production checks:

```sh
npm run build
npm run test:leads
npm run start
npm run verify
npm run verify:browser
npm run verify:lead-form
npm run verify:video
```

`npm run verify` runs against `http://127.0.0.1:3000`. Set `VERIFY_ORIGIN` to test a different origin. Without `VERIFY_PERSISTED=1`, API QA expects an unconfigured local form to return 503 and browser QA mocks successful submissions. Set `VERIFY_PERSISTED=1` only when checking real database writes on a configured deployment; the API and browser scripts record their synthetic lead IDs in ignored `test-results/` files for exact verification and cleanup. Browser QA covers desktop/mobile layouts, menus, branch facilities, WhatsApp, reviews, pricing, and enquiry/recruitment forms. It uses Windows Chrome by default; override `BROWSER_PATH` for another Chromium executable. `npm run verify:lead-form` separately checks campaign persistence across navigation, failure recovery, retries, double-submit prevention, and field reset without saving real data.

## Content

- Edit `src/lib/content.ts` for branch details, attractions, prices and FAQs.
- Facilities appear as informational photos on the homepage and within each branch. The former catalogue and individual facility URLs permanently redirect to the relevant facilities section; they are excluded from the sitemap. See `docs/url-plan.csv`.
- The homepage reviews carousel contains selected excerpts from recent five-star Google reviews of all three branches. Source links and verification notes are kept in `docs/content-sources.md`; no heading, explanation or outbound links appear in the carousel. WhatsApp uses the number already linked from the existing site.
- Photos and logo come from the existing `ninja-star.co.il`; source URLs are listed in `public/images/sources.json`.
- Branch imagery is illustrative from the Ninja Star network. Confirm branch-specific photographs before production.
- The local Rubik variable font is downloaded from Google Fonts by `scripts/download-assets.mjs`.
- The visual reference is the screen **Ninja Star — All-Star Navy, Deep Red & Blue** in the Stitch project **Ninja Star Homepage Redesign** (`489337128627221470`, screen `node_16556165105544864630`). Its centred hero, navy surfaces, blue highlights, deep-red accents, and Rubik/Heebo typography are applied throughout the site.
- `scripts/download-stitch-assets.mjs` retains the earlier hero illustration and local Heebo font assets as design references. The current hero uses the venue video supplied by the user.
- The hero has silent 30 fps H.264 MP4 exports for desktop (1280×720, approximately 8.2 MB) and mobile (540×960 portrait crop, approximately 4.4 MB), plus responsive WebP still images. The full 40.4-second edit is retained. Only the matching video variant loads; reduced-motion/data-saving preferences use the still image unless the visitor presses play. Playback pauses offscreen and in hidden tabs, and a manual pause remains in effect until the visitor resumes it.
- `npm run verify:video` checks media range requests, actual desktop/mobile playback, looping, pause/resume, viewport visibility, one variant per device, reduced-motion/data saving, blocked autoplay, failed video and the no-JavaScript fallback. It saves hero screenshots to `test-results/`.
- To regenerate the web assets with FFmpeg and FFprobe on PATH, run `npm run prepare:hero -- "C:/path/to/original.mp4"`. Keep the source video outside the repository. The output manifest is `public/videos/sources.json`.
- The demo omits gifts, shopping carts, checkout, account pages, author archives and other unused WordPress pages.
- The participation page remains at `/enter/` and is linked from pricing, not the main navigation. It is explicitly a demonstration and creates no legal participation record.

## Lead storage and preview behavior

All pages emit `noindex, nofollow` metadata and an `X-Robots-Tag` header. Keep these enabled on the demo, including any preview domain.

`POST /api/leads/` validates the request, then saves visitor and recruitment enquiries to Supabase's `public.leads` table. It returns success only after the database acknowledges the lead ID. Missing credentials or failed storage returns an error, preserving form fields for retry. The form reuses its UUID for unchanged retries and prevents simultaneous submissions. The database function serializes retries and limits a keyed client-IP hash to ten new leads per ten minutes; raw IP addresses are not stored. Public and signed-in browser roles have no table or function access. The API key is used only by the server.

Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Vercel Production; `.env.example` documents their names. Apply `supabase/migrations/` in order before deployment. `scripts/leads-database-check.sql` verifies permissions, retry deduplication, conflicting IDs and rate limiting inside a transaction that rolls back all test records. Leads are visible in the client's Supabase Table Editor. See `docs/client-production-setup.md` for the client-owned infrastructure and webhook operations.

The server also supports the integration-managed `SUPABASE_SERVICE_ROLE_KEY` as a fallback after a secret-key authentication rejection. Legacy JWT keys are sent on both `apikey` and `Authorization`; modern `sb_secret_...` keys are sent only on `apikey`. Both paths are server-only and target the configured Supabase project.

New leads and their webhook jobs are saved in one transaction. Supabase Cron checks the private `lead_delivery.outbox` every minute; `pg_net` transports the JSON without delaying the form response. The scheduler retries failed requests and recovers missing transport responses from the logged outbox. The public test destination remains in `test_only` mode: only synthetic jobs individually approved through administrative SQL are sent. Ordinary enquiries are retained for the eventual CRM destination. No additional Vercel or Edge Function secrets are needed for the current unauthenticated receiver. Email notifications are not configured.

`docs/crm-webhook.example.json` defines an example payload. Missing attribution fields are `null`. `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `gbraid`, and `wbraid` are captured from the URL. Attribution is kept in session storage within the browser tab across navigation/reloads; a newly tagged campaign replaces the prior campaign, while untagged pages preserve it. An ad click ID without explicit source/medium infers `google` / `cpc`; campaign names are never inferred from the click ID. Landing pages exclude query strings; referrers contain only an external origin. If browser storage is unavailable, only attribution still present on the submission page can be captured.

## Production launch work

1. Confirm branch details, hours, prices, facilities and birthday-package terms with the owner.
2. Complete an SEO URL inventory using Search Console, analytics, backlinks and a crawl. Public sitemaps are a starting point, not a complete index.
3. Preserve the retained routes and useful content. Decide which removed routes need a relevant permanent redirect and which should return 404/410. Do not blanket-redirect everything to the homepage.
4. Migrate relevant image/download URLs or add appropriate redirects, and preserve verification files and useful query parameters.
5. Verify lead storage on the deployed client project, arrange CRM delivery/notifications, and integrate the approved participation process and policies.
6. Finalize accessibility and privacy content, analytics/conversions and branch structured data.
7. Remove demo `noindex` from production only after the launch checks. Keep it on previews. Check canonical URLs, sitemap, status codes, and crawler access.
8. Back up the old site, preserve mail DNS records, plan the DNS cutover and rollback, and monitor Search Console and errors after launch.

## GitHub and Vercel

The intended repository owner is `halalashdod-cell`. Use the dedicated local SSH key `~/.ssh/id_ed25519_halal` for this repository; never commit SSH keys or tokens.

The default local Vercel account remains `lastav5-1548` (`stavdigital`). The workspace is linked to the client's `halal12/ninja-star` project under `halalashdod-5666`; use client credentials only for client commands. That project is connected to this repository with `main` as its production branch. The production custom domain is not attached yet.

The older demo remains at `stavdigital/ninja-star-demo`. Release the client version by pushing tested changes to this GitHub repository, then verify the resulting Vercel deployment and database writes.
