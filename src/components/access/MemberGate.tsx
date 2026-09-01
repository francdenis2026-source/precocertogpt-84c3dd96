import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BellRing, Heart, ShieldCheck, ShoppingBasket, Sparkles, TrendingDown } from "lucide-react";
import { supabase } from "../../lib/supabase";
import "./MemberGate.css";

type GateState = "checking" | "member" | "visitor";

const BENEFITS = [
  { icon: TrendingDown, label: "Comparador completo", text: "Veja todos os preços de cada produto, loja por loja." },
  { icon: ShoppingBasket, label: "Cesta inteligente", text: "Monte sua lista e descubra onde a compra sai mais barata." },
  { icon: Heart, label: "Favoritos sincronizados", text: "Salve produtos e recupere em qualquer aparelho." },
  { icon: BellRing, label: "Alertas de queda", text: "Avisamos quando o preço que você acompanha cair." },
];

/**
 * Protege as ferramentas da plataforma. Visitantes veem uma prévia com convite
 * profissional ao cadastro; usuários autenticados acessam o conteúdo real.
 */
export function MemberGate({ children, tool = "esta ferramenta" }: { children: ReactNode; tool?: string }) {
  const [state, setState] = useState<GateState>("checking");
  const { pathname, search } = useLocation();
  const returnTo = `${pathname}${search}`;

  useEffect(() => {
    let alive = true;
    if (!supabase) {
      setState("visitor");
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setState(data.session?.user ? "member" : "visitor");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setState(session?.user ? "member" : "visitor");
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "checking")
    return <main className="pc-gate pc-gate--loading" aria-busy="true" aria-label="Verificando acesso" />;

  if (state === "member") return <>{children}</>;

  return (
    <main className="pc-gate" id="conteudo-principal">
      <div className="pc-gate__preview" aria-hidden="true">
        {children}
      </div>
      <section className="pc-gate__panel" aria-labelledby="pc-gate-title">
        <span className="pc-gate__tag">
          <Sparkles aria-hidden="true" /> Área de membros
        </span>
        <h1 id="pc-gate-title">Crie sua conta gratuita para usar {tool}</h1>
        <p className="pc-gate__lead">
          O Preço Certo compara os preços reais dos comércios de Feijó. As ferramentas de economia ficam liberadas
          assim que você entra — leva menos de um minuto e não tem custo.
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
          <Link className="pc-gate__cta" to={`/cadastro?redirect=${encodeURIComponent(returnTo)}`}>
            Criar conta gratuita
          </Link>
          <Link className="pc-gate__ghost" to={`/login?redirect=${encodeURIComponent(returnTo)}`}>
            Já tenho cadastro
          </Link>
        </div>
        <p className="pc-gate__trust">
          <ShieldCheck aria-hidden="true" /> Cadastro só com nome, e-mail e senha. Sem cobrança e sem compartilhar seus dados.
        </p>
        <Link className="pc-gate__back" to="/">
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}

export default MemberGate;
