-- Rastreia visualizações de produto e buscas, de clientes cadastrados ou não,
-- para alimentar "produtos mais buscados" na plataforma. Eventos crus ficam
-- privados (sem policy de SELECT); leitura só via função agregada abaixo,
-- que nunca expõe session_id nem linha por linha.

create table if not exists public.product_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('view', 'search')),
  product_id text,
  query text,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists product_events_type_created_idx
  on public.product_events (event_type, created_at desc);
create index if not exists product_events_product_idx
  on public.product_events (product_id) where product_id is not null;

alter table public.product_events enable row level security;

drop policy if exists "anyone can log events" on public.product_events;
create policy "anyone can log events" on public.product_events
  for insert
  to anon, authenticated
  with check (true);

-- Sem policy de select: ninguém lê a tabela crua pela API, nem dono de conta
-- comum. Leitura agregada só pelas funções abaixo (security definer).

create or replace function public.get_top_products(days int default 30, result_limit int default 10)
returns table(product_id text, views bigint)
language sql
security definer
set search_path = public
as $$
  select product_id, count(*) as views
  from public.product_events
  where event_type = 'view'
    and product_id is not null
    and created_at >= now() - (days || ' days')::interval
  group by product_id
  order by views desc
  limit result_limit;
$$;

grant execute on function public.get_top_products(int, int) to anon, authenticated;

create or replace function public.get_top_searches(days int default 30, result_limit int default 10)
returns table(query text, searches bigint)
language sql
security definer
set search_path = public
as $$
  select lower(trim(query)) as query, count(*) as searches
  from public.product_events
  where event_type = 'search'
    and query is not null and trim(query) <> ''
    and created_at >= now() - (days || ' days')::interval
  group by lower(trim(query))
  order by searches desc
  limit result_limit;
$$;

grant execute on function public.get_top_searches(int, int) to anon, authenticated;
