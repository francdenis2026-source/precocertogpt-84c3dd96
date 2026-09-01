import { ArrowRight, BellRing, ListChecks, MapPin, Search, ShieldCheck, Store, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import "./AppExperienceShowcase.css";

const messages = [
  { icon: TrendingDown, title: "Menor preço encontrado", text: "A comparação destaca onde vale mais a pena comprar." },
  { icon: Store, title: "Comércio local visível", text: "Catálogos ativos de Feijó reunidos em um só lugar." },
  { icon: ListChecks, title: "Compra mais organizada", text: "Busque, compare e monte sua cesta antes de sair." },
] as const;

export function AppExperienceShowcase() {
  return <section className="pc26-app-story pc26-shell" aria-labelledby="pc26-app-story-title">
    <div className="pc26-app-story__photo">
      <img src="/home-editorial-2026/campanha-familia-precocerto-v1.webp" alt="Família usando o celular para comparar preços durante as compras no supermercado" loading="lazy" decoding="async" />
      <span><ShieldCheck aria-hidden="true" /> Economia para toda a família</span>
    </div>

    <div className="pc26-app-story__content">
      <span className="pc26-app-story__eyebrow">O PREÇOCERTO NO SEU DIA</span>
      <h2 id="pc26-app-story-title">Da busca à decisão, <em>em poucos toques.</em></h2>
      <p>Uma experiência feita para consultar preços reais, encontrar estabelecimentos e decidir a compra com mais segurança.</p>
      <div className="pc26-app-story__messages" aria-label="Recursos do aplicativo">
        {messages.map(({ icon: Icon, title, text }) => <article key={title}>
          <i><Icon aria-hidden="true" /></i><span><strong>{title}</strong><small>{text}</small></span>
        </article>)}
      </div>
      <Link to="/buscar">Experimentar a busca <ArrowRight aria-hidden="true" /></Link>
    </div>

    <div className="pc26-app-preview" aria-label="Prévia da experiência PreçoCerto">
      <div className="pc26-app-preview__speaker" aria-hidden="true" />
      <header><img src="/logo-preco-certo.svg?v=17" alt="PreçoCerto" /><BellRing aria-hidden="true" /></header>
      <span className="pc26-app-preview__location"><MapPin aria-hidden="true" /> Feijó, Acre</span>
      <div className="pc26-app-preview__search"><Search aria-hidden="true" /><span>O que você procura?</span></div>
      <div className="pc26-app-preview__notice"><TrendingDown aria-hidden="true" /><span><small>COMPARAÇÃO ATIVA</small><strong>Encontre o menor preço local</strong></span></div>
      <div className="pc26-app-preview__stores">
        <span><Store aria-hidden="true" /><b>Estabelecimentos</b><small>Catálogos próximos</small></span>
        <span><ListChecks aria-hidden="true" /><b>Sua cesta</b><small>Itens organizados</small></span>
      </div>
      <footer><ShieldCheck aria-hidden="true" /> Preços e lojas identificados</footer>
    </div>
  </section>;
}
