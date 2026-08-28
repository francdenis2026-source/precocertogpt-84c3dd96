import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function LocalCommerceSpotlight() {
  return <section className="pc26-local-spotlight pc26-shell" aria-labelledby="local-commerce-title">
    <div className="pc26-local-spotlight__image">
      <img
        src="/comercio-local-comparando-precos-2026.webp"
        alt="Cliente comparando o preço de um produto pelo celular com auxílio do comerciante local"
        width="1619"
        height="971"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div className="pc26-local-spotlight__copy">
      <h2 id="local-commerce-title">O comércio de Feijó, mais perto da sua decisão.</h2>
      <p>Encontre estabelecimentos locais, veja os produtos disponíveis e compare antes de sair de casa.</p>
      <Link to="/estabelecimentos">Conhecer estabelecimentos <ArrowRight aria-hidden="true" /></Link>
    </div>
  </section>;
}
