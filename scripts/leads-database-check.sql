-- Contract checks use synthetic records and leave no test data behind.
begin;
do $$
declare
  lead_id uuid;
  first_id uuid;
  client_hash text := md5(gen_random_uuid()::text) || md5(gen_random_uuid()::text);
  saved_count integer;
begin
  if has_table_privilege('anon', 'public.leads', 'select')
    or has_table_privilege('authenticated', 'public.leads', 'select')
    or has_function_privilege('anon', 'public.submit_website_lead(uuid,text,text,text,text,text,text,text)', 'execute') then
    raise exception 'Public lead access is allowed';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.leads'::regclass) then
    raise exception 'Lead RLS is not enabled';
  end if;
  for i in 1..10 loop
    lead_id := gen_random_uuid();
    if i = 1 then first_id := lead_id; end if;
    perform public.submit_website_lead(lead_id, 'NinjaStar QA', '0500000000', 'rehovot', 'visit', null, '/', client_hash);
  end loop;
  -- Retrying an acknowledged or timed-out request is still accepted at the limit.
  perform public.submit_website_lead(first_id, 'NinjaStar QA', '0500000000', 'rehovot', 'visit', null, '/', client_hash);
  select count(*) into saved_count from public.leads where id = first_id;
  if saved_count <> 1 then raise exception 'Retry created a duplicate'; end if;
  begin
    perform public.submit_website_lead(first_id, 'Changed payload', '0500000000', 'rehovot', 'visit', null, '/', client_hash);
    raise exception 'ID conflict was not rejected';
  exception when raise_exception then
    if sqlerrm <> 'lead_id_conflict' then raise; end if;
  end;
  begin
    perform public.submit_website_lead(gen_random_uuid(), 'NinjaStar QA', '0500000000', 'rehovot', 'visit', null, '/', client_hash);
    raise exception 'Rate limit was not applied';
  exception when raise_exception then
    if sqlerrm <> 'lead_rate_limit' then raise; end if;
  end;
end;
$$;
rollback;
