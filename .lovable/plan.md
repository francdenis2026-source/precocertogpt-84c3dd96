# Limpeza de peso histórico e ganho real de velocidade

## Diagnóstico (medido no projeto agora)

O site acumulou muitas camadas de "correções visuais" sobrepostas. Números reais:

- **63 arquivos CSS órfãos** em `src/pages/` e `src/reference/` (nenhum componente os importa) — ex.: `HomeTaste2026.css`, `HomeUxProMax2026.css`, `MobileNative2026.css`, `DesignSystem2.css`.
- **20 arquivos CSS em `public/` nunca referenciados** (`homepage-impeccable-2026.css` com 688 `!important`, `homepage-master-2026.css`, `header-unified-2026.css`, etc.).
- **12.293 declarações `!important`** no total — cada tela de reparo passada tenta vencer a anterior. Isso é o que causa contraste errado, texto ilegível e regressões a cada ajuste.
- **11 folhas CSS extras carregadas por `<link>` em runtime** dentro de `src/main.tsx`. Elas não entram no bundle, não são minificadas nem versionadas pelo build: são 11 requisições bloqueantes de render antes da primeira pintura.
- **5 famílias de fonte** instaladas (Inter, Outfit, Manrope, Geist, Geist Mono), com 3 importadas globalmente no `main.tsx`.
- **`public/` com 30 MB** e `src/assets/` com 9,1 MB, incluindo heros grandes que hoje não são usados.
- `remotion` (renderização de vídeo) está em `dependencies` em vez de `devDependencies`.

## O que será feito

### 1. Remover edições anteriores mortas
- Excluir os 63 CSS órfãos de `src/pages/` e `src/reference/` e os 20 CSS não referenciados de `public/`.
- Antes de excluir qualquer arquivo, confirmar por busca que nenhum `.tsx`, `index.html`, script de build ou prerender o referencia. Nada é removido "no escuro".

### 2. Tirar CSS do runtime e colocar no bundle
- Converter os 11 `appendStyle()` de `src/main.tsx` em `import` normais, na mesma ordem de cascata, para que o Vite minifique, concatene e faça hash. Resultado: menos requisições e nenhuma folha bloqueando a primeira pintura.
- Manter o script de tema inline no `index.html` (evita piscada de tema).

### 3. Reduzir a guerra de `!important`
- Nesta etapa, remover `!important` apenas dos arquivos que forem excluídos (ganho automático) e das regras que existirem em duplicidade exata entre folhas mantidas.
- Não reescrever a cascata das folhas ativas agora: isso muda aparência. Fica registrado como fase seguinte, opcional, com QA visual dedicado.

### 4. Fontes e dependências
- Reduzir para 2 famílias efetivamente usadas na interface, removendo os pacotes não usados do `package.json`.
- Mover `remotion` e `@remotion/cli` para `devDependencies`.

### 5. Assets
- Listar imagens em `public/` e `src/assets/` sem nenhuma referência no código e remover as confirmadamente órfãs (heros de campanhas antigas).
- Garantir `loading="lazy"` e `decoding="async"` em imagens fora da primeira dobra, e `fetchpriority="high"` apenas na imagem da hero.

### 6. Validação obrigatória
- `tsgo --noEmit` e `npm run build` sem erros.
- Playwright em desktop e mobile nas rotas `/`, `/buscar`, `/explorar`, `/estabelecimentos`, `/cesta`, `/favoritos`, `/login`: comparar screenshot antes/depois, checar ausência de scroll horizontal, ausência de erros de console e 404 de CSS/asset.
- Confirmar que rádio persistente, busca, catálogo, autenticação, PWA e rotas continuam idênticos.

## Garantias

- Zero mudança de design pretendida: o objetivo é remover o que já não pinta nada.
- Zero mudança em lógica de negócio, banco, Supabase, checkout ou Mercado Pago.
- Se algum arquivo "órfão" mostrar efeito visual real no QA, ele é restaurado e documentado.

## Ganho esperado

Menos CSS baixado e parseado, 11 requisições bloqueantes a menos, primeira pintura mais rápida no mobile, e — o mais importante a médio prazo — ajustes visuais futuros deixam de brigar com folhas fantasmas.
