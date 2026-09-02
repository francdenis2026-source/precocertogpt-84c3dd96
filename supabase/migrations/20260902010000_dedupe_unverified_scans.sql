-- Keep raw scan history useful without allowing repeated unverified observations
-- to grow the database indefinitely. Verified scans are never removed here.
--
-- For an unverified scan, only the newest observation for the same user,
-- barcode, establishment and captured price is retained. This preserves
-- independent evidence from different users and all verified history.

DO $$
BEGIN
  IF to_regclass('public.scans') IS NULL THEN
    RETURN;
  END IF;

  -- One-time cleanup of existing redundant unverified scans.
  -- ctid is used only inside this migration to avoid assuming the primary-key type.
  DELETE FROM public.scans AS s
  USING (
    SELECT ctid,
           row_number() OVER (
             PARTITION BY barcode, establishment_id, price_captured, user_id
             ORDER BY created_at DESC, ctid DESC
           ) AS rn
    FROM public.scans
    WHERE verified IS NOT TRUE
  ) AS duplicates
  WHERE s.ctid = duplicates.ctid
    AND duplicates.rn > 1;
END
$$;

CREATE OR REPLACE FUNCTION public.replace_redundant_unverified_scan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- A verified observation is evidence/history and must always be preserved.
  IF NEW.verified IS TRUE THEN
    RETURN NEW;
  END IF;

  -- Replace older *unverified* exact observations instead of appending another
  -- redundant row. Use null-safe comparisons because some legacy rows may have
  -- nullable metadata.
  DELETE FROM public.scans AS s
  WHERE s.verified IS NOT TRUE
    AND s.barcode IS NOT DISTINCT FROM NEW.barcode
    AND s.establishment_id IS NOT DISTINCT FROM NEW.establishment_id
    AND s.price_captured IS NOT DISTINCT FROM NEW.price_captured
    AND s.user_id IS NOT DISTINCT FROM NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scans_replace_redundant_unverified ON public.scans;
CREATE TRIGGER scans_replace_redundant_unverified
BEFORE INSERT ON public.scans
FOR EACH ROW
EXECUTE FUNCTION public.replace_redundant_unverified_scan();

-- Supports the trigger lookup and common review queries while limiting the
-- index to rows that are candidates for deduplication.
CREATE INDEX IF NOT EXISTS idx_scans_unverified_dedupe
  ON public.scans (barcode, establishment_id, price_captured, user_id)
  WHERE verified IS NOT TRUE;

COMMENT ON FUNCTION public.replace_redundant_unverified_scan() IS
  'Keeps only the newest exact unverified scan per user/barcode/establishment/price while preserving every verified scan.';
