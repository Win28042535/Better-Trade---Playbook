// Service worker. Two jobs:
//  1. Exists so Chrome/Android treat the app as "installable" (its criteria require an active SW with a
//     fetch handler, not just a manifest).
//  2. (2026-10-06, Asset Knowledge phase 3) Keeps the Asset Knowledge book files readable when the
//     signal drops mid-event: index.js + the 18 <id>.js files under assets/playbooks/ are pre-cached
//     on install and served cache-first, refreshed in the background (stale-while-revalidate).
//     Same for the Playbook พอร์ต tab's data file, assets/port/edu.js (2026-10-08), and the PDF preview's A4 mockup
//     (mockup/playbook-pdf/, ~4MB, 2026-10-09) — not pre-cached on install; since 2026-10-15 fetched whole on request
//     from the app (pdfPrefetch below), and still kept file-by-file once opened.
//
// Everything ELSE is still plain network pass-through, deliberately NOT cached: the app is under
// active development and a caching SW would risk serving a stale dna-quiz-flow.html to installed
// users after every edit. Revisit for the app shell once the build is stable.
//
// Bump APB_CACHE when the book file list changes (tools/build-asset-playbooks.js) so a stale cache is
// dropped on activate.
var APB_CACHE = 'apb-v4'; // v4 2026-10-22: + assets/agenda.js // v3 2026-10-12: 18 books (+ allocation, global, tfex, snote)
var APB_FILES = ['index', 'macro', 'allocation', 'stock', 'global', 'bond', 'fund', 'dr', 'tfex', 'snote',
  'gold', 'realestate', 'crypto', 'collectible', 'tax', 'insurance', 'longevity', 'ai', 'scam'].map(function (f) { return 'assets/playbooks/' + f + '.js'; })
  .concat(['assets/port/edu.js', 'assets/agenda.js']); // Playbook พอร์ต tab data (2026-10-08, tools/build-port-education.js)

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
// PDF preview offline copy (2026-10-15): the app posts {type:'pdf-prefetch'} when a player reaches the Playbook (idle).
// The whole mockup listed in mockup/playbook-pdf/manifest.json goes into its own cache 'pdf-<v>' with addAll (all or
// nothing — a failed run deletes the cache, so a half copy never counts); older pdf-* caches are dropped only after a new
// one is complete. v is the content hash the sync tool writes, so re-syncing the mockup = a new cache on next visit.
// Runs on localhost too (so it can be checked), but the fetch handler below only serves from it off localhost.
var PDF_DIR = 'mockup/playbook-pdf/';
function pdfPrefetch() {
  return fetch(PDF_DIR + 'manifest.json', { cache: 'no-store' }).then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (m) {
    var name = 'pdf-' + m.v;
    var reqs = m.files.map(function (f) { return new Request(PDF_DIR + f, { cache: 'no-cache' }); });
    return caches.open(name).then(function (c) {
      return c.keys().then(function (k) {
        if (k.length >= reqs.length) return; // already complete
        return c.addAll(reqs).catch(function (err) { return caches.delete(name).then(function () { throw err; }); });
      });
    }).then(function () { return caches.keys(); }).then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('pdf-') === 0 && k !== name; })
        .map(function (k) { return caches.delete(k); }));
    });
  }).catch(function () {});
}
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'pdf-prefetch') e.waitUntil(pdfPrefetch());
});
// A response that came through a redirect can't answer a page navigation (the browser rejects it and the iframe shows an
// error page — what broke the preview on Vercel, 2026-10-15: cleanUrls redirects the mockup's .html). Re-wrap it as a
// plain response before serving.
function unredirect(res) {
  if (!res || !res.redirected) return res;
  return res.blob().then(function (b) { return new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers }); });
}
function pdfHit(req) {
  return caches.keys().then(function (keys) {
    var k = keys.filter(function (n) { return n.indexOf('pdf-') === 0; })[0];
    return k ? caches.open(k).then(function (c) { return c.match(req); }) : null;
  });
}
function swr(req) {
  return caches.open(APB_CACHE).then(function (c) {
    return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) c.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  });
}
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (!DEV_HOST && req.method === 'GET' && req.url.indexOf('/mockup/playbook-pdf/') > -1) {
    // the complete pre-fetched copy first; anything it lacks (or before it exists) as before
    e.respondWith(pdfHit(req).then(function (hit) { return hit || swr(req); }).then(unredirect));
    return;
  }
  if (!DEV_HOST && req.method === 'GET' && (req.url.indexOf('/assets/playbooks/') > -1 || req.url.indexOf('/assets/port/') > -1 || req.url.indexOf('/assets/agenda.js') > -1)) {
    e.respondWith(swr(req).then(unredirect));
    return;
  }
  e.respondWith(fetch(req));
});
