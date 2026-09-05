-- Atualiza o preço confirmado nas imagens do comércio Facem.
WITH latest AS (
  SELECT id, value
  FROM public.prices
  WHERE establishment_id = '87bac1d3-304b-4560-bc1f-21744c0c3182'
    AND product_id = 'a2c1e3a8-da4a-4c94-a501-bebe07460c91'
  ORDER BY captured_at DESC
  LIMIT 1
)
UPDATE public.prices AS prices
SET previous_value = prices.value,
    value = 25.00,
    captured_at = now()
FROM latest
WHERE prices.id = latest.id
  AND prices.value IS DISTINCT FROM 25.00;
