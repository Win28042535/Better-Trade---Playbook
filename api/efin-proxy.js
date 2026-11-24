/* Same-origin proxy for the E-BOOK mockup (mockup/efin-ebook) on Vercel.
   The mockup page is a copy of the live efin.finance event page and loads that site's CSS, fonts and module scripts
   from /events/… — which only work same-origin (no CORS). A plain vercel.json external rewrite can't be used:
   Vercel adds X-Forwarded-Host, and efin's nginx answers 404 for any host but its own. This function fetches the file
   from www.efin.finance itself, so no forwarding headers are sent. Routed from vercel.json: /events/(.*) → ?p=$1. */
const ORIGIN = 'https://www.efin.finance/events/';

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.searchParams.get('p') || '';
  url.searchParams.delete('p');
  if (p.includes('..')) { res.statusCode = 400; return res.end(); }
  const qs = url.searchParams.toString();
  try {
    const up = await fetch(ORIGIN + p + (qs ? '?' + qs : ''), { headers: { 'User-Agent': 'Mozilla/5.0 (efin e-book mockup preview)' }, redirect: 'follow' });
    res.statusCode = up.status;
    res.setHeader('Content-Type', up.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Cache-Control', up.ok ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store');
    res.end(Buffer.from(await up.arrayBuffer()));
  } catch (e) {
    res.statusCode = 502;
    res.end('proxy error');
  }
};
