import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

type BasketItem = { name: string; quantity: number; price: number; establishment: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "Assistente de IA ainda não configurado (falta ANTHROPIC_API_KEY)." }, 503);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const auth = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) return json({ error: "Faça login para usar o assistente." }, 401);

  // Ferramenta paga: sem licença ativa, nem a Claude responde por aqui —
  // a chamada custa de verdade a cada mensagem, então a checagem tem que
  // acontecer no servidor, não só no gate visual da página.
  const { data: hasLicense } = await userClient.rpc("has_active_license", { _plan: "cesta_inteligente" });
  if (!hasLicense) return json({ error: "É preciso ter a Cesta Inteligente ativa para usar o assistente." }, 403);

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || "").slice(0, 500);
  if (!message.trim()) return json({ error: "Mensagem vazia." }, 400);

  const budget = Number(body.budget) || 0;
  const people = Number(body.people) || 1;
  const items: BasketItem[] = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  const missing: string[] = Array.isArray(body.missing) ? body.missing.slice(0, 20) : [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const itemsSummary = items.length
    ? items.map(i => `- ${i.quantity}x ${i.name} (${i.establishment}) — R$${(i.price * i.quantity).toFixed(2)}`).join("\n")
    : "(nenhum item na cesta ainda)";

  const systemPrompt = `Você é o assistente de compras do PreçoCerto, um app de comparação de preços em Feijó, Acre.
Ajude o usuário a montar a cesta de compras mais econômica com o orçamento e o número de pessoas informados.
Responda sempre em português do Brasil, em no máximo 3 frases curtas, direto ao ponto, sem markdown.
Você não pode alterar a cesta diretamente — só sugerir e explicar. Se um item pedido não estiver na lista atual, diga que a pessoa pode buscá-lo na aba "Escolher meus produtos".
Nunca invente preços ou produtos que não foram te informados.

Contexto atual do usuário:
- Orçamento: R$${budget.toFixed(2)}
- Pessoas na casa: ${people}
- Total já somado na cesta: R$${total.toFixed(2)}
- Itens na cesta:
${itemsSummary}
- Itens essenciais ainda não encontrados no orçamento: ${missing.length ? missing.join(", ") : "nenhum"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return json({ error: data?.error?.message || "Falha ao consultar o assistente." }, 502);
    }
    const reply = (data?.content || []).map((block: { text?: string }) => block.text || "").join("").trim();
    return json({ reply: reply || "Não consegui gerar uma resposta agora. Tente novamente." });
  } catch (err) {
    return json({ error: "Erro ao contatar o assistente de IA." }, 502);
  }
});
