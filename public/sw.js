const CACHE_VERSION = "20260828-1";
const SHELL_CACHE = `precocerto-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `precocerto-runtime-${CACHE_VERSION}`;
const PRECACHE = [
  "/",
  "/manifest.json",
  "/preco-certo-mark.svg?v=16",
  "/logo-preco-certo.svg?v=11",
  "/logo-preco-certo-inversa.svg?v=11",
  "/pwa-192x192.png?v=16",
  "/pwa-512x512.png?v=16",
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
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match("/"));
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
  return cached || refresh || Response.error();
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

  if (["style", "script", "font", "image"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
