import { FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Copy, Crown, KeyRound, LoaderCircle, MessageCircle, QrCode, Search, ShoppingBasket, Sparkles } from "lucide-react";
import heroImg from "../../assets/home-2026/app-precocerto-mockup.jpg";
import { supabase } from "../../lib/supabase";
import { whatsappSalesLink } from "../../lib/contact";
import "./SubscriberGate.css";

type CheckState = "checking" | "locked" | "unlocked";

const PLANS = [
  { key: "24h", label: "24 horas", price: "R$ 10,00" },
  { key: "7d", label: "7 dias", price: "R$ 15,00" },
  { key: "30d", label: "30 dias", price: "R$ 29,90" },
  { key: "90d", label: "Trimestral", price: "R$ 69,90" },
  { key: "180d", label: "Semestral", price: "R$ 119,90" },
] as const;

type PixCheckout = {
  orderId: string;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  amount: number;
  planLabel: string;
};

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

  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[number]["key"]>("30d");
  const [pixBusy, setPixBusy] = useState(false);
  const [pixError, setPixError] = useState("");
  const [checkout, setCheckout] = useState<PixCheckout | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<number | null>(null);

  const checkLicense = async () => {
    if (!supabase) { setState("locked"); return; }
    const { data, error } = await supabase.rpc("has_active_license", { _plan: plan });
    const unlocked = !error && Boolean(data);
    setState(unlocked ? "unlocked" : "locked");
    return unlocked;
  };

  useEffect(() => { void checkLicense(); }, [plan]);

  // Enquanto o painel de PIX estiver aberto, confere a cada 4s se a licença
  // já foi liberada — o webhook do Mercado Pago cria a licença sozinho
  // assim que o pagamento é aprovado, sem a pessoa precisar fazer nada aqui.
  useEffect(() => {
    if (!checkout) return;
    pollRef.current = window.setInterval(() => { void checkLicense(); }, 4000);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, [checkout, plan]);

  const startPixCheckout = async () => {
    if (!supabase || pixBusy) return;
    setPixBusy(true);
    setPixError("");
    setCheckout(null);
    const { data, error } = await supabase.functions.invoke<PixCheckout & { error?: string }>("license-pix-checkout", {
      body: { planKey: selectedPlan },
    });
    setPixBusy(false);
    if (error || !data || data.error) {
      // FunctionsHttpError não expõe a mensagem em error.message — o corpo
      // JSON de verdade (com o motivo real, ex.: "PIX ainda não configurado")
      // vem em error.context, que é o Response bruto da função.
      const context = (error as { context?: Response })?.context;
      const detail = context ? await context.clone().json().catch(() => null) : null;
      setPixError(data?.error || detail?.error || "Não foi possível gerar o PIX agora. Tente novamente ou compre pelo WhatsApp.");
      return;
    }
    setCheckout(data);
  };

  const copyPixCode = async () => {
    if (!checkout?.qrCode) return;
    try {
      await navigator.clipboard.writeText(checkout.qrCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível — o código já fica visível para copiar manualmente */
    }
  };

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
          <p>Escolha um plano, pague no PIX e o acesso é liberado sozinho — sem precisar digitar código nem esperar resposta.</p>
          <div className="pc-sub-gate__teaser">
            <span className="pc-sub-gate__teaser-icon"><Bot aria-hidden="true" /></span>
            <span>Inclui um assistente de compras interativo, só para quem assina.</span>
          </div>
          <ul className="pc-sub-gate__plans" role="radiogroup" aria-label="Escolha o plano">
            {PLANS.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedPlan === item.key}
                  className={selectedPlan === item.key ? "is-selected" : undefined}
                  onClick={() => { setSelectedPlan(item.key); setCheckout(null); setPixError(""); }}
                >
                  <span>{item.label}</span><b>{item.price}</b>
                </button>
              </li>
            ))}
          </ul>

          {checkout ? (
            <div className="pc-sub-gate__pix" aria-live="polite">
              {checkout.qrCodeBase64 && (
                <img className="pc-sub-gate__pix-qr" src={`data:image/png;base64,${checkout.qrCodeBase64}`} alt="QR Code do PIX" width="220" height="220" />
              )}
              <p className="pc-sub-gate__pix-amount">{checkout.planLabel} · {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(checkout.amount)}</p>
              {checkout.qrCode && (
                <button type="button" className="pc-sub-gate__pix-copy" onClick={() => void copyPixCode()}>
                  <Copy aria-hidden="true" /> {copied ? "Código copiado!" : "Copiar código PIX"}
                </button>
              )}
              <p className="pc-sub-gate__pix-wait"><LoaderCircle className="spin" aria-hidden="true" /> Aguardando confirmação do pagamento…</p>
              <button type="button" className="pc-sub-gate__pix-cancel" onClick={() => setCheckout(null)}>Escolher outro plano</button>
            </div>
          ) : (
            <button type="button" className="pc-sub-gate__whatsapp" onClick={() => void startPixCheckout()} disabled={pixBusy}>
              {pixBusy ? <LoaderCircle className="spin" aria-hidden="true" /> : <QrCode aria-hidden="true" />} {pixBusy ? "Gerando PIX…" : "Pagar com PIX e liberar na hora"}
            </button>
          )}
          {pixError && <p className="pc-sub-gate__msg">{pixError}</p>}

          <a
            className="pc-sub-gate__ghost pc-sub-gate__whatsapp-link"
            href={whatsappSalesLink("Olá! Quero comprar acesso à Cesta Inteligente do PreçoCerto.")}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle aria-hidden="true" /> Prefiro comprar pelo WhatsApp
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
