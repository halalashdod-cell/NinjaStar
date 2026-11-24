-- Public testing endpoints must receive only explicitly approved synthetic jobs.
alter table lead_delivery.settings add column test_only boolean not null default true;
alter table lead_delivery.outbox add column job_test_approved boolean not null default false;
comment on column lead_delivery.outbox.job_test_approved is 'Administrative approval for a synthetic test lead; never set by public form submissions.';

create or replace function lead_delivery.process() returns void
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
    and (job_test_approved or not (select test_only from lead_delivery.settings where singleton))
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
