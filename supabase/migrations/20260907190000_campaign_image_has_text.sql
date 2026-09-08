-- Alguns banners são enviados já prontos (arte completa, com texto e botão
-- desenhados na própria imagem); sobrepor o título/subtítulo do sistema em
-- cima deles duplica o texto. Esse campo deixa o admin avisar que a imagem
-- já se basta sozinha — nesse caso o banner público mostra só a imagem,
-- sem véu escuro nem texto por cima.
alter table public.platform_campaigns
  add column if not exists image_has_text boolean not null default false;
