const CACHE_VERSION = "20260904-search-rebuild-19";
const SHELL_CACHE = `precocerto-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `precocerto-runtime-${CACHE_VERSION}`;
const PRECACHE = [
  "/",
  "/manifest.json",
  "/preco-certo-mark.svg?v=17",
  "/logo-preco-certo.svg?v=17",
  "/logo-preco-certo-inversa.svg?v=17",
  "/pwa-192x192.png?v=17",
  "/pwa-512x512.png?v=17",
  "/hero-preco-certo-comparacao-2026.webp?v=20260830-2",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("precocerto-") && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const shell = await caches.match("/");
    if (shell) return shell;
    return new Response("PreçoCerto indisponível offline neste momento.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then(response => {
      if (response.ok) void cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    void refresh;
    return cached;
  }
  const response = await refresh;
  return response || new Response("", { status: 503, statusText: "Offline" });
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/rest/v1/") || url.pathname.startsWith("/auth/v1/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Código e estilos NUNCA podem vir de cache velho: senão o site continua
  // exibindo uma versão antiga depois de cada deploy.
  if (["style", "script", "document"].includes(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (["font", "image"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
