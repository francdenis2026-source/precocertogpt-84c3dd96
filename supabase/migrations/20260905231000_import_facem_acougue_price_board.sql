-- Importa os preços confirmados na tabela do açougue Facem.
WITH updates(product_name, new_value) AS (
  VALUES
    ('Costela Bovina',30.00),('Peito bovino',24.00),('Pescoço Bovino',24.00),
    ('Canela',22.00),('Canela Bovina',22.00),('Fígado e coração bovino',24.00),
    ('Pá e pé de costela',25.00),('Carne Moída',28.00),('Bisteca',28.00),
    ('Fraldinha',27.00),('Chã de fora',39.50),('Chã de dentro',39.50),
    ('Alcatra',39.50),('Patinho',39.50),('Filé',47.00),('Picanha',47.00),
    ('Carne de porco com casca',30.00),('Carne de porco sem casca',24.00),
    ('Porco com casca',30.00),('Porco sem casca',24.00),('Frango',14.99),
    ('Língua bovina',14.00)
),
latest AS (
  SELECT DISTINCT ON (p.id) p.id AS product_id, p.name, u.new_value, pr.id AS price_id, pr.value
  FROM updates u
  JOIN public.products p ON lower(p.name)=lower(u.product_name)
  JOIN public.prices pr ON pr.product_id=p.id
  WHERE pr.establishment_id='87bac1d3-304b-4560-bc1f-21744c0c3182'
  ORDER BY p.id, pr.captured_at DESC
)
UPDATE public.prices pr
SET previous_value=latest.value, value=latest.new_value, captured_at=now()
FROM latest
WHERE pr.id=latest.price_id AND pr.value IS DISTINCT FROM latest.new_value;

UPDATE public.products p
SET category='condimentos'
WHERE p.category='acougue'
  AND lower(p.name) IN ('ketchup heinz sabor bacon 397g','sazón frango 60g','tempero sazón ajinomoto carnes 60g');
