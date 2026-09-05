/* Identidade de dispositivo e de aba.
 *
 * Três escopos diferentes, que costumam ser confundidos:
 *
 *   deviceId   um por perfil de navegador, guardado em localStorage. Sobrevive
 *              a recarga e a fechar o navegador. É o que responde "quantas
 *              pessoas estão online": dez abas do mesmo navegador contam uma.
 *
 *   tabId      um por aba, em sessionStorage. Cada aba tem o seu, inclusive
 *              duas abas do mesmo navegador. É o que responde "esta página já
 *              está aberta em outro lugar".
 *
 *   sessionId  um por login. Muda toda vez que a pessoa entra na conta e é o
 *              que decide qual dispositivo fica logado quando há disputa.
 *
 * Sobre contar por IP: seria pior, não melhor. Numa cidade como Feijó, uma
 * lan house, uma família no mesmo wi-fi ou o CGNAT da operadora colocam dezenas
 * de pessoas atrás do mesmo IP, e o contador mostraria "1". O oposto também
 * acontece: quem alterna entre wi-fi e dados móveis troca de IP e vira duas
 * pessoas. Além disso o IP é dado pessoal sob a LGPD e o navegador não entrega
 * o dele ao JavaScript: exigiria mandar cada visita para um servidor. O
 * identificador aleatório por navegador é mais preciso e não identifica
 * ninguém.
 */

const DEVICE_KEY = "precocerto:presence-device";
const TAB_KEY = "precocerto:presence-tab";

function novoId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Navegadores antigos sem crypto.randomUUID: não precisa ser criptográfico,
  // só precisa não colidir entre abas do mesmo minuto.
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Identificador estável do navegador. Uma aba nova não gera outro. */
export function getDeviceId(): string {
  try {
    const guardado = localStorage.getItem(DEVICE_KEY);
    if (guardado) return guardado;
    const id = novoId();
    localStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    // Navegação anônima com armazenamento bloqueado: o id vive só em memória,
    // então esta sessão conta como um dispositivo novo. É o comportamento certo.
    return novoId();
  }
}

/** Identificador da aba. Some quando a aba fecha. */
export function getTabId(): string {
  try {
    const guardado = sessionStorage.getItem(TAB_KEY);
    if (guardado) return guardado;
    const id = novoId();
    sessionStorage.setItem(TAB_KEY, id);
    return id;
  } catch {
    return novoId();
  }
}

/** Identificador de um login. Novo a cada entrada na conta. */
export function novoSessionId(): string {
  return novoId();
}

/** Rótulo curto e honesto do aparelho, para dizer de onde veio o outro acesso. */
export function descreverDispositivo(): string {
  if (typeof navigator === "undefined") return "outro dispositivo";
  const ua = navigator.userAgent;
  const movel = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const navegador = /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "navegador";
  const sistema = /Android/i.test(ua) ? "Android"
    : /iPhone|iPad|iPod/i.test(ua) ? "iPhone ou iPad"
    : /Windows/i.test(ua) ? "Windows"
    : /Mac OS X/i.test(ua) ? "Mac"
    : /Linux/i.test(ua) ? "Linux"
    : "";
  const aparelho = movel ? "celular" : "computador";
  return sistema ? `${navegador} no ${aparelho} (${sistema})` : `${navegador} no ${aparelho}`;
}
