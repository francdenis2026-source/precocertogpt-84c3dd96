-- Organiza os produtos de carnes do Facem na seção específica de Açougue.
UPDATE public.products AS p
SET category = 'acougue'
WHERE p.category = 'carnes'
  AND EXISTS (
    SELECT 1
    FROM public.prices AS pr
    WHERE pr.product_id = p.id
      AND pr.establishment_id = '87bac1d3-304b-4560-bc1f-21744c0c3182'
  );
