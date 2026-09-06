-- Cesta Inteligente: paid-tool license gate.
-- Reuses the existing (previously unused) public.licenses table instead of
-- creating a parallel structure, since its shape already fits: license_key,
-- status, user_id, expires_at, revoked_at.

alter table public.licenses
  add column if not exists plan text not null default 'cesta_inteligente';

create index if not exists licenses_user_plan_idx
  on public.licenses (user_id, plan)
  where user_id is not null;

create unique index if not exists licenses_key_idx
  on public.licenses (license_key);

alter table public.licenses enable row level security;

drop policy if exists "Users can view their own license" on public.licenses;
create policy "Users can view their own license"
  on public.licenses for select
  using (user_id = auth.uid());

-- Redemption must go through this RPC (never a direct table write from the
-- client) so the paywall can't be bypassed via DevTools.
create or replace function public.redeem_license_key(_license_key text, _plan text default 'cesta_inteligente')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  _row public.licenses;
begin
  select * into _row from public.licenses where license_key = _license_key for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Código não encontrado.');
  end if;
  if _row.plan <> _plan then
    return jsonb_build_object('ok', false, 'error', 'Esse código não é válido para esta ferramenta.');
  end if;
  if _row.status <> 'active' or _row.revoked_at is not null then
    return jsonb_build_object('ok', false, 'error', 'Este código não está mais ativo.');
  end if;
  if _row.expires_at is not null and _row.expires_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'Este código expirou.');
  end if;
  if _row.user_id is not null and _row.user_id <> auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'Este código já foi usado por outra conta.');
  end if;

  update public.licenses
     set user_id = auth.uid(),
         activated_at = coalesce(activated_at, now())
   where license_key = _license_key;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.redeem_license_key(text, text) from public;
grant execute on function public.redeem_license_key(text, text) to authenticated;

create or replace function public.has_active_license(_plan text default 'cesta_inteligente')
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.licenses
    where user_id = auth.uid()
      and plan = _plan
      and status = 'active'
      and revoked_at is null
      and (expires_at is null or expires_at > now())
  );
$$;

revoke all on function public.has_active_license(text) from public;
grant execute on function public.has_active_license(text) to authenticated;

insert into public.licenses (license_key, status, plan)
values
  ('CESTA-TESTE-0001', 'active', 'cesta_inteligente'),
  ('CESTA-TESTE-0002', 'active', 'cesta_inteligente')
on conflict (license_key) do nothing;
