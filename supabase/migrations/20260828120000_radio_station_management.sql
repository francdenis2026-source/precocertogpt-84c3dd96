create table if not exists public.radio_stations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  stream_url text not null check (stream_url ~ '^https://'),
  fallback_url text check (fallback_url is null or fallback_url ~ '^https://'),
  metadata_url text check (metadata_url is null or metadata_url ~ '^https://'),
  is_active boolean not null default false,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists radio_stations_single_active on public.radio_stations (is_active) where is_active;
alter table public.radio_stations enable row level security;
revoke all on table public.radio_stations from anon, authenticated;
grant select on table public.radio_stations to anon, authenticated;
grant insert, update, delete on table public.radio_stations to authenticated;
drop policy if exists radio_stations_public_read on public.radio_stations;
create policy radio_stations_public_read on public.radio_stations for select to anon, authenticated using (is_active and is_enabled or private.is_platform_admin());
drop policy if exists radio_stations_admin_insert on public.radio_stations;
create policy radio_stations_admin_insert on public.radio_stations for insert to authenticated with check (private.is_platform_admin());
drop policy if exists radio_stations_admin_update on public.radio_stations;
create policy radio_stations_admin_update on public.radio_stations for update to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
drop policy if exists radio_stations_admin_delete on public.radio_stations;
create policy radio_stations_admin_delete on public.radio_stations for delete to authenticated using (private.is_platform_admin());
insert into public.radio_stations(name,stream_url,fallback_url,metadata_url,is_active,is_enabled)
select 'Jovem Pan FM','https://stream.zeno.fm/c45wbq2us3buv','https://stream-284.zeno.fm/c45wbq2us3buv','https://api.zeno.fm/mounts/metadata/subscribe/c45wbq2us3buv',true,true
where not exists(select 1 from public.radio_stations);
create or replace function public.admin_activate_radio(_station_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  if (select auth.uid()) is null or not private.is_platform_admin() then raise exception 'Acesso administrativo negado' using errcode='42501'; end if;
  if not exists(select 1 from public.radio_stations where id=_station_id and is_enabled) then raise exception 'Rádio indisponível'; end if;
  update public.radio_stations set is_active=false,updated_at=now() where is_active;
  update public.radio_stations set is_active=true,updated_at=now() where id=_station_id;
end;$$;
revoke all on function public.admin_activate_radio(uuid) from public;
revoke execute on function public.admin_activate_radio(uuid) from anon;
grant execute on function public.admin_activate_radio(uuid) to authenticated;
