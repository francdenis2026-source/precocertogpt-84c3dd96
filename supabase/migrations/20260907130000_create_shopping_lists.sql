-- Listas de compras do usuário: montagem manual (grátis) ou por IA (paga,
-- gate reaproveita has_active_license/"cesta_inteligente" via SubscriberGate
-- na função shopping-list-ai). Segue o mesmo padrão de RLS de user_favorites.

CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL DEFAULT 'Minha lista',
    mode text NOT NULL DEFAULT 'search' CHECK (mode IN ('store', 'price', 'search')),
    target_establishment_id text,
    budget numeric,
    household_size integer,
    source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.shopping_list_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id uuid REFERENCES public.shopping_lists(id) ON DELETE CASCADE NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    establishment_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT shopping_list_items_list_product_key UNIQUE (list_id, product_id)
);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can create own shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can update own shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can delete own shopping lists" ON public.shopping_lists;

CREATE POLICY "Users can view own shopping lists"
ON public.shopping_lists FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shopping lists"
ON public.shopping_lists FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists"
ON public.shopping_lists FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists"
ON public.shopping_lists FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own shopping list items" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Users can add own shopping list items" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Users can update own shopping list items" ON public.shopping_list_items;
DROP POLICY IF EXISTS "Users can remove own shopping list items" ON public.shopping_list_items;

CREATE POLICY "Users can view own shopping list items"
ON public.shopping_list_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.shopping_lists l WHERE l.id = list_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can add own shopping list items"
ON public.shopping_list_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_lists l WHERE l.id = list_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can update own shopping list items"
ON public.shopping_list_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.shopping_lists l WHERE l.id = list_id AND l.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_lists l WHERE l.id = list_id AND l.user_id = auth.uid()));

CREATE POLICY "Users can remove own shopping list items"
ON public.shopping_list_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.shopping_lists l WHERE l.id = list_id AND l.user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_list_items TO authenticated;
GRANT ALL ON public.shopping_lists TO service_role;
GRANT ALL ON public.shopping_list_items TO service_role;
REVOKE ALL ON public.shopping_lists FROM anon;
REVOKE ALL ON public.shopping_list_items FROM anon;

CREATE INDEX IF NOT EXISTS shopping_lists_user_updated_idx ON public.shopping_lists (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS shopping_list_items_list_idx ON public.shopping_list_items (list_id);

-- updated_at some sozinho a cada alteração da lista.
CREATE OR REPLACE FUNCTION public.touch_shopping_list_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS shopping_lists_touch_updated_at ON public.shopping_lists;
CREATE TRIGGER shopping_lists_touch_updated_at
BEFORE UPDATE ON public.shopping_lists
FOR EACH ROW EXECUTE FUNCTION public.touch_shopping_list_updated_at();

-- Toda alteração nos itens também atualiza a lista-mãe (pra ordenar
-- "Minhas listas" por atividade recente, não só por criação).
CREATE OR REPLACE FUNCTION public.touch_shopping_list_from_item()
RETURNS trigger AS $$
BEGIN
  UPDATE public.shopping_lists SET updated_at = now()
  WHERE id = COALESCE(NEW.list_id, OLD.list_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS shopping_list_items_touch_list ON public.shopping_list_items;
CREATE TRIGGER shopping_list_items_touch_list
AFTER INSERT OR UPDATE OR DELETE ON public.shopping_list_items
FOR EACH ROW EXECUTE FUNCTION public.touch_shopping_list_from_item();
