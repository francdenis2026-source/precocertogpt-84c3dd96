import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "@fontsource-variable/manrope";
import "./styles/AppReset.css";
// Cascata global oficial: importada pelo bundler (com hash e minificação) em
// vez de <link> apontando para /public — os arquivos antigos de /public foram
// removidos e as tags injetadas em runtime resultavam em 404, deixando o site
// publicado sem o design atual.
import "./styles/global/light-professional-2026.css";
import "./styles/global/logo-integration-2026.css";
import "./styles/global/typography-contrast-2026.css";
import "./styles/global/light-icon-contrast-2026.css";
import "./styles/global/glass-shell-2026.css";
import "./styles/global/mobile-app-shell-2026.css";
import "./styles/global/interaction-hover-2026.css";
import "./styles/global/app-shell-professional-2026.css";
import "./styles/global/search-refinement-2026.css";
import "./styles/global/taste-auth-2026.css";
import "./styles/global/glass-app-shell-v3-2026.css";
import "./styles/global/platform-polish-2026.css";
import "./styles/global/member-experience-2026.css";
import "./styles/global/pro-experience-2026.css";
import App from "./App";
import { initializePwaRuntime } from "./lib/pwaRuntime";
import { initializeSiteTheme } from "./lib/siteTheme";


initializeSiteTheme();
document.documentElement.classList.remove("pc-prepaint");
document.documentElement.classList.add("pc-styles-ready");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

const startNotifications = () => {
  if (!navigator.onLine) return;
  void import("./lib/paymentNotifications")
    .then(({ startPaymentNotifications }) => startPaymentNotifications())
    .catch(() => {});
};

window.setTimeout(startNotifications, 1_500);
window.addEventListener("online", startNotifications, { once: true });

// Centraliza o ciclo do service worker. O runtime também remove registros
// antigos em previews/iframes, evitando HTML ou chunks obsoletos e tela branca.
initializePwaRuntime();
