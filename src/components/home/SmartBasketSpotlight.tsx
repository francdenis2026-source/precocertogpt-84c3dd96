import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function SmartBasketSpotlight() {
  return (
    <section className="pcx-shell" aria-labelledby="smart-basket-title">
      <Link to="/cesta-inteligente" className="pcx-spotlight">
        <span className="pcx-spotlight__badge">
          <Sparkles aria-hidden="true" />
          Ferramenta com IA
        </span>
        <div className="pcx-spotlight__copy">
          <h2 id="smart-basket-title">Cesta Inteligente: monte sua compra e economize sem esforço</h2>
          <p>
            Diga o que você precisa e deixe a IA montar a lista com os menores preços
            entre os estabelecimentos de Feijó, comparando tudo por você em segundos.
          </p>
        </div>
        <span className="pcx-spotlight__cta">
          Experimentar a Cesta Inteligente <ArrowRight aria-hidden="true" />
        </span>
      </Link>
    </section>
  );
}
