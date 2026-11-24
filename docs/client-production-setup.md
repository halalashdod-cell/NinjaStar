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

The lead storage, webhook outbox, and test-mode migrations have been applied in Frankfurt. `public.leads` stores visitor enquiries and recruitment applications, including attribution. Only the server can call `public.submit_website_lead`; browser roles have no table/function access. Database checks verified RLS, duplicate retry handling, conflicting payload rejection, rate limiting and webhook recovery, with all synthetic writes rolled back. Webhooks run entirely through Supabase Cron and `pg_net`; no Edge Function deployment or secret-key retrieval is needed.

No API secret keys were requested or retrieved. The management token is separate from the application's runtime key.

## Application environment variables

In https://vercel.com/halal12/ninja-star/settings/environment-variables, configure the Production environment:

| Variable | Setup |
| --- | --- |
| `SUPABASE_URL` | Already configured with the project URL above. |
| `SUPABASE_SECRET_KEY` | Present for Production as a sensitive variable, updated after the Frankfurt project was created. Its value stays in Vercel; verify it through a real application submission after deployment. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional integration-managed server credential; used if the configured secret key is rejected with HTTP 401. Legacy JWT authorization is supported. |

Create or copy the secret key from the Supabase project's API Keys settings. Store its value directly in Vercel, mark it sensitive, and do not add a `NEXT_PUBLIC_` prefix. The local management-token file should not be copied into the application's Vercel environment.

The forms validate and save leads using the server's Supabase secret key. Success is returned only after a saved ID is acknowledged. Missing credentials and storage failures produce an error while preserving the form for retry. The client reuses a UUID for unchanged retries; the database handles deduplication and limits ten new leads per keyed client-IP hash per ten minutes. No raw IP addresses or personal form values are written to application logs. Leads can be managed through Supabase's Table Editor. Email notifications are not configured.

## CRM webhook contract and operations

The receiver gets `POST` JSON matching [crm-webhook.example.json](crm-webhook.example.json), with `Content-Type: application/json`, `X-Webhook-Event: lead.created`, `Idempotency-Key: <lead_id>`, and `X-Webhook-Attempt: <number>`. The receiver currently requires no authentication. No Supabase keys or client IP hashes are forwarded. Preserve phone numbers as strings.

`branch` is `rehovot`, `ashdod`, or `hod-hasharon`. `type` is `visit`, `birthday`, `group`, `other`, or `recruitment`. `message` and attribution fields may be `null`; timestamps are ISO 8601 with an offset. `source_path` is where the form was submitted; `landing_page` is the entry path for the captured campaign. Both omit query strings. `referrer` is an external origin only. Campaign capture lasts for the browser tab session, not across devices or future sessions.

The receiver should durably accept or queue the lead, deduplicate by `lead_id`, and return HTTP 2xx within ten seconds. Any other status, timeout, or missing transport response is retried. Delivery is at least once: a receiver may have accepted a request whose response was lost. Retry bodies and IDs stay unchanged.

The Cron job `ninjastar-lead-webhooks` runs every minute. Initial dispatch normally occurs within a minute. There are at most eight attempts, with retry delays of 1, 5, 15, 60, 180, 360 and 720 minutes after the preceding failed acknowledgement. Final failures remain in the outbox as `failed`, with attempt history retained in `lead_delivery.attempts`; no automatic alert is configured. Cron run history appears in Supabase's Cron dashboard. Suspending the project also suspends delivery until it resumes.

The temporary webhook.site destination is configured in `lead_delivery.settings` with `enabled=true` and `test_only=true`. Only rows with administrative `job_test_approved=true` are sent; the public API cannot set this flag. Real leads remain pending in the database. Approve only verified synthetic IDs for testing. Do not disable test-only mode for a public test inbox.

To switch to the client's real CRM, use administrative SQL after confirming the destination and field mapping:

```sql
update lead_delivery.settings
set endpoint_url = 'https://crm.example/replace-with-real-receiver',
    enabled = true, test_only = false
where singleton;
```

All pending ordinary leads will then be eligible for dispatch. Previously delivered events are not sent again automatically. To pause new dispatches, set `enabled=false`; in-flight acknowledgements are still reconciled. Endpoint changes apply to future attempts, including pending retries.

Inspect delivery without selecting names, phone numbers or messages:

```sql
select lead_id, status, attempts, next_attempt_at, last_http_status, last_error
from lead_delivery.outbox order by created_at desc limit 100;
```

After fixing a failed receiver, replay a specific failed ID (the attempt audit is cleared for that event; the payload and deduplication ID remain the same):

```sql
begin;
delete from lead_delivery.attempts
where lead_id = 'REPLACE-WITH-UUID'
  and exists (select 1 from lead_delivery.outbox o
              where o.lead_id = lead_delivery.attempts.lead_id and o.status = 'failed');
update lead_delivery.outbox
set status='pending', attempts=0, next_attempt_at=now(), request_id=null,
    delivered_at=null, last_http_status=null, last_error=null
where lead_id='REPLACE-WITH-UUID' and status='failed';
commit;
```

`scripts/webhooks-database-check.sql` tests atomic enqueue, unchanged retry deduplication, attribution conflicts, private permissions, synthetic-only gating, HTTP-error backoff, successful acknowledgement, lost-response recovery and final failure retention in a rolled-back transaction.

## Local account access

`.env.client.local` is excluded from both Git and Vercel uploads. It contains setup-tool credentials and is not loaded automatically by Next.js. Load the client credentials only into the process running a client command. Preserve the default `lastav5-1548` CLI login; do not replace it using `vercel login` or a global token setting.

Keep production indexing, custom domain changes, and DNS cutover as explicit launch steps after the client project and real form submission are verified.

The workspace's `.vercel/project.json` now targets `halal12/ninja-star`. A local backup of the previous demo link is in `.cache/demo-project-link.json`. Use the client token when running Vercel commands for this workspace; a normal unscoped command still authenticates as the existing personal account.
