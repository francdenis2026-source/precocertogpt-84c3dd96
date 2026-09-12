import { useEffect, useState } from "react";
import { Download } from "lucide-react";

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

  if (!available) return null;
  return <button className="pc-pwa-install" type="button" onClick={() => void install()} aria-label="Instalar aplicativo PreçoCerto" title="Instalar aplicativo">
    <Download aria-hidden="true" />
    <span>Instalar</span>
  </button>;
}
