create table public.leads (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (phone ~ '^\+?[0-9]{9,15}$'),
  branch text not null check (branch in ('rehovot', 'ashdod', 'hod-hasharon')),
  type text not null check (type in ('visit', 'birthday', 'group', 'other', 'recruitment')),
  message text check (char_length(message) <= 1000),
  source_path text not null check (char_length(source_path) between 1 and 500),
  client_hash text not null check (client_hash ~ '^[0-9a-f]{64}$')
);
create index leads_client_created_idx on public.leads (client_hash, created_at desc);
create index leads_created_idx on public.leads (created_at desc);
alter table public.leads enable row level security;
revoke all on public.leads from public, anon, authenticated;
grant select, insert on public.leads to service_role;
comment on table public.leads is 'Website enquiries and recruitment applications. CRM delivery is configured separately.';
comment on column public.leads.client_hash is 'HMAC of the client IP for rate limiting; raw IP addresses are not stored.';

create function public.submit_website_lead(
  p_id uuid, p_name text, p_phone text, p_branch text, p_type text,
  p_message text, p_source_path text, p_client_hash text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare existing public.leads%rowtype;
begin
  if p_id is null or p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_lead';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('website-lead-id:' || p_id::text, 0));
  select * into existing from public.leads where id = p_id;
  if found then
    if existing.name is distinct from p_name or existing.phone is distinct from p_phone
      or existing.branch is distinct from p_branch or existing.type is distinct from p_type
      or existing.message is distinct from p_message or existing.source_path is distinct from p_source_path then
      raise exception 'lead_id_conflict' using errcode = 'P0001';
    end if;
    return existing.id;
  end if;
  perform pg_advisory_xact_lock(hashtextextended('website-lead-ip:' || p_client_hash, 0));
  if (select count(*) from public.leads where client_hash = p_client_hash
      and created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'lead_rate_limit' using errcode = 'P0001';
  end if;
  insert into public.leads (id, name, phone, branch, type, message, source_path, client_hash)
    values (p_id, p_name, p_phone, p_branch, p_type, p_message, p_source_path, p_client_hash);
  return p_id;
end;
$$;
revoke all on function public.submit_website_lead(uuid, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_website_lead(uuid, text, text, text, text, text, text, text) to service_role;
