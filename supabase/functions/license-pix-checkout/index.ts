import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Gera uma cobrança PIX (Mercado Pago) para comprar uma licença da Cesta
// Inteligente diretamente pelo site, sem passar pelo WhatsApp. O preço e a
// duração de cada plano são fixados AQUI, no servidor — o cliente só manda
// qual plano escolheu (planKey), nunca o valor, para não dar pra falsificar
// o preço pelo DevTools.
const PLANS: Record<string, { days: number; amount: number; label: string }> = {
  "24h": { days: 1, amount: 10.00, label: "24 horas" },
  "7d": { days: 7, amount: 15.00, label: "7 dias" },
  "30d": { days: 30, amount: 29.90, label: "30 dias" },
  "90d": { days: 90, amount: 69.90, label: "Trimestral (90 dias)" },
  "180d": { days: 180, amount: 119.90, label: "Semestral (180 dias)" },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const mpToken = Deno.env.get("MERCADOPAGO_PLATFORM_ACCESS_TOKEN");
    const webhookUrl = Deno.env.get("MERCADOPAGO_PLATFORM_WEBHOOK_URL");
    if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "Serviço indisponível." }, 503);
    if (!mpToken) return json({ error: "Pagamento por PIX ainda não está configurado. Fale conosco pelo WhatsApp." }, 503);

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData.user;
    if (!user) return json({ error: "Faça login para comprar." }, 401);

    const body = await req.json().catch(() => ({}));
    const planKey = String(body?.planKey || "");
    const plan = PLANS[planKey];
    if (!plan) return json({ error: "Plano inválido." }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderError } = await admin
      .from("license_orders")
      .insert({
        user_id: user.id,
        plan_key: planKey,
        days: plan.days,
        amount: plan.amount,
        buyer_email: user.email,
      })
      .select("id")
      .single();
    if (orderError || !order) return json({ error: "Não foi possível criar o pedido." }, 500);

    const [firstName, ...rest] = (user.user_metadata?.name || user.email || "Cliente").split(/\s+/);
    const paymentPayload: Record<string, unknown> = {
      transaction_amount: plan.amount,
      description: `Cesta Inteligente PreçoCerto — ${plan.label}`,
      payment_method_id: "pix",
      external_reference: order.id,
      payer: { email: user.email, first_name: firstName, last_name: rest.join(" ") || undefined },
      metadata: { order_id: order.id, plan_key: planKey, user_id: user.id },
    };
    if (webhookUrl) paymentPayload.notification_url = webhookUrl;

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Idempotency-Key": `pc-license-${order.id}`,
      },
      body: JSON.stringify(paymentPayload),
    });
    const payment = await mpResponse.json().catch(() => ({}));
    if (!mpResponse.ok || !payment?.id) {
      await admin.from("license_orders").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", order.id);
      return json({ error: "O Mercado Pago não conseguiu gerar o PIX.", detail: payment?.message }, 502);
    }

    await admin.from("license_orders").update({ mp_payment_id: String(payment.id) }).eq("id", order.id);

    const tx = payment.point_of_interaction?.transaction_data || {};
    return json({
      orderId: order.id,
      status: payment.status || "pending",
      qrCode: tx.qr_code || null,
      qrCodeBase64: tx.qr_code_base64 || null,
      ticketUrl: tx.ticket_url || null,
      amount: plan.amount,
      planLabel: plan.label,
    });
  } catch (error) {
    console.error("license-pix-checkout", error);
    return json({ error: "Erro interno ao gerar o PIX. Tente novamente." }, 500);
  }
});
