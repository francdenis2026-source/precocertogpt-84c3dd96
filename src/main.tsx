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

// Continuação da mesma identidade visual por toda a homepage.
const homepageTheme = document.createElement("link");
homepageTheme.rel = "stylesheet";
homepageTheme.href = "/homepage-total-theme.css?v=20260825-1";
homepageTheme.dataset.precocertoHomepageTheme = "campaign-full-home-2026";
document.head.appendChild(homepageTheme);

// Acabamento profissional do modo claro.
const lightProfessionalTheme = document.createElement("link");
lightProfessionalTheme.rel = "stylesheet";
lightProfessionalTheme.href = "/light-professional-2026.css?v=20260825-1";
lightProfessionalTheme.dataset.precocertoLightTheme = "professional-light-2026";
document.head.appendChild(lightProfessionalTheme);

// Remove halos e brilhos circulares do hero em ambos os temas.
const heroNoHaloTheme = document.createElement("link");
heroNoHaloTheme.rel = "stylesheet";
heroNoHaloTheme.href = "/hero-no-halo.css?v=20260825-2";
heroNoHaloTheme.dataset.precocertoHeroPolish = "hero-no-halo-2026";
document.head.appendChild(heroNoHaloTheme);

// Override final: área direita do hero totalmente limpa, sem efeitos decorativos.
const heroCleanSpaceTheme = document.createElement("link");
heroCleanSpaceTheme.rel = "stylesheet";
heroCleanSpaceTheme.href = "/hero-clean-space-2026.css?v=20260825-5";
heroCleanSpaceTheme.dataset.precocertoHeroCleanSpace = "hero-clean-space-2026";
document.head.appendChild(heroCleanSpaceTheme);

// Integração final da nova logomarca em site, app, painéis e favicon/símbolo.
const logoIntegrationTheme = document.createElement("link");
logoIntegrationTheme.rel = "stylesheet";
logoIntegrationTheme.href = "/logo-integration-2026.css?v=20260825-3";
logoIntegrationTheme.dataset.precocertoLogo = "studio-brand-2026";
document.head.appendChild(logoIntegrationTheme);

// Camada final de tipografia: pesos consistentes e contraste legível no claro/escuro.
const typographyContrastTheme = document.createElement("link");
typographyContrastTheme.rel = "stylesheet";
typographyContrastTheme.href = "/typography-contrast-2026.css?v=20260825-1";
typographyContrastTheme.dataset.precocertoTypography = "accessible-type-2026";
document.head.appendChild(typographyContrastTheme);

// Revisão estrutural final da homepage: grid, espaçamento, recortes, cards e responsividade.
const homepageLayoutPolish = document.createElement("link");
homepageLayoutPolish.rel = "stylesheet";
homepageLayoutPolish.href = "/homepage-layout-polish-2026.css?v=20260825-1";
homepageLayoutPolish.dataset.precocertoHomepageLayout = "homepage-layout-polish-2026";
document.head.appendChild(homepageLayoutPolish);

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

// App shell mobile: estrutura visual de aplicativo nativo com safe-area, superfícies e dock flutuante.
const mobileAppShellTheme = document.createElement("link");
mobileAppShellTheme.rel = "stylesheet";
mobileAppShellTheme.href = "/mobile-app-shell-2026.css?v=20260825-1";
mobileAppShellTheme.dataset.precocertoMobileShell = "mobile-app-shell-2026";
document.head.appendChild(mobileAppShellTheme);

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
