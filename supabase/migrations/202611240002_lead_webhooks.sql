-- A logged outbox owns delivery state. pg_net's unlogged request/response tables
-- are transport only: a missing response is retried from the durable outbox.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create schema lead_delivery;
revoke all on schema lead_delivery from public, anon, authenticated, service_role;

alter table public.leads add column attribution jsonb not null default '{}'::jsonb
  check (jsonb_typeof(attribution) = 'object' and octet_length(attribution::text) <= 8192);
comment on table public.leads is 'Website enquiries and recruitment applications; new leads are atomically queued for CRM delivery.';

-- Replace the signature, preserving the old eight-argument call through a default.
drop function public.submit_website_lead(uuid, text, text, text, text, text, text, text);
create function public.submit_website_lead(
  p_id uuid, p_name text, p_phone text, p_branch text, p_type text,
  p_message text, p_source_path text, p_client_hash text, p_attribution jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare existing public.leads%rowtype;
begin
  if p_id is null or p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$'
    or p_attribution is null or jsonb_typeof(p_attribution) <> 'object' then
    raise exception 'invalid_lead';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('website-lead-id:' || p_id::text, 0));
  select * into existing from public.leads where id = p_id;
  if found then
    if existing.name is distinct from p_name or existing.phone is distinct from p_phone
      or existing.branch is distinct from p_branch or existing.type is distinct from p_type
      or existing.message is distinct from p_message or existing.source_path is distinct from p_source_path
      or existing.attribution is distinct from p_attribution then
      raise exception 'lead_id_conflict' using errcode = 'P0001';
    end if;
    return existing.id;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('website-lead-ip:' || p_client_hash, 0));
  if (select count(*) from public.leads where client_hash = p_client_hash
      and created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'lead_rate_limit' using errcode = 'P0001';
  end if;
  insert into public.leads (id, name, phone, branch, type, message, source_path, client_hash, attribution)
    values (p_id, p_name, p_phone, p_branch, p_type, p_message, p_source_path, p_client_hash, p_attribution);
  return p_id;
end;
$$;
revoke all on function public.submit_website_lead(uuid, text, text, text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.submit_website_lead(uuid, text, text, text, text, text, text, text, jsonb) to service_role;

create table lead_delivery.settings (
  singleton boolean primary key default true check (singleton),
  endpoint_url text check (endpoint_url ~ '^https://[^[:space:]]+$' and char_length(endpoint_url) <= 2000),
  enabled boolean not null default false
);
insert into lead_delivery.settings (singleton) values (true);

create table lead_delivery.outbox (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'in_flight', 'delivered', 'failed')),
  attempts integer not null default 0 check (attempts between 0 and 8),
  next_attempt_at timestamptz not null default now(),
  request_id bigint,
  started_at timestamptz,
  delivered_at timestamptz,
  last_http_status integer,
  last_error text,
  last_endpoint_url text
);
create index outbox_due_idx on lead_delivery.outbox(next_attempt_at) where status = 'pending';
create table lead_delivery.attempts (
  lead_id uuid not null references lead_delivery.outbox(lead_id) on delete cascade,
  attempt integer not null,
  started_at timestamptz not null,
  finished_at timestamptz not null default now(),
  http_status integer,
  error text,
  primary key (lead_id, attempt)
);
alter table lead_delivery.settings enable row level security;
alter table lead_delivery.outbox enable row level security;
alter table lead_delivery.attempts enable row level security;
revoke all on all tables in schema lead_delivery from public, anon, authenticated, service_role;

create function lead_delivery.enqueue() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into lead_delivery.outbox (lead_id, payload) values (new.id, jsonb_build_object(
    'event', 'lead.created', 'schema_version', 1,
    'lead_id', new.id, 'created_at', new.created_at,
    'name', new.name, 'phone', new.phone, 'branch', new.branch,
    'type', new.type, 'message', new.message, 'source_path', new.source_path,
    'utm_source', new.attribution->>'utm_source', 'utm_medium', new.attribution->>'utm_medium',
    'utm_campaign', new.attribution->>'utm_campaign', 'utm_term', new.attribution->>'utm_term',
    'utm_content', new.attribution->>'utm_content', 'gclid', new.attribution->>'gclid',
    'gbraid', new.attribution->>'gbraid', 'wbraid', new.attribution->>'wbraid',
    'landing_page', new.attribution->>'landing_page', 'referrer', new.attribution->>'referrer'
  ));
  return new;
end;
$$;
revoke all on function lead_delivery.enqueue() from public, anon, authenticated, service_role;
create trigger enqueue_lead_webhook after insert on public.leads
  for each row execute function lead_delivery.enqueue();

create function lead_delivery.retry_delay(attempt integer) returns interval
language sql immutable set search_path = ''
as $$ select make_interval(mins => (array[1, 5, 15, 60, 180, 360, 720])[greatest(1, least(attempt, 7))]); $$;
revoke all on function lead_delivery.retry_delay(integer) from public, anon, authenticated, service_role;

create function lead_delivery.process() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  job lead_delivery.outbox%rowtype;
  reply record;
  response_found boolean;
  succeeded boolean;
  problem text;
  endpoint text;
  new_request_id bigint;
begin
  if not pg_try_advisory_xact_lock(hashtextextended('ninjastar-lead-webhooks', 0)) then return; end if;
  -- Acknowledge completed transport requests, or recover lost/expired requests.
  for job in select * from lead_delivery.outbox where status = 'in_flight'
    order by started_at limit 100 for update skip locked loop
    select status_code, timed_out, error_msg into reply from net._http_response where id = job.request_id;
    response_found := found;
    if not response_found and job.started_at > now() - interval '2 minutes' then continue; end if;
    succeeded := response_found and reply.status_code between 200 and 299
      and not coalesce(reply.timed_out, false) and reply.error_msg is null;
    -- Store safe classifications only, never arbitrary CRM responses or lead data.
    problem := case when succeeded then null
      when not response_found then 'response_missing_or_expired'
      when coalesce(reply.timed_out, false) then 'request_timeout'
      when reply.error_msg is not null then 'transport_error'
      else 'http_error' end;
    insert into lead_delivery.attempts (lead_id, attempt, started_at, http_status, error)
      values (job.lead_id, job.attempts, job.started_at, reply.status_code, problem);
    update lead_delivery.outbox set
      status = case when succeeded then 'delivered' when attempts >= 8 then 'failed' else 'pending' end,
      delivered_at = case when succeeded then now() else null end,
      next_attempt_at = now() + lead_delivery.retry_delay(attempts),
      last_http_status = reply.status_code, last_error = problem, request_id = null
      where lead_id = job.lead_id;
  end loop;

  select endpoint_url into endpoint from lead_delivery.settings where singleton and enabled;
  if endpoint is null then return; end if;
  for job in select * from lead_delivery.outbox where status = 'pending' and attempts < 8 and next_attempt_at <= now()
    order by next_attempt_at limit 20 for update skip locked loop
    begin
      new_request_id := net.http_post(
        url := endpoint, body := job.payload,
        headers := jsonb_build_object('Content-Type', 'application/json',
          'Idempotency-Key', job.lead_id::text, 'X-Webhook-Event', 'lead.created',
          'X-Webhook-Attempt', (job.attempts + 1)::text),
        timeout_milliseconds := 10000
      );
      update lead_delivery.outbox set status = 'in_flight', attempts = attempts + 1,
        request_id = new_request_id, started_at = now(), last_endpoint_url = endpoint where lead_id = job.lead_id;
    exception when others then
      insert into lead_delivery.attempts (lead_id, attempt, started_at, error)
        values (job.lead_id, job.attempts + 1, now(), 'dispatch_error');
      update lead_delivery.outbox set attempts = attempts + 1,
        status = case when attempts + 1 >= 8 then 'failed' else 'pending' end,
        next_attempt_at = now() + lead_delivery.retry_delay(attempts + 1),
        last_error = 'dispatch_error', last_http_status = null where lead_id = job.lead_id;
    end;
  end loop;
end;
$$;
revoke all on function lead_delivery.process() from public, anon, authenticated, service_role;
select cron.schedule('ninjastar-lead-webhooks', '* * * * *', 'select lead_delivery.process();');
