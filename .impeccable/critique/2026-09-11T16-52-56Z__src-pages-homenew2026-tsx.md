---
target: homepage (HomeNew2026.tsx)
total_score: 23
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\feijo\\OneDrive\\Desktop\\precocertogpt-84c3dd96-main\\precocertogpt-84c3dd96-main\\src\\pages\\HomeNew2026.tsx"
target_fingerprint: "sha256:ba73a74a1f31f6bc85b52fc5e43a75e34365b79e7e1f974bda1b3e93ad58c317"
target_path: "C:\\Users\\feijo\\OneDrive\\Desktop\\precocertogpt-84c3dd96-main\\precocertogpt-84c3dd96-main\\src\\pages\\HomeNew2026.tsx"
timestamp: 2026-09-11T16-52-56Z
slug: src-pages-homenew2026-tsx
---
**Method: dual-agent (A: a5ad76f86f2af2a1f · B: acaeba5b1ed4ac648)**

## Recheck da crítica de agosto (órfã, sobre o componente antigo `HomePremium.tsx`)

| Item da crítica de 2026-08-14 | Status na home atual |
|---|---|
| Dados incompletos aparecem como conteúdo quebrado | Corrigido — fallbacks reais em ProductCard/StoreCard; único ponto solto é o painel de comparação do hero, que some silenciosamente sem dado |
| Selo "Atualizado" sem timestamp/origem | Parcial — cards de produto usam priceFreshness() real; hero ainda mostra "AO VIVO" sem timestamp |
| Tipografia funcional abaixo de 12px | Ainda presente — ~11.5–11.8px em vários rótulos |
| Home móvel longa e repetitiva | Parcial — ainda longa, mas redundância literal removida |
| Modal de oferta única chamado de "comparação" | Não se aplica mais — sem modal; painel exige 2 lojas reais |

## Audit Health Score

| # | Heurística | Nota | Achado principal |
|---|---|:---:|---|
| 1 | Visibilidade do estado do sistema | 3 | Loading states reais; falha de fetch é silenciosa |
| 2 | Correspondência com o mundo real | 4 | Vocabulário e taxonomia genuinamente locais |
| 3 | Controle e liberdade | 3 | Banner dispensável, tema alternável |
| 4 | Consistência e padrões | 2 | Duas buscas e duas navegações fazendo o mesmo trabalho |
| 5 | Prevenção de erros | 3 | Fallbacks de imagem/dado sólidos |
| 6 | Reconhecimento vs. memorização | 3 | Tudo visível inline |
| 7 | Flexibilidade e eficiência | 1 | Sem busca salva, sugestões fixas |
| 8 | Estética minimalista | 2 | 10+ seções empilhadas, hero com 9 elementos |
| 9 | Recuperação de erros | 2 | Falha de catálogo não comunicada |
| 10 | Ajuda e documentação | n/a | Não se aplica a home institucional/comercial |
| **Total** | | **23/36** | **Aceitável** |

## Veredito de especificidade de design

LLM: majoritariamente autoral (categorias locais reais, janelas de frescor por categoria, foto encomendada, comparação exige dados reais). Escorrega ao genérico na barra de confiança e no bloco de Cesta Inteligente (forma padrão SaaS).

Detector: zero achados nos arquivos da home (a listra decorativa já foi removida na sessão anterior).

Navegador: home real capturada em localhost:8080. Desktop ok. Mobile teve um flash transitório (~2s) com estatística errada no primeiro paint. Erro 401 de console em toda carga (desktop e mobile) — provavelmente o mesmo RLS de radio_stations já corrigido via migração; precisa confirmar deploy.

## Overall Impression

Disciplina de dado real e rara; falta contenção editorial — a home acumula funções de landing, ferramenta de comparação, diretório e funil de cesta na mesma rolagem, com chrome duplicado.

## What's Working

- pickRealComparison() recusa renderizar sem 2 lojas reais.
- Janelas de frescor por categoria (lib/pricing.ts) são modelagem de domínio genuína.
- Fallbacks resilientes de imagem/dado em toda a cadeia.

## Priority Issues

1. [P0] Falha silenciosa na busca do catálogo (HomeNew2026.tsx:61-69,104-105) — usuário não sabe que o preço pode estar desatualizado. Comando: $impeccable harden.
2. [P1] Erro 401 real no console em toda carga da home (confirmado ao vivo) — provável RLS de radio_stations ainda não implantado.
3. [P1] Chrome duplicado: duas buscas (Header e Hero), duas navegações (Header e AppDock). Comando: $impeccable layout.
4. [P1] Texto funcional abaixo de 12px em bairro/contagens. Comando: $impeccable typeset.
5. [P2] "AO VIVO" no hero sem timestamp, inconsistente com o badge de frescor real dos cards. Comando: $impeccable clarify.
6. [P3] Footer.tsx (o realmente usado na home) não tem o aviso de variação de preço presente no PublicFooter não usado. Comando: $impeccable clarify.
7. [P3] Flash transitório no mobile com contagem errada por ~2s — provavelmente benigno.

## Persona Red Flags

Casey: 9 elementos no hero antes de rolar; duas navegações simultâneas.
Sam: texto ~11.5px; falha de fetch sem aria-live (loading tem aria-busy, falha não).
Alex: sem busca salva/histórico; sugestões fixas em 4 termos.

## Minor Observations

- HeaderThemeToggle e ThemeButton duplicam a mesma função.
- CategoryBar cai em texto genérico quando a contagem por grupo é zero.
- StoreRail roda por ciclo de tempo sem opção manual de trocar.

## Questions to Consider

1. Por que a home pede duas buscas e duas navegações antes do usuário buscar qualquer coisa?
2. Por que o "AO VIVO" do hero não usa o priceFreshness() já implementado?
3. Numa conexão instável, uma falha de atualização em segundo plano deveria ser sempre visível?
