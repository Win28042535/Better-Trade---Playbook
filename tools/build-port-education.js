#!/usr/bin/env node
/* Playbook "พอร์ต" tab exporter (2026-10-08, Education Edition / ทาง ข, phase 1) — pulls the content
   team's DATA blob out of their standalone demo file (BT2026_Playbook_EducationEdition_Demo_*.html,
   content 2026-09-30.2) and writes the lazy-loaded file the app reads: assets/port/edu.js.

   Usage:  node tools/build-port-education.js "<path to BT2026_Playbook_EducationEdition_Demo_*.html>"

   Why .js and not .json: same reason as tools/build-asset-playbooks.js — the app also runs from
   file://, where fetch() of a local JSON is blocked; a <script src> assigning window.PORT_EDU_DATA
   loads either way.

   Kept (same for every player): 10-year history (5 sample levels x 11 Thai/foreign splits + monthly
   returns), the 5-level range table, mirror / calculator / own-portfolio texts.
   Dropped:
   - the references (and the [n] citation marks) and the 9-item disclaimer section (removed from the tab per direction 2026-10-08) and the banner's pointer to it
     ("· อ่านข้อจำกัดท้ายบท");
   - the demo's 3 fictional players (their per-player market lessons, patterns A–E and advisor
     questions are server output with no rules shipped — can't be recomputed for a real player);
   - every leftover ทาง ก string ("ระดับคุณ", "พอร์ตที่เหมาะกับคุณตอนนี้", over/under-range verdicts);
   - the financial-profile / consent block (phase 2 — its copy promises server storage this
     standalone build doesn't have), and the "saved" variants of the own-portfolio copy;
   - the per-player "สนใจ" flags on the range table.
   The advisor card ("เอาหน้านี้ไปคุยกับผู้แนะนำการลงทุน" + "เล่าให้ผู้แนะนำฟังด้วย") was removed from the tab per direction
   2026-10-08, so its text and the per-player sentence templates are no longer exported. */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) {
  console.error('usage: node tools/build-port-education.js "<path to BT2026_Playbook_EducationEdition_Demo_*.html>"');
  process.exit(1);
}
const OUT_DIR = path.join(__dirname, '..', 'assets', 'port');
const OUT = path.join(OUT_DIR, 'edu.js');

const html = fs.readFileSync(SRC, 'utf8');
const m = html.match(/^const DATA = (\{.*\});\s*$/m);
if (!m) throw new Error('DATA blob not found in the demo file');
const D = JSON.parse(m[1]);
const fail = (msg) => { throw new Error(msg); };

const C = D.content, E = C.education, PC = C.portfolio_check, HIS = D.history;
const gds = D.personas.map((p) => p.gd);
const g0 = gds[0];
if (g0.allocation.mode !== 'education') fail('demo is not the education edition (allocation.mode)');

/* Sections that must be identical for every player — if a new demo makes one of them per-player,
   it can no longer live in one shared file. */
for (const k of ['banner', 'disclaimer', 'portfolio_check', 'ui']) {
  const s = JSON.stringify(g0[k]);
  if (gds.some((g) => JSON.stringify(g[k]) !== s)) fail(`gd.${k} differs between players`);
}

const al = g0.allocation;
const table = {
  title: al.title, intro: al.intro, intro_more: al.intro_more, derived_note: al.derived_note,
  level_col: al.level_col, pick: al.pick,
  levels: al.levels.map((lv) => ({
    value: lv.value, label: lv.label,
    ranges: lv.ranges.map((r) => ({ bucket: r.bucket, label: r.label, lo: r.lo, hi: r.hi, range_text: r.range_text })),
  })),
  how: { title: al.how.title, items: al.how.items, more: al.how.more, cta: al.how.cta },
};
// Ranges must not depend on the player either (only the dropped "สนใจ" flag may).
const strip = (a) => JSON.stringify(a.levels.map((lv) => lv.ranges.map((r) => [r.bucket, r.lo, r.hi, r.range_text])));
if (gds.some((g) => strip(g.allocation) !== strip(al))) fail('range table differs between players');


// History texts the tab uses — ทาง ก lines ("ระดับคุณ…", "พอร์ตที่เหมาะกับคุณตอนนี้…") left out.
const T = HIS.texts;
const texts = {};
for (const k of ['source', 'disclaimer', 'split_title', 'split_note', 'split_template', 'split_ends', 'sample_line',
  'ladder_title', 'ladder_legend', 'ladder_summary', 'ladder_pick', 'growth_today', 'growth_drop',
  'bucket_short', 'row_label', 'avg_label', 'growth_bottom', 'growth_compare_hi', 'growth_compare_lo',
  'growth_title_amount', 'growth_base_amount', 'growth_drop_baht', 'amount_label', 'amounts',
  'amount_custom', 'calc_note']) texts[k] = T[k] != null ? T[k] : fail(`history.texts.${k} missing`);

const history = {
  period: HIS.period, months: HIS.months, default_foreign: HIS.default_foreign, foreign_steps: HIS.foreign_steps,
  levels: HIS.levels, by_foreign: HIS.by_foreign, monthly_returns: D.history_full.monthly_returns,
};

const port = {
  title: E.port_title, input_intro: PC.input_intro, inputs: PC.input_buckets, input_map: PC.input_map,
  sum_label: g0.portfolio_check.labels.sum_label, sum_error: g0.portfolio_check.labels.sum_error,
  submit: E.port_submit, redo: g0.portfolio_check.labels.redo, saved_no: g0.portfolio_check.labels.saved_no,
  unmeasured: g0.portfolio_check.labels.history_unmeasured, outside_note: PC.outside_note,
  mix: E.port_mix, compare_title: E.port_compare_title, cols: E.port_cols, yours: E.port_yours,
  split_note: E.port_split_note, no_verdict: E.port_no_verdict,
};

/* The banner ends with a pointer to the disclaimer section at the end of the chapter; that section is not in this tab,
   so the pointer goes too. */
const POINTER = ' · อ่านข้อจำกัดท้ายบท';
if (!g0.banner.endsWith(POINTER)) fail('banner no longer ends with the disclaimer pointer; check the new wording');
const banner = g0.banner.slice(0, -POINTER.length);

const out = {
  meta: { content_version: D.meta.content_version, built: new Date().toISOString().slice(0, 10), source: path.basename(SRC) },
  banner, table, texts, history, mirror: E.mirror, port,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, '/* generated by tools/build-port-education.js — do not edit by hand */\n' +
  'window.PORT_EDU_DATA=' + JSON.stringify(out) + ';\n');
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB) · content ${out.meta.content_version}`);
