revoke execute on function public.admin_activate_radio(uuid) from anon;
revoke execute on function public.admin_activate_radio(uuid) from public;
grant execute on function public.admin_activate_radio(uuid) to authenticated;
