import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "@fontsource-variable/manrope";
import "./styles/AppReset.css";
import App from "./App";
import { initializeSiteTheme } from "./lib/siteTheme";

// Único sistema visual global ativo do PreçoCerto.
const campaignTheme = document.createElement("link");
campaignTheme.rel = "stylesheet";
campaignTheme.href = "/campaign-theme.css?v=20260825-4";
campaignTheme.dataset.precocertoTheme = "campaign-2026";
document.head.appendChild(campaignTheme);

// Acabamento profissional do modo claro.
const lightProfessionalTheme = document.createElement("link");
lightProfessionalTheme.rel = "stylesheet";
lightProfessionalTheme.href = "/light-professional-2026.css?v=20260825-1";
lightProfessionalTheme.dataset.precocertoLightTheme = "professional-light-2026";
document.head.appendChild(lightProfessionalTheme);

// Integração final da nova logomarca em site, app, painéis e favicon/símbolo.
const logoIntegrationTheme = document.createElement("link");
logoIntegrationTheme.rel = "stylesheet";
logoIntegrationTheme.href = "/logo-integration-2026.css?v=20260825-4";
logoIntegrationTheme.dataset.precocertoLogo = "studio-brand-2026";
document.head.appendChild(logoIntegrationTheme);

// Camada final de tipografia: pesos consistentes e contraste legível no claro/escuro.
const typographyContrastTheme = document.createElement("link");
typographyContrastTheme.rel = "stylesheet";
typographyContrastTheme.href = "/typography-contrast-2026.css?v=20260825-1";
typographyContrastTheme.dataset.precocertoTypography = "accessible-type-2026";
document.head.appendChild(typographyContrastTheme);

// Contraste final do modo claro: ícones, logos, dock, busca e controles.
const lightIconContrastTheme = document.createElement("link");
lightIconContrastTheme.rel = "stylesheet";
lightIconContrastTheme.href = "/light-icon-contrast-2026.css?v=20260825-2";
lightIconContrastTheme.dataset.precocertoLightIcons = "light-icon-contrast-2026";
document.head.appendChild(lightIconContrastTheme);

// Assinatura do desenvolvedor no footer desktop.
const footerDeveloperSignatureTheme = document.createElement("link");
footerDeveloperSignatureTheme.rel = "stylesheet";
footerDeveloperSignatureTheme.href = "/footer-developer-signature-2026.css?v=20260825-1";
footerDeveloperSignatureTheme.dataset.precocertoFooterSignature = "developer-signature-2026";
document.head.appendChild(footerDeveloperSignatureTheme);

// Glass shell: a página continua visualmente sob header e footer.
const glassShellTheme = document.createElement("link");
glassShellTheme.rel = "stylesheet";
glassShellTheme.href = "/glass-shell-2026.css?v=20260825-1";
glassShellTheme.dataset.precocertoGlassShell = "glass-shell-2026";
document.head.appendChild(glassShellTheme);

// Player, botões e barra superior usam a paleta quente da identidade atual.
const topbarControlsTheme = document.createElement("link");
topbarControlsTheme.rel = "stylesheet";
topbarControlsTheme.href = "/topbar-controls-2026.css?v=20260825-1";
topbarControlsTheme.dataset.precocertoTopbarControls = "warm-controls-2026";
document.head.appendChild(topbarControlsTheme);

// App shell mobile: claro branco, escuro em uma única superfície carvão e detalhes da marca.
const mobileAppShellTheme = document.createElement("link");
mobileAppShellTheme.rel = "stylesheet";
mobileAppShellTheme.href = "/mobile-app-shell-2026.css?v=20260825-2";
mobileAppShellTheme.dataset.precocertoMobileShell = "mobile-app-shell-2026";
document.head.appendChild(mobileAppShellTheme);

// Interação de apontamento refinada: sem elevação, zoom ou saltos de hover.
const pointerInteractionTheme = document.createElement("link");
pointerInteractionTheme.rel = "stylesheet";
pointerInteractionTheme.href = "/interaction-hover-2026.css?v=20260825-2";
pointerInteractionTheme.dataset.precocertoPointerInteraction = "pointer-refined-2026";
document.head.appendChild(pointerInteractionTheme);

// Consolida todas as rotas públicas em uma única experiência de aplicativo.
const professionalAppShellTheme = document.createElement("link");
professionalAppShellTheme.rel = "stylesheet";
professionalAppShellTheme.href = "/app-shell-professional-2026.css?v=20260826-2";
professionalAppShellTheme.dataset.precocertoAppShell = "professional-app-shell-2026";
document.head.appendChild(professionalAppShellTheme);

// Impeccable: acabamento final da homepage em web e mobile.
const impeccableHomeTheme = document.createElement("link");
impeccableHomeTheme.rel = "stylesheet";
impeccableHomeTheme.href = "/impeccable-home-2026.css?v=20260826-1";
impeccableHomeTheme.dataset.precocertoImpeccable = "homepage-polish-2026";
document.head.appendChild(impeccableHomeTheme);

initializeSiteTheme();

const boot = document.getElementById("pc-boot-screen");
let bootRemovalTimer = 0;
const retireBoot = () => {
  window.clearTimeout(bootRemovalTimer);
  bootRemovalTimer = window.setTimeout(() => boot?.classList.add("is-removed"), 400);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

window.requestAnimationFrame(() => {
  window.requestAnimationFrame(() => {
    boot?.classList.add("is-done");
    retireBoot();
  });
});

const startNotifications = () => {
  if (!navigator.onLine) return;
  void import("./lib/paymentNotifications")
    .then(({ startPaymentNotifications }) => startPaymentNotifications())
    .catch(() => {
      // A interface e o catálogo local continuam disponíveis.
    });
};

window.setTimeout(startNotifications, 1_500);
window.addEventListener("online", startNotifications, { once: true });

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void (async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith("precocerto-")).map(key => caches.delete(key)));
      }

      if (!navigator.serviceWorker.controller) return;
      const reloadKey = "pc:legacy-worker-removed";
      try {
        if (sessionStorage.getItem(reloadKey)) return;
        sessionStorage.setItem(reloadKey,"1");
        window.location.reload();
      } catch {
        // Sem armazenamento de sessão, evita-se qualquer risco de loop.
      }
    })().catch(() => {
      // Falhas na limpeza não bloqueiam o funcionamento da aplicação.
    });
  }, { once: true });
}
