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

async function registerWorker() {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;
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
