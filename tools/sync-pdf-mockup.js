#!/usr/bin/env node
/* Playbook PDF mockup sync (2026-10-09) — copies the design team's A4 Playbook mockup (a separate build, deployed at
   the URL below) into mockup/playbook-pdf/, where the app's ดาวน์โหลด Playbook preview shows it in an iframe.
   Kept as a local copy, not a live link, so the preview works without signal at the event and doesn't break if the
   branch-preview URL changes. Re-run whenever the mockup is updated:

     node tools/sync-pdf-mockup.js [url]

   Copies the page (as index.html) + every js/ and assets/ file it references. Some file names are built in its JS
   at runtime ('assets/'+img+'.svg', 'assets/playbook-cover-'+which+'.webp'), so those are listed in DYNAMIC below —
   they were read from the page's own network log; add to it if the preview shows a missing image after a sync. */
'use strict';
const fs = require('fs');
const path = require('path');

const URL0 = process.argv[2] || 'https://playbook-pdf-git-ver2-win999.vercel.app/dna-quiz-flow';
const OUT = path.join(__dirname, '..', 'mockup', 'playbook-pdf');
const base = new URL('./', URL0);

const DYNAMIC = [
  'assets/playbook-cover-front.webp', 'assets/playbook-cover-back.webp',
  'assets/orn-corner.svg', 'assets/orn-asterism.svg', 'assets/topo.svg', 'assets/topo-b.svg',
  'assets/ill-compass.svg', 'assets/ill-scale.svg', 'assets/ill-chart.svg', 'assets/ill-path.svg', 'assets/ill-book.svg', 'assets/ill-quill.svg',
  'assets/sage.jpg', 'assets/waverider.jpg',
  'assets/ICON_HEALTH_PNG.webp', 'assets/ICON_FUND_PNG.webp', 'assets/ICON_STOCK_TH_PNG.webp', 'assets/ICON_STOCK_INTL_PNG.webp', 'assets/ICON_GOLD_PNG.webp', 'assets/ICON_CRYPTO_PNG.webp',
  'assets/eng-fund.svg', 'assets/eng-stockth.svg', 'assets/eng-gold.svg', 'assets/eng-gauge.svg', 'assets/eng-hook.svg', 'assets/eng-lens.svg',
  'assets/eng-hourglass.svg', 'assets/eng-heart.svg', 'assets/eng-steps.svg',
  'assets/eng-cat-basics.svg', 'assets/eng-cat-assets.svg', 'assets/eng-cat-costs.svg', 'assets/eng-cat-risk.svg', 'assets/eng-cat-planning.svg', 'assets/eng-cat-scams.svg',
  'assets/float-stock.png', 'assets/float-heart.png', 'assets/float-bitcoin.png', 'assets/float-gold.png',
];
const REF = /["'(]((?:assets|js)\/[A-Za-z0-9_.\-\/]+\.(?:png|jpe?g|webp|svg|ttf|woff2?|js))/g;

async function get(rel) {
  const res = await fetch(new URL(rel, base));
  if (!res.ok) throw new Error(`${res.status} ${rel}`);
  return Buffer.from(await res.arrayBuffer());
}
(async () => {
  const html = (await fetch(URL0).then((r) => { if (!r.ok) throw new Error(`${r.status} ${URL0}`); return r.text(); }));
  const files = new Set(DYNAMIC);
  for (const m of html.matchAll(REF)) files.add(m[1]);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  let total = html.length, missing = [];
  // js files can reference more assets, so read them first
  for (const f of [...files].filter((x) => x.endsWith('.js'))) {
    const buf = await get(f).catch((e) => { missing.push(e.message); return null; });
    if (!buf) continue;
    for (const m of buf.toString('utf8').matchAll(REF)) files.add(m[1]);
  }
  for (const f of files) {
    const buf = await get(f).catch((e) => { missing.push(e.message); return null; });
    if (!buf) continue;
    const dest = path.join(OUT, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    total += buf.length;
  }
  console.log(`synced ${files.size + 1} files (${(total / 1024 / 1024).toFixed(2)} MB) from ${URL0} -> ${path.relative(process.cwd(), OUT)}`);
  if (missing.length) console.log('not found (skipped):\n  ' + missing.join('\n  '));
})().catch((e) => { console.error(e.message); process.exit(1); });
