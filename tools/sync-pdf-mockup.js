#!/usr/bin/env node
/* Playbook PDF mockup sync (2026-10-09) — copies the design team's A4 Playbook mockup (a separate build, deployed at
   the URL below) into mockup/playbook-pdf/, where the app's ดาวน์โหลด Playbook preview shows it in an iframe.
   Kept as a local copy, not a live link, so the preview works without signal at the event and doesn't break if the
   branch-preview URL changes. Re-run whenever the mockup is updated:

     node tools/sync-pdf-mockup.js [url]
     node tools/sync-pdf-mockup.js --manifest   (only rebuild manifest.json from the local copy, no fetch)

   Copies the page as preview.html — what the app shows (2026-10-26, per direction "pdf เวอร์ล่าสุดที่อยู่ในระบบดูจะไม่ได้
   อัปเดต ให้วิเคราะห์จากลิงค์นี้": the design team's Ver.2 parchment book replaces the product live-playbook copy that
   tools/sync-pdf-live.js wrote; running that tool again would put the product book back) — plus the assets/js/data it uses +
   every js/, data/ and assets/ file it references. Files under assets/ js/ data/ that the new copy no longer uses are
   removed, so the offline pre-fetch (manifest.json) stays the size of the book. Some file names are built in its JS
   at runtime ('assets/'+img+'.svg', 'assets/playbook-cover-'+which+'.webp'), so those are listed in DYNAMIC below —
   they were read from the page's own network log; add to it if the preview shows a missing image after a sync. */
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const ONLY_MANIFEST = process.argv[2] === '--manifest';
const URL0 = (!ONLY_MANIFEST && process.argv[2]) || 'https://playbook-pdf-git-ver2-win999.vercel.app/dna-quiz-flow';
const OUT = path.join(__dirname, '..', 'mockup', 'playbook-pdf');
const base = new URL('./', URL0);

/* read from the Ver.2 page's network log after scrolling every sheet (2026-10-26) — names built at runtime included */
const DYNAMIC = [
  'assets/playbook-cover-front.jpg', 'assets/playbook-cover-back.jpg', 'assets/paper-parchment.jpg', 'assets/toc-compass.png',
  'assets/orn-asterism.svg', 'assets/orn-footer.png', 'assets/topo.svg',
  'assets/baskervville-regular-sub.woff2', 'assets/noto-sans-thai.ttf', 'assets/psl-praewsuda-serif-bold.otf',
  'assets/sarabun-500.ttf', 'assets/sarabun-700.ttf', 'assets/th-sarabun-new.ttf',
  'assets/ill-book.svg', 'assets/ill-chart.svg', 'assets/ill-path.svg', 'assets/ill-quill.svg', 'assets/ill-scale.png', 'assets/ill-telescope.svg',
  'assets/eng-gauge.svg', 'assets/eng-hook.svg', 'assets/eng-hourglass.svg', 'assets/eng-lens.svg', 'assets/eng-side-gauge.svg', 'assets/eng-side-lens.svg',
  'assets/eng-steps.svg', 'assets/eng-stetho.svg', 'assets/eng-stockth.svg',
  'assets/eng-cat-basics.svg', 'assets/eng-cat-assets.svg', 'assets/eng-cat-costs.svg', 'assets/eng-cat-risk.svg', 'assets/eng-cat-planning.svg', 'assets/eng-cat-scams.svg',
  ...['analyst', 'collector', 'contrarian', 'diamondhand', 'explorer', 'guardian', 'harvester', 'maverick', 'planner', 'sage', 'steadyhand', 'waverider'].map((k) => `assets/art-${k}.webp`),
];
/* assets/ + js/ + data/ (2026-10-15: the mockup's พอร์ต sheet loads data/app/port/edu.js, byte-identical to the app's assets/port/edu.js) */
const REF = /["'(]((?:assets|js|data)\/[A-Za-z0-9_.\-\/]+\.(?:png|jpe?g|webp|svg|ttf|woff2?|js))/g;

async function get(rel) {
  const res = await fetch(new URL(rel, base));
  if (!res.ok) throw new Error(`${res.status} ${rel}`);
  return Buffer.from(await res.arrayBuffer());
}
/* manifest.json (2026-10-15) — the list sw.js pre-fetches so the preview opens offline (app: pdfPrefetch()). Built from
   what is actually in the folder, so it never names a file that 404s (sw.js stores all-or-nothing); v = content hash, so
   any change to the copy makes the app's next visit build a fresh cache. */
function writeManifest() {
  const files = [];
  const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full); else files.push(path.relative(OUT, full).split(path.sep).join('/'));
  } };
  walk(OUT);
  const list = files.filter((f) => f !== 'manifest.json').sort();
  const h = crypto.createHash('sha1');
  for (const f of list) { h.update(f); h.update(fs.readFileSync(path.join(OUT, f))); }
  const v = h.digest('hex').slice(0, 10);
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ v, files: list }, null, 1) + '\n');
  console.log(`manifest.json: ${list.length} files, v ${v}`);
}
if (ONLY_MANIFEST) { writeManifest(); process.exit(0); }
(async () => {
  const html = (await fetch(URL0).then((r) => { if (!r.ok) throw new Error(`${r.status} ${URL0}`); return r.text(); }));
  const files = new Set(DYNAMIC);
  for (const m of html.matchAll(REF)) files.add(m[1]);
  /* names the page assembles at runtime from arrays (2026-10-15: a new "eng-stetho.svg" slipped through the DYNAMIC list):
     SIDE_FIG=['gauge',…] -> assets/eng-<name>.svg, and bare file names in src:'eng-fund.svg' style objects -> assets/<name> */
  for (const arr of html.matchAll(/SIDE_FIG\s*=\s*\[([^\]]*)\]/g)) for (const n of arr[1].matchAll(/['"]([a-z0-9-]+)['"]/g)) files.add(`assets/eng-${n[1]}.svg`);
  for (const m of html.matchAll(/\bsrc\s*:\s*['"]([A-Za-z0-9_.\-]+\.(?:png|jpe?g|webp|svg))['"]/g)) files.add(`assets/${m[1]}`);
  fs.mkdirSync(OUT, { recursive: true });
  /* write only what changed, and retry: on Windows a file that was just rewritten (or is open in the dev server / a scanner)
     can fail a second write straight away with "UNKNOWN: unknown error, open" (seen 2026-10-15) */
  const writeSafe = async (dest, buf) => {
    try { if (fs.existsSync(dest) && Buffer.compare(fs.readFileSync(dest), Buffer.from(buf)) === 0) return; } catch (e) { /* fall through to write */ }
    for (let i = 0; ; i++) {
      try { fs.writeFileSync(dest, buf); return; } catch (e) { if (i >= 4) throw e; await new Promise((r) => setTimeout(r, 400 * (i + 1))); }
    }
  };
  // preview.html, not index.html: Vercel cleanUrls redirects index.html to the folder URL. demo.html (the older demo kept
  // beside the product book, 2026-10-20) is superseded by this copy.
  await writeSafe(path.join(OUT, 'preview.html'), html);
  for (const old of ['index.html', 'demo.html']) try { fs.unlinkSync(path.join(OUT, old)); } catch (e) { /* already gone */ }
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
    await writeSafe(dest, buf);
    total += buf.length;
  }
  console.log(`synced ${files.size + 1} files (${(total / 1024 / 1024).toFixed(2)} MB) from ${URL0} -> ${path.relative(process.cwd(), OUT)}`);
  if (missing.length) console.log('not found (skipped):\n  ' + missing.join('\n  '));
  // prune what this copy doesn't use (only after a full sync, and only under assets/ js/ data/)
  const keep = new Set([...files].filter((f) => fs.existsSync(path.join(OUT, f))));
  const pruned = [];
  const walk = (dir) => { if (!fs.existsSync(dir)) return; for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name), rel = path.relative(OUT, full).split(path.sep).join('/');
    if (e.isDirectory()) walk(full); else if (!keep.has(rel)) { fs.unlinkSync(full); pruned.push(rel); }
  } };
  for (const d of ['assets', 'js', 'data']) walk(path.join(OUT, d));
  if (pruned.length) console.log(`removed ${pruned.length} unused: ${pruned.join(', ')}`);
  writeManifest();
})().catch((e) => { console.error(e.message); process.exit(1); });
