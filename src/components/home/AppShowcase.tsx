import { useEffect, useState } from "react";
import { ArrowRight, Download, MapPin, Search, Smartphone, Sparkles, Store, Zap } from "lucide-react";
import { Link } from "react-router-dom";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Mesma lógica de detecção do PwaInstallButton (Android via
 *  beforeinstallprompt, iOS sempre com instrução manual — a Apple não
 *  expõe API pra saber se o atalho já existe na tela inicial). Duplicada
 *  aqui, e não importada, porque este botão precisa do próprio visual
 *  (chamada principal da seção, não um ícone solto no header). */
function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setAvailable(true);
    };
    const installed = () => {
      setPromptEvent(null);
      setAvailable(false);
    };

    setAvailable(!isStandalone() && isIos());
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setAvailable(false);
      setPromptEvent(null);
      return;
    }
    window.alert("No iPhone ou iPad, toque em Compartilhar e depois em “Adicionar à Tela de Início”.");
  };

  return { available, install };
}

const HIGHLIGHTS = [
  { icon: Zap, title: "Acesso rápido", text: "Ícone na tela inicial" },
  { icon: Smartphone, title: "Sem app store", text: "Instala direto do navegador" },
  { icon: Store, title: "Mesmo catálogo", text: "Preços idênticos ao site" },
] as const;

/** Seção de destaque logo após a faixa de confiança: quem chega na home não
 *  sabia que dava pra instalar o PreçoCerto como app (o antigo botão de
 *  instalar vivia escondido no header e foi removido de lá por falta de
 *  contexto — ver histórico). Aqui ele ganha espaço de verdade, ao lado da
 *  opção de continuar só pela web, sem confundir as duas como se fossem a
 *  mesma ação. */
export function AppShowcase() {
  const { available, install } = useInstallPrompt();

  return (
    <section className="pcx-shell" aria-labelledby="app-showcase-title">
      <div className="pcx-appshowcase">
        <div className="pcx-appshowcase__copy">
          <span className="pcx-appshowcase__badge">
            <Sparkles aria-hidden="true" />
            App e versão web
          </span>
          <h2 id="app-showcase-title">
            Preço Certo no seu bolso, <strong>do jeito que for mais fácil.</strong>
          </h2>
          <p>
            Instale o aplicativo para abrir em um toque ou continue direto pelo
            navegador — o catálogo e os preços são exatamente os mesmos.
          </p>
          <ul className="pcx-appshowcase__highlights">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </li>
            ))}
          </ul>
          <div className="pcx-appshowcase__actions">
            {available && (
              <button type="button" className="pcx-appshowcase__cta" onClick={() => void install()}>
                <Download aria-hidden="true" /> Instalar aplicativo
              </button>
            )}
            <Link to="/explorar" className="pcx-appshowcase__link">
              Continuar pela web <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="pcx-appshowcase__visual" aria-hidden="true">
          <div className="pcx-appshowcase__glow" />
          <div className="pcx-appshowcase__phone">
            <div className="pcx-appshowcase__phone-screen">
              <div className="pcx-appshowcase__phone-bar">
                <MapPin aria-hidden="true" />
                <span>Feijó, Acre</span>
              </div>
              <div className="pcx-appshowcase__phone-search">
                <Search aria-hidden="true" />
                <span>Arroz 5kg</span>
              </div>
              <ul className="pcx-appshowcase__phone-list">
                <li>
                  <i />
                  <span>
                    <strong>Arroz Branco 5kg</strong>
                    <small>Comercial Central</small>
                  </span>
                  <b>R$ 23,90</b>
                </li>
                <li>
                  <i />
                  <span>
                    <strong>Feijão Carioca 1kg</strong>
                    <small>Mercado Silva</small>
                  </span>
                  <b>R$ 8,49</b>
                </li>
                <li>
                  <i />
                  <span>
                    <strong>Óleo de Soja 900ml</strong>
                    <small>Ponto Econômico</small>
                  </span>
                  <b>R$ 7,29</b>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
