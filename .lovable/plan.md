# Redesenho profissional: header, busca, conteúdo e rodapé (web + mobile)

## O que está errado hoje (verificado no código)

- **Barra de busca quebrada**: o rótulo `Produto para comparar` usa a classe `sr-only`, mas **nenhum CSS do projeto define `.sr-only`**. Resultado: o rótulo aparece visível dentro da barra, empurra o campo e o texto do usuário fica espremido num canto — foi exatamente isso que aparece na home.
- **Guerra de CSS**: a busca é estilizada em pelo menos 12 arquivos diferentes (`HomeProfessional2026.css`, `HomeEmilCompact2026.css`, `HomeViewportCompact2026.css`, `app-shell-professional-2026.css`, `HomepageSearchOverlayPro.css`, `HomepageSearchInputPolish.css`, `search-refinement-2026.css`, entre outros), quase todos com `!important`. Cada ajuste novo briga com o anterior — é a causa raiz do "tudo horrível".
- **Tokens ignorados**: várias folhas fixam cores cruas (`#fffefa`, `#0b6757`, `#18181B`, `#FFB800`) com `!important`, então o modo claro/escuro não é coerente.
- **Home sem ritmo**: `HomeNew2026.tsx` empilha hero, atalhos, grid, faixas promo, categorias e lojas sem espaçamento nem títulos padronizados; o rodapé fica dentro do `<main>`.

## O que vou fazer

### 1. Barra de busca (prioridade)
- Definir utilitário `.sr-only` real e global, corrigindo o rótulo vazado.
- Reconstruir a barra num único CSS proprietário do componente: ícone à esquerda, **campo ocupando toda a área digitável**, botão limpar e botão "Buscar" à direita, altura 56px no desktop / 48px no mobile, foco com anel acessível, texto legível em claro e escuro.
- No mobile o botão vira ícone e o campo mantém a largura máxima.
- Painel de sugestões alinhado à barra, com sombra e z-index únicos (sem overlays concorrentes).

### 2. Faxina de CSS conflitante
- Consolidar os estilos de busca, header e rodapé em folhas únicas e remover as regras duplicadas/`!important` das folhas antigas que competem entre si.
- Trocar cores cruas por tokens semânticos, garantindo claro/escuro consistente.

### 3. Header profissional (web + mobile)
- Barra de 60px com wordmark, navegação principal, busca compacta, botão de tema e ações de conta, tudo alinhado numa grade única.
- Mobile: header enxuto (marca + busca + menu), com todos os botões com área de toque de 44px e navegação inferior sem sobrepor conteúdo.

### 4. Corpo da home com hierarquia
- Espaçamento vertical padronizado entre seções, cabeçalhos de seção consistentes (kicker + título + link "ver tudo") e cards de produto/loja com alturas e tipografia uniformes.
- Micro-interações discretas (hover, foco, transições curtas) respeitando `prefers-reduced-motion`.

### 5. Rodapé
- Rodapé em 4 colunas no desktop (marca + descrição, navegação, categorias, contato/legal) e acordeão/empilhado no mobile, movido para fora do `<main>`, com faixa inferior de créditos e links legais.

### 6. Validação
- Conferência visual em desktop e mobile, nos dois temas, com uma rodada de correções em lote; typecheck e build.

## Detalhes técnicos

- Novos/refeitos: `src/components/home/LiveProductSearch.css` (único dono da busca), `src/components/home/Header.css`, `src/components/home/Footer.css`, e uma folha base com `.sr-only` e escala de espaçamento.
- Limpeza pontual das regras de busca/header/rodapé em `HomeProfessional2026.css`, `HomeEmilCompact2026.css`, `HomeViewportCompact2026.css`, `app-shell-professional-2026.css` e nas folhas `HomepageSearch*.css`.
- Nenhuma mudança em dados, rotas, Supabase, autenticação, rádio ou lógica de negócio — apenas apresentação.

## Fora do escopo
- Trocar conteúdo/textos do catálogo e alterar o painel admin.
