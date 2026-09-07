-- Pedidos de licença comprados via PIX direto pelo site (Cesta Inteligente).
-- Cada linha acompanha uma cobrança do Mercado Pago desde a criação até a
-- confirmação — quando aprovada, o webhook (license-pix-webhook) gera o
-- código em public.licenses e liga aqui via license_id.

create table if not exists public.license_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  plan text not null default 'cesta_inteligente',
  plan_key text not null,
  days integer not null,
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  mp_payment_id text,
  license_id uuid references public.licenses(id),
  buyer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists license_orders_mp_payment_id_idx
  on public.license_orders (mp_payment_id)
  where mp_payment_id is not null;

create index if not exists license_orders_user_idx
  on public.license_orders (user_id, created_at desc);

alter table public.license_orders enable row level security;

-- Só o dono do pedido pode consultá-lo (para a tela de "aguardando pagamento"
-- saber quando o PIX foi confirmado). Toda escrita acontece via service_role
-- nas Edge Functions (license-pix-checkout / license-pix-webhook) — nunca
-- diretamente do cliente, então não há policy de insert/update aqui.
drop policy if exists "Users can view their own license orders" on public.license_orders;
create policy "Users can view their own license orders"
  on public.license_orders for select
  using (user_id = auth.uid());
