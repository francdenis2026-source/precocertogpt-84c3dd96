import { ArrowRight, Check, Search, ShieldCheck, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import heroLifestyle from "../../assets/hero-preco-certo-lifestyle-campaign-2026.webp";
import "./HeroUserImage2026.css";

const comparisonSteps = ["Pesquise o produto", "Compare lojas e preços", "Escolha onde comprar"];

export function HeroUserImage2026() {
  return (
    <section className="pc26-user-hero" aria-labelledby="pc26-campaign-title">
      <div className="pc26-user-hero__frame">
        <div className="pc26-user-hero__copy">
          <div className="pc26-user-hero__brand" aria-label="Aplicativo Preço Certo">
            <img src="/preco-certo-mark.svg" alt="" width="42" height="42" />
            <span><strong>Preço Certo</strong><small>Comparador local de preços</small></span>
          </div>
          <h1 id="pc26-campaign-title">Compare antes.<br /><em>Compre melhor.</em></h1>
          <p>Descubra onde os produtos custam menos nos estabelecimentos de Feijó antes de sair para comprar.</p>
          <div className="pc26-user-hero__actions">
            <Link to="/buscar" className="pc26-user-hero__primary"><Search aria-hidden="true" /> Comparar preços <ArrowRight aria-hidden="true" /></Link>
            <Link to="/cesta-inteligente" className="pc26-user-hero__secondary"><ShoppingBasket aria-hidden="true" /> Montar minha cesta</Link>
          </div>
          <span className="pc26-user-hero__trust"><ShieldCheck aria-hidden="true" /> Informação do comércio local para decidir com clareza.</span>
        </div>
        <div className="pc26-user-hero__media">
          <img src={heroLifestyle} alt="Mulher comparando o preço de um produto pelo celular em um supermercado" width="1672" height="941" fetchPriority="high" decoding="async" />
          <div className="pc26-user-hero__app-card" aria-label="Como usar o Preço Certo">
            <header><span><Search aria-hidden="true" /></span><div><strong>Compare em segundos</strong><small>Direto no Preço Certo</small></div></header>
            <ol>{comparisonSteps.map(step => <li key={step}><Check aria-hidden="true" />{step}</li>)}</ol>
          </div>
        </div>
      </div>
    </section>
  );
}
