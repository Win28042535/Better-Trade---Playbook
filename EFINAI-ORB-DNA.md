# efinAI Orb — Design DNA

Source of truth: `.efin-ai-icwrap` / `.efin-ai-ic` / `@keyframes efinAiDrift` in [dna-quiz-flow.html](dna-quiz-flow.html) (search `efin-ai-ic`), asset at [LOGO/efinAi.png](LOGO/efinAi.png). This file is a **read-out** of that CSS + asset, not a new spec — if the two ever disagree, the CSS wins; update this doc to match.

Related memory: `design-dna-bt2026` (active DNA + history), `typography-dna-doc` (sibling read-out doc, same convention).

Used today (2026-08-20) on the "เปิดหน้า efin AI" CTA inside the AI-help section (`efinBannerHTML()`), on both Book v1 and Book v2.

---

## 1. Core DNA

- Futuristic
- Intelligent
- Organic
- Dynamic
- Soft
- Minimal
- Digital
- Premium

> **A living digital intelligence represented as a soft, dynamic orb.**

Visual does not represent AI via robot / circuit / technical graphics. It uses **abstract organic motion** instead — a single soft gradient sphere, not a geometric or literal AI glyph.

---

## 2. Visual Structure

```text
Outer Glow
↓
Circular Mask
↓
Multiple Gradient Layers
↓
Blur
↓
Contrast
↓
Inner Highlight
```

That layer stack describes how the **source asset** ([LOGO/efinAi.png](LOGO/efinAi.png)) itself was produced — a pre-rendered soft gradient sphere (cyan → green → violet blend, blurred, with a soft inner highlight). The live page does **not** re-build those layers in CSS; it treats the PNG as one finished texture and only adds the circular mask + motion on top of it (see §3). If a future pass needs the glow/gradient/highlight layers to be live (e.g. to recolor per-theme), rebuild them as actual CSS layers rather than baking a new PNG — but that's a deliberate scope change, not the current state.

---

## 3. Live implementation (what's actually in the CSS today)

```css
.efin-ai-icwrap{width:20px;height:20px;border-radius:50%;display:block;flex-shrink:0;overflow:hidden;position:relative;}
.efin-ai-ic{position:absolute;width:150%;height:150%;left:-25%;top:-25%;animation:efinAiDrift 9s ease-in-out infinite;}
@keyframes efinAiDrift{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-6%,5%) scale(1.08);}}
```

- **Circular mask**: `.efin-ai-icwrap` is a fixed 20×20px circular porthole (`border-radius:50%; overflow:hidden`) — the "Circular Mask" layer from §2, implemented as a container clip rather than an SVG mask.
- **Oversized source, not filtered**: the `<img>` inside is rendered at 150% size, offset -25%/-25%, so the porthole only ever shows a cropped patch of a larger gradient — there's always more texture around the edges to drift into, so the crop never runs out of image.
- **Motion plays with texture, not color** (explicit direction, 2026-08-20): the first pass used a `hue-rotate` filter for motion, but that shifted the orb's actual color tone as it animated. Direction was *"อยากให้โทนสีไม่เปลี่ยนไปจากต้นฉบับ...ให้การเคลื่อนไหวเล่นกับ texture อย่างเดียวพอ"* (keep the tone identical to the source — let the motion play with texture only). The fix: no filter/hue math at all — `efinAiDrift` only ever does `translate + scale` on the same source pixels, so the visible color mix never changes, only *which patch* of the original gradient shows through the mask at a given moment.
- **Timing**: 9s ease-in-out infinite, ping-ponging between resting (`translate(0,0) scale(1)`) and drifted (`translate(-6%,5%) scale(1.08)`) — slow and soft, matching the "Organic / Soft" DNA traits rather than a mechanical loop.
- **Reduced motion**: frozen by the app's global `prefers-reduced-motion` rule; freezing still shows a full, undistorted crop of the image (never blank or cut off), since the oversized-image approach doesn't depend on the animation to look correct at rest.

---

## 4. Asset

[LOGO/efinAi.png](LOGO/efinAi.png) — 44×44px, cyan → green → violet soft radial gradient sphere, blurred edges, soft inner highlight top-left. Embedded inline as a base64 data URI in `LOGO_IMG.efinAiIcon` (not referenced by path) so the page stays a single self-contained file — the PNG in `LOGO/` is the source copy, the base64 string is the shipped copy. **If the PNG is ever edited, re-embed it** (re-run the base64 encode into `LOGO_IMG.efinAiIcon`) — editing only the loose file does nothing to the live page.

---

## 5. Usage rule

This orb glyph is scoped to genuine **efin AI** touchpoints only (currently: the "เปิดหน้า efin AI" button icon). It is not a generic sparkle/AI badge — do not reuse it as a decorative icon elsewhere in the app; introduce a plain `lc-sparkles` or similar lucide glyph for non-efin-AI "smart/suggested" affordances instead, to keep this orb meaning one specific thing everywhere it appears.
