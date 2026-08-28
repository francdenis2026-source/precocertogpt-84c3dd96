import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "@fontsource-variable/manrope";
import "./styles/AppReset.css";
import "./reference/DesignSystem2.css";
import "./reference/Chrome2026.css";
import "./reference/InteractionPolish.css";
import App from "./App";
import { initializeSiteTheme } from "./lib/siteTheme";

/**
 * PreçoCerto visual bootstrap
 *
 * Keep one canonical visual system. The previous bootstrap appended several
 * independent override stylesheets (campaign, graphite, dark atelier, etc.)
 * after the application had loaded. Those layers competed with the component
 * styles and made spacing, color, typography and responsive behavior depend on
 * cascade order. The shared reference system already provides the intended
 * tokens, public chrome and interaction layer, so it is now the single source
 * of truth.
 */
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
      } catch {}
    })().catch(() => {});
  }, { once: true });
}
