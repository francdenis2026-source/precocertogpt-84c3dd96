-- Área administrativa de clientes/financeiro: quem está com licença ativa,
-- quanto a plataforma arrecadou, e detalhe por cliente ao clicar no nome.
-- Mesma checagem de permissão já usada em generate_license_key/list_licenses
-- (super_admin, admin ou moderator) — nenhuma tabela nova, só funções de
-- leitura agregada sobre public.licenses e public.license_orders.

CREATE OR REPLACE FUNCTION public.admin_finance_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _result jsonb;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin', 'moderator')
  ) INTO _is_admin;
  IF NOT _is_admin THEN
    RAISE EXCEPTION 'Sem permissão administrativa' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'total_revenue', coalesce((SELECT sum(amount) FROM public.license_orders WHERE status = 'approved'), 0),
    'revenue_30d', coalesce((SELECT sum(amount) FROM public.license_orders WHERE status = 'approved' AND created_at > now() - interval '30 days'), 0),
    'revenue_7d', coalesce((SELECT sum(amount) FROM public.license_orders WHERE status = 'approved' AND created_at > now() - interval '7 days'), 0),
    'orders_approved_count', (SELECT count(*) FROM public.license_orders WHERE status = 'approved'),
    'orders_pending_count', (SELECT count(*) FROM public.license_orders WHERE status = 'pending'),
    'active_licenses_count', (SELECT count(*) FROM public.licenses WHERE status = 'active' AND (expires_at IS NULL OR expires_at > now())),
    'customers_count', (SELECT count(DISTINCT user_id) FROM public.license_orders)
  ) INTO _result;

  RETURN _result;
END;
$$;

-- Um cliente por linha, com o total pago e a situação da licença mais
-- recente. Une pedidos e licenças pelo e-mail do comprador (fonte comum a
-- ambos), então aparece mesmo quando o pagamento ainda está pendente.
CREATE OR REPLACE FUNCTION public.admin_list_customers()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _result jsonb;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin', 'moderator')
  ) INTO _is_admin;
  IF NOT _is_admin THEN
    RAISE EXCEPTION 'Sem permissão administrativa' USING ERRCODE = '42501';
  END IF;

  WITH spend AS (
    SELECT user_id, sum(amount) FILTER (WHERE status = 'approved') AS total_spent,
           count(*) FILTER (WHERE status = 'approved') AS orders_count,
           max(created_at) AS last_order_at
    FROM public.license_orders
    GROUP BY user_id
  ),
  active_license AS (
    SELECT DISTINCT ON (user_id) user_id, plan, expires_at, license_key
    FROM public.licenses
    WHERE status = 'active' AND (expires_at IS NULL OR expires_at > now())
    ORDER BY user_id, expires_at DESC NULLS LAST
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'user_id', u.id,
    'email', u.email,
    'display_name', p.display_name,
    'created_at', u.created_at,
    'total_spent', coalesce(s.total_spent, 0),
    'orders_count', coalesce(s.orders_count, 0),
    'last_order_at', s.last_order_at,
    'active_plan', al.plan,
    'active_expires_at', al.expires_at
  ) ORDER BY s.last_order_at DESC NULLS LAST), '[]'::jsonb)
  INTO _result
  FROM spend s
  JOIN auth.users u ON u.id = s.user_id
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN active_license al ON al.user_id = u.id;

  RETURN _result;
END;
$$;

-- Detalhe de um cliente: perfil + histórico completo de licenças e pedidos.
CREATE OR REPLACE FUNCTION public.admin_customer_detail(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _profile jsonb;
  _licenses jsonb;
  _orders jsonb;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin', 'moderator')
  ) INTO _is_admin;
  IF NOT _is_admin THEN
    RAISE EXCEPTION 'Sem permissão administrativa' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'user_id', u.id, 'email', u.email, 'display_name', p.display_name,
    'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at,
    'roles', coalesce((SELECT jsonb_agg(role::text) FROM public.user_roles WHERE user_id = u.id), '[]'::jsonb)
  ) INTO _profile
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = _user_id;

  IF _profile IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Cliente não encontrado.');
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'license_key', license_key, 'status', status, 'plan', plan,
    'activated_at', activated_at, 'expires_at', expires_at, 'revoked_at', revoked_at, 'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb) INTO _licenses
  FROM public.licenses WHERE user_id = _user_id;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'plan', plan, 'plan_key', plan_key, 'days', days, 'amount', amount,
    'status', status, 'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb) INTO _orders
  FROM public.license_orders WHERE user_id = _user_id;

  RETURN jsonb_build_object('ok', true, 'profile', _profile, 'licenses', _licenses, 'orders', _orders);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_finance_summary() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_finance_summary() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_customers() FROM public;
GRANT EXECUTE ON FUNCTION public.admin_list_customers() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_customer_detail(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_customer_detail(uuid) TO authenticated;
