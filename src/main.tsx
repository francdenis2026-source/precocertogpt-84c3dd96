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

const pointerInteractionTheme = document.createElement("link");
pointerInteractionTheme.rel = "stylesheet";
pointerInteractionTheme.href = "/interaction-hover-2026.css?v=20260825-2";
pointerInteractionTheme.dataset.precocertoPointerInteraction = "pointer-refined-2026";
document.head.appendChild(pointerInteractionTheme);

const searchRefinementTheme = document.createElement("link");
searchRefinementTheme.rel = "stylesheet";
searchRefinementTheme.href = "/search-refinement-2026.css?v=20260826-1";
searchRefinementTheme.dataset.precocertoSearch = "live-search-refinement-2026";
document.head.appendChild(searchRefinementTheme);

// Dark Atelier: autoridade final do modo escuro em todo o produto.
const darkAtelierTheme = document.createElement("link");
darkAtelierTheme.rel = "stylesheet";
darkAtelierTheme.href = "/dark-atelier-2026.css?v=20260827-1";
darkAtelierTheme.dataset.precocertoDarkAtelier = "dark-atelier-2026";
document.head.appendChild(darkAtelierTheme);

// Redesign Geral Graphite 2026: autoridade final de cor, superfície e ritmo.
const graphiteRedesign = document.createElement("link");
graphiteRedesign.rel = "stylesheet";
graphiteRedesign.href = "/redesign-graphite-2026.css?v=20260827-10";
graphiteRedesign.dataset.precocertoGraphite = "redesign-graphite-2026";
document.head.appendChild(graphiteRedesign);

initializeSiteTheme();

const visualStyleLinks = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][data-precocerto-theme],link[rel="stylesheet"][data-precocerto-light-theme],link[rel="stylesheet"][data-precocerto-logo],link[rel="stylesheet"][data-precocerto-typography],link[rel="stylesheet"][data-precocerto-light-icons],link[rel="stylesheet"][data-precocerto-glass-shell],link[rel="stylesheet"][data-precocerto-topbar-controls],link[rel="stylesheet"][data-precocerto-mobile-shell],link[rel="stylesheet"][data-precocerto-pointer-interaction],link[rel="stylesheet"][data-precocerto-app-shell],link[rel="stylesheet"][data-precocerto-impeccable],link[rel="stylesheet"][data-precocerto-header],link[rel="stylesheet"][data-precocerto-search],link[rel="stylesheet"][data-precocerto-search-relocation],link[rel="stylesheet"][data-precocerto-unified-header],link[rel="stylesheet"][data-precocerto-footer-studio],link[rel="stylesheet"][data-precocerto-hero-market],link[rel="stylesheet"][data-precocerto-impeccable-final],link[rel="stylesheet"][data-precocerto-homepage-master],link[rel="stylesheet"][data-precocerto-homepage-impeccable],link[rel="stylesheet"][data-precocerto-homepage-taste],link[rel="stylesheet"][data-precocerto-dark-atelier],link[rel="stylesheet"][data-precocerto-graphite]'));

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
