-- Compartilhamento de lista por link: terceiros (sem precisar de conta) abrem
-- um link e marcam itens como comprados conforme vão às compras. O dono
-- controla um interruptor (share_enabled) e um token opaco (share_token);
-- desligar ou nunca ligar mantém a lista totalmente privada, como sempre foi.
-- Quem tem o link nunca vê nem edita nada além do que essas duas funções
-- (security definer) expõem explicitamente — nada de acesso direto às tabelas.

ALTER TABLE public.shopping_lists
  ADD COLUMN IF NOT EXISTS share_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS share_enabled boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS shopping_lists_share_token_idx ON public.shopping_lists (share_token);

ALTER TABLE public.shopping_list_items
  ADD COLUMN IF NOT EXISTS purchased boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS purchased_at timestamptz;

-- Dono liga/desliga o compartilhamento e pode trocar o token (invalida o
-- link antigo na hora, sem precisar apagar a lista).
CREATE OR REPLACE FUNCTION public.set_shopping_list_sharing(_list_id uuid, _enabled boolean, _rotate_token boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.shopping_lists;
BEGIN
  UPDATE public.shopping_lists
  SET share_enabled = _enabled,
      share_token = CASE WHEN _rotate_token THEN gen_random_uuid() ELSE share_token END
  WHERE id = _list_id AND user_id = auth.uid()
  RETURNING * INTO _row;

  IF _row.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Lista não encontrada.');
  END IF;

  RETURN jsonb_build_object('ok', true, 'share_token', _row.share_token, 'share_enabled', _row.share_enabled);
END;
$$;

-- Leitura pública (só quando share_enabled = true): nome, modo, itens com
-- quantidade e status de comprado. Preço/estabelecimento são resolvidos no
-- cliente a partir do catálogo público, igual às outras telas do site —
-- aqui só entrega o esqueleto da lista.
CREATE OR REPLACE FUNCTION public.get_shared_shopping_list(_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _list public.shopping_lists;
  _items jsonb;
BEGIN
  SELECT * INTO _list FROM public.shopping_lists WHERE share_token = _token AND share_enabled = true;
  IF _list.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Link inválido ou o dono desativou o compartilhamento.');
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'product_id', product_id, 'quantity', quantity, 'purchased', purchased
  ) ORDER BY created_at), '[]'::jsonb)
  INTO _items
  FROM public.shopping_list_items WHERE list_id = _list.id;

  RETURN jsonb_build_object(
    'ok', true, 'name', _list.name, 'mode', _list.mode,
    'target_establishment_id', _list.target_establishment_id, 'items', _items
  );
END;
$$;

-- Único ato de escrita permitido a quem só tem o link: marcar/desmarcar um
-- item como comprado. Nada de adicionar, remover ou trocar quantidade.
CREATE OR REPLACE FUNCTION public.set_shared_shopping_list_item_purchased(_token uuid, _product_id text, _purchased boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _list_id uuid;
BEGIN
  SELECT id INTO _list_id FROM public.shopping_lists WHERE share_token = _token AND share_enabled = true;
  IF _list_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Link inválido ou o dono desativou o compartilhamento.');
  END IF;

  UPDATE public.shopping_list_items
  SET purchased = _purchased, purchased_at = CASE WHEN _purchased THEN now() ELSE NULL END
  WHERE list_id = _list_id AND product_id = _product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Item não encontrado nessa lista.');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.set_shopping_list_sharing(uuid, boolean, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.set_shopping_list_sharing(uuid, boolean, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.get_shared_shopping_list(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_shared_shopping_list(uuid) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.set_shared_shopping_list_item_purchased(uuid, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.set_shared_shopping_list_item_purchased(uuid, text, boolean) TO anon, authenticated;
