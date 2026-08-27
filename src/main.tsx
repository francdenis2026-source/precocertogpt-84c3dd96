import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "@fontsource-variable/manrope";
import "./styles/AppReset.css";
import App from "./App";
import { initializeSiteTheme } from "./lib/siteTheme";

const campaignTheme = document.createElement("link");
campaignTheme.rel = "stylesheet";
campaignTheme.href = "/campaign-theme.css?v=20260825-4";
campaignTheme.dataset.precocertoTheme = "campaign-2026";
document.head.appendChild(campaignTheme);

const lightProfessionalTheme = document.createElement("link");
lightProfessionalTheme.rel = "stylesheet";
lightProfessionalTheme.href = "/light-professional-2026.css?v=20260825-1";
lightProfessionalTheme.dataset.precocertoLightTheme = "professional-light-2026";
document.head.appendChild(lightProfessionalTheme);

const logoIntegrationTheme = document.createElement("link");
logoIntegrationTheme.rel = "stylesheet";
logoIntegrationTheme.href = "/logo-integration-2026.css?v=20260825-4";
logoIntegrationTheme.dataset.precocertoLogo = "studio-brand-2026";
document.head.appendChild(logoIntegrationTheme);

const typographyContrastTheme = document.createElement("link");
typographyContrastTheme.rel = "stylesheet";
typographyContrastTheme.href = "/typography-contrast-2026.css?v=20260825-1";
typographyContrastTheme.dataset.precocertoTypography = "accessible-type-2026";
document.head.appendChild(typographyContrastTheme);

const lightIconContrastTheme = document.createElement("link");
lightIconContrastTheme.rel = "stylesheet";
lightIconContrastTheme.href = "/light-icon-contrast-2026.css?v=20260825-2";
lightIconContrastTheme.dataset.precocertoLightIcons = "light-icon-contrast-2026";
document.head.appendChild(lightIconContrastTheme);

const glassShellTheme = document.createElement("link");
glassShellTheme.rel = "stylesheet";
glassShellTheme.href = "/glass-shell-2026.css?v=20260825-1";
glassShellTheme.dataset.precocertoGlassShell = "glass-shell-2026";
document.head.appendChild(glassShellTheme);

const topbarControlsTheme = document.createElement("link");
topbarControlsTheme.rel = "stylesheet";
topbarControlsTheme.href = "/topbar-controls-2026.css?v=20260825-1";
topbarControlsTheme.dataset.precocertoTopbarControls = "warm-controls-2026";
document.head.appendChild(topbarControlsTheme);

const mobileAppShellTheme = document.createElement("link");
mobileAppShellTheme.rel = "stylesheet";
mobileAppShellTheme.href = "/mobile-app-shell-2026.css?v=20260825-2";
mobileAppShellTheme.dataset.precocertoMobileShell = "mobile-app-shell-2026";
document.head.appendChild(mobileAppShellTheme);

const pointerInteractionTheme = document.createElement("link");
pointerInteractionTheme.rel = "stylesheet";
pointerInteractionTheme.href = "/interaction-hover-2026.css?v=20260825-2";
pointerInteractionTheme.dataset.precocertoPointerInteraction = "pointer-refined-2026";
document.head.appendChild(pointerInteractionTheme);

const professionalAppShellTheme = document.createElement("link");
professionalAppShellTheme.rel = "stylesheet";
professionalAppShellTheme.href = "/app-shell-professional-2026.css?v=20260826-2";
professionalAppShellTheme.dataset.precocertoAppShell = "professional-app-shell-2026";
document.head.appendChild(professionalAppShellTheme);

const impeccableHomeTheme = document.createElement("link");
impeccableHomeTheme.rel = "stylesheet";
impeccableHomeTheme.href = "/impeccable-home-2026.css?v=20260826-1";
impeccableHomeTheme.dataset.precocertoImpeccable = "homepage-polish-2026";
document.head.appendChild(impeccableHomeTheme);

const headerRedesignTheme = document.createElement("link");
headerRedesignTheme.rel = "stylesheet";
headerRedesignTheme.href = "/header-redesign-2026.css?v=20260826-3";
headerRedesignTheme.dataset.precocertoHeader = "header-redesign-2026";
document.head.appendChild(headerRedesignTheme);

const searchRefinementTheme = document.createElement("link");
searchRefinementTheme.rel = "stylesheet";
searchRefinementTheme.href = "/search-refinement-2026.css?v=20260826-1";
searchRefinementTheme.dataset.precocertoSearch = "live-search-refinement-2026";
document.head.appendChild(searchRefinementTheme);

const searchRelocationTheme = document.createElement("link");
searchRelocationTheme.rel = "stylesheet";
searchRelocationTheme.href = "/search-relocation-2026.css?v=20260826-1";
searchRelocationTheme.dataset.precocertoSearchRelocation = "hero-search-2026";
document.head.appendChild(searchRelocationTheme);

const unifiedHeaderTheme = document.createElement("link");
unifiedHeaderTheme.rel = "stylesheet";
unifiedHeaderTheme.href = "/header-unified-2026.css?v=20260826-4";
unifiedHeaderTheme.dataset.precocertoUnifiedHeader = "studio-header-2026";
document.head.appendChild(unifiedHeaderTheme);

const footerStudioTheme = document.createElement("link");
footerStudioTheme.rel = "stylesheet";
footerStudioTheme.href = "/footer-studio-2026.css?v=20260826-1";
footerStudioTheme.dataset.precocertoFooterStudio = "studio-footer-2026";
document.head.appendChild(footerStudioTheme);

const heroMarketTheme = document.createElement("link");
heroMarketTheme.rel = "stylesheet";
heroMarketTheme.href = "/hero-market-2026.css?v=20260826-1";
heroMarketTheme.dataset.precocertoHeroMarket = "local-market-hero-2026";
document.head.appendChild(heroMarketTheme);

// A camada Impeccable precisa ser a autoridade final da homepage. Folhas de
// compatibilidade carregadas acima não podem reintroduzir o visual legado.
const impeccableFinalTheme = document.createElement("link");
impeccableFinalTheme.rel = "stylesheet";
impeccableFinalTheme.href = "/impeccable-home-2026.css?v=20260827-1";
impeccableFinalTheme.dataset.precocertoImpeccableFinal = "homepage-impeccable-final-2026";
document.head.appendChild(impeccableFinalTheme);

// Sistema visual consolidado da homepage. Carregado por último para impedir
// que camadas históricas voltem a sobrescrever o layout responsivo atual.
const homepageMasterTheme = document.createElement("link");
homepageMasterTheme.rel = "stylesheet";
homepageMasterTheme.href = "/homepage-master-2026.css?v=20260827-1";
homepageMasterTheme.dataset.precocertoHomepageMaster = "homepage-master-2026";
document.head.appendChild(homepageMasterTheme);

initializeSiteTheme();

const visualStyleLinks = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][data-precocerto-theme],link[rel="stylesheet"][data-precocerto-light-theme],link[rel="stylesheet"][data-precocerto-logo],link[rel="stylesheet"][data-precocerto-typography],link[rel="stylesheet"][data-precocerto-light-icons],link[rel="stylesheet"][data-precocerto-glass-shell],link[rel="stylesheet"][data-precocerto-topbar-controls],link[rel="stylesheet"][data-precocerto-mobile-shell],link[rel="stylesheet"][data-precocerto-pointer-interaction],link[rel="stylesheet"][data-precocerto-app-shell],link[rel="stylesheet"][data-precocerto-impeccable],link[rel="stylesheet"][data-precocerto-header],link[rel="stylesheet"][data-precocerto-search],link[rel="stylesheet"][data-precocerto-search-relocation],link[rel="stylesheet"][data-precocerto-unified-header],link[rel="stylesheet"][data-precocerto-footer-studio],link[rel="stylesheet"][data-precocerto-hero-market],link[rel="stylesheet"][data-precocerto-impeccable-final],link[rel="stylesheet"][data-precocerto-homepage-master]'));

const revealApp = () => {
  document.documentElement.classList.remove("pc-prepaint");
  document.documentElement.classList.add("pc-styles-ready");
};

const styleReadyPromises = visualStyleLinks.map(link => {
  if (link.sheet) return Promise.resolve();
  return new Promise<void>(resolve => {
    const finish = () => resolve();
    link.addEventListener("load", finish, { once: true });
    link.addEventListener("error", finish, { once: true });
  });
});

void Promise.all(styleReadyPromises).then(() => {
  requestAnimationFrame(() => requestAnimationFrame(revealApp));
});
window.setTimeout(revealApp, 2200);

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
      } catch {}
    })().catch(() => {});
  }, { once: true });
}
