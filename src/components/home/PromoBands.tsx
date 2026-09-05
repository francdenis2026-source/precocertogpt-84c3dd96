import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import buscarImg from "../../assets/home-2026/promo-buscar-produto.jpg";
import setoresImg from "../../assets/home-2026/promo-setores-organizados.jpg";
import localImg from "../../assets/home-2026/promo-comercio-local.jpg";

const stories = [
  {
    image: buscarImg,
    alt: "Mãos segurando um celular para consultar preços em um corredor de mercado",
    title: "O menor preço começa com uma busca.",
    text: "Consulte produtos, compare valores e saiba onde comprar antes de sair de casa.",
    action: "Buscar um produto",
    to: "/buscar",
  },
  {
    image: setoresImg,
    alt: "Compras da semana organizadas por setor sobre uma mesa clara",
    title: "Do mercado à farmácia, tudo organizado.",
    text: "Acesse mercearia, açougue, padaria, bebidas, higiene e outros setores em poucos toques.",
    action: "Explorar setores",
    to: "/explorar",
  },
] as const;

const feature = {
  image: localImg,
  alt: "Comerciante local organizando caixas de hortifrúti na entrada da loja",
  title: "Os estabelecimentos da cidade mais perto de você.",
  text: "Conheça lojas, catálogos e ofertas do comércio local em uma vitrine feita para Feijó.",
  action: "Conhecer estabelecimentos",
  to: "/estabelecimentos",
} as const;

export function PromoBands() {
  return (
    <section className="pcx-section" aria-labelledby="promo-title">
      <div className="pcx-shell">
        <div className="pcx-section__head">
          <div>
            <h2 id="promo-title">Informação que ajuda na escolha</h2>
            <p>Do preço ao comércio local, tudo mais simples para decidir.</p>
          </div>
        </div>

        <div className="pcx-promo-grid">
          {stories.map(({ image, alt, title, text, action, to }) => (
            <article className="pcx-promo" key={title}>
              <div className="pcx-promo__copy">
                <h3>{title}</h3>
                <p>{text}</p>
                <Link to={to}>
                  {action} <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className="pcx-promo__media">
                <img
                  src={image}
                  alt={alt}
                  loading="lazy"
                  decoding="async"
                  width="1200"
                  height="800"
                />
              </div>
            </article>
          ))}

          <Link className="pcx-promo-feature" to={feature.to}>
            <img
              src={feature.image}
              alt={feature.alt}
              loading="lazy"
              decoding="async"
              width="1600"
              height="640"
            />
            <div className="pcx-promo-feature__copy">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span>
                {feature.action} <ArrowRight aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
