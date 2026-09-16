/** Registro de "aquecimento" para as rotas com `lazy()` mais navegadas (dock
 * inferior e header). Chamar a função de import antes do clique de fato
 * (hover/foco/touchstart) faz o chunk já estar em cache quando a navegação
 * acontece — o React Router só precisa montar, não baixar+compilar o
 * módulo. `import()` repetido para o mesmo módulo é seguro: o bundler e o
 * navegador deduplicam, então chamar de novo no clique real não baixa nada
 * duas vezes. Mapeado por prefixo de rota; nenhuma rota nem comportamento
 * muda — isto só decide quando o download começa. */
const prefetchers: Record<string, () => Promise<unknown>> = {
  "/buscar": () => import("../reference/SearchDiscovery2026"),
  "/cesta": () => import("../reference/ProfessionalBasketPage"),
  "/estabelecimentos": () => import("../reference/ReferenceExperience"),
  "/favoritos": () => import("../reference/ReferenceExperience"),
  "/explorar": () => import("../reference/SectorHub2026"),
};

const started = new Set<string>();

export function prefetchRoute(path: string) {
  const entry = Object.entries(prefetchers).find(([prefix]) => path.startsWith(prefix));
  if (!entry) return;
  const [prefix, load] = entry;
  if (started.has(prefix)) return;
  started.add(prefix);
  void load();
}
