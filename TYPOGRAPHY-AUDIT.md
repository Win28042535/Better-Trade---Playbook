# Typography DNA Audit — Digital Playbook / Better Trade 2026

ตรวจเมื่อ 2026-09-21 · branch `Ver.3-On-Event` @ `46fce7c` · เป้าหมาย: ให้รีวิวต่อ (ไม่ได้แก้โค้ดใดๆ ในรอบนี้)

> เอกสารนี้เป็น **ผลตรวจ (audit)** ไม่ใช่สเปกใหม่ — เทียบ `TYPOGRAPHY-DNA.md` (read-out เดิม 2026-08-19) กับโค้ดจริงใน `dna-quiz-flow.html` + `js/liquid-metal-*.js` ตอนนี้ ถ้าขัดกัน โค้ดจริงคือข้อเท็จจริง

---

## 0. วิธีตรวจ (3 ชั้น เพื่อไม่ให้พลาดจากมุมเดียว)

| ชั้น | สิ่งที่ตรวจ | ขนาดข้อมูล |
|---|---|---|
| 1. Static CSS | parse `<style>` ทั้งก้อน → ทุก declaration ของ `font-size / font-weight / font-family / letter-spacing / line-height / text-transform` | 1,195 rules · 245 font-size · 185 font-weight · 96 line-height · 29 letter-spacing · 71 font-family |
| 2. Inline ใน JS template + JS ปุ่ม | `style="…font-size…"` ในสตริง HTML, `font-size=` ของ SVG, preset ของ Liquid Metal (`js/liquid-metal-cta.js`) | 24 จุด inline + 3 preset |
| 3. **Rendered (computed style จริง)** | เดินทุก text node ที่มองเห็นได้ใน 17 หน้า/สถานะ → อ่าน `getComputedStyle` (ขนาด/น้ำหนัก/ฟอนต์/line-height/tracking) — ทำที่ 416px และ 1440px | 657 text nodes |

หน้าที่ sweep ใน rendered: splash · consent · quiz (Q1, Q5, ข้อสุดท้าย) · reveal · card reveal · home · book ×4 แท็บ · library · เกมหลัก (ล็อก / เล่นแล้ว 2 เกม) · เดินบูธ · profile.
**ไม่ได้ sweep แบบ rendered (ตรวจจาก CSS เท่านั้น):** modal (scan / share / howto / ยืนยันดาวน์โหลด), หน้าเล่นมินิเกม (brief / question / summary), ตัวแปร Pre-Event, Book แบบยังไม่ลงทะเบียน, demo panel

---

## 1. สรุปสำหรับรีวิว (อ่านหน้านี้หน้าเดียวก็พอ)

**ภาพรวม: ระบบมีวินัยดีมาก** — 95.9% ของ `font-size` ใน CSS (235/245) ใช้ token, 99.5% ของ `font-weight` (184/185) ใช้ token, ฟอนต์ 100% อยู่ใน `--font`/`--serif`, ไม่มี Thai ตกใน serif เลย, และสเกลตัวอักษร **เหมือนกันทุก viewport** (เทียบ set ของ size|weight|family ที่ 416px vs 1440px → ตรงกันเป๊ะ)

**ตัวเลข rendered (657 text nodes):**

| มิติ | ผล |
|---|---|
| ขนาด | 14px 31% · 18px 33% · 16px 18% · 22px 9% · 28px 3% · 24px 2% · 36px 1% · **หลุดสเกล 3% (20 nodes)** |
| น้ำหนัก | 500 = 56% · 700 = 41% · **600 = 1.8% (12 nodes) · 400 = 0.5% (3 nodes)** ← ขัดกฎ "2 น้ำหนัก" |
| ฟอนต์ | FC Minimal 94.8% · Baskervville 5.2% (34 nodes — ทุกตัวเป็นเลข/อังกฤษล้วน) |
| line-height | **`normal` (ไม่ได้ระบุ) 64% (420 nodes)** · ระบุชัด 36% (237) |
| letter-spacing ≠ 0 | 23 nodes (3.5%) |
| เล็กสุดที่ rendered | **14px** — สเกลการ์ด `--pc-fs-*` (8.5–13px) **ไม่ปรากฏใน 17 หน้าเลย** |

**ประเด็นที่ควรหยิบมารีวิวก่อน (เรียงตามน้ำหนักผลกระทบ):**

1. 🔴 **น้ำหนัก 400 หลุดเข้าระบบ** — Home `บัตรของคุณ` (`.pass-card` เป็น `<button>` ตั้งแต่ `font-family` แต่ไม่ตั้ง `font-weight` → UA button ให้ 400 กับ `.pass-benefit`, `.pass-foot-lbl`) + ปุ่ม CTA หน้า splash (Liquid Metal hero = 400)
2. 🔴 **น้ำหนัก 600 จาก Liquid Metal** — ปุ่ม `สแกน QR` (อยู่ทุกหน้า) + ปุ่ม `ดูเกมที่เหลือ` / `เล่นเกม` (compact/cta preset = 600)
3. 🟠 **`.consent-h` ขัด "ไม่ใส่ tracking กับ headline"** — `letter-spacing:-0.01em` บน headline sans (ที่เหลือทุกตัว `.tb-title/.q-title/.hero-th/.s-h/.prog-val` ตั้ง `0` ชัดเจน) และลูก `ch-1/ch-2` สืบทอดเป็น −0.64px
4. 🟠 **line-height: normal 64%** — body ไม่ตั้ง line-height; ข้อความที่ไม่ได้ตั้งเองได้ค่า `normal` ของ FC Minimal (Thai)
5. 🟠 **ขนาดหลุด token 10 declarations ใน CSS (รวม `html{16px}` ที่เป็นค่าฐานปกติ) + 8 จุดใน JS** (7 inline `font-size` + 1 SVG; รายการเต็มใน §5) — เด่นสุด: callout `ast-block` ตัวเดียวกันมี 3 ขนาด (16 / 20 / 20px), `ev-empty-t` มี 3 ขนาด (h2 24 / 26 / 32px)
6. 🟡 **tracking ของ eyebrow ไม่นิ่ง** — 9 ค่าในสูตรเดียว (0.01–0.12em) + เขียน `.08em` กับ `0.08em` ปนกัน
7. 🟡 **โค้ดตาย/ซ้ำ:** `.sp-h` (serif hero) ไม่มี markup ใช้แล้ว · `.ds-chip` ประกาศซ้ำ 2 ที่ (บรรทัด 2101/2105) · ชุด `--pc-fs-*` + `.pcE-*/.pcb-*` ไม่ถูก render (การ์ดเป็นรูป JPG ทั้งหมดแล้ว) → ควรยืนยันว่าเป็น dormant
8. 🟡 **เอกสาร `TYPOGRAPHY-DNA.md` ล้าสมัย 8 จุด** (§6)
9. ℹ️ (นอกเรื่อง typography แต่เจอระหว่างตรวจ) — caption ใต้การ์ด splash ยังเขียนว่า **"แตะการ์ดกลางเพื่อดูด้านหลัง"** (`dna-quiz-flow.html:4304`) ทั้งที่เอา tap-to-flip ออกไปแล้ว → ข้อความบอกให้แตะแต่แตะไม่เกิดอะไร

---

## 2. Token layer — ค่าจริง + จำนวนการใช้งาน

### 2.1 ฟอนต์

| token | ค่า | ใช้ใน CSS | หมายเหตุ |
|---|---|---|---|
| `--font` | FC Minimal → Noto Sans Thai → Thonburi → DB Helvethaica X → system-ui … | 58 rules | ฟอนต์ UI เดียว |
| `--serif` | Baskervville → Bodoni MT → Didot → Georgia … | 13 rules | อังกฤษ/ตัวเลขเท่านั้น (ดู §4.2) |

`@font-face` ตอนนี้โหลดจากไฟล์ `assets/*.ttf` (**ไม่ใช่ base64 แล้ว** — ต่างจากที่เอกสารเดิมบอก): `fc-minimal-100-500.ttf` (weight 100–500), `fc-minimal-600-900.ttf` (600–900), `baskervville-400-700.ttf` (400–700), ทั้งหมด `font-display:swap`.

### 2.2 สเกลขนาด (`--fs-*`) — ค่าตรงกับเอกสาร ✅

| token | px | CSS decl | rendered nodes* | ใช้กับ (ตัวอย่างจริง) |
|---|---|---|---|---|
| `--fs-title` | 36 | 3 | 7 | `.q-title`, `.conf-sc` |
| `--fs-heading` | 28 | 3 | 20 | `.s-h`, `.hero-th`, `.stub-t` |
| `--fs-h2` | 24 | 10 | 16 | `.tb-title`, `.pass-name`, `.ns-t`, `.hc-val` |
| `--fs-sub` | 22 | 25 | 57 | `.btn`, `.opt-text`, `.sp-sub`, `.bt-t` |
| `--fs-body` | 22 | 4 | (รวมกับ sub) | `.consent-p`, `.sp-kick`, `.cr-kicker`, `.play-brief-p` |
| `--fs-bodysm` | 18 | 66 | 215 | supporting text ส่วนใหญ่ |
| `--fs-label` | 16 | 33 | 116 | `.opt-key`, tab label, ปุ่มเล็ก |
| `--fs-eyebrow` | 14 | 67 | 206 | kicker/caption/meta |
| `--fs-meta` | 14 | 8 | (รวมกับ eyebrow) | `.tb-count`, `.rc-meta`, `.next-d` |

\* rendered นับรวม token ที่ขนาดเท่ากัน (sub=body=22, eyebrow=meta=14) เพราะแยกจาก computed style ไม่ได้

สเกลการ์ด `--pc-fs-1…5` = 24 / 13 / 11 / 10 / 8.5px (ใช้ใน CSS 14 declarations — **ไม่ rendered ใน 17 หน้า**)

### 2.3 น้ำหนัก / tracking / line-height

- **น้ำหนัก (CSS):** `--w-label` 93 · `--w-head` 60 · `--w-body` 31 · ค่าดิบ `700` 1 (`.radar-ww.sel .rk-lab.rk-act`, บรรทัด 1437) — `--w-body` = `--w-head` = 500, `--w-label` = 700
- **tracking (29 declarations, 13 ค่า):** `0` ×5 · `-0.015em` ×1 · `-0.01em` ×4 · `0.01` ×1 · `0.02` ×1 · `0.03` ×1 · `0.04` ×5 · `0.05` ×1 · `0.06` ×3 · `0.08` ×4 · `0.10` ×1 · `0.12` ×1 · `normal` ×1
- **line-height (96 declarations, 17 ค่า):** `1.5` ×25 · `1.55` ×14 · `1.45` ×10 · `1.3` ×9 · `1.4` ×8 · `1` ×5 · `1.35` ×5 · `1.6` ×5 · `1.2` ×3 · `1.65` ×3 · `1.06` ×2 · `1.15` ×2 · `1.1` `1.25` `0.96` `1.05` `1.02` อย่างละ 1
  - กลุ่ม **body** กระจาย 6 ค่าภายใน 0.25 (1.4 / 1.45 / 1.5 / 1.55 / 1.6 / 1.65)
  - กลุ่ม **display** กระจาย 9 ค่า (0.96 – 1.2)
  - `body{}` **ไม่ตั้ง line-height** → ทุกอย่างที่ไม่ตั้งเอง = `normal`

---

## 3. Rendered footprint — แต่ละหน้าใช้อะไรบ้าง (จริงบนจอ)

| หน้า/สถานะ | text nodes | ขนาดที่ใช้ (px) | น้ำหนัก |
|---|---|---|---|
| splash | 4 | 14, 20°, 22 | **400°**/500/700 |
| consent | 16 | 14, 22, 24, 64° | 500/700 |
| quiz Q1 | 17 | 14, 16, 18, 22, 24, 36 | 500/700 |
| quiz Q5 | 14 | 14, 16, 22, 24, 36 | 500/700 |
| quiz ข้อสุดท้าย (interest) | 20 | 14, 18, 22, 24, 36 | 500/700 |
| reveal (กำลังวิเคราะห์) | 3 | 16, 40° | 500/700 |
| card reveal | 4 | 14, 22, 48° | 500/700 |
| home | 57 | 14, 15°, 16, 16.8°, 18, 22, 24, 28 | **400°**/500/**600°**/700 |
| book · ตัวตน | 47 | 14, 15°, 16, 18, 22 | 500/**600°**/700 |
| book · วิเคราะห์ | 39 | 14, 15°, 16, 18, 22, 28, 36 | 500/**600°**/700 |
| book · พอร์ต | 85 | 14, 15°, 16, 18, 28 | 500/**600°**/700 |
| book · เส้นทาง | 83 | 14, 15°, 16, 18, 22, 28 | 500/**600°**/700 |
| library | 30 | 14, 18, 24, 28 | 500/700 |
| เกมหลัก (ล็อก) | 16 | 15°, 16, 18, 20°, 24, 28, 32° | 500/**600°**/700 |
| เกมหลัก (เล่นแล้ว 2) | 37 | 14, 15°, 16, 18, 24, 28 | 500/**600°**/700 |
| เดินบูธ | 158 | 14, 15°, 16, 16.8°, 18, 24, 28 | 500/**600°**/700 |
| profile | 27 | 14, 15°, 16, 18, 24 | 500/**600°**/700 |

° = นอกสเกล token หรือนอกกฎ 500/700 (สาเหตุแต่ละตัวอยู่ใน §5)

**Rendered combination ที่พบบ่อยสุด** (ขนาด|น้ำหนัก|line-height): `18|500|normal` · `14|500|normal` (114 nodes — caption/meta ส่วนใหญ่ไม่มี line-height) · `18|700|normal` (63) · `16|500|normal` (47) · `16|700|normal` (46) · `14|500|1.5` · `18|500|1.5` · `18|500|1.55`

---

## 4. แยกตามส่วนงาน (area-by-area)

### 4.1 ตารางรายหน้า/คอมโพเนนต์ — อ่านจาก CSS จริง

วิธีอ่าน: `—` ในคอลัมน์ขนาด/น้ำหนัก/line-height/tracking = **rule นั้นไม่ได้ตั้งค่าเอง** (สืบทอดจาก parent; ฐานคือ `html 16px` และ `body` weight 500, line-height `normal`). ค่าใน `()` คือชื่อ token. "บรรทัด" อ้างอิง `dna-quiz-flow.html`. rule ที่ไม่มี font declaration เลย (เช่น `.q-opt`, `.hc-card`) ยังแสดงไว้เพราะเป็น container ที่ลูกสืบทอดค่า.

หมายเหตุเฉพาะจุดที่เจอระหว่างเรียงตาราง:
- **A1** `.reg-cta` (ลิงก์ ลงทะเบียน) ตั้ง 16px แต่ไม่ตั้ง weight → rendered 500; ปุ่ม `สแกน QR` ไม่อยู่ตารางนี้เพราะเป็น Liquid Metal (ดู §4.4)
- **A2** `.sp-h` ไม่มี markup ใช้ (หัวเรื่อง splash เป็นรูป `sp-hero-logo`) → rule ตาย; ข้อความใน splash ที่ rendered จริงมีแค่ `.sp-kick`, `.sp-sub`, caption `.cr2-cap`, และ CTA (Liquid Metal)
- **A3** `.consent-h` 64px / `.consent-h.reveal-h` 40px เป็นขนาดเฉพาะกิจนอก token (comment ในโค้ดบอกชัดว่าตั้งใจ "ไม่แตะ `--fs-title`")
- **A5** ชุด `pcE-*/pcb-*` ไม่ถูก render ใน sweep เลย (การ์ดแสดงเป็น `<img class="pcE-photo">` จาก `REAL_CARD_IMG`) — เหลือเป็น fallback CSS mockup
- **A6/A7** `.pass-card`, `.pass-benefit`, `.pass-foot-lbl` = ต้นเหตุ weight 400 (§5 ข้อ 1)
- **A10** มี override เฉพาะ mobile 1 จุด (บรรทัด 2064): `:root[data-view="mobile"] .bp-lbl { line-height:1.3 }` — เป็น **ข้อเดียวใน CSS ทั้งไฟล์ที่เปลี่ยน typography ตาม viewport** (และเปลี่ยนแค่ line-height ไม่ใช่ขนาด)

### A1 Chrome — topbar / tabbar / ปุ่มพื้นฐาน / tabs

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 159 | `html` | 16px | — | — | — |  |
| 174 | `body` | — | 500 | — | — |  |
| 205 | `.reg-cta,.reg-cta:link,.reg-cta:visited,.reg-cta:hover,.reg-cta:active` | 16px (--fs-label) | — | — | — |  |
| 226 | `.tb-title` | 24px (--fs-h2) | 700 | — | 0 |  |
| 227 | `.tb-sub` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 233 | `.tb-sub--strong` | — | 700 | — | — |  |
| 239 | `.tb-pill` | 18px (--fs-bodysm) | 500 | — | — |  |
| 241 | `.tb-count` | 14px (--fs-meta) | 500 | — | — |  |
| 383 | `.btn` | 22px (--fs-sub) | 500 | 1 | — |  |
| 696 | `.tab-item` | — | — | — | — |  |
| 698 | `.tab-item span` | 16px (--fs-label) | 700 | — | — |  |
| 1767 | `.bt-tab` | — | — | — | — |  |
| 1782 | `.bt-tabs--primary .bt-tab` | 18px (--fs-bodysm) | 500 | — | — |  |
| 1783 | `.bt-tabs--primary .bt-tab[aria-selected="true"]` | — | 700 | — | — |  |
| 1805 | `.bt-tabs--secondary .bt-tab` | 18px (--fs-bodysm) | 500 | — | — |  |
| 1820 | `.bt-tabs--secondary .bt-tab-label` | — | — | 1.15 | — |  |
| 1912 | `.bt-tab[data-tooltip]::after` | 16px (--fs-label) | 500 | — | — |  |

### A2 Splash

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 3020 | `.sp-kick` | 22px (--fs-body) | 700 | — | — |  |
| 3021 | `.sp-h` | clamp(34px,12vw,50px | 700 | 0.96 | -0.015em | serif |
| 3032 | `.sp-sub` | 22px (--fs-sub) | 500 | 1.55 | — |  |
| 3033 | `.sp-sub b` | — | 700 | — | — |  |

### A3 Consent + DNA Quiz

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 285 | `.q-title` | 36px (--fs-title) | 500 | 1.2 | 0 |  |
| 291 | `.q-title b` | — | 700 | — | — |  |
| 292 | `.q-sub` | 18px (--fs-bodysm) | 500 | 1.5 | — |  |
| 298 | `.q-opt` | — | — | — | — |  |
| 300 | `.opt-key` | 16px (--fs-label) | 500 | — | — |  |
| 302 | `.opt-text` | 22px (--fs-sub) | 500 | 1.5 | — |  |
| 305 | `.int-count` | 18px (--fs-bodysm) | 500 | — | — |  |
| 314 | `.int-opt` | — | — | — | — |  |
| 324 | `.int-t` | 22px (--fs-sub) | 500 | 1.35 | — |  |
| 522 | `.consent-h.reveal-h` | 40px | — | — | — |  |
| 562 | `.consent-h` | 64px | — | 1.06 | -0.01em |  |
| 584 | `.consent-h .ch-1` | — | 500 | — | — |  |
| 585 | `.consent-h .ch-2` | — | 700 | — | — |  |
| 630 | `.consent-p` | 22px (--fs-body) | 500 | 1.65 | — |  |
| 633 | `.consent-p b` | — | 700 | — | — |  |
| 648 | `.rc-kicker` | 14px (--fs-eyebrow) | 700 | — | 0.08em | UPPERCASE |
| 651 | `.rc-title` | 22px (--fs-sub) | 700 | — | — |  |
| 660 | `.rc-title-pts` | 22px (--fs-sub) | — | — | — |  |
| 661 | `.rc-meta` | 14px (--fs-meta) | — | — | — |  |
| 686 | `.consent-caption b` | — | 700 | — | — |  |

### A4 Reveal + Character Card Reveal

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 3551 | `.cr-kicker` | 22px (--fs-body) | 700 | — | normal |  |
| 3653 | `.cr-en` | 48px | 700 | 1.06 | -0.01em | serif |
| 3655 | `.cr-th` | 22px (--fs-sub) | 500 | 1.55 | — |  |
| 3657 | `.cr-hint` | 14px (--fs-eyebrow) | — | 1.5 | — |  |

### A5 Card art (พื้นผิวการ์ด pcE-/pcb-)

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 3160 | `.pcE-en` | 24px (--pc-fs-1) | 700 | 1.05 | -0.01em | serif |
| 3161 | `.pcE-en` | clamp(20px,10cqw,30px | — | — | — | @supports/media |
| 3175 | `.pcE-spk` | 11px (--pc-fs-3) | — | — | — |  |
| 3184 | `.pcE-th2` | 13px (--pc-fs-2) | 700 | — | — |  |
| 3185 | `.pcE-def` | 11px (--pc-fs-3) | 500 | 1.45 | — |  |
| 3186 | `.pcE-ed` | 8.5px (--pc-fs-5) | — | — | — |  |
| 3188 | `.pcE-tag` | 8.5px (--pc-fs-5) | — | — | — |  |
| 3189 | `.pcE-tag i` | 8.5px (--pc-fs-5) | — | — | — |  |
| 3196 | `.pcb-ey` | 10px (--pc-fs-4) | — | — | 0.12em | UPPERCASE |
| 3197 | `.pcb-en` | 24px (--pc-fs-1) | 700 | 1.02 | — | serif |
| 3198 | `.pcb-th` | 13px (--pc-fs-2) | — | — | — |  |
| 3200 | `.pcb-hd` | 10px (--pc-fs-4) | 700 | — | 0.06em | UPPERCASE |
| 3202 | `.pcb-li` | 11px (--pc-fs-3) | 500 | 1.45 | — |  |
| 3203 | `.pcb-li::before` | 8.5px (--pc-fs-5) | — | — | — |  |
| 3205 | `.pcb-stl` | 10px (--pc-fs-4) | — | — | — |  |
| 3211 | `.pcb-stv` | 10px (--pc-fs-4) | — | — | — |  |
| 3212 | `.pcb-leg` | 11px (--pc-fs-3) | — | — | — |  |
| 3213 | `.pcb-leg b` | — | 700 | — | — | serif |

### A6 Home

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1323 | `.next-t` | 16px (--fs-label) | 700 | 1.3 | — |  |
| 1324 | `.next-d` | 14px (--fs-meta) | — | 1.4 | — |  |
| 1594 | `.hh-sub` | 22px (--fs-sub) | 500 | 1.55 | — |  |
| 1598 | `.hh-sub b` | — | 700 | — | — |  |
| 1600 | `.hh-meta span` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 1630 | `.pass-card` | — | — | — | — |  |
| 1644 | `.pass-ey` | 14px (--fs-eyebrow) | 500 | — | — | UPPERCASE |
| 1646 | `.pass-name` | 24px (--fs-h2) | 700 | 1.15 | — |  |
| 1657 | `.pass-benefit` | 18px (--fs-bodysm) | — | 1.4 | — |  |
| 1659 | `.pass-foot-lbl` | 14px (--fs-eyebrow) | — | — | — |  |
| 1667 | `.pass-price` | 22px (--fs-sub) | 700 | — | — |  |
| 1712 | `.ns-ey` | 14px (--fs-eyebrow) | 500 | — | — | UPPERCASE |
| 1713 | `.ns-t` | 24px (--fs-h2) | 700 | 1.3 | — |  |
| 1718 | `.ns-b` | 18px (--fs-bodysm) | 500 | 1.5 | — |  |
| 1728 | `.next-step .ns-cta-slot.btn-primary` | 16px (--fs-label) | — | — | — |  |
| 1730 | `.hc-card` | — | — | — | — |  |
| 1732 | `.hc-val` | 24px (--fs-h2) | 700 | 1.2 | — |  |
| 1733 | `.hc-label` | 14px (--fs-eyebrow) | 500 | 1.35 | — |  |
| 1745 | `.bt-t` | 22px (--fs-sub) | 700 | 1.25 | — |  |
| 1747 | `.bt-s` | 18px (--fs-bodysm) | — | 1.45 | — |  |
| 1756 | `.hcard-s` | 18px (--fs-bodysm) | — | 1.5 | — |  |
| 1927 | `.ag-time` | 18px (--fs-bodysm) | 700 | 1.45 | — |  |
| 1928 | `.ag-t` | 18px (--fs-bodysm) | 700 | 1.4 | — |  |
| 1929 | `.ag-by` | 14px (--fs-eyebrow) | — | 1.45 | — |  |
| 1930 | `.ag-more` | 18px (--fs-bodysm) | 500 | — | — |  |
| 1950 | `.ann-t` | 18px (--fs-bodysm) | 700 | 1.4 | — |  |
| 1951 | `.ann-s` | 14px (--fs-eyebrow) | — | 1.45 | — |  |
| 1977 | `.pe-report-t` | 18px (--fs-bodysm) | 700 | 1.4 | — |  |
| 1978 | `.pe-report-s` | 14px (--fs-eyebrow) | — | 1.45 | — |  |
| 1983 | `.pe-vlbl` | 24px (--fs-h2) | 700 | — | — |  |
| 1989 | `.pe-vt` | 18px (--fs-bodysm) | 500 | — | — |  |
| 1990 | `.pe-vs` | 14px (--fs-eyebrow) | — | — | — |  |
| 1994 | `.pe-track-lbl` | 24px (--fs-h2) | 700 | — | — |  |
| 1995 | `.pe-track-badge` | 16px (--fs-label) | 500 | — | — |  |
| 1998 | `.pe-locked` | 14px (--fs-eyebrow) | — | — | — |  |
| 2003 | `.pe-item-t` | 18px (--fs-bodysm) | 500 | 1.35 | — |  |
| 2004 | `.pe-item-s` | 14px (--fs-eyebrow) | — | — | — |  |
| 2005 | `.pe-dl` | 16px (--fs-label) | 500 | — | — |  |
| 2007 | `.pe-lockbtn` | 16px (--fs-label) | 500 | — | — |  |
| 2017 | `.stub-t` | 28px (--fs-heading) | 700 | — | — |  |
| 2018 | `.stub-s` | 18px (--fs-bodysm) | — | 1.55 | — |  |
| 2025 | `.hd-star` | 0.6em | — | — | — |  |
| 2026 | `.booth-hd .booth-s` | 18px (--fs-bodysm) | — | 1.45 | — |  |
| 2099 | `.ns-body .ds-dl` | 14px (--fs-eyebrow) | 500 | — | — |  |

### A7 Book (คู่มือ) — ตัวตน / วิเคราะห์ / พอร์ต / เส้นทาง

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 778 | `.cr2-chip` | 14px (--fs-eyebrow) | 700 | 1 | .03em |  |
| 784 | `.cr2-cap` | 14px (--fs-eyebrow) | — | 1.5 | — |  |
| 785 | `.cr2-cap b` | — | 700 | — | — |  |
| 794 | `.cr2-lock span` | 18px (--fs-bodysm) | 700 | 1.4 | — |  |
| 811 | `.prog-lbl` | 14px (--fs-eyebrow) | 500 | — | 0.08em | UPPERCASE |
| 812 | `.prog-val` | 24px (--fs-h2) | 500 | — | 0 |  |
| 896 | `.fam-badge` | 18px (--fs-bodysm) | 700 | — | 0.01em |  |
| 906 | `.hero-art-ft` | 14px (--fs-meta) | 500 | — | 0.04em |  |
| 909 | `.hero-en` | 14px (--fs-eyebrow) | 500 | — | 0.1em | UPPERCASE |
| 910 | `.hero-th` | 28px (--fs-heading) | 700 | 1.1 | 0 |  |
| 911 | `.hero-sig` | 18px (--fs-bodysm) | 500 | 1.6 | — |  |
| 949 | `.str-hd` | 18px (--fs-bodysm) | 700 | — | — |  |
| 964 | `.str-li` | 18px (--fs-bodysm) | 500 | 1.55 | — |  |
| 970 | `.ast-lbl` | 22px (--fs-sub) | 700 | — | — |  |
| 980 | `.chip` | 18px (--fs-bodysm) | 700 | — | — |  |
| 987 | `.skc-t` | 22px (--fs-sub) | 700 | — | — |  |
| 991 | `.conf-rl.skc-rl` | — | 500 | — | — |  |
| 1006 | `.conf-vl.skc-vl` | 22px (--fs-sub) | 700 | — | — |  |
| 1016 | `.hero-leg-lbl` | 14px (--fs-eyebrow) | 500 | — | 0.04em | UPPERCASE |
| 1017 | `.hero-leg-txt` | 18px (--fs-bodysm) | 500 | 1.55 | — |  |
| 1019 | `.ln` | — | 700 | — | — | serif |
| 1025 | `.hero-note` | 14px (--fs-eyebrow) | 500 | 1.6 | — |  |
| 1047 | `.ev-empty-t` | 22px (--fs-sub) | 700 | — | — |  |
| 1059 | `.ev-empty-s` | 18px (--fs-bodysm) | 500 | 1.55 | — |  |
| 1088 | `.redeem-t` | 18px (--fs-bodysm) | 700 | — | — |  |
| 1093 | `.redeem-s` | 14px (--fs-eyebrow) | — | 1.5 | — |  |
| 1097 | `.redeem-quota` | 14px (--fs-eyebrow) | — | — | — |  |
| 1098 | `.redeem-tier` | — | 700 | — | — |  |
| 1103 | `.redeem-note` | 14px (--fs-eyebrow) | — | 1.55 | — |  |
| 1117 | `.pdf-dl-cap` | 14px (--fs-eyebrow) | — | — | — |  |
| 1132 | `.s-ey` | 14px (--fs-eyebrow) | 500 | — | — | UPPERCASE |
| 1134 | `.s-h` | 28px (--fs-heading) | 700 | — | 0 |  |
| 1135 | `.s-sub` | 18px (--fs-bodysm) | 500 | 1.55 | — |  |
| 1136 | `.upd-pill` | 14px (--fs-eyebrow) | 500 | — | 0.04em | UPPERCASE |
| 1151 | `.risk-tag` | 16px (--fs-label) | 700 | — | — |  |
| 1152 | `.risk-match` | 22px (--fs-sub) | 700 | — | — |  |
| 1154 | `.risk-desc` | 18px (--fs-bodysm) | 500 | 1.65 | — |  |
| 1155 | `.risk-slbl` | 14px (--fs-eyebrow) | 500 | — | 0.06em | UPPERCASE |
| 1158 | `.risk-rl` | 16px (--fs-label) | 500 | — | — |  |
| 1167 | `.risk-vl` | 22px (--fs-sub) | 700 | — | — | serif |
| 1179 | `.conf-ml` | 14px (--fs-eyebrow) | 500 | — | — | UPPERCASE |
| 1180 | `.conf-mv` | 18px (--fs-bodysm) | 700 | — | — |  |
| 1185 | `.conf-sc` | 36px (--fs-title) | 700 | 1 | -0.01em | serif |
| 1186 | `.conf-su` | 22px (--fs-sub) | 500 | — | — |  |
| 1189 | `.conf-rl` | 18px (--fs-bodysm) | 500 | — | — |  |
| 1192 | `.conf-vl` | 14px (--fs-meta) | 500 | — | — | serif |
| 1193 | `.conf-note` | 14px (--fs-eyebrow) | 500 | 1.55 | — |  |
| 1211 | `.radar-insight` | 18px (--fs-bodysm) | — | 1.5 | — |  |
| 1219 | `.radar-insight b` | — | 700 | — | — |  |
| 1233 | `.int-bar-l` | 18px (--fs-bodysm) | 700 | — | — |  |
| 1234 | `.int-bar-v` | 18px (--fs-bodysm) | 700 | — | — | serif |
| 1243 | `.int-bar-note` | 14px (--fs-eyebrow) | — | 1.5 | — |  |
| 1253 | `.efin-t` | 22px (--fs-sub) | 700 | — | — |  |
| 1254 | `.efin-d` | 18px (--fs-bodysm) | — | 1.55 | — |  |
| 1300 | `.pdf-t` | 22px (--fs-sub) | 500 | — | — |  |
| 1301 | `.pdf-s` | 14px (--fs-eyebrow) | — | — | — |  |
| 1302 | `.pdf-btn` | 16px (--fs-label) | 500 | — | — |  |
| 1307 | `.quote-badge` | 14px (--fs-eyebrow) | — | — | .08em | UPPERCASE |
| 1308 | `.quote-h` | 24px (--fs-h2) | 700 | — | — |  |
| 1313 | `.quote-leg` | 18px (--fs-bodysm) | — | 1.55 | — |  |
| 1314 | `.quote-leg .ln` | — | 700 | — | — |  |
| 1343 | `.ex-tag` | 14px (--fs-eyebrow) | 700 | — | .04em | UPPERCASE |
| 1351 | `.trait-l` | 18px (--fs-bodysm) | 700 | — | — |  |
| 1352 | `.trait-v` | 18px (--fs-bodysm) | — | — | — | serif |
| 1360 | `.trait-chip` | 14px (--fs-eyebrow) | 700 | — | — |  |
| 1363 | `.trait-note` | 14px (--fs-eyebrow) | — | 1.5 | — |  |
| 1369 | `.alloc-row` | 18px (--fs-bodysm) | — | — | — |  |
| 1375 | `.alloc-l` | — | 700 | — | — |  |
| 1376 | `.alloc-p` | — | — | — | — | serif |
| 1437 | `.radar-ww.sel .rk-lab.rk-act` | — | 700 | — | — |  |
| 1461 | `.dd-li` | 18px (--fs-bodysm) | 500 | 1.55 | — |  |
| 1463 | `.dd-note` | 14px (--fs-eyebrow) | — | 1.5 | — |  |
| 1520 | `.side-num` | 14px (--fs-meta) | 500 | — | — |  |
| 1528 | `.side-t` | 18px (--fs-bodysm) | 700 | 1.3 | — |  |
| 1529 | `.side-s` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 1538 | `.sc` | 16px (--fs-label) | 500 | — | — |  |
| 1547 | `.side-dl p` | 18px (--fs-bodysm) | 500 | 1.65 | — |  |
| 1548 | `.side-loc` | 14px (--fs-eyebrow) | 500 | — | 0.02em |  |
| 1555 | `.side-lh` | 18px (--fs-bodysm) | 500 | 1.5 | — |  |
| 1563 | `.rs-n` | 14px (--fs-meta) | 500 | — | — |  |
| 1570 | `.rs-t` | 18px (--fs-bodysm) | 700 | — | — |  |
| 1571 | `.rs-d` | 18px (--fs-bodysm) | 500 | 1.5 | — |  |
| 3217 | `.hero-sig-c` | 22px (--fs-sub) | 500 | 1.55 | — |  |

### A8 Library (คลังความรู้)

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 1476 | `.klib-t` | 22px (--fs-sub) | 700 | — | — |  |
| 1477 | `.klib-s` | 18px (--fs-bodysm) | — | — | — |  |
| 1485 | `.klib-item` | 18px (--fs-bodysm) | — | — | — |  |
| 1488 | `.lib-num` | — | — | — | — | serif |
| 1491 | `.lib-cat-hd` | — | — | — | — |  |
| 1493 | `.lib-cat-t` | 18px (--fs-bodysm) | 700 | — | — |  |
| 1494 | `.lib-cat-n` | 14px (--fs-eyebrow) | 700 | — | — |  |
| 1504 | `.lib-stub` | 14px (--fs-eyebrow) | — | 1.5 | — |  |

### A9 เกมหลัก (Games)

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 2795 | `.gh-sub` | 18px (--fs-bodysm) | — | 1.45 | — |  |
| 2815 | `.gh-restlbl` | 14px (--fs-eyebrow) | 500 | — | .06em | UPPERCASE |
| 2841 | `.gr-hd .btn-primary` | 16px (--fs-label) | — | — | — |  |
| 2845 | `.gr-title` | 18px (--fs-bodysm) | 700 | 1.35 | — |  |
| 2861 | `.gr-played` | 16px (--fs-label) | 500 | — | — |  |
| 2863 | `.gr-status` | 14px (--fs-eyebrow) | — | 1.4 | — |  |
| 2879 | `.gr-from` | 14px (--fs-eyebrow) | — | — | — |  |
| 2880 | `.gr-result` | 18px (--fs-bodysm) | 500 | 1.6 | — |  |
| 2881 | `.games-note` | 14px (--fs-eyebrow) | — | — | — |  |

### A10 เดินบูธ (Booth / Passport)

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 2043 | `.bp-lbl` | 18px (--fs-bodysm) | 700 | — | — |  |
| 2044 | `.bp-frac` | 18px (--fs-bodysm) | 700 | — | — |  |
| 2101 | `.ds-chip` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 2103 | `.ds-joined` | 18px (--fs-bodysm) | 700 | — | — |  |
| 2105 | `.ds-chip` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 2108 | `.route-badge` | 16px (--fs-label) | 500 | — | — |  |
| 2116 | `.map-ph .mp-cap` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 2118 | `.map-ph .mp-zoom` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 2138 | `.map-lightbox .ml-cap` | 18px (--fs-bodysm) | 500 | — | — |  |
| 2623 | `.rt-name` | 18px (--fs-bodysm) | 700 | 1.35 | — |  |
| 2627 | `.rt-badge` | 16px (--fs-label) | 700 | — | — |  |
| 2631 | `.rt-meta` | 14px (--fs-eyebrow) | — | — | — |  |
| 2639 | `.map-ph.v2 .bmk` | — | — | — | — |  |
| 2647 | `.map-ph.v2 .bmk-num` | 14px (--fs-eyebrow) | 700 | 1 | — |  |
| 2665 | `.map-ph.v2 .bmk-lbl` | 16px (--fs-label) | 500 | — | — |  |
| 2691 | `.route-list.v2 .rt-dot.rt-num` | 18px (--fs-bodysm) | 700 | — | — |  |
| 2693 | `.route-list.v2 .rt-state` | 16px (--fs-label) | 500 | — | — |  |
| 2739 | `.booth-legend` | 14px (--fs-eyebrow) | — | — | — |  |
| 2768 | `.bc-asset` | 18px (--fs-bodysm) | 700 | — | — |  |
| 2771 | `.bc-zchip` | 16px (--fs-label) | 500 | — | — |  |
| 2772 | `.bc-game` | 14px (--fs-eyebrow) | — | — | — |  |
| 2776 | `.bp-btn` | 14px (--fs-eyebrow) | 500 | — | — |  |

### A11 Mini-game play (หน้าเล่นเกม)

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 2207 | `.play-timer` | 16px (--fs-label) | 500 | — | — |  |
| 2217 | `.play-pts-badge` | 24px (--fs-h2) | 700 | — | — |  |
| 2230 | `.play-q` | 32px | 500 | 1.3 | — |  |
| 2231 | `.play-q b` | — | 700 | — | — |  |
| 2232 | `.play-sub` | 16px (--fs-label) | — | 1.5 | — |  |
| 2238 | `.play-skip` | 16px (--fs-label) | — | — | — |  |
| 2255 | `.play-insight span` | 16px (--fs-label) | — | 1.5 | — |  |
| 2271 | `.play-result-ey` | 14px (--fs-eyebrow) | 500 | — | 0.04em | UPPERCASE |
| 2272 | `.play-result-t` | 18px (--fs-bodysm) | 700 | 1.5 | — |  |
| 2276 | `.play-sum-item span` | 16px (--fs-label) | — | 1.5 | — |  |
| 2296 | `.play-sum-pts` | 36px (--fs-title) | 700 | — | — |  |
| 2306 | `.play-brief-badge` | 16px (--fs-label) | 500 | 1.3 | — |  |
| 2307 | `.play-brief-badge .pb-emoji` | 16px | — | 1 | — |  |
| 2317 | `.play-brief-h` | 48px | — | — | — |  |
| 2576 | `.play-brief-p` | 22px (--fs-body) | — | 1.6 | — |  |
| 2578 | `.play-brief-note` | 16px (--fs-label) | — | 1.5 | — |  |

### A12 Profile

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 2902 | `.prof-name` | 24px (--fs-h2) | 700 | — | — |  |
| 2903 | `.prof-org` | 18px (--fs-bodysm) | — | 1.45 | — |  |
| 2906 | `.prof-vf` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 2912 | `.prof-tier` | 14px (--fs-eyebrow) | 500 | — | — |  |
| 2925 | `.pq-lbl` | 14px (--fs-eyebrow) | 700 | — | .08em | UPPERCASE |
| 2930 | `.pq-note` | 14px (--fs-eyebrow) | — | 1.5 | — |  |
| 2938 | `.pr-row` | 18px (--fs-bodysm) | — | — | — |  |
| 2942 | `.pr-v` | — | 700 | 1.5 | — |  |
| 2944 | `.pf-brand` | 18px (--fs-bodysm) | 500 | — | — |  |
| 2947 | `.pf-brand-bold` | — | 700 | — | — |  |
| 2948 | `.pf-note` | 14px (--fs-eyebrow) | — | 1.6 | — |  |

### A13 Modals / overlays (scan · share · howto)

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 2155 | `.scan-t` | 22px (--fs-sub) | 700 | 1.3 | — |  |
| 2156 | `.scan-s` | 14px (--fs-eyebrow) | — | — | — |  |
| 2168 | `.scan-cam-cap` | 16px (--fs-label) | — | — | — |  |
| 2184 | `.scan-mine-cap` | 14px (--fs-eyebrow) | — | 1.5 | — |  |
| 2191 | `.scan-note span` | 16px (--fs-label) | — | 1.5 | — |  |
| 2193 | `.scan-demo-note` | 16px (--fs-label) | — | — | — |  |
| 2592 | `.share-t` | 22px (--fs-sub) | 700 | 1.3 | — |  |
| 2595 | `.share-sub` | 14px (--fs-eyebrow) | — | — | — |  |
| 2598 | `.share-opt` | — | — | — | — |  |
| 2601 | `.share-opt-lbl` | 16px (--fs-label) | 500 | 1.2 | — |  |
| 2603 | `.share-copy-url` | 14px (--fs-eyebrow) | — | — | — |  |
| 2604 | `.share-copy-btn` | 16px (--fs-label) | 500 | — | — |  |
| 2708 | `.howto-t` | 22px (--fs-sub) | 700 | 1.3 | — |  |
| 2709 | `.howto-s` | 14px (--fs-eyebrow) | — | — | — |  |
| 2721 | `.zh-li` | 18px (--fs-bodysm) | — | 1.5 | — |  |
| 2722 | `.zh-li b` | — | 700 | — | — |  |
| 2723 | `.zh-note` | 14px (--fs-eyebrow) | 500 | 1.5 | — |  |
| 2727 | `.howto-btn` | 16px (--fs-label) | 500 | — | — |  |

### A14 Demo panel (dev-only)

| บรรทัด | selector | ขนาด | น้ำหนัก | line-height | letter-spacing | หมายเหตุ |
|---|---|---|---|---|---|---|
| 3465 | `.demo-panel` | — | — | — | — |  |
| 3468 | `.demo-ti` | 22px (--fs-sub) | 700 | — | — |  |
| 3472 | `.demo-lbl` | 14px (--fs-eyebrow) | 700 | — | 0.05em | UPPERCASE |
| 3474 | `.seg button` | 18px (--fs-bodysm) | — | — | — |  |
| 3475 | `.seg button.on` | — | 700 | — | — |  |
| 3478 | `.demo-sel` | 18px (--fs-bodysm) | — | — | — |  |
| 3480 | `.demo-row .rl` | 18px (--fs-bodysm) | — | — | — |  |
| 3489 | `.demo-stub` | 14px (--fs-meta) | — | 1.4 | — |  |

### 4.2 Serif (Baskervville) — inventory จริง (13 selectors)

| selector | ขนาด | น้ำหนัก | rendered ที่ไหน | ตัวอย่าง |
|---|---|---|---|---|
| `.conf-sc` | 36 | 700 | book·วิเคราะห์ | `74` (ตัวเลข confidence) |
| `.risk-vl` | 22 | 700 | book·วิเคราะห์ | `5` |
| `.conf-vl` | 14/22 | 500/700 | book·วิเคราะห์ | `5/10`, `16` |
| `.int-bar-v` | 18 | 700 | book·วิเคราะห์ | `38%` ⚠ ไม่อยู่ในเอกสารเดิม |
| `.trait-v` | 18 | 500 | book·พอร์ต | `/35` |
| `.alloc-p` | (สืบทอด) | — | book·พอร์ต | สัดส่วน % |
| `.lib-num` | 28 | 700 | library | `41` |
| `.ln` | (สืบทอด) | 700 | book·ตัวตน | ชื่อ legend investor |
| `.cr-en` | 48 | 700 | card reveal | `The Planner` ⚠ ไม่อยู่ในเอกสารเดิม |
| `.pcE-en` `.pcb-en` `.pcb-leg b` | 24 / 24 / 11 | 700 | (ไม่ rendered) | ชื่อบนการ์ด |
| `.sp-h` | clamp 34–50 | 700 | **ไม่มี markup ใช้** | rule ตาย |

ตรวจ rendered: **34 text nodes เป็น serif, 0 nodes มีอักษรไทย** ✅ (กฎ Thai=FC Minimal ยังไม่ถูกละเมิด)

### 4.3 Eyebrow / UPPERCASE recipe — 18 selectors (เอกสารเดิมมี 12)

`text-transform:uppercase` ที่ใช้อยู่จริง: `.rc-kicker` `.prog-lbl` `.hero-en` `.hero-leg-lbl` `.s-ey` `.upd-pill` `.risk-slbl` `.conf-ml` `.quote-badge` `.ex-tag` `.pass-ey` `.ns-ey` + **ใหม่ 6 ตัว** `.play-result-ey` `.gh-restlbl` `.pq-lbl` `.pcb-ey` `.pcb-hd` `.demo-lbl`

tracking ของกลุ่มนี้ (ทุกตัวขนาด 14px ยกเว้น `pcb-*` 10px):

| tracking | selector |
|---|---|
| 0.12em | `.pcb-ey` |
| 0.10em | `.hero-en` |
| 0.08em | `.rc-kicker` `.prog-lbl` `.pq-lbl` (เขียน `.08em`) |
| 0.06em | `.risk-slbl` `.gh-restlbl` (`.06em`) `.pcb-hd` |
| 0.05em | `.demo-lbl` |
| 0.04em | `.hero-leg-lbl` `.upd-pill` `.play-result-ey` `.ex-tag` (`.04em`) |
| **ไม่ตั้ง (0)** | `.s-ey` `.conf-ml` `.pass-ey` `.ns-ey` |

→ ใน 18 ตัว: 6 ค่า tracking + 4 ตัวไม่ตั้งเลย; weight ก็ต่างกัน (`--w-head` 500 vs `--w-label` 700 — 700 ใน `.rc-kicker`, `.pq-lbl`, `.ex-tag`, `.demo-lbl`, `.pcb-hd`)

### 4.4 Liquid Metal (JS-rendered button — **ไม่ผ่าน token เลย**)

ตั้งค่าใน `js/liquid-metal-cta.js` (comment บอก "verbatim from kit README — do not change without direction"):

| preset | ใช้ที่ไหน | desktop (≥576px) | mobile (≤575px) | weight | font-family |
|---|---|---|---|---|---|
| `hero` | ปุ่ม `ค้นหาตัวตนของคุณ` (splash) | **20px** | 18px | **400** | `'FC Minimal'` (ไม่มี fallback) |
| `cta` | `ดูเกมที่เหลือ`, `เล่นเกม` (การ์ด next-step / next-game) | **16px** | 15px | **600** | `var(--font)` |
| `compact` | `สแกน QR` (header ทุกหน้า), CTA เล็กใน card | **15px** | 14px | **600** | `var(--font)` |

- ขนาด 3 คู่ (20/18, 16/15, 15/14) เป็นตัวเลขดิบใน JS; มีแค่ 16 กับ 14 ที่บังเอิญตรง `--fs-label` / `--fs-eyebrow`; **15px, 18px, 20px ไม่อยู่ในสเกลใดเลย**
- น้ำหนัก 400 และ 600 ไม่อยู่ในระบบ 2 น้ำหนัก (500/700). FC Minimal โหลดเป็น 2 ไฟล์ (100–500 / 600–900) → 600 ใช้ไฟล์ชุด 600–900 (ไฟล์เดียวกับ 700 ไม่โหลดเพิ่ม) แต่ 400 ใช้ไฟล์ชุด 100–500
- ความกว้างปุ่มถูกวัดจาก `font-size`/`font-weight`/`font-family` จริงตอน mount (`measureLabel`) — ถ้าจะเปลี่ยนค่า ต้องเปลี่ยนใน preset ไม่ใช่ CSS

### 4.5 ข้อความใน SVG (radar chart)

`dna-quiz-flow.html:4982` — label แกนเรดาร์ใช้ attribute ตรงๆ: `font-size="14"` `font-weight="500"` `font-family=SVGFONT` โดย `SVGFONT = 'FC Minimal','Noto Sans Thai','Thonburi',system-ui,sans-serif` (บรรทัด 3769) — ค่า 14/500 ตรง `--fs-eyebrow`/`--w-body` โดยบังเอิญ (hard-code) และ stack ฟอนต์ **สั้นกว่า `--font`** (ขาด `DB Helvethaica X`, `-apple-system`, `Segoe UI`); ตอนเลือก (`.rk-act`) CSS ยกเป็น `700` ตรงๆ (บรรทัด 1437)

### 4.6 Inline style ใน JS template (24 จุด — เฉพาะที่ไม่ใช่ token)

| บรรทัด | ค่า | คอมโพเนนต์ | หมายเหตุ |
|---|---|---|---|
| 4061 | `font-size:15px` | `.pcE-spk` ดาวที่ 2 บนการ์ด | ดาวแรกใช้ `--pc-fs-3` (11px) → ดาว 2 ดวงคนละขนาด |
| 5369 | `font-size:26px` | `ev-empty-t` "Investment DNA ของคุณคือจุดเริ่มต้น" (Book coming-soon) | ไม่ตรง token ใดเลย |
| 5371 | `font-size:16px` + `font-weight:700` | `ast-block` callout (Book coming-soon) | callout ขนาด 16 |
| 7421 · 7453 | `font-size:32px` | `ev-empty-t` "6 เกม 6 มุมมอง" (เกมหลัก pre-event / ล็อก) | 32px ไม่มี token (ระหว่าง heading 28 กับ title 36) |
| 7437 · 7461 | `font-size:20px` + `font-weight:700` | `ast-block` callout (เกมหลัก pre-event / ล็อก) | callout ขนาด 20 (`--fs-sub` เคยเป็น 20 ก่อน v4 → ตกค้าง) |
| 4982 | SVG `font-size="14"` | radar label | ดู §4.5 |

ส่วน inline ที่ใช้ token (ถูกต้อง): `font-weight:var(--w-label)` ×5 (บรรทัด 5178, 5189, 5294, 6887, 8037), `font-size:var(--fs-sub)` ×3 (ปุ่ม `แชร์ภาพการ์ด`, `กลับไปเล่นเกมต่อ`), `--fs-h2` ×3 (`ev-empty-t`), `--fs-label` ×1 (ปุ่มดาวน์โหลด PLAYBOOK), `--fs-bodysm` ×1

---

## 5. Findings — รายละเอียดพร้อมหลักฐาน (ยังไม่ได้แก้อะไร)

ระดับ: 🔴 ขัดกฎที่เขียนไว้ตรงๆ · 🟠 ไม่สม่ำเสมอ/ควรตัดสินใจ · 🟡 ความสะอาด/ตกค้าง · ℹ️ นอกขอบเขต typography

### 🔴 F1 — น้ำหนัก 400 หลุดจาก Home `.pass-card`
- **หลักฐาน:** rendered `18px|400|lh1.40` (`.pass-benefit` "Playbook เต็ม + เวิร์กช็อป") และ `14px|400` (`.pass-foot-lbl` "ราคาบัตร") บนหน้า home
- **สาเหตุ:** `.pass-card` เป็น `<button>` (บรรทัด 1630: `font-family:var(--font)` แต่ **ไม่มี `font-weight`**) → button ไม่สืบทอด weight จาก `body` → ได้ 400 จาก UA; ลูก `.pass-benefit` / `.pass-foot-lbl` ก็ไม่ตั้ง weight เอง
- **ผลต่อ DNA:** ข้อความกลุ่มนี้บางกว่าข้อความข้างเคียงทั้งหมด (500) โดยไม่ได้ตั้งใจ; บนหน้า เกมหลัก `.pass-card` เป็น `<div>` (ลูกที่ไม่ตั้ง weight เองจะได้ 500 จาก body) → **container class เดียวกัน: เป็น `<button>` ได้ 400, เป็น `<div>` ได้ 500** (บนเกมหลักยังไม่เห็นเพราะลูกทุกตัวตั้ง weight เอง)
- **ทางเลือก:** เพิ่ม `font-weight:var(--w-body)` ให้ `.pass-card` (ทางแก้ระดับ root cause — ตรวจ `<button>` อื่นที่ตั้ง font-family เองแบบเดียวกันด้วย)

### 🔴 F2 — น้ำหนัก 400/600 จาก Liquid Metal (§4.4)
- **หลักฐาน:** 12 nodes @600 (ปุ่ม `สแกน QR` ทุกหน้า, `ดูเกมที่เหลือ`, `เล่นเกม`) + 1 node @400 (ปุ่มหลัก splash)
- **บริบท:** ค่าใน preset มี comment "verbatim from the kit's README — do not change without direction" → เป็นการตัดสินใจเชิงแบรนด์ของปุ่ม ไม่ใช่ความบังเอิญ
- **ทางเลือก:** (a) ยอมรับเป็น exception ที่เขียนไว้ใน DNA doc ("Liquid Metal = 3 preset, 400/600") (b) ปรับ preset ให้เข้า 500/700 — ต้องตัดสินใจโดยเจ้าของแบรนด์ และวัดความกว้างปุ่มใหม่ (ปุ่มวัดความกว้างจาก font จริง)

### 🟠 F3 — `.consent-h` ใส่ tracking ให้ headline sans
- **หลักฐาน:** `.consent-h{font-size:64px;letter-spacing:-0.01em;line-height:1.06}` (บรรทัด 562) → rendered `ch-1/ch-2` = −0.64px (64px) และ −0.4px (40px, reveal)
- **ขัดกับ:** หลักการเดิม "zero letter-spacing on headlines คือ signature" — ตัว sans อื่นทุกตัวตั้ง `0` ชัดเจน (`.tb-title` `.q-title` `.hero-th` `.s-h` `.prog-val`); tracking ติดลบเดิมสงวนไว้ให้ serif display (`.conf-sc` `.pcE-en` `.cr-en` `.sp-h`)
- **ผลข้างเคียง:** `.conf-su` "/100" ก็รับ −0.36px จาก `.conf-sc` (letter-spacing สืบทอดเป็นค่า px) ทั้งที่เป็นตัวรอง 22px
- **ทางเลือก:** (a) ตัดสินใจว่า "headline ขนาดโปสเตอร์ ≥ 40px" อนุญาต tracking ติดลบ แล้วเขียนเป็นกฎ (b) ตั้ง `0` แบบเดียวกับตัวอื่น

### 🟠 F4 — line-height `normal` ครอบ 64% ของข้อความ
- **หลักฐาน:** rendered 420/657 nodes; ชุดที่หนักสุดคือ caption/meta `14|500|normal` (114 nodes), label `16|500/700|normal` (93), `18|700|normal` (63)
- **บริบท:** `body{}` ไม่ตั้ง `line-height`; ใน CSS มี line-height 17 ค่าแต่ผูกกับ selector เฉพาะ → ข้อความสั้นบรรทัดเดียวไม่เป็นปัญหา แต่ **ข้อความที่ wrap หลายบรรทัดและไม่ได้ตั้ง line-height จะได้ `normal`** (สำหรับ Thai FC Minimal ช่วงบรรทัดจะแคบ/กว้างต่างจากข้อความข้างเคียงที่ตั้ง 1.4–1.65)
- **ทางเลือก:** ตั้ง line-height ฐานที่ `body` (เช่น ค่ากลางของ body-tier) แล้วให้ display-tier override — และถือโอกาสยุบ body-tier 6 ค่า (1.4/1.45/1.5/1.55/1.6/1.65) เหลือ 2–3 ค่า (ต้องรีวิวรายจุดเพราะเปลี่ยนความสูง layout)

### 🟠 F5 — ขนาดนอก token (รายการเต็ม)

| ที่ | ค่า | เทียบ token ที่ใกล้สุด | จัดการอย่างไรได้ |
|---|---|---|---|
| `.consent-h` (562) | 64px | เกิน `--fs-title` 36 | display ขนาดโปสเตอร์ — ตั้ง token ใหม่ (`--fs-display`) หรือคงเป็น exception |
| `.consent-h.reveal-h` (522) | 40px | — | ใช้กับหน้า reveal |
| `.cr-en` (3653), `.play-brief-h` (2317) | 48px | — | 2 จุดใช้ 48 → รวมเป็น display-2 ได้ |
| `.play-q` (2230) | 32px | ระหว่าง heading 28 / title 36 | หัวคำถามมินิเกม — comment ในโค้ดตั้งใจให้เล็กกว่า `.q-title` 36 "เพราะอยู่ใน modal" แต่หน้าเล่นเปลี่ยนเป็น **full page แล้ว** (2026-09-10) → เหตุผลนี้ตกค้าง ควรทบทวนว่าจะใช้ `--fs-title` 36 เหมือน DNA quiz หรือไม่ |
| `ev-empty-t` inline 32px ×2 (7421, 7453) | 32px | เหมือน `.play-q` | คอมโพเนนต์ empty-state เดียวกันมี 3 ขนาดหัวข้อ: 24 (`--fs-h2`) / 26 / 32 |
| `ev-empty-t` inline 26px (5369) | 26px | — | (ดูบรรทัดบน) |
| `ast-block` callout inline: 16px (5371) · 20px ×2 (7437, 7461) | 16 / 20 | `--fs-label` / (เคยเป็น `--fs-sub` ก่อน v4) | **callout ตัวเดียวกัน 3 หน้า 2 ขนาด** — 20px คือ `--fs-sub` เก่า (v3) ที่ไม่ได้ตามตอน v4 ขยับเป็น 22 |
| `.sp-h` (3021) | clamp(34px,12vw,50px) | — | **ไม่มี markup** → ลบได้ |
| `.pcE-en` @supports (3161) | clamp(20px,10cqw,30px) | `--pc-fs-1` 24 | container-query ขนาดชื่อบนการ์ด (dormant) |
| `.hd-star` (2025) | 0.6em → 16.8px | — | ดาวคั่นใน `.s-h` (28px) — fractional px |
| `.pb-emoji` (2307) | 16px | `--fs-label` | ค่าดิบที่บังเอิญเท่า token |
| `.pcE-spk` inline (4061) | 15px | `--pc-fs-3` 11 | ดาว 2 ดวงบนการ์ดคนละขนาด (dormant) |
| SVG radar (4982) | 14 (attr) | `--fs-eyebrow` 14 | hard-code เท่า token |
| Liquid Metal | 20/18 · 16/15 · 15/14 | — | §4.4 |

### 🟡 F6 — tracking ของ eyebrow กระจาย 9 ค่า + เขียนสองแบบ
ดู §4.3. ใน 18 ตัว uppercase มี 6 ค่า tracking (0.04–0.12em) + 4 ตัวไม่ตั้ง — ถ้านับรวม chip/badge ขนาด eyebrow ที่ไม่ใช่ uppercase (`.cr2-chip` .03em, `.side-loc` 0.02em, `.fam-badge` 0.01em) จะเป็น 9 ค่า; ค่าที่เขียนไม่มีศูนย์นำหน้า (`.08em` `.06em` `.04em` `.03em`) ปนกับแบบมีศูนย์ 5 จุด — ไม่กระทบการแสดงผล แต่ทำให้ grep/audit ตกหล่นง่าย

### 🟡 F7 — โค้ดตาย / ซ้ำ / dormant
- `.sp-h` (บรรทัด 3021): ไม่มี markup อ้างถึง (หัวเรื่อง splash เป็นรูปภาพ)
- `.ds-chip` ประกาศ **ซ้ำ** (บรรทัด 2101 กับ 2105 เนื้อหาเหมือนกันทุกตัวอักษร)
- `.pcE-*` `.pcb-*` และ `--pc-fs-1…5`: rendered 0 nodes ใน 17 หน้า — การ์ดแสดงเป็นรูป JPG ทั้งหมดแล้ว (comment ในโค้ดเองระบุว่า CSS editorial-mockup branch "unreached for every real persona now") → **ควรยืนยันว่าเป็น fallback ที่ตั้งใจเก็บ หรือเก็บกวาดได้** (ไม่ได้ไล่ตรวจว่าฟังก์ชัน `pcFrontInner`/หลังการ์ดยังถูกเรียกที่อื่นหรือไม่)
- `int-sec-rank`: เอกสารเดิมอ้างถึง แต่ไม่มีใน CSS/markup แล้ว (0 occurrences)

### ℹ️ F8 — caption "แตะการ์ดกลางเพื่อดูด้านหลัง" ยังอยู่ (ไม่ใช่ typography)
`dna-quiz-flow.html:4304` — `<p class="cr2-cap">แตะการ์ดกลางเพื่อดูด้านหลัง</p>` ใต้การ์ดใน splash ยังบอกให้แตะ ทั้งที่ tap-to-flip ถูกเอาออกไปแล้วในรอบก่อน (ข้อความ "ตกค้าง" จากงานนั้น) — ต้องตัดสินใจว่าจะลบบรรทัดนี้หรือเปลี่ยนข้อความ; ไม่ได้แก้เพราะกระทบ layout/สำเนาบนหน้าแรก

---

## 6. เอกสาร `TYPOGRAPHY-DNA.md` ตรงกับโค้ดหรือไม่

| # | หัวข้อในเอกสารเดิม | สถานะ | ของจริง |
|---|---|---|---|
| 1 | token `--fs-*` / `--w-*` / `--font` / `--serif` | ✅ ตรง | — |
| 2 | "ฟอนต์ฝัง base64 `@font-face`" | ❌ ล้าสมัย | ตอนนี้เป็นไฟล์ `assets/*.ttf` ผ่าน `url()` (commit `8de560e` แยก asset ออกจาก HTML) |
| 3 | "ระบบ render **แค่ 2 น้ำหนัก** (500/700)" | ⚠ ไม่จริงทั้งหมด | rendered มี 400 (3 nodes) และ 600 (12 nodes) — F1, F2 |
| 4 | `--fs-title` ใช้กับ "consent headline" | ❌ ล้าสมัย | `.consent-h` = 64px (เฉพาะกิจ), reveal = 40px; `--fs-title` เหลือ `.q-title`, `.conf-sc`, `.play-sum-pts` |
| 5 | serif audit (10 selectors) | ❌ ไม่ครบ | ตอนนี้ 13: **เพิ่ม `.int-bar-v`, `.cr-en`** และ `.sp-h` กลายเป็นโค้ดตาย |
| 6 | uppercase eyebrow (12 selectors) | ❌ ไม่ครบ | ตอนนี้ 18: เพิ่ม `.play-result-ey` `.gh-restlbl` `.pq-lbl` `.pcb-ey` `.pcb-hd` `.demo-lbl` |
| 7 | "`.conf-sc`, `.pcE-en`, `.pcb-en` มี tracking −0.01/−0.015em" | ⚠ บางส่วน | `.pcb-en` **ไม่มี** tracking; ที่มีจริง: `.conf-sc` `.pcE-en` `.sp-h` `.cr-en` (serif) **และ `.consent-h` (sans — ไม่ได้อยู่ในเอกสาร)** |
| 8 | line-height by role (4 tier) | ⚠ ขาดข้อมูลสำคัญ | ไม่พูดถึงว่า 64% ของข้อความเป็น `normal`; ตัวอย่าง `.int-sec-rank` ไม่มีแล้ว; ค่าที่ยกตัวอย่าง (`.q-title` 1.2, `.hero-th` 1.1, `.consent-p` 1.65, `.risk-desc` 1.65, `.side-dl p` 1.65, `.opt-text` 1.5, `.bt-t` 1.25, `.scan-t` 1.3, `.side-t` 1.3, `.pcE-en` 1.05, `.conf-sc` 1) **ตรงกับโค้ด** ✅ |
| 9 | "type scale ไม่โตตาม viewport" | ✅ ตรง | ยืนยันด้วย rendered 416px vs 1440px — set เดียวกัน (มี override เดียว: `.bp-lbl` line-height บน mobile) |
| 10 | ไม่ครอบคลุม | ➕ ขาด | Liquid Metal preset (§4.4), SVG radar text (§4.5), inline style ใน JS (§4.6) — 3 พื้นผิวที่ typography อยู่นอก CSS token |

---

## 7. Checklist สำหรับรอบรีวิวถัดไป

ตัดสินใจเป็นข้อๆ (ทุกข้อยังเป็นตัวเลือก — ไม่มีอะไรถูกแก้ในรอบนี้):

- [x] **F1** (applied: .pass-card weight 500) ตั้ง `font-weight` ให้ `.pass-card` (root cause ของ weight 400 ที่ Home)
- [ ] **F2** Liquid Metal: ยอมรับ 400/600 เป็น exception ที่เขียนลง DNA doc หรือปรับ preset เข้า 500/700 (เจ้าของแบรนด์ตัดสิน)
- [x] **F3** (applied 2026-09-21: letter-spacing 0) `.consent-h` ที่ −0.01em: จะให้ headline ขนาดโปสเตอร์มี tracking ได้ (เขียนกฎ) หรือคืนเป็น 0
- [x] **F4** (applied 2026-09-21: body line-height 1.5 — ยังไม่ยุบ body-tier) ตั้ง line-height ฐานที่ `body` + ยุบ body-tier จาก 6 ค่าเหลือ 2–3
- [~] **F5** (ast-block รวมเป็น --fs-sub/--w-label แล้ว; ที่เหลือยังเปิด) เพิ่ม token สำหรับ display (64/48/40/32?) หรือยืนยันว่าเป็น exception ต่อจุด; รวม `ev-empty-t` (24/26/32) และ callout `ast-block` (16/20) ให้เป็นขนาดเดียว; ตัดสินใจ `.play-q` 32 vs `.q-title` 36
- [ ] **F6** ตกลงชุด tracking ของ eyebrow (เช่น 2–3 ระดับ) แล้วเขียนรูปแบบเดียว (`0.08em`)
- [ ] **F7** ลบ `.sp-h`, `.ds-chip` ซ้ำ; ตัดสินใจเรื่องชุด `pcE-*/pcb-*/--pc-fs-*` (เก็บ/ลบ)
- [x] **F8** (applied: ลบ caption แล้ว) caption splash "แตะการ์ดกลาง…" — ลบหรือเปลี่ยนข้อความ
- [ ] อัปเดต `TYPOGRAPHY-DNA.md` ตาม §6 (หลังตัดสินใจข้างบนแล้ว จะได้เขียนครั้งเดียว)
- [x] ขยาย sweep แบบ rendered ไปยังส่วนที่ยังไม่ได้ตรวจ: modal ทั้ง 4, หน้าเล่นมินิเกม 3 step, Pre-Event, Book ยังไม่ลงทะเบียน

---

*ข้อมูลดิบ (คำนวณจากโค้ดจริงวันที่ตรวจ): ชุด parse CSS, ตาราง selector→ขนาด/น้ำหนัก, รายการ inline, และผล rendered sweep ถูกสร้างชั่วคราวใน scratchpad ของ session — ไม่ได้ commit; ถ้าต้องการ re-run ให้บอกได้*

## 8. ผลหลังแก้ + rendered sweep ส่วนที่เหลือ (2026-09-21)

**แก้แล้ว:** `.consent-h` tracking 0 · `body` line-height 1.5 · `.pass-card` weight 500 (ต้นเหตุ = `<button>` UA) · ลบ caption splash · `.ev-empty-s.ast-block` รวมเป็น `--fs-sub` (22) / `--w-label` (700)

**Sweep (modal ทั้ง 4, มินิเกม, Pre-Event, Book ยังไม่ลงทะเบียน):** weight เหลือ 500/700 ในทุกจุด (ยกเว้น Liquid Metal 400/600), ไม่มี horizontal overflow ของหน้า, modal ทุกแบบ 14–22px

**ยังเปิด:**
- line-height 1.5 ทำให้หัวข้อ/chip/pill สูงขึ้น (หน้าสูง +9…+247px) — ทางเลือก: หัวข้อ 1.2, chip ~1, `button{line-height:inherit}`
- `line-height:normal` ที่เหลืออยู่ใน `<button>` ลูกทั้งหมด
- Book coming-soon callout 16→22px (~4 บรรทัดที่ 320px)
- `.play-q` (32px) เป็น CSS ตาย ไม่มี markup ใช้ (คำถามจริงใช้ 36px)
- `.conf-su` สืบทอด tracking −0.36px จาก `.conf-sc`
- ขนาดนอก token: brief มินิเกม 48px, `ev-empty-t` 26px, consent-h family
