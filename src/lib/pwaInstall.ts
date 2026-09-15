export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __pcInstallPromptEvent?: InstallPromptEvent | null;
  }
}

/**
 * O "beforeinstallprompt" já pode ter disparado antes deste módulo (ou o
 * componente que o usa) existir — index.html captura o evento assim que a
 * página carrega, bem antes do bundle React montar. Isso lê o que já foi
 * capturado, para o componente não perder o prompt só por ter montado tarde.
 */
export function getCapturedInstallPrompt(): InstallPromptEvent | null {
  return typeof window === "undefined" ? null : window.__pcInstallPromptEvent ?? null;
}

export function clearCapturedInstallPrompt() {
  if (typeof window !== "undefined") window.__pcInstallPromptEvent = null;
}
