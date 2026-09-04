-- Adiciona o campo de liberação global de preços à tabela
-- platform_settings existente (linha única, id='global'), reaproveitando
-- suas políticas de RLS já corretas (leitura pública, escrita admin).
alter table public.platform_settings
  add column if not exists all_prices_visible boolean not null default false;

-- Habilita replicação em tempo real para que o toggle propague
-- instantaneamente para todos os clientes conectados (inclusive visitantes).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.platform_settings;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;
