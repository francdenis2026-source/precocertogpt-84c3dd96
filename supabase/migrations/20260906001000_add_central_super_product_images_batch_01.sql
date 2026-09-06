UPDATE public.products SET image_url = CASE id
WHEN 'a147e81d-5a2e-4741-aa3b-c6565d215248' THEN 'https://drogariaspacheco.vteximg.com.br/arquivos/ids/2219223-1000-1000/658855---absorvente-externo-always-super-protecao-com-abas-cobertura-procter.jpg?v=639088315062900000'
WHEN 'b3f524ee-758a-4d3e-b592-d33a8d5a4147' THEN 'https://bemol.vtexassets.com/arquivos/ids/170739-800-800?aspect=true&height=800&v=639034267741900000&width=800'
WHEN '3023926f-08c1-457e-8866-af0928b275ee' THEN 'https://www.castelao.com.br/media/catalog/product/cache/1/image/1800x/040ec09b1e35df139433887a97daa66f/a/g/agua-mineral-crystal-com-gas-500ml.jpg'
WHEN '017092e8-6bfa-47e2-bbc2-7333b347a7ff' THEN 'https://images.tcdn.com.br/img/img_prod/694926/alcool_liquido_limpeza_70_santa_cruz_litro_360429_1_0a4a06b1c0385fafc0c6dc9d2c69507a.jpg'
END
WHERE id IN ('a147e81d-5a2e-4741-aa3b-c6565d215248','b3f524ee-758a-4d3e-b592-d33a8d5a4147','3023926f-08c1-457e-8866-af0928b275ee','017092e8-6bfa-47e2-bbc2-7333b347a7ff');