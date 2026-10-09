// Service worker. Two jobs:
//  1. Exists so Chrome/Android treat the app as "installable" (its criteria require an active SW with a
//     fetch handler, not just a manifest).
//  2. (2026-10-06, Asset Knowleges phase 3) Keeps the Asset Knowleges book files readable when the
//     signal drops mid-event: index.js + the 14 <id>.js files under assets/playbooks/ are pre-cached
//     on install and served cache-first, refreshed in the background (stale-while-revalidate).
//     Same for the Playbook พอร์ต tab's data file, assets/port/edu.js (2026-10-08), and the PDF preview's A4 mockup
//     (mockup/playbook-pdf/, ~3MB, 2026-10-09) — that one is NOT pre-cached, only kept once it has been opened.
//
// Everything ELSE is still plain network pass-through, deliberately NOT cached: the app is under
// active development and a caching SW would risk serving a stale dna-quiz-flow.html to installed
// users after every edit. Revisit for the app shell once the build is stable.
//
// Bump APB_CACHE when the book file list changes (tools/build-asset-playbooks.js) so a stale cache is
// dropped on activate.
var APB_CACHE = 'apb-v2';
var APB_FILES = ['index', 'macro', 'stock', 'bond', 'fund', 'dr', 'gold', 'realestate', 'crypto',
  'collectible', 'tax', 'insurance', 'longevity', 'ai', 'scam'].map(function (f) { return 'assets/playbooks/' + f + '.js'; })
  .concat(['assets/port/edu.js']); // Playbook พอร์ต tab data (2026-10-08, tools/build-port-education.js)

self.addEventListener('install', function (e) {
  if (/^(localhost|127\.0\.0\.1)$/.test(self.location.hostname)) { e.waitUntil(self.skipWaiting()); return; } // dev: no pre-cache
  // Pre-cache each file on its own so one failed fetch can't abort the whole install.
  e.waitUntil(caches.open(APB_CACHE).then(function (c) {
    return Promise.all(APB_FILES.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('apb-') === 0 && k !== APB_CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// On localhost / 127.0.0.1 (local development) the book files are NOT served from cache: while the
// content is being rebuilt, stale-while-revalidate would show last build's text on the first reload
// after every `node tools/build-asset-playbooks.js` and read as "my change didn't apply".
var DEV_HOST = /^(localhost|127\.0\.0\.1)$/.test(self.location.hostname);
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (!DEV_HOST && req.method === 'GET' && (req.url.indexOf('/assets/playbooks/') > -1 || req.url.indexOf('/assets/port/') > -1 || req.url.indexOf('/mockup/playbook-pdf/') > -1)) {
    e.respondWith(caches.open(APB_CACHE).then(function (c) {
      return c.match(req).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && res.ok) c.put(req, res.clone());
          return res;
        }).catch(function () { return hit; });
        return hit || net;
      });
    }));
    return;
  }
  e.respondWith(fetch(req));
});
