/**
 * Evita o "flash" de fotos aparecendo por cima de um vazio em branco durante
 * a navegação: toda <img> nasce com opacity 0 (regra em AppReset.css) e só
 * fica visível quando o navegador confirma que ela carregou (ou falhou),
 * com uma transição suave em vez do pop abrupto.
 *
 * Precisa cobrir dois casos: imagens que chegam ao DOM depois de já
 * carregadas do cache (o evento "load" não dispara de novo) e imagens novas
 * inseridas por qualquer página, sem precisar tocar em cada componente.
 */
const LOADED_ATTR = "data-pc-img-ready";

function markLoaded(img: HTMLImageElement) {
  img.setAttribute(LOADED_ATTR, "true");
}

function markIfAlreadyLoaded(img: HTMLImageElement) {
  if (img.complete) markLoaded(img);
}

export function initializeImageLoadFade() {
  if (typeof document === "undefined") return;

  document.addEventListener(
    "load",
    event => {
      if (event.target instanceof HTMLImageElement) markLoaded(event.target);
    },
    true,
  );
  document.addEventListener(
    "error",
    event => {
      if (event.target instanceof HTMLImageElement) markLoaded(event.target);
    },
    true,
  );

  document.querySelectorAll("img").forEach(img => markIfAlreadyLoaded(img as HTMLImageElement));

  new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLImageElement) markIfAlreadyLoaded(node);
        else if (node instanceof Element) {
          node.querySelectorAll("img").forEach(img => markIfAlreadyLoaded(img as HTMLImageElement));
        }
      });
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}
