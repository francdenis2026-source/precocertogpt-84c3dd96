import { ArrowRight, BadgeDollarSign, Store } from "lucide-react";
import { Link } from "react-router-dom";

export function ValueHero() {
  return <section className="pc26-value-hero" aria-labelledby="pc26-value-title">
    <div className="pc26-shell pc26-value-hero__inner">
      <div className="pc26-value-hero__copy">
        <span className="pc26-value-hero__eyebrow"><BadgeDollarSign aria-hidden="true" />Economia local, decisão inteligente</span>
        <h2 id="pc26-value-title">Compare antes de sair de casa.</h2>
        <p>Veja preços, descubra estabelecimentos e monte sua compra com mais clareza. O Preço Certo aproxima você das melhores opções do comércio local.</p>
        <div className="pc26-value-hero__actions">
          <Link className="is-primary" to="/buscar">Ver ofertas <ArrowRight aria-hidden="true" /></Link>
          <Link to="/estabelecimentos"><Store aria-hidden="true" />Explorar lojas</Link>
        </div>
      </div>
      <div className="pc26-value-hero__visual" aria-hidden="true"><img src="/economy-hero-2026.svg" alt="" loading="lazy" decoding="async" /></div>
    </div>
  </section>;
}
