-- ===========================================================================
-- PreçoCerto — Fase 2: ofertas, dados de loja (bairro/endereço/horário/fotos)
-- e criação da conta administrativa.
--
-- Execute UMA VEZ no SQL Editor do SEU projeto Supabase (banco próprio).
-- Pré-requisito: db/sql/fase0_roles_auditoria_denuncias.sql já executado
-- (cria public.app_role, public.user_roles e public.has_role).
--
-- Antes de rodar:
--   1) crie sua conta no site (Entrar > Criar conta) com o e-mail abaixo;
--   2) troque 'francdenisbr@gmail.com' pelo seu e-mail, se for outro.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1) Ofertas promocionais (aba "Ofertas" do painel admin)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_offers (
  id            uuid primary key default gen_random_uuid(),
  title         text        not null check (char_length(title) between 1 and 120),
  product_name  text        not null check (char_length(product_name) between 1 and 140),
  store_name    text,
  category_slug text,
  promo_price   numeric(10,2) check (promo_price is null or promo_price >= 0),
  regular_price numeric(10,2) check (regular_price is null or regular_price >= 0),
  image_url     text,
  link_url      text        not null default '/buscar',
  starts_at     timestamptz,
  ends_at       timestamptz,
  is_active     boolean     not null default true,
  priority      integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null
);

create index if not exists platform_offers_category_idx on public.platform_offers (category_slug);
create index if not exists platform_offers_active_idx   on public.platform_offers (is_active, priority desc);

-- Acesso pela Data API (PostgREST não concede privilégios por padrão)
grant select on public.platform_offers to anon;
grant select, insert, update, delete on public.platform_offers to authenticated;
grant all on public.platform_offers to service_role;

alter table public.platform_offers enable row level security;

drop policy if exists "Ofertas visíveis publicamente" on public.platform_offers;
create policy "Ofertas visíveis publicamente"
  on public.platform_offers for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Administradores leem todas as ofertas" on public.platform_offers;
create policy "Administradores leem todas as ofertas"
  on public.platform_offers for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

drop policy if exists "Administradores gravam ofertas" on public.platform_offers;
create policy "Administradores gravam ofertas"
  on public.platform_offers for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

drop policy if exists "Administradores atualizam ofertas" on public.platform_offers;
create policy "Administradores atualizam ofertas"
  on public.platform_offers for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

drop policy if exists "Administradores excluem ofertas" on public.platform_offers;
create policy "Administradores excluem ofertas"
  on public.platform_offers for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

-- ---------------------------------------------------------------------------
-- 2) Dados públicos de loja usados nas páginas de cidade e no cabeçalho
-- ---------------------------------------------------------------------------
alter table public.establishments add column if not exists city            text;
alter table public.establishments add column if not exists opening_hours   text;
alter table public.establishments add column if not exists photo_url       text;
alter table public.establishments add column if not exists whatsapp        text;

-- ---------------------------------------------------------------------------
-- 3) Sua conta administrativa
-- ---------------------------------------------------------------------------
update auth.users
   set email_confirmed_at = coalesce(email_confirmed_at, now())
 where email = 'francdenisbr@gmail.com';

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
  from auth.users
 where email = 'francdenisbr@gmail.com'
on conflict (user_id, role) do nothing;

-- 4) Conferência
select u.email, r.role
  from public.user_roles r
  join auth.users u on u.id = r.user_id
 where u.email = 'francdenisbr@gmail.com';
