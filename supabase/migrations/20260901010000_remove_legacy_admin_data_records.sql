-- Remove the legacy import/staging table that was responsible for tens of MB
-- of unnecessary database usage. The production application does not reference
-- this table; operational catalog data lives in products, prices,
-- establishments, merchant_products and related normalized tables.
--
-- This migration is intentionally idempotent so it is safe on environments
-- where the legacy table was never created or was already removed manually.

drop table if exists public.admin_data_records;
