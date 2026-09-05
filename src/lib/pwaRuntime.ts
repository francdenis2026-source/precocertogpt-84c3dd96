let initialized = false;
let onlineTimer: number | undefined;
let sondando = false;
let ultimoEstado: boolean | null = null;

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
    ? "Conexão restabelecida. Os preços voltam a ser atualizados."
    : "Você está sem internet. Mostrando o que já estava salvo no aparelho.";
  if (online && transient) {
    onlineTimer = window.setTimeout(() => element.classList.remove("is-visible"), 3200);
  }
}

/* navigator.onLine responde "a interface de rede está ligada?", e não "a
 * internet funciona?". Wi-fi de estabelecimento com portal de login, franquia
 * de dados estourada, torre fora do ar: em todos esses casos ele diz `true` e
 * nada carrega. Como esse é justamente o cenário comum aqui, o estado só é
 * confirmado depois de buscar um arquivo pequeno de verdade.
 *
 * A sonda usa o próprio manifest, que já está publicado e pesa poucos bytes,
 * com cache desligado para não ser respondida pelo disco. */
async function temInternetDeVerdade(): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const controle = new AbortController();
    const prazo = window.setTimeout(() => controle.abort(), 4000);
    const resposta = await fetch(`/manifest.json?ping=${Date.now()}`, {
      cache: "no-store",
      signal: controle.signal,
    });
    window.clearTimeout(prazo);
    return resposta.ok;
  } catch {
    return false;
  }
}

/** Avisa o aplicativo, para quem quiser reagir (recarregar dados, por exemplo). */
function anunciar(online: boolean) {
  if (ultimoEstado === online) return;
  const primeiraVez = ultimoEstado === null;
  ultimoEstado = online;
  window.dispatchEvent(new CustomEvent("pc:network", { detail: { online } }));
  if (!online) showNetworkStatus(false);
  else if (!primeiraVez) showNetworkStatus(true, true);
}

async function verificar() {
  if (sondando) return;
  sondando = true;
  try {
    anunciar(await temInternetDeVerdade());
  } finally {
    sondando = false;
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

  void verificar();

  // "offline" é confiável quando dispara: a interface caiu mesmo.
  window.addEventListener("offline", () => anunciar(false));
  // "online" só diz que a interface voltou. Se existe internet, quem responde
  // é a sonda.
  window.addEventListener("online", () => void verificar());
  // Voltar para a aba é bom momento para reconferir: o aparelho pode ter
  // trocado de rede ou saído do modo avião sem disparar evento nenhum.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void verificar();
  });

  window.addEventListener("load", () => void registerWorker(), { once: true });
}
