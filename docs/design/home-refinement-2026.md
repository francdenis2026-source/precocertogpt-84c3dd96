# Homepage web e PWA — refinamento visual

Escopo: homepage compartilhada; não altera telas nativas independentes, autenticação ou regras de preços.

- Direção: interface de compras utilitária, com busca prioritária e menor ruído visual.
- Temas: claro #F4F7FB / branco com azul #2563EB; escuro #08111F / #101C2E com azul #60A5FA. Tokens existentes preservados.
- Tipografia: Outfit 600 em títulos; Manrope em texto e controles. Campo de busca 16px; título fluido 32–42px no celular e até 58px no desktop.
- Hero: namespace pcx-intro independente de overlays verdes legados. Foto decorativa em picture com fonte mobile; texto não sobreposto. Mantém comparação do catálogo, carregamento e atualização existentes.
- Hierarquia: busca como ação principal, lojas como link secundário; removidos CTA duplicado e faixa promocional repetitiva.
- Espaçamento: ritmo de 8px, raios 14–20px, sombras discretas, controles de busca e links de rodapé com alvo mínimo de 44px.
- Responsividade: duas colunas desktop; uma coluna até 760px; ajustes para 420px. Radio móvel mantém controle sem texto minúsculo.

Validação pendente: inspeção visual em 320/375/768/1440px, zoom 200%, claro/escuro, busca aberta, rádio tocando e catálogo vazio. Ambiente local indisponível; build deve ser conferido no CI. O guia ui-ux-pro-max foi aplicado como checklist; CLI de geração não pôde executar no ambiente.
