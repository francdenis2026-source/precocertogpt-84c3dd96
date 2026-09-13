create table if not exists public.merchant_login_attempts (
  identifier_hash text primary key,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.merchant_login_attempts enable row level security;

revoke all on table public.merchant_login_attempts from public, anon, authenticated;
grant all on table public.merchant_login_attempts to service_role;

create index if not exists merchant_login_attempts_cleanup_idx
  on public.merchant_login_attempts (updated_at);

comment on table public.merchant_login_attempts is
  'Contadores de tentativas de login empresarial, identificados apenas por hash do CPF.';
