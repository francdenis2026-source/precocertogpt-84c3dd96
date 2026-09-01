import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/outfit";
import "@fontsource-variable/manrope";
import "./styles/AppReset.css";
import App from "./App";
import { initializePwaRuntime } from "./lib/pwaRuntime";
import { initializeSiteTheme } from "./lib/siteTheme";

const appendStyle = (href: string, key: string, value: string) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset[key] = value;
  document.head.appendChild(link);
};

// Core public system only. Historical homepage-specific override sheets were
// removed from the global cascade so HomeNew2026 owns its own visual system.
appendStyle(
  "/light-professional-2026.css?v=20260825-1",
  "precocertoLightTheme",
  "professional-light-2026",
);
appendStyle(
  "/logo-integration-2026.css?v=20260825-4",
  "precocertoLogo",
  "studio-brand-2026",
);
appendStyle(
  "/typography-contrast-2026.css?v=20260825-1",
  "precocertoTypography",
  "accessible-type-2026",
);
appendStyle(
  "/light-icon-contrast-2026.css?v=20260825-2",
  "precocertoLightIcons",
  "light-icon-contrast-2026",
);
appendStyle(
  "/glass-shell-2026.css?v=20260825-1",
  "precocertoGlassShell",
  "glass-shell-2026",
);
appendStyle(
  "/mobile-app-shell-2026.css?v=20260825-2",
  "precocertoMobileShell",
  "mobile-app-shell-2026",
);
appendStyle(
  "/interaction-hover-2026.css?v=20260825-2",
  "precocertoPointerInteraction",
  "pointer-refined-2026",
);
appendStyle(
  "/app-shell-professional-2026.css?v=20260826-2",
  "precocertoAppShell",
  "professional-app-shell-2026",
);
appendStyle(
  "/search-refinement-2026.css?v=20260826-1",
  "precocertoSearch",
  "live-search-refinement-2026",
);
appendStyle(
  "/taste-auth-2026.css?v=20260829-1",
  "precocertoTasteAuth",
  "taste-auth-2026",
);
appendStyle(
  "/glass-app-shell-v3-2026.css?v=20260901-2",
  "precocertoGlassAppShell",
  "glass-app-shell-v3-2026",
);

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
