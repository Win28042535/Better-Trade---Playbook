# Better Trade 2026 — Data Baseline (canonical, supersedes prior content)

**Status: this is the latest content baseline for the whole Digital Playbook / DNA Quiz project, as of 2026-08-11.**
Source: `Playbook Final.html` (a bundled React event-companion app export, ~29MB on disk,
real payload ~840KB once unwrapped from the bundler's bootstrap shell — see extraction note
at the bottom). This supersedes the prior "Name and Define Personality Character BetterTrade"
PDF-sourced persona data that [`dna-quiz-flow.html`](dna-quiz-flow.html) originally shipped with.

**What's already ported into `dna-quiz-flow.html` (done):** section 1–2 below (FAMILIES + HEROES,
including radar/skills/legend/assets), applied to the "คู่มือลงทุนของคุณ" (book/result) page,
keeping the current Design DNA (editorial CSS cards, Trirong serif, Lucide icons, spectrum
accents) untouched — only content/copy changed, not visual system. The 12 hero **key slugs**
(guardian/harvester/steadyhand/diamondhand/analyst/planner/explorer/sage/maverick/waverider/
contrarian/collector) were kept as internal IDs so quiz-scoring (S2 vote targets), the demo
persona picker, and PICON glyphs needed no code changes — only their content fields were
refreshed. Mapping used (by family + legend-match): guardian→Safe Harbor, harvester→Dividend
Farmer, steadyhand→Steady Tide, diamondhand→Dragon Hoarder, analyst→Eagle Eye, planner→Chess
Master, explorer→Global Nomad, sage→Philosopher King, maverick→Rocket Rider, waverider→Trend
Surfer, contrarian→Contrarian, collector→Legacy Builder.

**What's captured here but NOT yet built (reference-only, for later design passes):**
sections 3–10 below — the source app is a full 5-tab event-companion app (Home / Passport /
Games / Book / Profile) for a physical 2-day conference, and the quiz-app prototype here only
implements the quiz + book/result page. When those other tabs/menus get designed, this doc is
the starting content — don't re-derive from the PDF or invent new copy.

---

## 1. FAMILIES (3) — ✅ ported to FAM object

| key | th | strengths | watchouts |
|---|---|---|---|
| G (guardian) | Guardian · ผู้พิทักษ์ | ปกป้องเงินต้นได้ดี ไม่โลภตามกระแส / อดทน ถือยาว มีวินัยการออม | ระวังเกินไปจนอาจพลาดโอกาสเติบโต / เงินเฟ้ออาจกัดกินผลตอบแทนถ้าปลอดภัยจัด |
| N (navigator) | Navigator · นักเดินเรือ | วางแผนทั้งพอร์ต กระจายความเสี่ยงเก่ง / ตัดสินใจบนข้อมูล ไม่ใช้อารมณ์ | วิเคราะห์นานจนพลาดจังหวะ (analysis paralysis) / กระจายจนคุมยาก ต้องมีระบบติดตาม |
| V (visionary) | Visionary · ผู้มองการณ์ไกล | กล้าได้กล้าเสีย มองหาการเติบโตสูง / จับเทรนด์ใหม่ได้ก่อนตลาด | พอร์ตเหวี่ยงแรง ต้องทนความผันผวนให้ไหว / กระจุกตัวสูง ควรมีแผนจำกัดขาดทุน |

## 2. HEROES (12) — ✅ ported (see `dna-quiz-flow.html` HEROES object for exact fields)

| slug (this app) | en (source) | th (source) | legend | skills [ใจกล้า,วินัย,กระจาย] |
|---|---|---|---|---|
| guardian | The Safe Harbor | ท่าเรือปลอดภัย | Ray Dalio | 1,9,6 |
| harvester | The Dividend Farmer | ชาวนาปันผล | Benjamin Graham | 3,9,6 |
| steadyhand | The Steady Tide | กระแสน้ำสม่ำเสมอ | John Bogle | 3,10,8 |
| diamondhand | The Dragon Hoarder | มังกรสะสมทรัพย์ | Warren Buffett | 3,10,7 |
| analyst | The Eagle Eye | นกอินทรีย์จับสัญญาณ | Peter Lynch | 5,8,5 |
| planner | The Chess Master | ปรมาจารย์หมากรุก | David Swensen | 5,9,10 |
| explorer | The Global Nomad | นักเดินทางไร้พรมแดน | Jim Rogers | 5,7,9 |
| sage | The Philosopher King | ราชันนักปราชญ์ | Naval Ravikant | 4,9,5 |
| maverick | The Rocket Rider | นักบินจรวด | Cathie Wood | 9,5,3 |
| waverider | The Trend Surfer | นักโต้คลื่นกระแส | Paul Tudor Jones | 8,6,4 |
| contrarian | The Contrarian | นักเดินทวนกระแส | Howard Marks | 7,8,4 |
| collector | The Legacy Builder | ผู้สร้างมรดก | Andrew Carnegie | 8,10,9 |

Radar axis order (new, 6-axis, replaces old [หุ้น/ต่างปท./กองทุน/ตราสาร/ทอง/อสังหา]):
**[หุ้นไทย, ต่างประเทศ, กองทุน, คริปโต, ทอง, สุขภาพ]**

Per-hero product scarcity mock counters also exist in source (`PROD` map, limit/left per hero,
decreasing by rarity) — not ported, only relevant once a real redemption/inventory feature exists.

---

## 3. Quiz question bank — NOT in source (kept as-is from this app)

The source app has **no quiz UI** — it's a post-registration companion app that only stores a
`heroId` result (the real 7-question DNA quiz happens once, physically, at event registration,
and is simulated in-app only as an OTP unlock + fake "analyzing" spinner). This app's own
11-question quiz (S1 risk×3 + S2 DNA×7 + S3 interest-picker) is **original to this prototype**
and was left unchanged — only the *result* it produces was reskinned with the new persona data.

---

## 4. Interest/asset taxonomy (reference — this app's S3 picker already aligns closely)

Source `RADAR_AXES` (10-item, used for its "confirm your interest" picker):
หุ้นไทย · ต่างประเทศ · กองทุน · ตราสารหนี้ · ทอง · อสังหา · ประกัน · คริปโต · ทางเลือก · สุขภาพ

This app's existing S3_OPTS (10 items) already matches this almost exactly — no change needed.

Source `BOOTHS` (10 physical booths, gamified names) — reference-only, needs a "Passport" tab
to be meaningful:
สังเวียนเลือกหุ้น (หุ้นไทย) · พาสปอร์ตนักลงทุนโลก (หุ้นต่างประเทศ) · ดวลกองทุน (กองทุนรวม) ·
สร้างตาข่ายกันตก (ตราสารหนี้) · ทองคำ เพื่อนยามวิกฤต (ทองคำ) · ล่าผลตอบแทนค่าเช่า (อสังหา/REIT) ·
สแกนช่องโหว่ชีวิต (ประกัน) · โต้คลื่นความผันผวน (คริปโต) · นักตีราคาของสะสม (ของสะสม) ·
เช็กสุขภาพกับเงิน (สุขภาพ)

---

## 5. Tabs / navigation (reference-only — not built in this prototype)

**Bottom tab bar** (5): หน้าหลัก (home) · คู่มือของคุณ (book) · เดินบูธ (passport) · เกมหลัก (games) · โปรไฟล์ (profile)

**Book-page in-page TOC** (source app): การ์ดของคุณ · ถาม efin AI · สิ่งที่เราเห็น · เรดาร์ความสนใจ · สรุปจบงาน
— compare to this app's current book TOC: ตัวตน · Confidence · 6 ด้าน · เส้นทาง (kept as-is,
conceptually equivalent, no rename needed yet).

**5-tier access ladder** (`tierMeta`, gates nearly every section in source):
Visitor (ยังไม่สมัครสมาชิก) → Free (สมาชิก efin.finance ฟรี) → Explorer (150/200 บาท) →
Master Class (990/1,890 บาท) → Ultimate (1,500/2,500 บาท). Not implemented in this prototype
(demo panel's "สิทธิ์ของคุณ" selector already stubs 3 of these — Master Class/Explorer/Ultimate —
consistent naming, just missing Visitor/Free rungs).

---

## 6. Confidence Score system (reference — depends on game-play data this prototype doesn't have)

Source formula requires event-only signals (games played, booth coverage, crisis-game result)
that don't exist in a quiz-only prototype: `Confidence = เก็บความรู้(35) + รู้ใจตัวเอง(25) +
ลงมือเล่น(25) + ลองหลายหมวด(15)`. This app's own confidence formula (`compute()`'s
identity/behavior/riskAlign/discipline, out of 80, ×1.25) was **left as-is** since it's
purpose-built for quiz-only signals — port the source's formula later only once
Games/Passport tabs (and their play-tracking state) actually exist.

Related "Risk Gap" concept (ที่บอกกับที่ทำต่างกันไหม — declared vs revealed risk, keyed
`aligned/closet_agg/closet_con/exploratory/unknown`) is conceptually similar to this app's
existing `gap`/`declared`/`revealed` fields in `RESULT` — copy can be aligned later.

---

## 7. Library / myth-busting content (reference-only, 8 categories · 41 items) + Glossary (4 groups · 33 terms)

Category list (item counts): พื้นฐานการลงทุน (9) · สินทรัพย์แต่ละประเภท (6) · ต้นทุนและผลตอบแทน (3) ·
กลลวงและการป้องกันตัว (4) · วางแผนชีวิตและสุขภาพการเงิน (5) · ความเสี่ยงและการอ่านตัวเอง (6) ·
ภาษีและกฎเกณฑ์ (3) · เครื่องมือและการติดตาม (5).

Glossary groups: คำที่ใช้ในเล่มนี้ (9 terms, incl. Investor DNA def: *"ชุดคำถามตอนต้นทางที่ใช้จัด
สไตล์การลงทุนของคุณเป็น 1 ใน 12 แบบ — วัดความชอบ ไม่ได้วัดความเก่ง"*) · คำเรื่องความเสี่ยง (7) ·
คำเรื่องวิธีเลือกและวิธีลงทุน (10) · คำอังกฤษที่โผล่ในคำบรรยาย (8).

Full item titles + 1-line paraphrases captured in the exploration transcript of this session
(2026-08-11) — re-run the extraction against `playbook-final-extracted.html` if verbatim
lead/body/myth text is needed for a future Library tab.

---

## 8. Route/journey sections (reference-only)

**(A) Hero Route** — personalized booth order ranked by the hero's own radar scores (5 asset
zones + 1 card-redemption stop): Capital Zone · Crypto Zone · Commodity Zone · Alternative
Investment Zone · Health Zone.

**(B) "ขั้นต่อไปของคุณ"** — single-step onboarding funnel (7 states, home-screen CTA ladder from
"ทำแบบทดสอบตัวตน 7 ข้อ" through "อ่านสรุปให้คุณก่อนกลับ").

**(C) "6 ด้านของคุณ" (SIDES, 6 mini-games)** — the source's real equivalent of this app's
"6 ด้านที่วัดได้จากคุณ" accordion: ความเสี่ยงแท้จริง · สิ่งที่คุณดูก่อนตัดสินใจ ·
ภูมิคุ้มกันความกลัวตกขบวน · เป้าหมายตามวัย · ก้าวแรก · ทองคำในพอร์ต — each with a
`sideResult(i, hero)` narrative branch driven by hero.skills + hero.fam. This app's current
"6 ด้าน" accordion content is original to this prototype and NOT yet reskinned to match these
6 topics — flagged as the most likely next content-parity gap if the book page gets a deeper pass.

---

## 9. Other sections captured (reference-only, not built)

Conference agenda (22 sessions across 2 days), Workshop/Private Class schedules (12 sessions),
booth check-in/activity game mechanics copy, lead-capture ("สนใจ · ให้บูธติดต่อกลับ") flow,
efin-AI stock-screening prompt generator (`PROMPTS`, 12 hero-tuned prompt templates + 2 shared
rule blocks), Profile screen (mock identity/QR/leads), lifecycle upsell CTA copy by tier,
recommended-tools-by-family (`reportTools`), "ซองส่งต่อ" advisor-handoff summary + 5 fixed
questions, Final Report / "Hero Evolution" reconciliation (4 states: building/confirmed/
evolved/emerging). Full details in the 2026-08-11 exploration transcript — re-extract from
`playbook-final-extracted.html` when any of these tabs get built.

---

## 10. Source file note (how this was extracted)

`Playbook Final.html` is not a plain static page — it's a self-contained "bundled" export (a
proprietary artifact-hosting format) where the real page HTML/JS is JSON-escaped inside a
`<script type="__bundler/template">` tag near the end of the file, wrapped in ~13KB of loader
boilerplate. The visible 29MB file size is the JSON-escaped template text itself (not images —
there's no embedded base64 media in this particular export). To re-extract:
1. Find `<script type="__bundler/template">` → the very next `"..."` JSON string is the payload.
2. `JSON.parse()` that string → get back real `<!DOCTYPE html>...` source (~840KB).
3. That source is a proprietary component-templating format (`sc-if`/`sc-for` custom elements +
   `{{ }}` mustache bindings to a `renderVals()` props method), not plain JSX — read the
   `HEROES`/`FAMILIES`/etc. object literals directly rather than trying to run it.
