# PreçoCerto — App Mobile (Expo / React Native)

Aplicativo nativo iOS/Android do comparador de preços e portal do lojista, conectado ao mesmo Supabase do site PreçoCerto GPT.

## Como rodar

```bash
npm install
cp .env.example .env
npm start
```

Preencha `EXPO_PUBLIC_SUPABASE_ANON_KEY` no `.env` local. O arquivo `.env` não deve ser versionado.

## Implementado

- Home com busca rápida e categorias.
- Busca de produtos na tabela `products`.
- Comparador de preços por loja usando `prices` e `establishments`.
- Login e cadastro de lojista via Supabase Auth.
- Solicitação em `merchant_applications`.
- Painel do lojista com itens de `merchant_products`.

## Estrutura

```text
src/
  lib/
  navigation/
  screens/
  services/
  theme.ts
```

A publicação nas lojas exige revisão das políticas RLS do Supabase e configuração de EAS Build/credenciais Apple e Google.
