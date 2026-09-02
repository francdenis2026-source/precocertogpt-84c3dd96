import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./PromoBands.css";
import buscarImg from "../../assets/home-2026/promo-buscar-produto.jpg";
import setoresImg from "../../assets/home-2026/promo-setores-organizados.jpg";
import localImg from "../../assets/home-2026/promo-comercio-local.jpg";

const stories = [
  {
    className: "pc26-promo__story--compare",
    image: buscarImg,
    alt: "Mãos segurando um celular para consultar preços em um corredor de mercado",
    title: "O menor preço começa com uma busca.",
    text: "Consulte produtos, compare valores e saiba onde comprar antes de sair de casa.",
    action: "Buscar um produto",
    to: "/buscar",
  },
  {
    className: "pc26-promo__story--sectors",
    image: setoresImg,
    alt: "Compras da semana organizadas por setor sobre uma mesa clara",
    title: "Do mercado à farmácia, tudo organizado.",
    text: "Acesse mercearia, açougue, padaria, bebidas, higiene e outros setores em poucos toques.",
    action: "Explorar setores",
    to: "/explorar",
  },
  {
    className: "pc26-promo__story--stores",
    image: localImg,
    alt: "Comerciante local organizando caixas de hortifrúti na entrada da loja",
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
          <h2 id="promo-title">Informação que ajuda na escolha</h2>
        </div>
        <p>Do preço ao comércio local, tudo mais simples para decidir.</p>
      </header>

      <div className="pc26-promo__grid">
        {stories.map(({ className, image, alt, title, text, action, to }) => (
          <article className={`pc26-promo__story ${className}`} key={title}>
            <div className="pc26-promo__copy">
              <h3>{title}</h3>
              <p>{text}</p>
              <Link to={to}>
                {action} <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="pc26-promo__media">
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
      </div>
    </section>
  );
}
