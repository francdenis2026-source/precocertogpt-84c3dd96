import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, KeyRound, LoaderCircle, MessageCircle, Search, ShoppingBasket, Sparkles } from "lucide-react";
import heroImg from "../../assets/home-2026/app-precocerto-mockup.jpg";
import { supabase } from "../../lib/supabase";
import { whatsappSalesLink } from "../../lib/contact";
import "./SubscriberGate.css";

type CheckState = "checking" | "locked" | "unlocked";

/**
 * Bloqueia ferramentas que são exclusivas de quem tem uma licença ativa.
 * A checagem é feita pela função `has_active_license` (RPC no Supabase, ver
 * migration create_smart_basket_license_system) — nunca por um campo local
 * que dê pra falsificar no DevTools. Sem Supabase configurado, o gate nunca
 * libera (mesma prudência de antes: melhor mostrar "em breve" do que fingir
 * um desbloqueio que não existe).
 */
export function SubscriberGate({ tool = "esta ferramenta", plan = "cesta_inteligente", children }: { children?: ReactNode; tool?: string; plan?: string }) {
  const [state, setState] = useState<CheckState>("checking");
  const [licenseKey, setLicenseKey] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState("");

  const checkLicense = async () => {
    if (!supabase) { setState("locked"); return; }
    const { data, error } = await supabase.rpc("has_active_license", { _plan: plan });
    setState(!error && data ? "unlocked" : "locked");
  };

  useEffect(() => { void checkLicense(); }, [plan]);

  async function redeem(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !licenseKey.trim()) return;
    setRedeeming(true);
    setMessage("");
    const { data, error } = await supabase.rpc("redeem_license_key", { _license_key: licenseKey.trim(), _plan: plan });
    setRedeeming(false);
    if (error || !data) {
      setMessage(error?.message || "Não foi possível validar esse código.");
      return;
    }
    setMessage("Código aceito! Liberando…");
    setLicenseKey("");
    await checkLicense();
  }

  if (state === "checking") {
    return (
      <main className="pc-sub-gate" id="conteudo-principal" aria-busy="true">
        <span className="pc-sub-gate__loading"><LoaderCircle className="spin" /> Verificando acesso…</span>
      </main>
    );
  }

  if (state === "unlocked") return <>{children}</>;

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
          <h1 id="pc-sub-gate-title">{tool} é exclusiva de quem tem uma licença ativa</h1>
          <p>Monte sua cesta automaticamente com IA. Peça seu código de acesso pelo WhatsApp do PreçoCerto e resgate abaixo.</p>
          <ul className="pc-sub-gate__plans">
            <li><span>24 horas</span><b>R$ 10,00</b></li>
            <li><span>7 dias</span><b>R$ 15,00</b></li>
            <li><span>30 dias</span><b>R$ 29,90</b></li>
            <li><span>Trimestral</span><b>R$ 69,90</b></li>
            <li><span>Semestral</span><b>R$ 119,90</b></li>
          </ul>
          <a
            className="pc-sub-gate__whatsapp"
            href={whatsappSalesLink("Olá! Quero comprar acesso à Cesta Inteligente do PreçoCerto.")}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle aria-hidden="true" /> Comprar pelo WhatsApp
          </a>
          <form className="pc-sub-gate__redeem" onSubmit={redeem}>
            <label htmlFor="pc-sub-gate-key"><KeyRound aria-hidden="true" /> Código de acesso</label>
            <div className="pc-sub-gate__redeem-row">
              <input
                id="pc-sub-gate-key"
                value={licenseKey}
                onChange={event => setLicenseKey(event.target.value.toUpperCase())}
                placeholder="Ex.: CESTA-XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
              />
              <button type="submit" disabled={redeeming || !licenseKey.trim()}>
                {redeeming ? <LoaderCircle className="spin" aria-hidden="true" /> : "Desbloquear"}
              </button>
            </div>
            {message && <p className={message.startsWith("Código aceito") ? "pc-sub-gate__msg pc-sub-gate__msg--ok" : "pc-sub-gate__msg"}>{message}</p>}
          </form>
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
