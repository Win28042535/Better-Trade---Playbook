#!/usr/bin/env node
/* Agenda + ticket facts from the registration website (2026-10-22, per direction "ใช้ข้อมูลอ้างอิงจริงตามเว็บลงทะเบียนทั้งหมด").
   The Home "กำหนดการ" card shows every room of both days — Conference (เวทีใหญ่), Experience (โซนกิจกรรม), Workshop
   (คลาสลงมือทำ, 2 rooms) and Master Class (คลาสเชิงลึก) — straight from the site's agenda tables, plus which ticket
   gets into each room and the Master Class prices from its ticket section. Re-run whenever the site changes (it notes
   "Session อาจมีการปรับเปลี่ยนตามความเหมาะสม"):

     node tools/sync-agenda.js [url]

   Writes assets/agenda.js (window.BT_AGENDA), loaded by a plain <script> in dna-quiz-flow.html so it works on file:// too.
   Speaker photos are deliberately not copied (user's call, 2026-10-22). */
'use strict';
const fs = require('fs');
const path = require('path');

const URL0 = process.argv[2] || 'https://better-trade-2026.vercel.app/';
const OUT = path.join(__dirname, '..', 'assets', 'agenda.js');

const ent = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const text = (s) => ent(String(s || '').replace(/<!--[\s\S]*?-->/g, '').replace(/<br[^>]*>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const grab = (s, cls) => { const m = new RegExp('<[^>]+class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>([\\s\\S]*?)</(?:p|span|a|dd|small|h3|strong)>').exec(s); return m ? text(m[1]) : ''; };

(async () => {
  const html = await fetch(URL0).then((r) => { if (!r.ok) throw new Error(`${r.status} ${URL0}`); return r.text(); });

  /* ── ticket plans: access per room + Master Class prices ── */
  const plans = {};
  for (const m of html.matchAll(/<article class="ticket__plan ticket__plan--(\w+)[^"]*"[\s\S]*?<\/article>/g)) {
    const a = m[0];
    plans[m[1]] = {
      name: grab(a, 'ticket__plan-header') ? text((/<h3[^>]*>([\s\S]*?)<\/h3>/.exec(a) || [])[1]) : m[1],
      note: grab(a, 'ticket__plan-note'),
      prices: [...a.matchAll(/<button class="ticket__price[\s\S]*?<\/button>/g)].map((b) => ({
        day: grab(b[0], 'ticket__price-day'), baht: text((/<strong>([\s\S]*?)<small/.exec(b[0]) || [])[1]), note: grab(b[0], 'ticket__price-note'),
      })),
      access: Object.fromEntries([...a.matchAll(/ticket__access-label--(\w+)[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/g)].map((x) => [x[1], text(x[2])])),
    };
  }
  if (!plans.explorer || !plans.ultimate || !plans.master) throw new Error('ticket plans not found — has the site changed?');

  /* ── agenda panels ── */
  const DAYS = [{ id: 'one', d: 1, date: '31 ต.ค. 2569' }, { id: 'two', d: 2, date: '1 พ.ย. 2569' }];
  const ROOMS = [
    { id: 'main-stage', key: 'conf', label: 'Conference', th: 'เวทีใหญ่', acc: 'conference' },
    { id: 'mini-stage', key: 'exp', label: 'Experience', th: 'โซนกิจกรรม', acc: 'experience' },
    { id: 'workshop', key: 'ws', label: 'Workshop', th: 'คลาสลงมือทำ', acc: 'workshop' },
    { id: 'private-class', key: 'mc', label: 'Master Class', th: 'คลาสเชิงลึก', acc: 'private' },
  ];
  const mcPrice = {}; plans.master.prices.forEach((p) => { mcPrice[p.note.toUpperCase()] = p.baht + ' บาท'; });
  const panelHTML = (id) => {
    const k = `id="${id}" class="agenda__panel"`, i = html.indexOf(k); if (i < 0) throw new Error('panel ' + id + ' not found');
    const j = html.indexOf('class="agenda__panel"', i + k.length); return html.slice(i, j < 0 ? undefined : j);
  };
  const days = DAYS.map((D) => ({
    d: D.d, date: D.date,
    rooms: ROOMS.map((R) => {
      const p = panelHTML(`agenda-day-${D.id}-${R.id}`);
      const tables = [...p.matchAll(/<table[\s\S]*?<\/table>/g)].map((t) => ({
        room: text((/<caption[^>]*>([\s\S]*?)<\/caption>/.exec(t[0]) || [])[1]).replace(/^กำหนดการ\s*/, '').replace(/\s*วันที่.*$/, ''),
        rows: [...t[0].matchAll(/<tr>\s*<th scope="row">([\s\S]*?)<\/tr>/g)].map((r) => {
          const row = { time: text((/<time>([\s\S]*?)<\/time>/.exec(r[1]) || [])[1]), t: grab(r[1], 'agenda__session-title') };
          const sum = grab(r[1], 'agenda__session-summary'), by = grab(r[1], 'agenda__session-speaker');
          if (sum) row.sum = sum;
          if (by) row.by = /^to be determined$/i.test(by) ? 'รอประกาศ' : by;
          const act = /class="[^"]*agenda__session-action[^"]*" href="([^"]+)"/.exec(r[1]);
          if (act) { row.buy = act[1]; if (mcPrice[row.t.toUpperCase()]) row.price = mcPrice[row.t.toUpperCase()]; }
          return row;
        }),
      }));
      const ex = plans.explorer.access[R.acc] || '';
      return { key: R.key, label: R.label, th: R.th, access: /รวมในบัตร/.test(ex) ? 'รวมในทุกบัตร' : ex, tables };
    }),
  }));
  const note = text((/\*หมายเหตุ[^<]*/.exec(html) || [''])[0]);
  const out = { src: URL0, synced: new Date().toISOString().slice(0, 10), note, days,
    plans: Object.fromEntries(Object.entries(plans).map(([k, v]) => [k, { name: v.name, note: v.note, prices: v.prices }])) };
  fs.writeFileSync(OUT, '/* Generated by tools/sync-agenda.js from the registration website — do not edit by hand. */\nwindow.BT_AGENDA=' + JSON.stringify(out) + ';\n');
  console.log('assets/agenda.js: ' + days.map((d) => 'day ' + d.d + ': ' + d.rooms.map((r) => r.key + ' ' + r.tables.reduce((n, t) => n + t.rows.length, 0)).join(', ')).join(' | '));
  console.log('access: ' + days[0].rooms.map((r) => r.key + '=' + r.access).join(' · '));
  console.log('plans: ' + Object.values(out.plans).map((p) => p.name + ' ' + p.prices.map((x) => x.baht).join('/')).join(' · '));
})().catch((e) => { console.error(e.message); process.exit(1); });
