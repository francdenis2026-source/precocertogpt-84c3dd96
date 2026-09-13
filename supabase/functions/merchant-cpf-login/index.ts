import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const MAX_FAILURES = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 30 * 60 * 1000;

async function identifierHash(cpf: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`merchant-login:${cpf}`));
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function alias(cpf: string) {
  const bytes = new TextEncoder().encode(`precocerto-owner:${cpf}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return `u-${Array.from(new Uint8Array(hash))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}@login.precocerto.com.br`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  
  try {
    if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
    
    const body = await req.json().catch(() => ({}));
    const cpf = String(body.cpf || "").replace(/\D/g, "");
    const pin = String(body.pin || "");
    
    if (cpf.length !== 11) {
      return json({ error: "CPF inválido. Use 11 dígitos." }, 400);
    }
    
    if (!/^[0-9]{6}$/.test(pin)) {
      return json({ error: "PIN inválido. Use 6 números." }, 400);
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
      console.error("Variáveis de ambiente do Supabase ausentes na Edge Function");
      return json({ error: "Configuração do servidor incompleta." }, 500);
    }
    
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const hash = await identifierHash(cpf);
    const now = new Date();
    const { data: attempt } = await admin
      .from("merchant_login_attempts")
      .select("failed_attempts,window_started_at,blocked_until")
      .eq("identifier_hash", hash)
      .maybeSingle();
    if (attempt?.blocked_until && new Date(attempt.blocked_until) > now) {
      return json({ error: "Muitas tentativas. Aguarde 30 minutos antes de tentar novamente." }, 429);
    }
    
    const email = await alias(cpf);
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: pin,
    });
    
    if (error || !data.session) {
      const windowStarted = attempt?.window_started_at ? new Date(attempt.window_started_at) : now;
      const insideWindow = now.getTime() - windowStarted.getTime() < ATTEMPT_WINDOW_MS;
      const failures = insideWindow ? Number(attempt?.failed_attempts || 0) + 1 : 1;
      const blockedUntil = failures >= MAX_FAILURES ? new Date(now.getTime() + BLOCK_MS).toISOString() : null;
      await admin.from("merchant_login_attempts").upsert({
        identifier_hash: hash,
        failed_attempts: failures,
        window_started_at: insideWindow ? windowStarted.toISOString() : now.toISOString(),
        blocked_until: blockedUntil,
        updated_at: now.toISOString(),
      });
      console.warn(`Falha de login empresarial (${hash.slice(0, 10)}): ${error?.message || "sem sessão"}`);
      return json({ 
        error: blockedUntil
          ? "Muitas tentativas. Aguarde 30 minutos antes de tentar novamente."
          : "Acesso empresarial não encontrado ou PIN incorreto. Verifique seus dados ou contate o administrador."
      }, blockedUntil ? 429 : 401);
    }

    await admin.from("merchant_login_attempts").delete().eq("identifier_hash", hash);
    
    return json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    });
  } catch (err) {
    console.error("Erro interno na Edge Function:", err);
    return json({ error: "Erro interno ao processar login." }, 500);
  }
});
