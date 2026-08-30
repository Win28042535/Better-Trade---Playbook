# Aurora Background — Design & Motion DNA

Applied to: the "กำลังวิเคราะห์" (analyzing) screen's background — `.reveal-scene` in
[dna-quiz-flow.html](dna-quiz-flow.html) (search `AURORA`), replacing its former flat static
violet radial-gradient fill. This doc is the spec as given; the CSS is the implementation of it —
if they ever disagree, re-read this file before trusting the CSS's specific numbers.

## 1. Core DNA

Aurora Background มี DNA หลักเป็น:

- Atmospheric
- Soft
- Organic
- Fluid
- Immersive
- Minimal
- Futuristic
- Premium

แนวคิดหลัก:

> **สร้างบรรยากาศให้กับ Section โดยใช้แสงและสีที่เคลื่อนไหวอย่างนุ่มนวล แทนการใช้ Graphic ที่ชัดเจน**

Aurora ทำหน้าที่เป็น **Atmospheric Layer** มากกว่า Content หลัก

## 2. Visual role / layer order

```text
Background
↓
Aurora / Light Field
↓
Content
↓
CTA / Interaction
```

Depth reading (foreground → deep background):

```text
Foreground   → Typography / CTA
Middle       → Content Container
Background   → Aurora
Deep Background → Base Color
```

> Large Canvas + Minimal Content + Atmospheric Light

## 3. Aurora form

```text
Soft Light + Gradient + Blur + Organic Flow + Large Negative Space
```

Aurora มีลักษณะเป็น: Large Gradient Field · Soft Edge · Diffused Light · Organic Shape · Layered
Color · Slow Movement.

Visual ไม่ควรดูเหมือน Gradient Box ธรรมดา — ควรรู้สึกเหมือน **แสงกำลังไหลอยู่ในพื้นที่**.

## 4. Color

ใช้สี spectrum tokens ที่มีอยู่แล้ว (`--violet` `--cyan` `--pink` `--yellow`) — ไม่เพิ่มชุดสีใหม่, ตรงกับ
DESIGN-DNA.md ("Spectrum gradient is a rare accent, never a fill").

## 5. Motion DNA

Aurora เป็น Continuous Background Motion. Motion ควร: Slow · Fluid · Organic · Continuous · Calm.
ไม่ควรมี: Bounce · Flash · Sharp Movement · Sudden Color Change · Fast Rotation.

> หลักสำคัญ: ผู้ใช้ควรรู้สึกถึง Motion แต่ไม่ควรถูก Motion รบกวน

Separately, content entering the viewport (unrelated to the aurora layer itself, already covered
by this file's existing `.scroll-reveal`/`.fade` mechanism — not reimplemented here):

```text
Section เข้า Viewport → Content Initial State (opacity:0, y:40px) → Fade + Move Up → Final State
delay: 0.3s · duration: 0.8s · ease: easeInOut
```

```text
Page Load → Aurora Background Active → User Scroll → Section เข้า Viewport → Content Reveal → Final State
Aurora → Title → Supporting Text → CTA
```

## 6. Responsive behavior

- **Desktop** — ใช้ Aurora ได้เต็มพื้นที่: Large Gradient, Wide Blur, Multiple Color Fields.
- **Tablet** — ลด Gradient Scale / Intensity / Visual Density. ตรวจสอบไม่ให้ Aurora ทำให้ Text/CTA
  อ่านยาก.
- **Mobile** — ลดจำนวน Layer และ Intensity: Soft Gradient + Minimal Motion + Readable Content.

`@media (prefers-reduced-motion: reduce)` — handled by this file's existing global kill-switch
(every animation already freezes under it; no separate rule needed for this effect).

## 7. Performance

Aurora เป็น Background Effect จึงต้องระวัง Performance. ควร: ใช้ GPU-friendly properties (transform/
opacity) · หลีกเลี่ยงการ trigger layout · จำกัดจำนวน animated layers · ไม่ใช้ JavaScript animation loop
หากไม่จำเป็น · หลีกเลี่ยง animation ที่ทำงานหนักตลอดทั้งหน้า. Content motion ใช้ viewport trigger เพื่อไม่
ให้ทุก section animate พร้อมกัน.

## 8. Do / Don't

**DO** — ใช้เป็น background atmosphere · large soft gradient · slow motion · brand spectrum ·
negative space · reveal content เมื่อเข้า viewport · สร้าง transition ระหว่าง chapter.

**DON'T** — ใช้ aurora เป็น content หลัก · สีจัดจนอ่าน text ยาก · motion เร็ว · gradient ขอบแข็ง · aurora
ทุก section · ให้ background แข่งกับ data visualization · effect มากจนกลายเป็น visual noise.

## 9. Core DNA summary

```text
SOFT GRADIENT + ATMOSPHERIC LIGHT + ORGANIC MOTION + NEGATIVE SPACE + VIEWPORT REVEAL + SPATIAL DEPTH
= IMMERSIVE BACKGROUND
```

## 10. Implementation notes (this instance)

- Two independently-drifting blurred blobs — `.reveal-scene::before` (violet→pink) and `::after`
  (cyan→yellow) — each animated with `transform: translate()+scale()` only (never animated
  `background-position`), so the drift stays fully compositor/GPU-side per §7.
- `.reveal-scene` shares the `.consent` class, whose own `::before` (a flat 64%-white photo wash
  meant for the room1 backdrop scene) would otherwise sit on top of the aurora and mute it almost
  to nothing. Since `.reveal-scene::before`/`::after` are equal specificity and declared later in
  the stylesheet, they fully override that shared rule for this element only — every other
  `.consent`-only screen keeps its wash untouched.
- `z-index:-1` (not the `z-index:0` pattern this file uses elsewhere, e.g. `.sp-scatter`) is
  deliberate: negative paints behind plain static content within `.consent`'s own isolated stacking
  context (`isolation:isolate`), so the icon/kicker/headline need no z-index changes of their own.
- Responsive: base rule = 2 layers / 48px blur (tablet's own middle ground); `data-view="pc"` bumps
  blur to 72px ("wide blur, multiple color fields"); `data-view="mobile"` hides `::after` entirely
  ("reduce layer count"), leaving one soft blob.
- **Drift duration is intentionally short (7s/8s), not the first instinct for "slow."** This screen
  auto-advances to Book after a hardcoded 3s (`REVEALTIMER` in `renderReveal()`) — a 24s/28s loop
  (the first pass) meant real attendees only ever saw ease-in-out's slowest opening stretch, which
  read as a frozen gradient rather than a living one. Tune this animation's speed to the screen's
  actual on-screen lifetime, not to "slow" in the abstract — if that lifetime ever changes, revisit
  this duration too.
