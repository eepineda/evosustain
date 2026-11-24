/* Evoford News service worker: cache-first static assets, network-first pages, no API caching. */
"use strict";
const VERSION = "evoford-news-pwa-v68";
const SHELL = VERSION + "-shell";
const STATIC = VERSION + "-static";
const PRECACHE = [
  "/news/",
  "/news/offline.html",
  "/news/manifest.webmanifest",
  "/news/academy.webmanifest",
  "/news/assets/app-navigation.css?v=20261123-mobileapp3",
  "/news/assets/app-navigation.js?v=20261123-nav8",
  "/news/assets/academy-mobile.css?v=20261124-academy-mobile1",
  "/news/assets/app-navigation.css?v=20261124-academy-mobile1",
  "/news/assets/app-navigation.js?v=20261124-academy-mobile1",
  "/news/icons/icon-192.svg",
  "/news/icons/icon-512.svg",
  "/news/assets/style.css?v=20261114-ads2",
  "/news/assets/news-core.css?v=1",
  "/news/assets/editorial-premium.css?v=20261114-premium5",
  "/news/assets/modern-home.css?v=8",
  "/news/assets/home-print.css?v=1",
  "/news/assets/app-shell.css?v=20261122-pwalayout60",
  "/news/assets/news-core.js?v=1",
  "/news/assets/site.js?v=20261122-anchorfix1",
  "/news/assets/ads.js?v=20261117-editorial2",
  "/news/assets/pwa.js?v=6"
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
    const deletions = [];
    for (const key of keys) {
      if (key.startsWith("evoford-news-pwa-") && key !== SHELL && key !== STATIC) deletions.push(caches.delete(key));
    }
    await Promise.all(deletions);
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

      // Only use cache-first for explicitly versioned assets. Unversioned
      // resources (for example icons replaced at the same URL) are refreshed
      // from the network and use the cache only as an offline fallback.
      const isVersioned = url.searchParams.has("v") || /\.[a-f0-9]{8,}\./i.test(url.pathname);
      const cached = await cache.match(request);
      if (isVersioned && cached) return cached;

      const shell = await caches.open(SHELL);
      const precached = await shell.match(request);

      try {
        const response = await fetch(request);
        if (response && response.ok) {
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return cached || precached || Response.error();
      }
    })());
  }
});
