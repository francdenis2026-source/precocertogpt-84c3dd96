import { useEffect, useState } from "react";
import { Download, Smartphone, Sparkles, Store, Zap } from "lucide-react";
import appPhoto from "../../assets/home-2026/app-showcase-mao-celular-2026.jpg";


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
 *  contexto — ver histórico). Aqui ele ganha espaço de verdade.
 *
 *  O link "Continuar pela versão web" foi removido: quem lê esta seção já
 *  está navegando pela versão web (é a home do site), então o link não
 *  levava a lugar nenhum de fato — só duplicava o que a pessoa já estava
 *  fazendo. A prévia ilustrada do app (mockup de tela sobre a foto) também
 *  saiu: competia com a fotografia real por atenção, e as duas linguagens
 *  visuais juntas (foto + interface desenhada) liam como remendo, não como
 *  peça única. A foto agora é a única protagonista do card. */
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
            Instale o aplicativo e abra o Preço Certo em um toque, direto da
            tela inicial do seu celular.
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
          {available && (
            <div className="pcx-appshowcase__actions">
              <button type="button" className="pcx-appshowcase__cta" onClick={() => void install()}>
                <Download aria-hidden="true" /> Instalar aplicativo
              </button>
            </div>
          )}
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
        </div>
      </div>
    </section>
  );
}

