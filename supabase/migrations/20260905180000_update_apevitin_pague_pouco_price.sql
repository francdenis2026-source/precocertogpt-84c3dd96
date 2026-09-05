-- Update the verified Apevitin BC 240 ml offer at Drogaria Pague Pouco.
-- This migration is idempotent and refuses to change ambiguous catalog rows.
do $$
declare
  v_current_count integer;
  v_target_count integer;
begin
  select count(*)
    into v_target_count
  from public.prices pr
  join public.products p on p.id = pr.product_id
  join public.establishments e on e.id = pr.establishment_id
  where lower(trim(p.name)) = 'apevitin bc'
    and lower(trim(coalesce(p.size, ''))) = '240'
    and lower(trim(coalesce(p.unit, ''))) = 'ml'
    and lower(trim(e.name)) = 'drogaria pague pouco'
    and pr.value = 22.99;

  if v_target_count = 1 then
    return;
  end if;

  select count(*)
    into v_current_count
  from public.prices pr
  join public.products p on p.id = pr.product_id
  join public.establishments e on e.id = pr.establishment_id
  where lower(trim(p.name)) = 'apevitin bc'
    and lower(trim(coalesce(p.size, ''))) = '240'
    and lower(trim(coalesce(p.unit, ''))) = 'ml'
    and lower(trim(e.name)) = 'drogaria pague pouco'
    and pr.value = 24.99;

  if v_current_count <> 1 then
    raise exception
      'Expected exactly one Apevitin BC 240 ml price of 24.99 at Drogaria Pague Pouco, found %',
      v_current_count;
  end if;

  update public.prices pr
  set previous_value = pr.value,
      value = 22.99,
      captured_at = now()
  from public.products p, public.establishments e
  where p.id = pr.product_id
    and e.id = pr.establishment_id
    and lower(trim(p.name)) = 'apevitin bc'
    and lower(trim(coalesce(p.size, ''))) = '240'
    and lower(trim(coalesce(p.unit, ''))) = 'ml'
    and lower(trim(e.name)) = 'drogaria pague pouco'
    and pr.value = 24.99;
end;
$$;
