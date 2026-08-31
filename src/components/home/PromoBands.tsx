import { ArrowRight, BadgePercent, ReceiptText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./PromoBands.css";

export function PromoBands() {
  return (
    <section className="pc26-promo" aria-label="Destaques do PreçoCerto">
      <div className="pc26-promo__band pc26-promo__band--economy">
        <div className="pc26-promo__copy">
          <span className="pc26-promo__eyebrow"><BadgePercent aria-hidden="true" /> ECONOMIA LOCAL</span>
          <h2>Seu dinheiro vale mais quando você compara.</h2>
          <p>Veja onde o mesmo produto está mais barato antes de sair para comprar.</p>
          <Link to="/buscar">Comparar preços <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="pc26-promo__visual pc26-promo__visual--basket" aria-hidden="true">
          <span className="promo-orb promo-orb--one" /><span className="promo-orb promo-orb--two" />
          <div className="promo-basket"><span /><span /><span /><span /></div>
          <div className="promo-price">R$ <strong>MENOS</strong></div>
        </div>
      </div>

      <div className="pc26-promo__band pc26-promo__band--receipt">
        <div className="pc26-promo__visual pc26-promo__visual--receipt" aria-hidden="true">
          <div className="promo-phone"><div className="promo-phone__screen"><Sparkles /><strong>PreçoCerto</strong><small>compare • escolha • economize</small><i /><i /><i /></div></div>
          <ReceiptText className="promo-receipt" />
        </div>
        <div className="pc26-promo__copy">
          <span className="pc26-promo__eyebrow"><Sparkles aria-hidden="true" /> COMPRA INTELIGENTE</span>
          <h2>Transforme preços em decisões melhores.</h2>
          <p>Pesquise, compare estabelecimentos e encontre oportunidades em Feijó com poucos toques.</p>
          <Link to="/explorar">Explorar o PreçoCerto <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
