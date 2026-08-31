import { ArrowRight, BadgePercent, Check, ScanSearch, Smartphone, Store } from "lucide-react";
import { Link } from "react-router-dom";
import "./PromoBands.css";

const supermarketImage = "https://images.unsplash.com/photo-1769499311767-bce1cf9b4549?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1800";
const brazilMarketImage = "https://images.unsplash.com/photo-1601599963565-b7ba29c8e3ff?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1800";

export function PromoBands() {
  return (
    <section className="pc26-promo" aria-label="Experiência de compra inteligente">
      <div className="pc26-promo__band pc26-promo__band--market">
        <div className="pc26-promo__photo" style={{ backgroundImage: `url(${supermarketImage})` }} aria-hidden="true" />
        <div className="pc26-promo__shade" aria-hidden="true" />
        <div className="pc26-promo__copy">
          <span className="pc26-promo__eyebrow"><Store aria-hidden="true" /> COMPRE MELHOR EM FEIJÓ</span>
          <h2>Compare antes de colocar no carrinho.</h2>
          <p>Uma experiência de supermercado real, conectada ao PreçoCerto: pesquise, compare estabelecimentos e escolha onde comprar melhor.</p>
          <Link to="/buscar">Comparar preços <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="pc26-shopping-ui" aria-hidden="true">
          <div className="pc26-shopping-ui__label"><Smartphone /> PREÇOCERTO</div>
          <div className="pc26-shopping-ui__screen">
            <div><small>Menor preço encontrado</small><strong>R$ 24,90</strong></div>
            <span>economize R$ 5,00</span>
            <div className="pc26-shopping-ui__line" />
            <small>2 estabelecimentos comparados</small>
          </div>
        </div>
      </div>

      <div className="pc26-promo__band pc26-promo__band--compare">
        <div className="pc26-promo__photo" style={{ backgroundImage: `url(${brazilMarketImage})` }} aria-hidden="true" />
        <div className="pc26-promo__shade" aria-hidden="true" />
        <div className="pc26-compare-card" aria-label="Exemplo visual de comparação de produtos">
          <div className="pc26-compare-card__top"><span><ScanSearch /> COMPARADOR</span><b>2 ofertas</b></div>
          <div className="pc26-product-row">
            <div className="pc26-product-row__pack pc26-product-row__pack--blue" />
            <div><strong>Arroz 5 kg</strong><small>Produto equivalente</small></div>
            <div className="pc26-product-row__price"><small>Mercado A</small><strong>R$ 29,90</strong></div>
          </div>
          <div className="pc26-product-row pc26-product-row--best">
            <div className="pc26-product-row__pack pc26-product-row__pack--gold" />
            <div><strong>Arroz 5 kg</strong><small>Mesmo tamanho</small></div>
            <div className="pc26-product-row__price"><small>Mercado B</small><strong>R$ 24,90</strong></div>
            <span className="pc26-best"><Check /> menor preço</span>
          </div>
        </div>
        <div className="pc26-promo__copy pc26-promo__copy--compare">
          <span className="pc26-promo__eyebrow"><BadgePercent aria-hidden="true" /> DECISÃO INTELIGENTE</span>
          <h2>O mesmo produto. Preços diferentes. Uma escolha melhor.</h2>
          <p>O comparador transforma preços de diferentes estabelecimentos em uma decisão visual, rápida e objetiva.</p>
          <Link to="/buscar">Encontrar menor preço <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
