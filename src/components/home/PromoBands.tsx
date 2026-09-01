import { ArrowRight, BadgePercent, ShoppingBasket, Store } from "lucide-react";
import { Link } from "react-router-dom";
import "./PromoBands.css";

const stories = [
  {
    className: "pc26-promo__story--featured",
    image: "/home-editorial-2026/comparacao-no-mercado.webp",
    alt: "Cliente comparando preços pelo celular durante as compras no mercado",
    icon: BadgePercent,
    eyebrow: "COMPARE ANTES DE COMPRAR",
    title: "Veja a diferença antes de chegar ao caixa.",
    text: "Consulte o produto, confira as ofertas locais e escolha com mais segurança.",
    action: "Comparar preços",
    to: "/buscar",
  },
  {
    className: "pc26-promo__story--local",
    image: "/home-editorial-2026/comercio-local.webp",
    alt: "Comerciante local organizando frutas e verduras em seu estabelecimento",
    icon: Store,
    eyebrow: "PERTO DE VOCÊ",
    title: "Comércio local em primeiro plano.",
    text: "Descubra estabelecimentos e ofertas de Feijó.",
    action: "Ver comércios",
    to: "/explorar",
  },
  {
    className: "pc26-promo__story--basket",
    image: "/home-editorial-2026/compra-organizada.webp",
    alt: "Cesta de compras organizada com alimentos para a semana",
    icon: ShoppingBasket,
    eyebrow: "COMPRA ORGANIZADA",
    title: "Planeje melhor. Leve o que importa.",
    text: "Comece pela sua lista e encontre opções para economizar.",
    action: "Começar busca",
    to: "/buscar",
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
            <img src={image} alt={alt} loading="lazy" decoding="async" />
            <div className="pc26-promo__shade" aria-hidden="true" />
            <div className="pc26-promo__copy">
              <span className="pc26-promo__eyebrow"><Icon aria-hidden="true" /> {eyebrow}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link to={to}>{action} <ArrowRight aria-hidden="true" /></Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
