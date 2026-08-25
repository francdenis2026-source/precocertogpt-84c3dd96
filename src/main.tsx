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
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();
      } catch {
        // Sem armazenamento de sessão, evita-se qualquer risco de loop.
      }
    })().catch(() => {
      // Falhas na limpeza não bloqueiam o funcionamento da aplicação.
    });
  }, { once: true });
}
