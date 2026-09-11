# Auditoria Impeccable — PreçoCerto (2026-09-11)

Escopo pedido: homepage, páginas internas de estabelecimento, heróis/imagens, header,
footer, telas de login, painéis de administrador, catálogos de produto, versão mobile.

## Como esta auditoria foi feita

- **Varredura determinística** (`impeccable detect`) rodou sobre `src/` e `public/` inteiros —
  cobre 100% dos arquivos, não uma amostra.
- Cada achado do detector foi **verificado manualmente** contra `src/App.tsx`/`src/main.tsx`
  para confirmar se o arquivo está de fato montado em alguma rota viva, antes de entrar como
  problema real (o detector não sabe se um arquivo é código morto).
- **Histórico reaproveitado:** havia uma crítica anterior (`$impeccable critique`, não audit) em
  `.impeccable/critique/2026-08-14T06-28-17Z__src-pages-homepremium-tsx.md`, nota 29/40. O
  arquivo que ela avaliou (`src/pages/HomePremium.tsx`) **não existe mais** — a home foi
  reconstruída como `HomeNew2026.tsx` depois daquela crítica. Os achados de conteúdo (dados
  incompletos, sem timestamp de atualização, tipografia pequena) foram re-verificados abaixo
  contra a home atual em vez de assumidos como ainda válidos.
- **Estabelecimento:** a página `/estabelecimento/:id` (`StoreDetailProfessional.tsx`) já
  recebeu uma rodada de correções nesta mesma sessão (contato, grid, categorias, dark mode,
  rotas culturais, RLS do radio_stations) — tratada aqui como baseline pós-fix, não como
  achado novo.
- Verificação visual em navegador **não foi possível**: outra sessão já ocupa a porta do
  servidor de dev neste projeto. Os achados abaixo vêm de leitura de código, não de screenshot.

## Audit Health Score

| # | Dimensão | Nota | Achado principal |
|---|-----------|:---:|---|
| 1 | Acessibilidade | 3 | Boa base (skip link, foco, alt text real); gaps pontuais no admin (dark mode) |
| 2 | Performance | 2 | Animações de `width`/`height`/`min-height` (layout thrash) em 2 arquivos vivos |
| 3 | Responsividade | 3 | Sistema de breakpoints consistente; página de estabelecimento tinha bugs reais (corrigidos) |
| 4 | Theming | 3 | Tokens `--pc-*` bem adotados; admin é propositalmente só-claro (documentado); 1 gap real corrigido nesta sessão |
| 5 | Integridade de implementação | 2 | 8 achados de "AI slop" (borda lateral, gradiente, grid decorativo) em arquivos **vivos**; 8 achados a mais estavam em **código morto** |
| **Total** | | **13/20** | **Aceitável — trabalho relevante pendente, mas nada bloqueante** |

---

## Por área

### Homepage (`HomeNew2026.tsx` + `HomeProfessionalRedesign2026.css`)

- **[P2] Borda lateral decorativa ("side-tab") no painel do hero.** `HomeProfessionalRedesign2026.css:760`, `.pcx-hero__panel::before` — listra de 4px é uma assinatura reconhecível de UI gerada por IA. **Comando sugerido:** `$impeccable quieter`.
- **[P2 — reaproveitado da crítica de 2026-08-14, re-verificar]** A crítica anterior (sobre a home antiga) apontou: dados ausentes aparecendo como `- · -`/imagens quebradas, selo "Atualizado" sem hora/origem, texto funcional abaixo de 12px, modal de oferta única chamado de "comparação". Como o componente mudou, **preciso confirmar se esses pontos persistem na `HomeNew2026.tsx` atual** — não os contei na nota acima por falta de verificação, mas valem uma passada rápida antes de descartar. **Comando sugerido:** `$impeccable critique home` (para gerar uma leitura fresca, já que a antiga está órfã).

### Perfil do estabelecimento (`StoreDetailProfessional.tsx`)

Já corrigido nesta sessão: contato (endereço/WhatsApp/horário), grid de 6→4 colunas, nomes de
produto cortados, categorias em snake_case, casos em CAIXA ALTA, unidades soltas, footer com
crédito de dev, cartão "verificado" sumindo no tablet, dark mode da barra superior, hero
duplicado, redirecionamento de perfis culturais, aviso de farmácia, RLS de `radio_stations`.
Nenhum achado novo de dimensão 1–4 aqui. Ver commit `9970d5625f`.

- **[P3] Fora de escopo, sinalizado antes:** Kelly Burgueria e Ponto do Sanduba (Beto Burguer)
  usam páginas totalmente separadas (`KellyBurgueriaPage.tsx`, `PontoDoSandubaPage.tsx`), com
  header/footer/design próprios — inconsistência de experiência entre lojas que exigiria
  reconstrução dessas duas páginas sobre o template padrão. Não tentado.

### Header / Footer (`PublicChrome.tsx`, `ReferenceExperience.css`, `ReferencePagesMore.css`)

- **[P2] Borda lateral decorativa.** `ReferenceExperience.css:10`, `border-left:4px solid var(--ref-green)` — mesmo padrão de "AI slop" do hero da home, aqui no chrome usado em **todo** site (header/footer/dock via `PublicChrome.tsx`). **Comando sugerido:** `$impeccable quieter`.
- **[P3, consultivo] Grade decorativa de fundo.** `ReferencePagesMore.css:2` — fundo em grade de linhas finas; reservar esse tratamento para superfícies que realmente representam mapa/blueprint/medição. **Comando sugerido:** `$impeccable quieter`.
- **Código morto encontrado (não é bug, é limpeza):** `src/components/FooterDeveloperInfo.tsx` e `src/components/HeaderStickyUx.tsx` não são importados por nenhuma rota — o header/footer real vive em `PublicChrome.tsx`/`ReferenceExperience.tsx`. Seguro remover ou ignorar; não afetam o que é servido.

### Login / Autenticação (`ReferenceAuthPage` em `ReferenceExperience.tsx`)

Tratamento fixo-escuro intencional e documentado em `DESIGN.md` (mesmo padrão do onboarding de
lojista) — não é bug. Nenhum achado do detector recaiu sobre este componente. Não tive tempo de
fazer uma leitura linha a linha do formulário (validação, mensagens de erro, foco) nesta rodada;
recomendo `$impeccable audit` focado (`--target src/reference/ReferenceExperience.tsx`, seção do
auth) se quiser essa profundidade.

### Painéis de administrador (`AdminControlCenter.tsx`, `AdminCatalogWorkspace.tsx`)

- **[P2, já documentado como decisão consciente em `DESIGN.md`, não novo]** O shell do admin é
  propositalmente só-claro (sem dark mode) — decisão registrada como "follow-up com escopo
  próprio", não uma falha desta auditoria. Mantenho como pendência conhecida, não P1.
- Nenhum achado do detector recaiu sobre os arquivos de admin.

### Catálogo de produtos / cards (`ProductCardActions.css`, `ProductQuickViewModal.css`)

- **[P3] Easing "bounce"/elástico.** `ProductCardActions.css:18` (`cubic-bezier(0.34, 1.56, 0.64, 1)`) — usado em `ProductCard.tsx`, `SearchDiscovery2026.tsx` e `StoreDetailProfessional.tsx` (catálogo de toda loja). Sensação datada; prefira `ease-out-quart/expo`. **Comando sugerido:** `$impeccable quieter`.
- **[P3] Easing "bounce" também no modal de visualização rápida.** `ProductQuickViewModal.css:21`, usado em Kelly Burgueria e Ponto do Sanduba. **Comando sugerido:** `$impeccable quieter`.

### Perfis culturais (`DorinhaEditorialPage.tsx`, rota real e ativa)

- **[P2] Borda lateral decorativa.** `DorinhaEditorialPage.css:8`, `border-left:2px solid var(--de-gold)`. **Comando sugerido:** `$impeccable quieter`.
- **Código morto encontrado:** `DorinhaAuthorStoreProMax.tsx`/`.css` e `DorinhaAuthorStoreProMaxV4.css` (2 achados do detector: borda lateral + grade decorativa) e `PremiumVisualSystem.tsx` (texto em gradiente + grade decorativa) **não são importados por nenhuma rota** — são versões antigas do perfil da Dorinha, substituídas por `DorinhaEditorialPage.tsx`. Seguro excluir; não renderizam para ninguém hoje.

### Mobile (breakpoints gerais)

- Sistema de breakpoints do site é consistente (`@media` bem distribuído, dock mobile próprio,
  `AppDock` só abaixo de 680px). A página de estabelecimento tinha bugs mobile reais — já
  corrigidos nesta sessão (padding escondendo rótulo atrás da barra fixa, cartão "verificado"
  sumindo).
- Não verifiquei viewport mobile de cada página individualmente (exigiria o navegador, que está
  ocupado por outra sessão agora). Recomendo abrir em 375px real antes de considerar mobile
  "fechado" para todas as áreas.

---

## Padrões sistêmicos

- **"AI slop" recorrente:** a borda lateral decorativa (`side-tab`) aparece de forma
  independente em **6 arquivos diferentes** (home, chrome global, Dorinha, comparação de
  produtos ×2, e mais 2 em código morto) — sugere que múltiplas gerações/sessões de IA
  reinventaram o mesmo enfeite sem um componente compartilhado. Vale um `$impeccable quieter`
  de escopo amplo em vez de corrigir arquivo por arquivo.
- **Código morto acumulado:** 5 arquivos/componentes inteiros (`PrecoCertoApp.tsx`,
  `HeaderStickyUx.tsx`, `FooterDeveloperInfo.tsx`, `PremiumVisualSystem.tsx`,
  `DorinhaAuthorStoreProMax*`) não são importados por nenhuma rota. Isso não afeta o que é
  servido, mas infla a base de código e pode confundir a próxima pessoa/sessão que mexer aqui
  achando que são a versão ativa.

## O que está funcionando bem

- Sistema de tokens `--pc-*` com inversão real de tema claro/escuro, adotado na maioria das
  superfícies públicas.
- Skip link, alvos de toque, `prefers-reduced-motion` respeitado no motion layer compartilhado.
- `alt` text real e específico nas imagens de produto/loja verificadas (a varredura de texto
  simples acusou 18 `<img>` "sem alt", mas todas tinham `alt` numa linha seguinte — falso
  positivo descartado após checagem).

## Ações recomendadas (ordem de prioridade)

1. **[P2] `$impeccable quieter`**: remover a borda lateral decorativa recorrente e a grade de
   fundo decorativa nos 6 arquivos vivos listados acima (home, chrome global, Dorinha,
   comparação de produtos).
2. **[P2] `$impeccable critique home`**: leitura fresca da `HomeNew2026.tsx` atual, para
   confirmar se os pontos de confiança/dados da crítica de agosto (órfã) ainda procedem.
3. **[P3] `$impeccable quieter`**: trocar o easing "bounce" por exponencial em
   `ProductCardActions.css` e `ProductQuickViewModal.css`.
4. **Limpeza (sem comando impeccable — é exclusão de arquivo):** remover os 5
   componentes/arquivos órfãos listados em "Padrões sistêmicos", depois de confirmar com o time
   que nada externo os referencia (deploys antigos, links salvos etc.).
5. **[P3] `$impeccable polish`**: passe final depois dos itens acima, para validar o conjunto.

Comandos fora da lista permitida pelo impeccable não foram usados.
