# Client production setup

The client owns the production infrastructure. The existing `stavdigital/ninja-star-demo` remains a separate demo deployment.

## Vercel

- Account: `halalashdod-5666`
- Team: `halal12` (Halal)
- Project: `ninja-star`
- Dashboard: https://vercel.com/halal12/ninja-star
- Project ID: `prj_OBGLkHCGT5JSCOrIy7PBgiAgRwcp`
- Team ID: `team_U5OZR7djFPd8Yn04EBGCA6GL`
- Framework: Next.js
- Plan: Hobby during setup; upgrades are managed by the client.
- Intended Git repository: https://github.com/halalashdod-cell/NinjaStar
- Intended production branch: `main`

Deployments should be triggered through the Vercel GitHub integration. The client completed both the GitHub Login Connection and installation of the Vercel GitHub App. The saved Vercel project link was verified as `halalashdod-cell/NinjaStar` (repository ID `1468954768`), with production branch `main`.

## Supabase

- Project: `NinjaStar Website`
- Project reference: `deecqyurwjtitbsqdvsf`
- Dashboard: https://supabase.com/dashboard/project/deecqyurwjtitbsqdvsf
- Project URL: https://deecqyurwjtitbsqdvsf.supabase.co
- Region: `eu-central-1` (Frankfurt)

The client created this Frankfurt replacement for the previous Tokyo project (`czjguyxuqfqcttjenxfs`). The new project was verified healthy with zero public tables, Auth users, and Storage buckets. The workspace's `.env.client.local` reference and Vercel's Production `SUPABASE_URL` now point to Frankfurt. No Supabase project was deleted by Codex.

The `website_leads` migration has been applied in Frankfurt. `public.leads` stores visitor enquiries and recruitment applications. Only the server can call `public.submit_website_lead`; browser roles have no table/function access. Database checks verified RLS, duplicate retry handling, conflicting payload rejection and rate limiting, with all synthetic writes rolled back. Edge Function deployment and writing Edge Function secrets remain untested because CRM delivery is not implemented yet.

No API secret keys were requested or retrieved. The management token is separate from the application's runtime key.

## Application environment variables

In https://vercel.com/halal12/ninja-star/settings/environment-variables, configure the Production environment:

| Variable | Setup |
| --- | --- |
| `SUPABASE_URL` | Already configured with the project URL above. |
| `SUPABASE_SECRET_KEY` | Present for Production as a sensitive variable, updated after the Frankfurt project was created. Its value stays in Vercel; verify it through a real application submission after deployment. |

Create or copy the secret key from the Supabase project's API Keys settings. Store its value directly in Vercel, mark it sensitive, and do not add a `NEXT_PUBLIC_` prefix. The local management-token file should not be copied into the application's Vercel environment.

The forms validate and save leads using the server's Supabase secret key. Success is returned only after a saved ID is acknowledged. Missing credentials and storage failures produce an error while preserving the form for retry. The client reuses a UUID for unchanged retries; the database handles deduplication and limits ten new leads per keyed client-IP hash per ten minutes. No raw IP addresses or personal form values are written to application logs. Leads can be managed through Supabase's Table Editor. CRM delivery and email notifications still require separate configuration, including the receiver URL, authentication, payload contract and agreed retries.

## Local account access

`.env.client.local` is excluded from both Git and Vercel uploads. It contains setup-tool credentials and is not loaded automatically by Next.js. Load the client credentials only into the process running a client command. Preserve the default `lastav5-1548` CLI login; do not replace it using `vercel login` or a global token setting.

Keep production indexing, custom domain changes, and DNS cutover as explicit launch steps after the client project and real form submission are verified.

The workspace's `.vercel/project.json` now targets `halal12/ninja-star`. A local backup of the previous demo link is in `.cache/demo-project-link.json`. Use the client token when running Vercel commands for this workspace; a normal unscoped command still authenticates as the existing personal account.
