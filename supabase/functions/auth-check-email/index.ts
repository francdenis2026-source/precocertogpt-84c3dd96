import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Só responde SE existe conta com esse e-mail (true/false) — nunca nome,
// telefone ou qualquer outro dado. Usada depois de um login falhar, para o
// app dizer "conta não encontrada" em vez de "senha incorreta" quando for
// o caso. É chamada com service_role porque a Auth API pública do Supabase
// não deixa consultar isso do lado do cliente (proteção padrão contra
// enumeração de contas) — aqui o custo/benefício foi decidido pelo produto.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "E-mail inválido." }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) {
      console.error("Variáveis de ambiente do Supabase ausentes na Edge Function");
      return json({ error: "Configuração do servidor incompleta." }, 500);
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    let exists = false;
    let page = 1;
    while (page <= 20) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return json({ error: "Não foi possível consultar as contas." }, 500);
      if (data.users.some((u) => u.email?.toLowerCase() === email)) {
        exists = true;
        break;
      }
      if (data.users.length < 1000) break;
      page++;
    }

    return json({ exists });
  } catch (err) {
    console.error("Erro interno na Edge Function:", err);
    return json({ error: "Erro interno ao consultar a conta." }, 500);
  }
});
