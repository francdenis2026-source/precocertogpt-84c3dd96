-- Zoom manual da imagem do banner (além do enquadramento/posição que já
-- existia). Guardado em porcentagem (100 = tamanho normal).
alter table public.platform_campaigns
  add column if not exists image_scale numeric not null default 100
  check (image_scale between 50 and 250);
