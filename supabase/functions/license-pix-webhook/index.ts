import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Chamado sozinho pelo Mercado Pago assim que o PIX da licença é pago.
// Confirma o pagamento, cria o código de licença automaticamente e manda
// por e-mail (Resend) — sem nenhuma ação manual. Segue o mesmo esquema de
// assinatura HMAC do webhook de marketplace (mercadopago-webhook), mas usa
// o token da PLATAFORMA (venda direta do PreçoCerto), não de um lojista.

const encoder = new TextEncoder();
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-signature, x-request-id" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function parseSignature(value: string | null) {
  const result: Record<string, string> = {};
  for (const part of (value || "").split(",")) { const [key, val] = part.trim().split("=", 2); if (key && val) result[key] = val; }
  return result;
}
async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
function generateLicenseKey() {
  const part = () => crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `CESTA-${part()}-${part()}`;
}

async function sendLicenseEmail(opts: { to: string; licenseKey: string; planLabel: string; expiresAt: string | null }) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromAddress = Deno.env.get("PAYMENT_NOTIFICATION_FROM");
  if (!resendKey || !fromAddress) {
    console.info(`[LICENSE-EMAIL-SKIPPED] ${opts.to} (provedor de e-mail não configurado) key=${opts.licenseKey}`);
    return { sent: false, reason: "email_provider_not_configured" };
  }
  const expiresText = opts.expiresAt
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(opts.expiresAt))
    : "sem validade definida";
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#10161d">
      <h2 style="margin:0 0 12px">Sua Cesta Inteligente está liberada 🎉</h2>
      <p>Pagamento do plano <strong>${opts.planLabel}</strong> confirmado. Seu código de acesso já está ativo na sua conta — não precisa nem digitar nada, mas guarde-o caso precise:</p>
      <p style="margin:18px 0;padding:14px 18px;border:1px dashed #0e7a5f;border-radius:10px;background:#e3f5ee;font-size:20px;font-weight:800;letter-spacing:.04em;color:#0a5c47">${opts.licenseKey}</p>
      <p>Válido até: <strong>${expiresText}</strong>.</p>
      <p><a href="https://precocerto.com.br/cesta-inteligente" style="color:#0e7a5f;font-weight:700">Abrir a Cesta Inteligente</a></p>
      <p style="color:#5c6773;font-size:13px;margin-top:24px">PreçoCerto · confirmação automática de pagamento.</p>
    </div>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromAddress, to: [opts.to], subject: "Sua licença da Cesta Inteligente chegou", html }),
  });
  if (!response.ok) {
    console.error(`[LICENSE-EMAIL-ERROR] ${opts.to} status=${response.status}: ${await response.text()}`);
    return { sent: false, reason: "send_failed" };
  }
  return { sent: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const webhookSecret = Deno.env.get("MERCADOPAGO_PLATFORM_WEBHOOK_SECRET");
  const mpToken = Deno.env.get("MERCADOPAGO_PLATFORM_ACCESS_TOKEN");
  if (!serviceKey || !supabaseUrl || !webhookSecret || !mpToken) return json({ error: "Webhook não configurado" }, 503);

  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("data_id") || String(body?.data?.id || "");
  const requestId = req.headers.get("x-request-id") || "";
  const parts = parseSignature(req.headers.get("x-signature"));
  const ts = parts.ts || "";
  const receivedHash = parts.v1 || "";
  if (!dataId || !requestId || !ts || !receivedHash) return json({ error: "Assinatura incompleta" }, 401);

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expectedHash = await hmacHex(webhookSecret, manifest);
  if (!safeEqual(expectedHash, receivedHash)) return json({ error: "Assinatura inválida" }, 401);

  const eventType = body?.type || url.searchParams.get("type");
  if (eventType && eventType !== "payment") return json({ ok: true, ignored: eventType });

  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
    headers: { Authorization: `Bearer ${mpToken}`, Accept: "application/json" },
  });
  const payment = await mpResponse.json();
  if (!mpResponse.ok) return json({ error: "Não foi possível consultar pagamento" }, 502);

  const orderId = payment.external_reference ? String(payment.external_reference) : null;
  if (!orderId) return json({ ok: true, payment_found: true, order_found: false });

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: order } = await admin.from("license_orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return json({ ok: true, payment_found: true, order_found: false });
  if (order.status === "approved" && order.license_id) return json({ ok: true, already_processed: true });

  if (payment.status === "approved") {
    const licenseKey = generateLicenseKey();
    const expiresAt = new Date(Date.now() + order.days * 24 * 60 * 60 * 1000).toISOString();
    const { data: license, error: licenseError } = await admin
      .from("licenses")
      .insert({ license_key: licenseKey, status: "active", plan: order.plan, user_id: order.user_id, expires_at: expiresAt, activated_at: new Date().toISOString() })
      .select("id")
      .single();
    if (licenseError || !license) return json({ error: "Falha ao gerar a licença" }, 500);

    await admin.from("license_orders").update({
      status: "approved",
      license_id: license.id,
      mp_payment_id: String(payment.id),
      updated_at: new Date().toISOString(),
    }).eq("id", orderId);

    if (order.buyer_email) {
      await sendLicenseEmail({ to: order.buyer_email, licenseKey, planLabel: order.plan_key, expiresAt });
    }
    return json({ ok: true, approved: true });
  }

  if (["rejected", "cancelled"].includes(payment.status)) {
    await admin.from("license_orders").update({ status: payment.status, updated_at: new Date().toISOString() }).eq("id", orderId);
  }
  return json({ ok: true, status: payment.status });
});
