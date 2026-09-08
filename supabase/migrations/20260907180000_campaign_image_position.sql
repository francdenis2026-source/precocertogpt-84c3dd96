-- Permite o administrador ajustar manualmente o enquadramento (crop) da
-- imagem do banner, além de trocar/redimensionar o arquivo em si (upload já
-- existia). Guarda um valor de object-position em CSS (ex.: "50% 30%",
-- "left top"), aplicado via variável --campaign-focus no banner público.
alter table public.platform_campaigns
  add column if not exists image_position text;
