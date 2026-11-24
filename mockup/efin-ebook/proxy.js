/* Local mockup server for the efin.finance Better Trade 2026 event page + the E-BOOK sections.
   The live site sends no CORS headers, so a plain saved copy can't load its fonts or its module scripts (the Liquid Metal
   button). This serves the patched page (index.html, built by build.js) at the page's real path and proxies every other
   request to www.efin.finance, so the page runs same-origin exactly as it does live. Local files for the mockup live under
   /events/better-trade/better-trade2026/mock-ebook/. Run: node proxy.js  →  http://localhost:8740/ */
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path');
const PORT = +process.env.PORT || 8740, ORIGIN = 'https://www.efin.finance';
const PAGE = '/events/better-trade/better-trade2026', MOCK = PAGE + '/mock-ebook/';
const TYPES = { '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.css': 'text/css', '.js': 'application/javascript', '.html': 'text/html; charset=utf-8' };
const cache = new Map();

function fetchUp(url, redirects = 5) {
  return new Promise((ok, no) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (mockup preview)', 'Accept-Encoding': 'identity' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && redirects) {
        r.resume(); return ok(fetchUp(new URL(r.headers.location, url).href, redirects - 1));
      }
      const parts = []; r.on('data', (c) => parts.push(c));
      r.on('end', () => ok({ status: r.statusCode, type: r.headers['content-type'] || 'application/octet-stream', body: Buffer.concat(parts) }));
    }).on('error', no);
  });
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const p = decodeURIComponent(u.pathname);
  if (p === '/' || p === PAGE || p === PAGE + '/') {
    if (p === '/') { res.writeHead(302, { Location: PAGE }); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store' });
    return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }
  if (p.startsWith(MOCK)) {
    const f = path.join(__dirname, path.normalize(p.slice(MOCK.length)).replace(/^([/\\])+/, ''));
    if (!f.startsWith(__dirname) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    const head = { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' };
    if (path.extname(f) === '.pdf') head['Content-Disposition'] = 'attachment; filename="The_Capital_Playbook_2027.pdf"';
    res.writeHead(200, head);
    return fs.createReadStream(f).pipe(res);
  }
  try {
    const key = u.pathname + u.search;
    let hit = cache.get(key);
    if (!hit) { hit = await fetchUp(ORIGIN + key); if (hit.status === 200) cache.set(key, hit); }
    res.writeHead(hit.status, { 'Content-Type': hit.type });
    res.end(hit.body);
  } catch (e) { res.writeHead(502); res.end(String(e)); }
}).listen(PORT, () => console.log('efin e-book mockup on http://localhost:' + PORT + PAGE));
