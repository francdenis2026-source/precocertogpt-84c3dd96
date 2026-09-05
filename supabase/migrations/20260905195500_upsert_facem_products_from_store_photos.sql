-- Upsert dos produtos e preços fotografados na Facem Comércio F.M. Araújo.
-- Idempotente: reutiliza produtos existentes e atualiza somente o preço mais recente da loja.

insert into public.products (name, brand, category, size, unit, slug)
select
  'Cerveja Stella Artois Pure Gold Pack 8x269ml',
  'Stella Artois',
  'Bebidas',
  '8x269ml',
  'pack',
  'cerveja-stella-artois-pure-gold-pack-8x269ml'
where not exists (
  select 1 from public.products
  where slug = 'cerveja-stella-artois-pure-gold-pack-8x269ml'
);

with desired(slug, value) as (
  values
    ('acucar-cristal-bela-vista-1kg', 3.50::numeric),
    ('acucar-cristal-doce-dia-1kg', 3.50),
    ('acucar-cristal-itamarati-1kg', 3.60),
    ('arroz-phd-tipo-1-1kg', 4.99),
    ('erva-mate-chacal-cereja-500g', 21.50),
    ('erva-mate-chacal-limao-rosa-500g', 21.50),
    ('leite-condensado-itambe-395g', 9.00),
    ('leite-condensado-moca-integral-395g', 11.00),
    ('leite-condensado-moca-nestle-395g', 10.00),
    ('leite-em-po-integral-ccgl-400g', 18.00),
    ('macarrao-galo-espaguete-400g', 3.75),
    ('macarr-o-penne-todeschini-500g', 4.80),
    ('cerveja-stella-artois-pure-gold-pack-8x269ml', 40.00)
),
resolved as (
  select p.id as product_id, d.value, e.id as establishment_id
  from desired d
  join public.products p on p.slug = d.slug
  cross join lateral (
    select id from public.establishments
    where name = 'Facem Comércio F.M. Araújo'
    limit 1
  ) e
),
latest as (
  select distinct on (pr.product_id) pr.id, pr.product_id
  from public.prices pr
  join resolved r
    on r.product_id = pr.product_id
   and r.establishment_id = pr.establishment_id
  order by pr.product_id, pr.captured_at desc, pr.id desc
),
updated as (
  update public.prices pr
  set
    previous_value = case
      when pr.value <> r.value then pr.value
      else pr.previous_value
    end,
    value = r.value,
    captured_at = now()
  from resolved r
  join latest l on l.product_id = r.product_id
  where pr.id = l.id
  returning pr.product_id
)
insert into public.prices (
  product_id, establishment_id, value, previous_value, captured_at
)
select r.product_id, r.establishment_id, r.value, null, now()
from resolved r
where not exists (
  select 1 from latest l where l.product_id = r.product_id
);
