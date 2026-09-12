import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import localImg from "../../assets/home-2026/../../assets/home-2026/promo-comercio-local.jpg";

/** Banner fotográfico único de fechamento da home, antes do rodapé —
 *  substitui a antiga "Informação que ajuda na escolha" (2 promos + 1
 *  destaque): o pedido era só este banner, focado em comércio local. */
export function LocalBanner() {
  return (
    <section className="pcx-section" aria-labelledby="local-banner-title">
      <div className="pcx-shell">
        <Link className="pcx-promo-feature" to="/estabelecimentos">
          <img
            src={localImg}
            alt="Comerciante local organizando caixas de hortifrúti na entrada da loja"
            loading="lazy"
            decoding="async"
            width="1600"
            height="640"
          />
          <div className="pcx-promo-feature__copy">
            <h3 id="local-banner-title">Comprar local fortalece Feijó.</h3>
            <p>Compare preços, economize e continue comprando no comércio da sua cidade.</p>
            <span>
              Conhecer estabelecimentos <ArrowRight aria-hidden="true" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
