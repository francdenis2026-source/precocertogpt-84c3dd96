# Preço Certo

Aplicação web do **Preço Certo**, plataforma local de comparação de preços e descoberta de estabelecimentos.

Este repositório é a fonte principal do projeto. A aplicação atual usa **Vite + React + TypeScript**, com Supabase para os recursos de dados e autenticação que dependem do backend.

## Stack atual

- React 19
- TypeScript 5
- Vite 6
- React Router
- Tailwind CSS
- Supabase JS
- Vitest
- Playwright
- GitHub Actions
- GitHub Pages para o deploy configurado no repositório

## Requisitos

- Node.js 22 recomendado
- npm

O `package.json` aceita Node.js 20 ou superior, enquanto o CI usa Node.js 22 para manter um ambiente de build consistente.

## Desenvolvimento local

```bash
npm install
npm run dev
```

## Validação

```bash
npm test
npm run build
```

O build de produção também executa as rotinas de geração de sitemap e prerenderização SEO configuradas no projeto.

## Scripts principais

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm test
npm run seo:audit
npm run seo:audit:fast
npm run seo:audit:full
```

## Variáveis de ambiente

As integrações com Supabase usam variáveis Vite, incluindo:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_PUBLISHABLE_KEY
```

Não versione arquivos `.env` com credenciais.

## Deploy

A branch canônica é `main`.

O workflow `.github/workflows/deploy.yml` executa testes, gera o build e publica o conteúdo de `dist/` no GitHub Pages quando há push na `main`.

O domínio configurado pelo workflow é:

```text
www.precocerto.live
```

## Integrações de desenvolvimento

Ferramentas externas podem ser usadas para editar ou visualizar o projeto, mas os metadados locais dessas ferramentas não fazem parte da arquitetura da aplicação. Em especial, `.lovable/` é ignorado pelo Git para evitar que estados internos de edição ou sincronização controlem o código-fonte.

Alterações válidas devem ser consolidadas no GitHub, preferencialmente na `main` ou via pull request.

## Estrutura resumida

```text
src/                 aplicação React
public/              arquivos públicos
scripts/             automações de build/SEO
supabase/            recursos relacionados ao Supabase
.github/workflows/   CI/CD
package.json         dependências e scripts
vite.config.*        configuração do Vite
```

## Fonte de verdade

Para evitar divergências entre editores externos, considere sempre o estado da branch `main` no GitHub como a versão canônica do Preço Certo.
