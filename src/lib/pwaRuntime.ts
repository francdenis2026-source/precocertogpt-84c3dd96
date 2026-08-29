let initialized = false;
let onlineTimer: number | undefined;

function ensureStatusElement() {
  let element = document.querySelector<HTMLDivElement>(".pc-network-status");
  if (element) return element;
  element = document.createElement("div");
  element.className = "pc-network-status";
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  element.setAttribute("aria-atomic", "true");
  document.body.appendChild(element);
  return element;
}

function showNetworkStatus(online: boolean, transient = false) {
  const element = ensureStatusElement();
  window.clearTimeout(onlineTimer);
  element.classList.toggle("is-online", online);
  element.classList.add("is-visible");
  element.textContent = online
    ? "Conexão restabelecida. Os dados podem ser atualizados novamente."
    : "Você está offline. O PreçoCerto usará o conteúdo disponível no dispositivo.";
  if (online && transient) {
    onlineTimer = window.setTimeout(() => element.classList.remove("is-visible"), 3200);
  }
}

/**
 * O service worker só pode assumir o controle no site publicado.
 * Em dev, dentro de iframe ou nos domínios de prévia ele serviria HTML/chunks
 * obsoletos (tela branca e "loop" de atualização), então nesses contextos a
 * inscrição é recusada e qualquer registro anterior é removido.
 */
function shouldSkipServiceWorker() {
  const host = window.location.hostname;
  const previewHost =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  const inIframe = window.self !== window.top;
  const killSwitch = new URLSearchParams(window.location.search).get("sw") === "off";
  return !import.meta.env.PROD || previewHost || inIframe || killSwitch;
}

async function unregisterWorker() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) =>
          (registration.active || registration.installing || registration.waiting)?.scriptURL.includes("/sw.js"),
        )
        .map((registration) => registration.unregister()),
    );
  } catch {
    /* nada a limpar */
  }
}

async function registerWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (shouldSkipServiceWorker()) {
    await unregisterWorker();
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    void registration.update();
  } catch (error) {
    console.warn("PreçoCerto: service worker indisponível.", error);
  }
}

export function initializePwaRuntime() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const initialOnline = navigator.onLine;
  if (!initialOnline) showNetworkStatus(false);

  window.addEventListener("offline", () => showNetworkStatus(false));
  window.addEventListener("online", () => showNetworkStatus(true, true));
  window.addEventListener("load", () => void registerWorker(), { once: true });
}
