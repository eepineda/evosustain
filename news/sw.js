/* Evoford News service worker: conservative cache, network-first pages, no API caching. */
"use strict";
const VERSION = "evoford-news-pwa-v9";
const SHELL = VERSION + "-shell";
const STATIC = VERSION + "-static";
const PRECACHE = [
  "/news/",
  "/news/offline.html",
  "/news/manifest.webmanifest",
  "/news/icons/icon-192.svg",
  "/news/icons/icon-512.svg",
  "/news/assets/style.css?v=20261114-ads2",
  "/news/assets/news-core.css?v=1",
  "/news/assets/editorial-premium.css?v=20261114-premium5",
  "/news/assets/modern-home.css?v=5",
  "/news/assets/home-print.css?v=1",
  "/news/assets/app-shell.css?v=9",
  "/news/assets/news-core.js?v=1",
  "/news/assets/site.js?v=20261114-bio1",
  "/news/assets/ads.js?v=20261114-i18n3",
  "/news/assets/pwa.js?v=3"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(PRECACHE);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("evoford-news-pwa-") && key !== SHELL && key !== STATIC).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/news/")) return;
  if (url.pathname.startsWith("/news/admin/") || url.pathname.includes("/api/")) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok && url.pathname === "/news/") {
          const cache = await caches.open(SHELL);
          cache.put("/news/", response.clone());
        }
        return response;
      } catch (_) {
        const cache = await caches.open(SHELL);
        if (url.pathname === "/news/" || url.pathname === "/news/index.html") {
          return (await cache.match("/news/")) || (await cache.match("/news/offline.html"));
        }
        return (await cache.match("/news/offline.html"));
      }
    })());
    return;
  }
  if (["style", "script", "image", "font"].includes(request.destination) || url.pathname.endsWith(".webmanifest") || url.pathname.endsWith(".svg")) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC);
      const cached = await cache.match(request);
      const network = fetch(request).then(response => {
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => null);
      return cached || (await network) || Response.error();
    })());
  }
});