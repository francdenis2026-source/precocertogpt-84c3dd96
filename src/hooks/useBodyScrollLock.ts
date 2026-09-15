import { useEffect } from "react";

/**
 * Trava a rolagem da página por trás de um painel em primeiro plano (menu
 * mobile, modal).
 *
 * Trava no <html> (documentElement), não no <body>: nesta página quem rola
 * de verdade é o html (body é só tão alto quanto o conteúdo, sem clipar
 * nada — confirmado: body.clientHeight bate com body.scrollHeight, igual
 * ao conteúdo inteiro). Travar overflow no body não impedia a rolagem real
 * (ela acontece no html) e, pior, o header (position:sticky) fica confuso
 * sobre qual é seu "scroll container" quando um ANCESTRAL vira uma caixa de
 * overflow diferente da que ele já usava — o header saía do lugar e ficava
 * preso fora da tela ao reabrir/fechar o menu depois de rolar a página, o
 * "travamento" visual relatado. Travando o elemento que já é o scroller de
 * verdade, nada muda de referência para o header.
 *
 * A alternativa "mais robusta" da literatura — position:fixed no body com
 * top negativo pra compensar o scroll — foi tentada e revertida por um
 * motivo relacionado: ela move o body inteiro, e um header sticky (parado
 * na posição estática, já que nada rolou de verdade) vai junto pro alto,
 * saindo da tela.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousOverflow;
    };
  }, [active]);
}
