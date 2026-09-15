import { useEffect, useState } from "react";
import { Download, MapPin, Search, Smartphone, Sparkles, Store, Zap } from "lucide-react";

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

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Seção de destaque logo após a faixa de confiança: quem chega na home não
 *  sabia que dava pra instalar o PreçoCerto como app (o antigo botão de
 *  instalar vivia escondido no header e foi removido de lá por falta de
 *  contexto — ver histórico). Aqui ele ganha espaço de verdade, ao lado da
 *  opção de continuar só pela web, sem confundir as duas como se fossem a
 *  mesma ação.
 *
 *  A prévia do celular mostra produtos reais do catálogo já carregado (nome,
 *  estabelecimento mais barato e preço) sobre uma fotografia de uso real —
 *  nada de números inventados; sem catálogo, a prévia simplesmente não
 *  aparece. */
export function AppShowcase({ products = [] }: { products?: Product[] }) {
  const { available, install } = useInstallPrompt();
  const preview = products.filter((product) => product.minPrice > 0).slice(0, 3);

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
            <Link className="pcx-appshowcase__ghost" to="/explorar">
              Continuar pela versão web
            </Link>
          </div>
        </div>
        <div className="pcx-appshowcase__visual">
          <figure className="pcx-appshowcase__photo">
            <img
              src={appPhoto}
              alt="Cliente conferindo preços pelo celular dentro de um comércio de Feijó"
              loading="lazy"
              decoding="async"
              width={1280}
              height={960}
            />
          </figure>
          {preview.length > 0 && (
            <div className="pcx-appshowcase__phone" aria-hidden="true">
              <div className="pcx-appshowcase__phone-screen">
                <div className="pcx-appshowcase__phone-bar">
                  <MapPin aria-hidden="true" />
                  <span>Feijó, Acre</span>
                </div>
                <div className="pcx-appshowcase__phone-search">
                  <Search aria-hidden="true" />
                  <span>Comparar preços</span>
                </div>
                <ul className="pcx-appshowcase__phone-list">
                  {preview.map((product) => (
                    <li key={product.id}>
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.establishment}</small>
                      </span>
                      <b>{brl.format(product.minPrice)}</b>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

