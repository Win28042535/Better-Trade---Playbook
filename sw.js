// Minimal service worker — exists only so Chrome/Android treat the app as "installable" (its
// criteria require an active SW with a fetch handler, not just a manifest). Deliberately does NOT
// cache anything: this app is still under active development, and a caching SW would risk serving
// stale dna-quiz-flow.html to installed users after every edit. Revisit with a real cache strategy
// once the app is closer to a stable release build.
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) { e.respondWith(fetch(e.request)); });
