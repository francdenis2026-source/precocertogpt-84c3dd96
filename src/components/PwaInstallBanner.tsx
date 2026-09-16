import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { type InstallPromptEvent, clearCapturedInstallPrompt, getCapturedInstallPrompt } from "../lib/pwaInstall";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

const DISMISS_KEY = "pc-pwa-banner-dismissed";

/** Faixa de instalação exibida assim que o site abre em Android instalável
 * (evento `beforeinstallprompt` real do navegador, não um chute por
 * user-agent). Fica no topo do fluxo normal da página — não sobrepõe o
 * cabeçalho nem o dock inferior de navegação — e some sozinha se a pessoa
 * instalar, fechar, ou já estiver rodando como app instalado. Só volta a
 * incomodar em uma sessão nova depois de fechada. */
export function PwaInstallBanner() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try { if (sessionStorage.getItem(DISMISS_KEY)) return; } catch { /* storage indisponível: segue exibindo normalmente */ }

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    const installed = () => setVisible(false);

    // O evento pode já ter disparado antes deste componente montar (ver
    // index.html) — sem isso, a faixa não apareceria em aparelhos onde o
    // JS demora mais para carregar, mesmo sendo perfeitamente instalável.
    const captured = getCapturedInstallPrompt();
    if (captured) { setPromptEvent(captured); setVisible(true); }

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    clearCapturedInstallPrompt();
    setVisible(false);
    if (choice.outcome !== "accepted") { try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignora */ } }
  };

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignora */ }
  };

  if (!visible) return null;
  return (
    <div className="pc-pwa-banner" role="region" aria-label="Instalar aplicativo PreçoCerto">
      <span className="pc-pwa-banner__icon"><Download aria-hidden="true" /></span>
      <span className="pc-pwa-banner__text">
        <strong>Instale o PreçoCerto</strong>
        <small>Acesso rápido direto da tela inicial, sem app store</small>
      </span>
      <button type="button" className="pc-pwa-banner__cta" onClick={() => void install()}>Instalar</button>
      <button type="button" className="pc-pwa-banner__close" onClick={dismiss} aria-label="Fechar aviso de instalação"><X aria-hidden="true" /></button>
    </div>
  );
}
