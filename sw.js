/* ============================================================
   sw.js · Mein Deutschheft 离线缓存（PWA）
   ------------------------------------------------------------
   策略：
     · install  → 预缓存「应用外壳」（全部 HTML / JS / CSS / 图标）
     · fetch    → 同源 GET 走「缓存优先」，未命中则回源并写入缓存
     · 导航请求 → 网络失败时回退到缓存里的 index.html（离线可用）
     · activate → 清理旧版本缓存

   ALL_FILES 由 scripts/pack_site.py 在打包时注入（全量文件清单），
   供页面上的「📥 离线缓存」按钮一次性把音频/PDF 也缓存下来。
   直接以文件形式打开（file://）时本文件不生效，需经 http(s) 访问。
   ============================================================ */
"use strict";

const VERSION = "deutschheft-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];
const ALL_FILES = "__ALL__";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // 只处理本站资源

  // 导航请求：网络优先，失败则给缓存的页面
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  // 静态资源：缓存优先，未命中回源并写入
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
    })
  );
});

/* 供页面调用：一次性缓存全站（含音频 / PDF） */
self.addEventListener("message", e => {
  if (e.data && e.data.type === "cache-all") {
    e.waitUntil(
      caches.open(VERSION).then(c => c.addAll(ALL_FILES)).then(() => {
        e.source && e.source.postMessage({ type: "cache-all-done" });
      })
    );
  }
});
