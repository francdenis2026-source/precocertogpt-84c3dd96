import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

type CatalogItem = { id: string; name: string; category: string; minPrice: number };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "Montagem por IA ainda não configurada (falta ANTHROPIC_API_KEY)." }, 503);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const auth = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) return json({ error: "Faça login para montar a lista por IA." }, 401);

  // Ferramenta paga: a checagem tem que acontecer no servidor, não só no
  // gate visual da página — senão dá pra chamar a função direto sem pagar.
  const { data: hasLicense } = await userClient.rpc("has_active_license", { _plan: "cesta_inteligente" });
  if (!hasLicense) return json({ error: "É preciso ter a Cesta Inteligente ativa para montar listas por IA." }, 403);

  const body = await req.json().catch(() => ({}));
  const budget = Number(body.budget) || 0;
  const people = Number(body.people) || 1;
  const notes = String(body.notes || "").slice(0, 300);
  const catalog: CatalogItem[] = Array.isArray(body.catalog) ? body.catalog.slice(0, 220) : [];
  if (!catalog.length) return json({ error: "Catálogo não enviado." }, 400);

  const catalogSummary = catalog
    .map(item => `${item.id}|${item.name}|${item.category}|R$${item.minPrice.toFixed(2)}`)
    .join("\n");

  const systemPrompt = `Você monta listas de compras econômicas para o PreçoCerto, um app de comparação de preços em Feijó, Acre.
Escolha produtos e quantidades da lista de catálogo abaixo (formato id|nome|categoria|preço) que caibam no orçamento e sirvam para ${people} pessoa(s).
Preferências do usuário: ${notes || "nenhuma, priorize itens essenciais de mercado (alimentos básicos, limpeza, higiene)"}.
Responda SOMENTE com um JSON válido, sem markdown, sem texto antes ou depois, no formato exato:
{"items":[{"id":"<id do catálogo>","quantity":<número inteiro>}],"message":"<até 2 frases em português explicando a escolha>"}
Use apenas ids que existem no catálogo abaixo. Não invente produtos. Fique dentro do orçamento somando preço x quantidade de cada item escolhido.

Catálogo disponível (id|nome|categoria|preço):
${catalogSummary}

Orçamento: R$${budget.toFixed(2)}`;

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
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: "Monte a lista agora, respeitando o formato JSON pedido." }],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return json({ error: data?.error?.message || "Falha ao consultar a IA." }, 502);
    }
    const raw = (data?.content || []).map((block: { text?: string }) => block.text || "").join("").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return json({ error: "A IA não retornou uma lista válida. Tente novamente." }, 502);

    const parsed = JSON.parse(jsonMatch[0]) as { items?: { id?: string; quantity?: number }[]; message?: string };
    const validIds = new Set(catalog.map(item => item.id));
    const items = (parsed.items ?? [])
      .filter(item => item.id && validIds.has(String(item.id)))
      .map(item => ({ productId: String(item.id), quantity: Math.max(1, Math.round(Number(item.quantity) || 1)) }))
      .slice(0, 40);

    if (!items.length) return json({ error: "A IA não conseguiu montar uma lista com esse orçamento. Tente aumentar o valor." }, 502);
    return json({ items, message: parsed.message || "Lista montada com base no seu orçamento." });
  } catch (err) {
    return json({ error: "Erro ao contatar a IA." }, 502);
  }
});
