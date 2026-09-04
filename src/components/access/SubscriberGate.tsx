import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bot, Crown, Sparkles, TrendingDown, Wand2 } from "lucide-react";
import "./MemberGate.css";

const BENEFITS = [
  { icon: Wand2, label: "Cesta montada por IA", text: "Diga o que precisa e a inteligência artificial monta sua lista." },
  { icon: TrendingDown, label: "Menor custo automático", text: "A IA já escolhe onde cada item sai mais barato." },
  { icon: Bot, label: "Sugestões personalizadas", text: "Recomendações com base no seu histórico de compras." },
];

/**
 * Bloqueia ferramentas que serão exclusivas de assinantes. Hoje o site não
 * tem sistema de cobrança/assinatura, então isto é intencionalmente uma
 * prévia "em breve" — nunca libera acesso, mesmo para quem está logado, para
 * não fingir uma cobrança que ainda não existe.
 */
export function SubscriberGate({ children, tool = "esta ferramenta" }: { children: ReactNode; tool?: string }) {
  return (
    <main className="pc-gate" id="conteudo-principal">
      <div className="pc-gate__preview" aria-hidden="true">
        {children}
      </div>
      <section className="pc-gate__panel" aria-labelledby="pc-gate-title">
        <span className="pc-gate__tag">
          <Crown aria-hidden="true" /> Recurso para assinantes
        </span>
        <h1 id="pc-gate-title">{tool} é exclusiva para quem assina um plano</h1>
        <p className="pc-gate__lead">
          Estamos preparando os planos pagos do Preço Certo. Assim que estiverem disponíveis, assinantes
          poderão usar {tool.toLowerCase()} para montar a cesta automaticamente. Em breve avisamos por aqui.
        </p>
        <ul className="pc-gate__benefits">
          {BENEFITS.map(({ icon: Icon, label, text }) => (
            <li key={label}>
              <Icon aria-hidden="true" />
              <div>
                <strong>{label}</strong>
                <span>{text}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="pc-gate__actions">
          <Link className="pc-gate__cta" to="/buscar">
            <Sparkles aria-hidden="true" /> Comparar preços agora
          </Link>
          <Link className="pc-gate__ghost" to="/cesta-basica">
            Montar cesta manualmente
          </Link>
        </div>
        <Link className="pc-gate__back" to="/">
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}

export default SubscriberGate;
