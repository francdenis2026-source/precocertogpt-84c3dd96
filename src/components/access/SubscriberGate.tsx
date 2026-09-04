import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Crown, Search, ShoppingBasket, Sparkles } from "lucide-react";
import heroImg from "../../assets/home-2026/app-precocerto-mockup.jpg";
import "./SubscriberGate.css";

/**
 * Bloqueia ferramentas que serão exclusivas de assinantes. Hoje o site não
 * tem sistema de cobrança/assinatura, então isto é intencionalmente uma
 * prévia "em breve" — nunca libera acesso, mesmo para quem está logado, para
 * não fingir uma cobrança que ainda não existe. Cartão compacto, sem rolagem,
 * com imagem de destaque em vez da grade de benefícios anterior.
 */
export function SubscriberGate({ tool = "esta ferramenta" }: { children?: ReactNode; tool?: string }) {
  return (
    <main className="pc-sub-gate" id="conteudo-principal">
      <section className="pc-sub-gate__card" aria-labelledby="pc-sub-gate-title">
        <div className="pc-sub-gate__hero">
          <img src={heroImg} alt="" width="1280" height="960" loading="lazy" decoding="async" />
          <span className="pc-sub-gate__badge">
            <Crown aria-hidden="true" /> Assinantes
          </span>
        </div>
        <div className="pc-sub-gate__body">
          <h1 id="pc-sub-gate-title">{tool} chega em breve para assinantes</h1>
          <p>Monte sua cesta automaticamente com IA — disponível assim que os planos pagos forem lançados.</p>
          <div className="pc-sub-gate__actions">
            <Link className="pc-sub-gate__cta" to="/buscar">
              <Search aria-hidden="true" /> Comparar preços
            </Link>
            <Link className="pc-sub-gate__ghost" to="/cesta-basica">
              <ShoppingBasket aria-hidden="true" /> Cesta manual
            </Link>
          </div>
          <Link className="pc-sub-gate__back" to="/">
            <Sparkles aria-hidden="true" /> Voltar para a página inicial
          </Link>
        </div>
      </section>
    </main>
  );
}

export default SubscriberGate;
