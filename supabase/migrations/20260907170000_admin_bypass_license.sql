-- Administradores/moderadores nunca deveriam precisar comprar uma licença
-- pra usar ferramentas pagas do próprio site que eles administram. Como
-- has_active_license é a única checagem usada tanto pelo SubscriberGate
-- (cliente) quanto pela Edge Function do assistente (servidor), um bypass
-- aqui dentro cobre os dois lugares de uma vez, sem precisar duplicar a
-- regra em cada tela/função que verifica licença.
create or replace function public.has_active_license(_plan text default 'cesta_inteligente')
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'admin', 'moderator')
    )
    or exists (
      select 1 from public.licenses
      where user_id = auth.uid()
        and plan = _plan
        and status = 'active'
        and revoked_at is null
        and (expires_at is null or expires_at > now())
    );
$$;
