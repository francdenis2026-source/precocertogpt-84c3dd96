-- A política pública de leitura de radio_stations (migração 20260828120000)
-- combinava "is_active and is_enabled" com "private.is_platform_admin()" na
-- mesma cláusula USING. Todo visitante anônimo do site consulta esta tabela
-- (player de rádio embutido em toda página de estabelecimento) e recebia
-- 401, poluindo o console em todas as visitas.
-- Aqui a leitura pública fica isolada em sua própria política, sem depender
-- da função administrativa (que assume sessão autenticada) para o caminho
-- anônimo mais comum.
drop policy if exists radio_stations_public_read on public.radio_stations;

create policy radio_stations_public_active_read
  on public.radio_stations
  for select
  to anon, authenticated
  using (is_active and is_enabled);

create policy radio_stations_admin_read
  on public.radio_stations
  for select
  to authenticated
  using (private.is_platform_admin());

grant select on table public.radio_stations to anon, authenticated;
