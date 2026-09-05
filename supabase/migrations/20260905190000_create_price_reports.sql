-- Cria a tabela price_reports, usada por src/data/priceReports.ts para registrar
-- denúncias/solicitações de correção de preço enviadas por visitantes e usuários
-- logados no site público. A tabela nunca foi criada em produção, então todo
-- envio feito pelo formulário do site falhava em silêncio (erro "Could not find
-- the table 'public.price_reports' in the schema cache").
CREATE TABLE IF NOT EXISTS public.price_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    establishment_id uuid REFERENCES public.establishments(id) ON DELETE SET NULL,
    reported_price numeric,
    reason text NOT NULL,
    comment text,
    reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewed', 'applied', 'dismissed')),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.price_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit price reports" ON public.price_reports;
DROP POLICY IF EXISTS "Admins can view price reports" ON public.price_reports;
DROP POLICY IF EXISTS "Admins can update price reports" ON public.price_reports;

-- Visitantes (anon) e usuários logados podem enviar denúncias de preço.
CREATE POLICY "Anyone can submit price reports"
ON public.price_reports FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Só administradores da plataforma podem ver e triar as denúncias recebidas.
CREATE POLICY "Admins can view price reports"
ON public.price_reports FOR SELECT
TO authenticated
USING (private.is_platform_admin());

CREATE POLICY "Admins can update price reports"
ON public.price_reports FOR UPDATE
TO authenticated
USING (private.is_platform_admin())
WITH CHECK (private.is_platform_admin());

GRANT INSERT ON public.price_reports TO anon, authenticated;
GRANT SELECT, UPDATE ON public.price_reports TO authenticated;
GRANT ALL ON public.price_reports TO service_role;

CREATE INDEX IF NOT EXISTS price_reports_created_idx
ON public.price_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS price_reports_product_idx
ON public.price_reports (product_id);

CREATE INDEX IF NOT EXISTS price_reports_establishment_idx
ON public.price_reports (establishment_id);
