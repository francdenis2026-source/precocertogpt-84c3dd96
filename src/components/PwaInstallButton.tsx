import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { type InstallPromptEvent, clearCapturedInstallPrompt, getCapturedInstallPrompt } from "../lib/pwaInstall";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function PwaInstallButton() {
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

    // O evento pode já ter disparado antes deste componente montar (ver
    // index.html) — sem isso, o botão simplesmente não aparecia em
    // aparelhos onde o JS demora mais para carregar, mesmo sendo
    // perfeitamente instalável.
    const captured = getCapturedInstallPrompt();
    if (captured) {
      setPromptEvent(captured);
      setAvailable(true);
    } else {
      setAvailable(!isStandalone() && isIos());
    }
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
      clearCapturedInstallPrompt();
      return;
    }
    window.alert("No iPhone ou iPad, toque em Compartilhar e depois em “Adicionar à Tela de Início”.");
  };

  if (!available) return null;
  return <button className="pc-pwa-install" type="button" onClick={() => void install()} aria-label="Instalar aplicativo PreçoCerto" title="Instalar aplicativo">
    <Download aria-hidden="true" />
    <span>Instalar</span>
  </button>;
}
