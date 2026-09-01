import { ArrowRight, BadgePercent, ShoppingBasket, Store } from "lucide-react";
import { Link } from "react-router-dom";
import "./PromoBands.css";

const stories = [
  {
    className: "pc26-promo__story--compare",
    image: "/home-editorial-2026/campanha-homem-comparando-precos-v1.webp",
    alt: "Homem comparando pelo celular o preço de um produto durante as compras no mercado",
    icon: BadgePercent,
    eyebrow: "COMPARAÇÃO LOCAL",
    title: "O menor preço começa com uma busca.",
    text: "Consulte produtos, compare valores e saiba onde comprar antes de sair de casa.",
    action: "Buscar um produto",
    to: "/buscar",
  },
  {
    className: "pc26-promo__story--sectors",
    image: "/home-editorial-2026/promo-compra-inteligente-app-v2.webp",
    alt: "Casal organizando uma compra com apoio do celular em um supermercado",
    icon: ShoppingBasket,
    eyebrow: "SETORES EM DESTAQUE",
    title: "Do mercado à farmácia, tudo organizado.",
    text: "Acesse mercearia, açougue, padaria, bebidas, higiene e outros setores em poucos toques.",
    action: "Explorar setores",
    to: "/explorar",
  },
  {
    className: "pc26-promo__story--stores",
    image: "/home-editorial-2026/promo-comercio-local-app-v2.webp",
    alt: "Cliente em um estabelecimento local enquanto comerciante organiza produtos frescos",
    icon: Store,
    eyebrow: "COMÉRCIO DE FEIJÓ",
    title: "Os estabelecimentos da cidade mais perto de você.",
    text: "Conheça lojas, catálogos e ofertas do comércio local em uma vitrine feita para Feijó.",
    action: "Conhecer estabelecimentos",
    to: "/estabelecimentos",
  },
] as const;

export function PromoBands() {
  return (
    <section className="pc26-promo pc26-shell" aria-labelledby="promo-title">
      <header className="pc26-promo__heading">
        <div>
          <span>Compra inteligente</span>
          <h2 id="promo-title">Informação que ajuda na escolha</h2>
        </div>
        <p>Do preço ao comércio local, tudo mais simples para decidir.</p>
      </header>

      <div className="pc26-promo__grid">
        {stories.map(({ className, image, alt, icon: Icon, eyebrow, title, text, action, to }) => (
          <article className={`pc26-promo__story ${className}`} key={title}>
            <div className="pc26-promo__copy">
              <span className="pc26-promo__eyebrow"><Icon aria-hidden="true" /> {eyebrow}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link to={to}>{action} <ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className="pc26-promo__media">
              <img src={image} alt={alt} loading="lazy" decoding="async" width="1200" height="800" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
