-- All synthetic queue/response changes roll back; pg_net sends only after commit.
begin;
update lead_delivery.settings set enabled = false;
do $$
declare
  test_id uuid := gen_random_uuid();
  test_hash text := md5(gen_random_uuid()::text) || md5(gen_random_uuid()::text);
  synthetic_request bigint := -1000000000000 - floor(random() * 1000000000)::bigint;
  job lead_delivery.outbox%rowtype;
begin
  if has_schema_privilege('anon', 'lead_delivery', 'usage')
    or has_schema_privilege('authenticated', 'lead_delivery', 'usage')
    or has_function_privilege('anon', 'lead_delivery.process()', 'execute') then
    raise exception 'Public webhook management access is allowed';
  end if;
  perform public.submit_website_lead(test_id, 'Webhook QA', '0500000000', 'ashdod', 'birthday', null, '/birthday/', test_hash,
    '{"utm_source":"google","gclid":"synthetic-click","landing_page":"/"}'::jsonb);
  perform public.submit_website_lead(test_id, 'Webhook QA', '0500000000', 'ashdod', 'birthday', null, '/birthday/', test_hash,
    '{"utm_source":"google","gclid":"synthetic-click","landing_page":"/"}'::jsonb);
  select * into strict job from lead_delivery.outbox where lead_id = test_id;
  if job.payload->>'utm_source' <> 'google' or job.payload->>'gclid' <> 'synthetic-click'
    or job.payload->>'lead_id' <> test_id::text or job.payload ? 'client_hash' or job.payload ? 'p_client_hash' then
    raise exception 'Webhook payload mismatch';
  end if;
  begin
    perform public.submit_website_lead(test_id, 'Webhook QA', '0500000000', 'ashdod', 'birthday', null, '/birthday/', test_hash, '{}');
    raise exception 'Attribution conflict was not rejected';
  exception when raise_exception then
    if sqlerrm <> 'lead_id_conflict' then raise; end if;
  end;

  -- Ordinary leads remain queued in test mode, even with a destination enabled.
  update lead_delivery.settings set enabled=true, test_only=true, endpoint_url='https://example.test/synthetic-only';
  perform lead_delivery.process();
  if not exists(select 1 from lead_delivery.outbox where lead_id=test_id and status='pending' and attempts=0) then
    raise exception 'Test mode allowed an unapproved lead to be sent';
  end if;
  update lead_delivery.outbox set job_test_approved=true where lead_id=test_id;
  perform lead_delivery.process();
  select * into strict job from lead_delivery.outbox where lead_id=test_id;
  if job.status <> 'in_flight' or job.attempts <> 1 or job.request_id is null then
    raise exception 'Approved synthetic job was not dispatched';
  end if;
  update lead_delivery.settings set enabled=false;

  -- A 503 is retained and delayed, never acknowledged as delivered.
  update lead_delivery.outbox set status='in_flight', attempts=1, started_at=now(), request_id=synthetic_request where lead_id=test_id;
  insert into net._http_response (id, status_code) values (synthetic_request, 503);
  perform lead_delivery.process();
  select * into strict job from lead_delivery.outbox where lead_id=test_id;
  if job.status <> 'pending' or job.last_http_status <> 503 or job.next_attempt_at <> now() + interval '1 minute' then
    raise exception 'HTTP error was not rescheduled';
  end if;

  -- A later successful acknowledgement completes the same event.
  update lead_delivery.outbox set status='in_flight', attempts=2, started_at=now(), request_id=synthetic_request-1 where lead_id=test_id;
  insert into net._http_response (id, status_code) values (synthetic_request-1, 204);
  perform lead_delivery.process();
  if not exists(select 1 from lead_delivery.outbox where lead_id=test_id and status='delivered' and delivered_at is not null) then
    raise exception 'Successful retry was not acknowledged';
  end if;

  -- A lost unlogged request after a restart is also recovered.
  update lead_delivery.outbox set status='in_flight', attempts=3, started_at=now()-interval '3 minutes', request_id=synthetic_request-2 where lead_id=test_id;
  perform lead_delivery.process();
  if not exists(select 1 from lead_delivery.outbox where lead_id=test_id and status='pending'
    and last_error='response_missing_or_expired' and next_attempt_at=now()+interval '15 minutes') then
    raise exception 'Lost request was not recovered';
  end if;

  -- Final failures stay in the outbox for inspection and manual replay.
  update lead_delivery.outbox set status='in_flight', attempts=8, started_at=now(), request_id=synthetic_request-3 where lead_id=test_id;
  insert into net._http_response (id, timed_out, error_msg) values (synthetic_request-3, true, 'synthetic timeout');
  perform lead_delivery.process();
  if not exists(select 1 from lead_delivery.outbox where lead_id=test_id and status='failed' and last_error='request_timeout') then
    raise exception 'Final failure was not retained';
  end if;
  if (select count(*) from lead_delivery.attempts where lead_id=test_id) <> 4 then raise exception 'Attempt history missing'; end if;
end;
$$;
rollback;
