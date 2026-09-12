CREATE TABLE IF NOT EXISTS public.user_favorite_establishments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    establishment_id uuid REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_favorite_establishments_user_establishment_key UNIQUE (user_id, establishment_id)
);

ALTER TABLE public.user_favorite_establishments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorite establishments" ON public.user_favorite_establishments;
DROP POLICY IF EXISTS "Users can add own favorite establishments" ON public.user_favorite_establishments;
DROP POLICY IF EXISTS "Users can remove own favorite establishments" ON public.user_favorite_establishments;

CREATE POLICY "Users can view own favorite establishments"
ON public.user_favorite_establishments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorite establishments"
ON public.user_favorite_establishments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorite establishments"
ON public.user_favorite_establishments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.user_favorite_establishments TO authenticated;
GRANT ALL ON public.user_favorite_establishments TO service_role;
REVOKE ALL ON public.user_favorite_establishments FROM anon;

CREATE INDEX IF NOT EXISTS user_favorite_establishments_user_created_idx
ON public.user_favorite_establishments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS user_favorite_establishments_establishment_idx
ON public.user_favorite_establishments (establishment_id);
