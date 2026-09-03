import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Garante um único rodapé por página. Telas internas herdadas do projeto antigo
 * renderizam rodapés próprios; aqui mantemos apenas o último (o rodapé
 * institucional) e escondemos os duplicados, sem alterar a lógica das telas.
 */
export function FooterSingleton() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/painel-lojista")) return;

    const dedupe = () => {
      // Só rodapés de página inteira entram na deduplicação. `<footer>` usados
      // como sub-elemento dentro de cards/links (preço de produto, ações do
      // estabelecimento) não são "duplicatas" e nunca devem ser escondidos.
      const footers = Array.from(document.querySelectorAll<HTMLElement>("body footer")).filter(
        node => !node.closest("[data-footer-ignore]") && !node.closest("a, button, article"),
      );
      footers.forEach((node, index) => {
        if (index === footers.length - 1) {
          if (node.dataset.footerHidden === "true") {
            node.style.removeProperty("display");
            delete node.dataset.footerHidden;
          }
          return;
        }
        if (node.dataset.footerHidden !== "true") {
          node.style.setProperty("display", "none", "important");
          node.dataset.footerHidden = "true";
        }
      });
    };

    const frame = window.requestAnimationFrame(dedupe);
    const observer = new MutationObserver(() => window.requestAnimationFrame(dedupe));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

export default FooterSingleton;
