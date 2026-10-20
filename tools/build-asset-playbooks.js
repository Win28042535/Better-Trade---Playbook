#!/usr/bin/env node
/* Asset Playbooks exporter (2026-10-06) — converts the content team's verified source
   (the BT2026_AssetPlaybooks folder's _source: data/<id>.json + shorts/<id>.json) into the lazy-loaded
   files the app reads from assets/playbooks/.

   Usage:  node tools/build-asset-playbooks.js "<path to _source>"

   Why .js and not .json: the app also runs from file:// (no dev server), where fetch() of a local
   JSON is blocked — a <script src> that assigns into window.ASSET_PB_DATA loads either way.

   Kept: everything a reader sees in the source's own full edition. Dropped: open_issues and
   language_guard (internal notes for the team / IC-IP review, not reader content) and the
   source records' verification metadata (verified/kind/lang/scope/what_it_supports).
   Shorts are matched to their full answer by exact question text / basics term, the same rule the
   source's build_playbooks.py uses; an unmatched short or a number in a short that isn't in its full
   answer aborts the build, so a stale summary can never reach the app. */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(path.join(SRC, 'data'))) {
  console.error('usage: node tools/build-asset-playbooks.js "<path to _source>"');
  process.exit(1);
}
const OUT = path.join(__dirname, '..', 'assets', 'playbooks');

/* Order + grouping = the source's own NAV_GROUPS (build_playbooks.py). Icons are picked from this
   app's own lc-* sprite (no new glyphs). */
/* 2026-10-12: 18 books / 4 groups (source round of 9 Oct: + allocation, global, tfex, snote and the
   "อนุพันธ์และผลิตภัณฑ์ซับซ้อน" group). global takes lc-globe, so dr moves to lc-plane (= "abroad"; picked by
   the user from 4 options, 2026-10-12). */
/* Group membership, order and titles follow the real product's preview (2026-10-20, per direction "ให้ของในระบบสัมพันธ์
   กับ preview"): AI INVESTING sits with the derivatives, the 4th group is "…สุขภาพการเงิน", ASSET ALLOCATION closes group 1.
   The preview's "ETF" / "DW" / "OPTIONS" cards open exactly the GLOBAL STOCK / TFEX / STRUCTURED NOTE books (checked
   2026-10-20: same key questions and text) — those slots keep the real book names here, not the preview's card labels. */
const GROUPS = [
  { t: 'ภาพใหญ่ หุ้น และตราสาร', ids: ['macro', 'stock', 'bond', 'fund', 'dr', 'global', 'allocation'] },
  { t: 'อนุพันธ์และผลิตภัณฑ์ซับซ้อน', ids: ['ai', 'tfex', 'snote'] },
  { t: 'สินทรัพย์ทางเลือก', ids: ['gold', 'realestate', 'crypto', 'collectible'] },
  { t: 'วางแผน ป้องกัน และสุขภาพการเงิน', ids: ['tax', 'insurance', 'longevity', 'scam'] },
];
const ICON = {
  macro: 'lc-compass', allocation: 'lc-sliders', stock: 'lc-trending-up', global: 'lc-globe',
  bond: 'lc-landmark', fund: 'lc-pie-chart', dr: 'lc-plane', tfex: 'lc-zap', snote: 'lc-target',
  gold: 'lc-gold-bars', realestate: 'lc-building-2', crypto: 'lc-bitcoin',
  collectible: 'lc-gem', tax: 'lc-file-text', insurance: 'lc-shield', longevity: 'lc-hourglass',
  ai: 'lc-sparkles', scam: 'lc-alert-triangle',
};
/* Every source id a book cites (refs arrays + "(S2, S7)" written inside text) must be in its sources list,
   and every book in GROUPS must exist in the source — same rule the source's build_playbooks.py warns on;
   here it aborts, so a dangling citation can never reach the app. */
const INLINE_REF = /[(\[]\s*S\d+(?:\s*[,;/]\s*S\d+)*\s*[)\]]/g;
function citedIds(o, out = new Set()) {
  if (Array.isArray(o)) o.forEach(x => citedIds(x, out));
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) {
      if (k === 'sources') continue;
      if (k === 'refs' && Array.isArray(v)) v.forEach(r => out.add(String(r).trim()));
      else citedIds(v, out);
    }
  } else if (typeof o === 'string') (o.match(INLINE_REF) || []).forEach(m => (m.match(/S\d+/g) || []).forEach(r => out.add(r)));
  return out;
}
const ALL_IDS = GROUPS.flatMap(g => g.ids);

/* Step 2 (2026-10-12) — the source round of 9 Oct adds three reader layers, each attached here to the record it
   belongs to so the app needs no lookups: step.visual (visual/<id>.json: quick table, how-to, panels, takeaways),
   step.action_tables (action_tables.json: the header row for an action that says "ทำตาราง A | B | C", keyed by
   action number from 1) and key_question.labels (answer_labels.json: the "xxx:" points the full answer breaks at).
   The source's own build guards are repeated, so a summary can never say more than its step: no number in a
   visual summary that is not in that step's full text, one how-to item per action, every answer label found. */
const readJson = f => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {});
const ACTION_TABLES = readJson(path.join(SRC, 'action_tables.json'));
const ANSWER_LABELS = readJson(path.join(SRC, 'answer_labels.json'));
const vNums = s => new Set((String(s || '').match(/\d[\d,]*(?:\.\d+)?/g) || []).map(n => n.replace(/,/g, '').replace(/\.$/, '')));
const vStrings = (o, out = []) => {
  if (typeof o === 'string') out.push(o);
  else if (Array.isArray(o)) o.forEach(x => vStrings(x, out));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (k !== 'refs' && k !== 'howto_title') vStrings(v, out);
  return out;
};
const stepText = s => [s.title, s.code, s.goal, s.pitfall || '', ...(s.actions || []), ...(s.ask_yourself || []),
  ...(s.tools || []).map(t => `${t.name || ''} ${t.use_for || ''}`)].join(' ');
function attachLayers(id, d) {
  const vis = readJson(path.join(SRC, 'visual', id + '.json')).steps || {};
  for (const s of d.steps) {
    const v = vis[String(s.n)];
    if (v) {
      const allowed = vNums(stepText(s)), extra = [...vNums(vStrings(v).join(' '))].filter(x => !allowed.has(x));
      if (extra.length) throw new Error(`${id}: visual summary of step ${s.n} has numbers not in the step: ${extra.join(', ')}`);
      if ((v.howto || []).length !== (s.actions || []).length) throw new Error(`${id}: step ${s.n} visual has ${(v.howto || []).length} how-to items for ${(s.actions || []).length} actions`);
      s.visual = v;
    }
    const at = (ACTION_TABLES[id] || {})[String(s.n)];
    if (at) s.action_tables = at;
  }
  for (const q of d.key_questions || []) {
    const labels = (ANSWER_LABELS[id] || {})[q.q];
    if (!labels) continue;
    let pos = 0;
    for (const lb of labels) {
      const i = q.a.indexOf(lb + ':', pos);
      if (i < 0 || (i > 0 && !/\s/.test(q.a[i - 1]))) throw new Error(`${id}: answer label "${lb}" not found in "${q.q.slice(0, 40)}"`);
      pos = i + lb.length + 1;
    }
    q.labels = labels;
  }
}

const nums = s => (String(s).match(/\d[\d,.]*/g) || []).map(n => n.replace(/[,.]$/, ''));
function checkShort(id, key, short, full) {
  const fullNums = new Set(nums(full));
  const bad = nums(short).filter(n => !fullNums.has(n));
  if (bad.length) throw new Error(`${id}: short for "${key.slice(0, 40)}" has numbers not in the full text: ${bad.join(', ')}`);
}

/* House spelling (per direction 2026-10-06): "คริปโต", never "คริปโท", in everything the reader sees. The
   cited source records are left alone — their titles/publishers are other people's published names. */
const fixSpelling = (o, skipKeys = []) => {
  if (typeof o === 'string') return o.replace(/คริปโท/g, 'คริปโต');
  if (Array.isArray(o)) return o.map(x => fixSpelling(x, skipKeys));
  if (o && typeof o === 'object') {
    const r = {};
    for (const [k, v] of Object.entries(o)) r[k] = skipKeys.includes(k) ? v : fixSpelling(v, skipKeys);
    return r;
  }
  return o;
};

const pick = (o, keys) => keys.reduce((r, k) => (o[k] !== undefined && (r[k] = o[k]), r), {});

fs.mkdirSync(OUT, { recursive: true });
const index = [];
/* "เล่ม N/18" keeps the source's own book order (the preview numbers STOCK 3/18 the same way), independent of how GROUPS
   arranges the books on screen. */
const BOOK_NO = ['macro', 'allocation', 'stock', 'global', 'bond', 'fund', 'dr', 'tfex', 'snote', 'gold', 'realestate', 'crypto',
  'collectible', 'tax', 'insurance', 'longevity', 'ai', 'scam'];
for (const g of GROUPS) {
  for (const id of g.ids) {
    const n = BOOK_NO.indexOf(id) + 1;
    if (!n) throw new Error(id + ': not in BOOK_NO');
    const d = JSON.parse(fs.readFileSync(path.join(SRC, 'data', id + '.json'), 'utf8'));
    const shortsFile = path.join(SRC, 'shorts', id + '.json');
    const sh = fs.existsSync(shortsFile) ? JSON.parse(fs.readFileSync(shortsFile, 'utf8')) : {};

    for (const [q, s] of Object.entries(sh.key_questions || {})) {
      const kq = d.key_questions.find(x => x.q === q);
      if (!kq) throw new Error(`${id}: short for unknown question "${q.slice(0, 40)}"`);
      checkShort(id, q, s, kq.a); kq.short = s;
    }
    for (const [t, s] of Object.entries(sh.basics || {})) {
      const b = d.basics.find(x => x.term === t);
      if (!b) throw new Error(`${id}: short for unknown term "${t.slice(0, 40)}"`);
      checkShort(id, t, s, b.plain); b.short = s;
    }

    attachLayers(id, d);
    /* fit_matrix + prompt_pack (2026-10-12) and the sources' scope/kind/what_it_supports/verified: the source's
       full edition shows all of them to readers, so they are reader content, not team notes. */
    const book = fixSpelling({
      id, n, group: g.t, icon: ICON[id],
      ...pick(d, ['name_en', 'name_th', 'headline', 'tagline', 'who_for', 'outcome', 'data_asof',
        'key_questions', 'basics', 'fit_matrix', 'method_matrix', 'steps', 'worked_example', 'prompt_pack',
        'takehome', 'red_flags', 'at_event']),
      sources: (d.sources || []).map(s => pick(s, ['id', 'publisher', 'title', 'url', 'scope', 'kind',
        'what_it_supports', 'accessed', 'verified'])),
    }, ['sources']);
    const srcIds = new Set(book.sources.map(s => s.id));
    const dangling = [...citedIds(book)].filter(r => !srcIds.has(r));
    if (dangling.length) throw new Error(`${id}: cites ${dangling.join(', ')} but its sources list has no such id`);
    // "#fund" = a book; "#tax-example" = a section of a book (the source's own anchor names; the app maps them)
    const SECTIONS = ['steps', 'example', 'takehome', 'event', 'flags', 'sources'];
    const okLink = x => ALL_IDS.includes(x) || (/^([a-z]+)-([a-z]+)$/.test(x) && ALL_IDS.includes(RegExp.$1) && SECTIONS.includes(RegExp.$2));
    const xlinks = (JSON.stringify(book).match(/\]\(#([\w-]+)\)/g) || []).map(m => m.slice(3, -1)).filter(x => !okLink(x));
    if (xlinks.length) throw new Error(`${id}: links to unknown book(s) ${[...new Set(xlinks)].join(', ')}`);
    const js = `/* Generated by tools/build-asset-playbooks.js — do not edit by hand. */\n` +
      `(window.ASSET_PB_DATA=window.ASSET_PB_DATA||{})[${JSON.stringify(id)}]=${JSON.stringify(book)};\n`;
    fs.writeFileSync(path.join(OUT, id + '.js'), js);
    index.push(fixSpelling({ id, n, group: g.t, icon: ICON[id], name_en: d.name_en, name_th: d.name_th,
      tagline: d.tagline, data_asof: d.data_asof, sources: book.sources.length, steps: d.steps.length }));
    console.log(`${String(n).padStart(2)} ${id.padEnd(12)} ${(js.length / 1024).toFixed(0)}KB  ${book.sources.length} sources, ${citedIds(book).size} cited`);
  }
}
fs.writeFileSync(path.join(OUT, 'index.js'),
  `/* Generated by tools/build-asset-playbooks.js — do not edit by hand. */\n` +
  `window.ASSET_PB_INDEX=${JSON.stringify({ groups: GROUPS.map(g => g.t), books: index })};\n`);
console.log(`index: ${index.length} books -> ${path.relative(process.cwd(), OUT)}`);
